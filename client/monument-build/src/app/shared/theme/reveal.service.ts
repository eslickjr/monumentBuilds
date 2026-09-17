import { Injectable, computed, inject, signal } from '@angular/core';
import { ThemeService, THEME_ORDER, ThemeName } from './theme.service';

/**
 * Drives the site-wide style slider.
 *
 * The slider position `x` (0..1) is the seam between the current "base" theme
 * and the "incoming" (next) theme. Pushing fully across commits to the next
 * theme and flips the anchored end, so bouncing the slider cycles the loop
 * cartoon -> futuristic -> professional -> cartoon.
 */
@Injectable({ providedIn: 'root' })
export class RevealService {
  private themeService = inject(ThemeService);
  readonly order = THEME_ORDER;

  /** Index (into order) of the currently committed base theme. */
  readonly baseIndex = signal(this.themeService.index());
  /** True when the base theme is anchored at the left end. */
  readonly homeLeft = signal(true);
  /** Seam position, 0 (far left) .. 1 (far right). */
  readonly x = signal(0);
  /** True while a full-screen overlay (e.g. the gallery lightbox) is open, so
   *  the floating style slider can hide itself out of the way. */
  readonly overlayOpen = signal(false);

  readonly baseTheme = computed(() => this.order[this.baseIndex()]);
  readonly incomingTheme = computed(() => this.order[(this.baseIndex() + 1) % this.order.length]);

  /** clip-path for the ghost layer given the seam and anchored end. */
  readonly clipPath = computed(() =>
    this.homeLeft()
      ? `inset(0 ${(1 - this.x()) * 100}% 0 0)`
      : `inset(0 0 0 ${this.x() * 100}%)`,
  );

  /** Hide the seam line when resting fully on a single theme. */
  readonly seamOpacity = computed(() =>
    (this.homeLeft() && this.x() <= 0.001) || (!this.homeLeft() && this.x() >= 0.999) ? 0 : 1,
  );

  /** Jump straight to a theme (e.g. from the gallery tiles), resetting the
   *  slider to rest on it. */
  jumpTo(theme: ThemeName): void {
    const i = this.order.indexOf(theme);
    if (i < 0) return;
    this.baseIndex.set(i);
    this.homeLeft.set(true);
    this.x.set(0);
    this.themeService.set(theme);
  }

  /** Move the seam; commits to the next theme when pushed fully across. */
  setX(value: number): void {
    this.x.set(Math.min(1, Math.max(0, value)));
    this.maybeCommit();
  }

  private maybeCommit(): void {
    if (this.homeLeft() && this.x() >= 0.985) this.advance(false, 1);
    else if (!this.homeLeft() && this.x() <= 0.015) this.advance(true, 0);
  }

  private advance(homeLeft: boolean, xEnd: number): void {
    this.baseIndex.set((this.baseIndex() + 1) % this.order.length);
    this.homeLeft.set(homeLeft);
    this.x.set(xEnd);
    // Persist the committed theme and mirror it onto <html> (body background, SSR default).
    this.themeService.set(this.baseTheme());
  }
}
