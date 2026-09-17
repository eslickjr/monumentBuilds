import { Component, HostListener, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealService } from '../../shared/theme/reveal.service';
import { ThemeName } from '../../shared/theme/theme.service';

interface ThemeTile {
  name: string;
  tag: string;
  bg: string;
  surface: string;
  primary: string;
  accent: string;
  accentText: string;
  font: string;
}

interface Project {
  title: string;
  category: string;
  blurb: string;
  from: string;
  to: string;
  /** Screenshots for the lightbox. Empty = card shows the gradient placeholder. */
  images: string[];
  /** Placeholder demo entry — shows a "Sample" badge. Omit for real work. */
  sample?: boolean;
}

@Component({
  selector: 'app-gallery',
  imports: [RouterLink],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
})
export class Gallery implements OnDestroy {
  private reveal = inject(RevealService);

  /** Mini-previews of each theme, rendered in that theme's own fixed palette. */
  readonly themes: ThemeTile[] = [
    { name: 'Cartoon', tag: 'Playful & bold', bg: '#36454F', surface: '#03B5AA', primary: '#F2F4F3', accent: '#FFA400', accentText: '#36454F', font: "'Merriweather', serif" },
    { name: 'Futuristic', tag: 'Neon & sleek', bg: '#05070E', surface: '#0E1A2E', primary: '#EAF2FF', accent: '#22D3EE', accentText: '#05070E', font: "'Space Grotesk', sans-serif" },
    { name: 'Professional', tag: 'Clean & trusted', bg: '#F6F9FC', surface: '#FFFFFF', primary: '#16233F', accent: '#2E6BE6', accentText: '#FFFFFF', font: "'Playfair Display', serif" },
    { name: 'Computer', tag: 'Technical & sharp', bg: '#0B0E0C', surface: '#141A12', primary: '#EAE6D3', accent: '#C9A24B', accentText: '#0B0E0C', font: "'JetBrains Mono', monospace" },
    { name: '1920s', tag: 'Art-deco & gold', bg: '#241B11', surface: '#2A2015', primary: '#F3E8CE', accent: '#C9A24B', accentText: '#241B11', font: "'Poiret One', sans-serif" },
  ];

  /** Real projects first, then sample concepts (placeholder screenshots) that
   *  can be deleted once there's more real work. Folder names with spaces are
   *  URL-encoded (%20) so the browser resolves them. */
  readonly projects: Project[] = [
    { title: 'Joshua Eslick Portfolio', category: 'Portfolio', blurb: 'My personal developer portfolio — skills, project timeline, and how to get in touch.', from: '#2E6BE6', to: '#16233F', images: ['/projects/Joshua%20Eslick%20Portfolio/Dash.png', '/projects/Joshua%20Eslick%20Portfolio/About.png', '/projects/Joshua%20Eslick%20Portfolio/Skills.png', '/projects/Joshua%20Eslick%20Portfolio/Timeline.png', '/projects/Joshua%20Eslick%20Portfolio/Hire.png'] },
    { title: 'Golden Grove Bicycle Co', category: 'Retail', blurb: 'A storefront, owner dashboard, and customer reviews for a local bicycle company.', from: '#43E97B', to: '#1C7A55', images: ['/projects/Golden%20Grove%20Bicycle%20Co/Dash.png', '/projects/Golden%20Grove%20Bicycle%20Co/About.png', '/projects/Golden%20Grove%20Bicycle%20Co/Reviews.png'] },
    { title: 'Bloom Hair Studio', category: 'Salon', blurb: 'A bright, booking-ready site for a boutique hair salon.', from: '#FF9A9E', to: '#FAD0C4', images: ['/projects/sample-1.jpg', '/projects/sample-2.jpg', '/projects/sample-3.jpg'], sample: true },
    { title: 'Corner Cafe', category: 'Restaurant', blurb: 'Menu, hours, and online ordering for a neighborhood cafe.', from: '#F6D365', to: '#C1833B', images: ['/projects/sample-1.jpg', '/projects/sample-2.jpg', '/projects/sample-3.jpg'], sample: true },
    { title: 'Peak Fitness', category: 'Gym', blurb: 'Class schedules and membership signup for a local gym.', from: '#43E97B', to: '#1C9E77', images: ['/projects/sample-1.jpg', '/projects/sample-2.jpg', '/projects/sample-3.jpg'], sample: true },
    { title: 'Willow & Co.', category: 'Boutique', blurb: 'An elegant online storefront for a clothing boutique.', from: '#A18CD1', to: '#C86DD7', images: ['/projects/sample-1.jpg', '/projects/sample-2.jpg', '/projects/sample-3.jpg'], sample: true },
    { title: 'Harbor Law', category: 'Professional services', blurb: 'A fast, trustworthy site for a small law firm.', from: '#2E6BE6', to: '#16233F', images: ['/projects/sample-1.jpg', '/projects/sample-2.jpg', '/projects/sample-3.jpg'], sample: true },
    { title: 'Maple Dental', category: 'Healthcare', blurb: 'Appointment requests and services for a dental practice.', from: '#4FC3F7', to: '#2A7FB8', images: ['/projects/sample-1.jpg', '/projects/sample-2.jpg', '/projects/sample-3.jpg'], sample: true },
  ];

  /** Lightbox state. */
  lightboxProject: Project | null = null;
  lightboxIndex = 0;

  gradient(p: Project): string {
    return `linear-gradient(135deg, ${p.from}, ${p.to})`;
  }

  initials(title: string): string {
    return title
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  }

  /** Apply a theme when its showcase tile is clicked. */
  setTheme(name: string): void {
    this.reveal.jumpTo(name.toLowerCase() as ThemeName);
  }

  /** Rect of the clicked thumbnail, captured so the lightbox image can animate
   *  ("fly") from that spot toward the center on open. */
  private sourceRect: DOMRect | null = null;

  openLightbox(p: Project, event?: Event): void {
    if (!p.images.length) return;
    const card = event?.currentTarget as HTMLElement | undefined;
    const thumb = card?.querySelector('.project-img') as HTMLElement | null;
    this.sourceRect = thumb ? thumb.getBoundingClientRect() : null;

    this.lightboxProject = p;
    this.lightboxIndex = 0;
    this.reveal.overlayOpen.set(true);
    this.playOpenAnimation(0);
  }

  /** Fade in the backdrop + controls and fly the image from the thumbnail to center. */
  private playOpenAnimation(attempt: number): void {
    requestAnimationFrame(() => {
      const lb = document.querySelector('.lightbox') as HTMLElement | null;
      const img = lb?.querySelector('.lb-img') as HTMLElement | null;
      if (!lb || !img) {
        if (attempt < 10) this.playOpenAnimation(attempt + 1);
        return;
      }
      // Backdrop + controls fade in.
      lb.classList.add('open');

      // Respect reduced-motion: show the image with no fly-in.
      const reduce =
        typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        img.style.opacity = '1';
        return;
      }

      const dest = img.getBoundingClientRect();
      if (this.sourceRect && dest.width && dest.height) {
        // FLIP: start the image sized/placed over the thumbnail, then transition
        // it to its resting (centered) position.
        const dx =
          this.sourceRect.left + this.sourceRect.width / 2 - (dest.left + dest.width / 2);
        const dy =
          this.sourceRect.top + this.sourceRect.height / 2 - (dest.top + dest.height / 2);
        const sx = this.sourceRect.width / dest.width;
        const sy = this.sourceRect.height / dest.height;
        img.style.transformOrigin = 'center center';
        img.style.transition = 'none';
        img.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
        img.style.opacity = '1';
        void img.offsetWidth; // force reflow so the next change animates
        img.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
        img.style.transform = 'none';
      } else {
        // Fallback: gentle scale-in at center.
        img.style.transition = 'none';
        img.style.transform = 'scale(0.9)';
        img.style.opacity = '1';
        void img.offsetWidth;
        img.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
        img.style.transform = 'none';
      }
    });
  }

  closeLightbox(): void {
    this.lightboxProject = null;
    this.reveal.overlayOpen.set(false);
  }

  ngOnDestroy(): void {
    // Safety: never leave the slider hidden if we navigate away mid-view.
    this.reveal.overlayOpen.set(false);
  }

  next(): void {
    if (!this.lightboxProject) return;
    this.lightboxIndex = (this.lightboxIndex + 1) % this.lightboxProject.images.length;
  }

  prev(): void {
    if (!this.lightboxProject) return;
    const n = this.lightboxProject.images.length;
    this.lightboxIndex = (this.lightboxIndex - 1 + n) % n;
  }

  goTo(i: number): void {
    this.lightboxIndex = i;
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (!this.lightboxProject) return;
    if (e.key === 'Escape') this.closeLightbox();
    else if (e.key === 'ArrowRight') this.next();
    else if (e.key === 'ArrowLeft') this.prev();
  }
}
