import { Component, input } from '@angular/core';
import { type SbBlokData } from '@storyblok/angular';

/** Storyblok "hero" block. Create a block named `hero` with these fields:
 *  headline (Text), subheadline (Textarea), cta_label (Text), cta_url (Text). */
interface HeroBlok extends SbBlokData {
  headline?: string;
  subheadline?: string;
  cta_label?: string;
  cta_url?: string;
}

@Component({
  selector: 'app-hero-block',
  standalone: true,
  template: `
    <section class="sb-hero">
      @if (blok().headline) { <h1 class="sb-hero-title">{{ blok().headline }}</h1> }
      @if (blok().subheadline) { <p class="sb-hero-sub">{{ blok().subheadline }}</p> }
      @if (blok().cta_label) {
        <a class="sb-hero-cta" [href]="blok().cta_url || '#'">{{ blok().cta_label }}</a>
      }
    </section>
  `,
  styles: [`
    .sb-hero {
      text-align: center;
      padding: 64px 20px;
      background: linear-gradient(135deg, var(--surface-color-3, #1B2C4E), var(--surface-color-4, #141F39));
    }
    .sb-hero-title {
      margin: 0 0 12px;
      font-family: var(--font-family-2, serif);
      font-weight: 700;
      font-size: 2.6em;
      color: var(--primary-color, #fff);
    }
    .sb-hero-sub {
      margin: 0 auto 20px;
      max-width: 620px;
      font-family: var(--font-family-3, sans-serif);
      font-size: 1.15em;
      line-height: 1.6;
      color: var(--secondary-color-4, #EAF0FA);
    }
    .sb-hero-cta {
      display: inline-block;
      padding: 12px 28px;
      border-radius: 8px;
      background: var(--secondary-color, #C9A24B);
      color: var(--accent-text, #141F39);
      font-family: var(--font-family-3, sans-serif);
      font-weight: 700;
      text-decoration: none;
    }
  `],
})
export class HeroBlock {
  readonly blok = input.required<HeroBlok>();
}
