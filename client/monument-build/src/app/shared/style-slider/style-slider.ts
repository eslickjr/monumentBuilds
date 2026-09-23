import { Component, inject, signal, afterNextRender } from '@angular/core';
import { RevealService } from '../theme/reveal.service';
import { ThemeName } from '../theme/theme.service';

@Component({
  selector: 'app-style-slider',
  standalone: true,
  imports: [],
  templateUrl: './style-slider.html',
  styleUrl: './style-slider.css',
})
export class StyleSlider {
  readonly reveal = inject(RevealService);

  /** Distance from the viewport bottom, in px. Normally glued near the bottom of
   *  the screen; as the footer scrolls into view it rises so it comes to rest in
   *  the gap just above the footer, then re-glues to the bottom on the way back up. */
  readonly bottom = signal(24);
  private readonly NORMAL_BOTTOM = 24;
  /** How far above the footer's top the slider rests (centers it in the ~200px gap). */
  private readonly GAP_MARGIN = 30;

  /** First-visit onboarding: spotlight the slider in the center of a dimmed
   *  screen with an explanation, then fly it down to its real spot on dismiss. */
  readonly onboarding = signal(false);
  /** Elevated z-index while onboarding + during the fly-to-place animation. */
  readonly elevated = signal(false);
  /** Gates the transform transition so the entrance is instant and only the
   *  exit (fly-to-place) animates. */
  readonly animate = signal(false);
  /** Inline transform on the slider: centered+scaled during onboarding, then
   *  back to the normal centered-at-bottom transform. */
  readonly onboardTransform = signal('translateX(-50%)');
  private readonly SEEN_KEY = 'mb_slider_seen';

  constructor() {
    // Browser-only: track scroll so the slider rides above the footer at the bottom.
    afterNextRender(() => {
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          this.updateBottom();
          ticking = false;
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });

      // Measure only once layout is settled. Measuring in afterNextRender ran
      // before the tall hero images had loaded, so the page was still collapsed,
      // the footer sat near the top, and the slider got flung upward until the
      // first scroll corrected it. Recompute after load + a couple of frames.
      if (document.readyState === 'complete') {
        this.updateBottom();
      } else {
        window.addEventListener('load', () => this.updateBottom(), { once: true });
      }
      setTimeout(() => this.updateBottom(), 300);
      setTimeout(() => this.updateBottom(), 1200);

      this.maybeStartOnboarding(0);
    });
  }

  /** On a first visit, center the slider over a dark backdrop with a how-to. */
  private maybeStartOnboarding(attempt: number): void {
    let seen = false;
    try {
      seen = localStorage.getItem(this.SEEN_KEY) === '1';
    } catch {
      seen = false;
    }
    if (seen) return;

    const el = document.getElementById('style-slider');
    if (!el) {
      if (attempt < 10) requestAnimationFrame(() => this.maybeStartOnboarding(attempt + 1));
      return;
    }

    // Lift the slider so its center lands at the viewport's vertical center.
    // (Scale is about the element center, so translate first then scale keeps it centered.)
    const h = el.offsetHeight || 150;
    const dy = -(window.innerHeight / 2) + this.NORMAL_BOTTOM + h / 2;

    this.onboardTransform.set(`translateX(-50%) translateY(${dy}px) scale(1.12)`);
    this.elevated.set(true);
    this.onboarding.set(true);
    try {
      document.body.style.overflow = 'hidden'; // freeze scroll behind the spotlight
    } catch {}

    // Enable the transition only after the centered position is painted, so the
    // spotlight appears instantly and only the fly-to-place (exit) animates.
    const reduce =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      requestAnimationFrame(() => requestAnimationFrame(() => this.animate.set(true)));
    }
  }

  /** Dismiss the spotlight: fade the backdrop/text and fly the slider to its
   *  real resting spot at the bottom of the page. */
  dismissOnboarding(): void {
    if (!this.onboarding()) return;
    try {
      localStorage.setItem(this.SEEN_KEY, '1');
    } catch {}
    try {
      document.body.style.overflow = '';
    } catch {}

    this.onboarding.set(false); // fades backdrop + text + button
    this.onboardTransform.set('translateX(-50%)'); // animates back to normal position
    // Recompute the resting position now that scrolling is restored, then drop
    // the elevated z-index once the motion has finished.
    setTimeout(() => this.updateBottom(), 50);
    setTimeout(() => this.elevated.set(false), 650);
  }

  private updateBottom(): void {
    // Don't fight the onboarding transform while the spotlight is active.
    if (this.onboarding()) return;
    const footer = document.getElementById('footer');
    if (!footer) {
      this.bottom.set(this.NORMAL_BOTTOM);
      return;
    }
    const footerTop = footer.getBoundingClientRect().top;
    // When the footer is well below the viewport, `raised` is small/negative and
    // the slider stays glued at NORMAL_BOTTOM. As the footer rises into view,
    // `raised` grows and lifts the slider so its bottom edge stays GAP_MARGIN
    // above the footer's top — parking it in the gap at the bottom of the page.
    const raised = window.innerHeight - footerTop + this.GAP_MARGIN;
    // Cap how high it can ever go (a bit above the footer) so a premature or odd
    // measurement can never fling the slider to the top of the screen.
    const cap = footer.offsetHeight + this.GAP_MARGIN + 40;
    this.bottom.set(Math.min(cap, Math.max(this.NORMAL_BOTTOM, raised)));
  }

  label(theme: ThemeName): string {
    return theme.charAt(0).toUpperCase() + theme.slice(1);
  }

  get arrow(): string {
    return this.reveal.homeLeft() ? '-->' : '<--';
  }

  /** Left/right scale labels follow the anchored (base) vs reveal (incoming) end. */
  get leftLabel(): ThemeName {
    return this.reveal.homeLeft() ? this.reveal.baseTheme() : this.reveal.incomingTheme();
  }
  get rightLabel(): ThemeName {
    return this.reveal.homeLeft() ? this.reveal.incomingTheme() : this.reveal.baseTheme();
  }

  onInput(event: Event): void {
    this.reveal.setX(+(event.target as HTMLInputElement).value / 1000);
  }
}
