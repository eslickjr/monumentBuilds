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
      this.updateBottom();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
    });
  }

  private updateBottom(): void {
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
    this.bottom.set(Math.max(this.NORMAL_BOTTOM, raised));
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
