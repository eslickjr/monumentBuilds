import { Injectable, signal } from '@angular/core';

export type ThemeName = 'cartoon' | 'futuristic' | 'professional' | 'computer' | '1920s';

/** Order the style slider cycles through. */
export const THEME_ORDER: ThemeName[] = ['cartoon', 'futuristic', 'professional', 'computer', '1920s'];

const STORAGE_KEY = 'mb-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Current committed theme. */
  readonly theme = signal<ThemeName>(this.load());

  /** Set (and persist) the active theme. */
  set(theme: ThemeName): void {
    this.theme.set(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* storage unavailable */ }
  }

  /** Index of the current theme in THEME_ORDER. */
  index(): number {
    return THEME_ORDER.indexOf(this.theme());
  }

  order(): ThemeName[] {
    return THEME_ORDER;
  }

  private load(): ThemeName {
    // Always open on the professional theme, regardless of what was last used.
    return 'professional';
  }

  // NOTE: the committed theme is applied via data-theme on the .reveal-base layer
  // (see app.html / RevealService), NOT on <html>. Putting it on a shared ancestor
  // of both reveal layers would make :host-context theme rules match two themes at
  // once in the ghost layer (e.g. showing both hero images), so it must stay off <html>.
}
