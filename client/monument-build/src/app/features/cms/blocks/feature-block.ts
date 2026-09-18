import { Component, input, computed } from '@angular/core';
import { type SbBlokData } from '@storyblok/angular';

interface SbAsset {
  filename?: string;
  alt?: string;
}

/** Storyblok "feature" block. Create a block named `feature` with these fields:
 *  heading (Text), text (Textarea), image (Asset), image_side (Single-Option:
 *  left | right). */
interface FeatureBlok extends SbBlokData {
  heading?: string;
  text?: string;
  image?: SbAsset;
  image_side?: 'left' | 'right';
}

@Component({
  selector: 'app-feature-block',
  standalone: true,
  template: `
    <section class="sb-feature" [class.reverse]="blok().image_side === 'right'">
      @if (imageUrl()) {
        <div class="sb-feature-media">
          <img [src]="imageUrl()" [alt]="blok().image?.alt || ''" loading="lazy">
        </div>
      }
      <div class="sb-feature-body">
        @if (blok().heading) { <h2 class="sb-feature-title">{{ blok().heading }}</h2> }
        @if (blok().text) { <p class="sb-feature-text">{{ blok().text }}</p> }
      </div>
    </section>
  `,
  styles: [`
    .sb-feature {
      display: flex;
      gap: 32px;
      align-items: center;
      max-width: 1000px;
      margin: 0 auto;
      padding: 48px 20px;
    }
    .sb-feature.reverse { flex-direction: row-reverse; }
    .sb-feature-media { flex: 1 1 45%; }
    .sb-feature-media img { width: 100%; height: auto; border-radius: 12px; display: block; }
    .sb-feature-body { flex: 1 1 55%; }
    .sb-feature-title {
      margin: 0 0 12px;
      font-family: var(--font-family-2, serif);
      font-weight: 700;
      font-size: 1.8em;
      color: var(--primary-color, #16233F);
    }
    .sb-feature-text {
      margin: 0;
      font-family: var(--font-family-3, sans-serif);
      font-size: 1.05em;
      line-height: 1.7;
      color: var(--secondary-color-4, #333);
    }
    @media (max-width: 720px) {
      .sb-feature, .sb-feature.reverse { flex-direction: column; }
    }
  `],
})
export class FeatureBlock {
  readonly blok = input.required<FeatureBlok>();
  readonly imageUrl = computed(() => this.blok().image?.filename ?? '');
}
