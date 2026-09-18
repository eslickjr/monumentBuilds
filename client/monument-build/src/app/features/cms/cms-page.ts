import { Component, OnInit, inject, signal } from '@angular/core';
import { STORYBLOK_DEMO_SLUG } from './storyblok.config';

/**
 * Live CMS demo powered by Storyblok. Fetches the story at slug
 * STORYBLOK_DEMO_SLUG and renders its blocks. Content is edited visually in
 * Storyblok — add/reorder blocks, edit text, swap images — then published,
 * and it appears here with no code change.
 */
@Component({
  selector: 'app-cms-page',
  standalone: true,
  imports: [],
  templateUrl: './cms-page.html',
  styleUrl: './cms-page.css',
})
export class CmsPage {

  readonly story = signal<any | null>(null);
  readonly loading = signal(true);
  readonly errored = signal(false);
}
