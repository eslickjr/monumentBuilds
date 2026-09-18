import { Component, input, computed } from '@angular/core';
import { SbBlokDirective, type SbBlokData } from '@storyblok/angular';

/** Storyblok "page" content type. Create a content type named `page` with a
 *  single "body" field of type Blocks (which holds hero / feature / etc.). */
interface PageBlok extends SbBlokData {
  body?: SbBlokData[];
}

@Component({
  selector: 'app-page-block',
  standalone: true,
  imports: [SbBlokDirective],
  template: `
    @for (item of body(); track item._uid) {
      <ng-container [sbBlok]="item" />
    }
  `,
})
export class PageBlock {
  readonly blok = input.required<PageBlok>();
  readonly body = computed(() => this.blok().body ?? []);
}
