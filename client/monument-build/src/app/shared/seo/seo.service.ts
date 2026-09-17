import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { filter } from 'rxjs/operators';

/** Change this to the real production domain once deployed. Used for canonical
 *  URLs and Open Graph og:url. */
const BASE_URL = 'https://monumentbuilds.com';
const SITE_NAME = 'Monument Builds';
const DEFAULT_TITLE = 'Monument Builds — Web Design & Development in Upstate SC';
const DEFAULT_DESC =
  'Monument Builds designs and builds fast, modern, responsive websites for small businesses — based in Upstate South Carolina, working with clients anywhere.';

/**
 * Keeps the document <title>, meta description, canonical link, and Open Graph /
 * Twitter tags in sync with the active route. Runs on both server (SSR) and
 * client, so crawlers get correct per-page metadata in the initial HTML.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private router = inject(Router);
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);

  init(): void {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.apply());
  }

  private apply(): void {
    // Merge data from the matched route chain (deepest wins).
    let snapshot: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    let data: { title?: string; description?: string } = {};
    while (snapshot) {
      data = { ...data, ...snapshot.data };
      snapshot = snapshot.firstChild;
    }

    const title = data.title ? `${data.title} — ${SITE_NAME}` : DEFAULT_TITLE;
    const description = data.description || DEFAULT_DESC;
    const path = this.router.url.split(/[?#]/)[0];
    const url = BASE_URL + (path === '/' ? '/' : path);

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.setCanonical(url);
  }

  private setCanonical(url: string): void {
    let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
