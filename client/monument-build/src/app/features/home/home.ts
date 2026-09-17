import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private router = inject(Router);
  private animating = false;

  /** Go to the gallery, then glide down to the projects with a slow, eased
   *  "cinematic" scroll instead of the instant anchor jump. */
  goToGallery(event: Event): void {
    event.preventDefault();
    this.router.navigateByUrl('/gallery').then(() => {
      // Pin to the very top first so the glide is always top-down. This also
      // beats the router's scroll-position restoration, which could otherwise
      // leave us partway down and make the animation run bottom-up / jittery.
      window.scrollTo({ top: 0, behavior: 'auto' });
      this.waitForProjects(0);
    });
  }

  /** Wait for the gallery's #projects section to exist and lay out, keeping the
   *  page pinned at the top, then start the animation. */
  private waitForProjects(attempt: number): void {
    const target = document.getElementById('projects');
    if (!target) {
      if (attempt < 90) requestAnimationFrame(() => this.waitForProjects(attempt + 1));
      return;
    }
    // One more frame for layout to settle, still pinned at top, then glide.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      this.cinematicScrollTo(target);
    });
  }

  private cinematicScrollTo(target: HTMLElement): void {
    const startY = window.scrollY; // ~0 after the pin above
    const endY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 24);
    const distance = endY - startY;
    if (distance <= 4) return;

    const duration = 1500; // ms — deliberately slow for the cinematic feel
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // If the user scrolls (wheel / touch / keys), abandon the animation so we
    // never fight their input — a common source of the jitter.
    this.animating = true;
    const cancel = () => { this.animating = false; };
    window.addEventListener('wheel', cancel, { once: true, passive: true });
    window.addEventListener('touchstart', cancel, { once: true, passive: true });
    window.addEventListener('keydown', cancel, { once: true });

    let start: number | null = null;
    const step = (now: number) => {
      if (!this.animating) return;
      if (start === null) start = now;
      const p = Math.min(1, (now - start) / duration);
      // behavior:'auto' overrides the global CSS scroll-behavior:smooth so our
      // own easing drives the motion (otherwise the two fight and it stutters).
      window.scrollTo({ top: startY + distance * easeInOutCubic(p), behavior: 'auto' });
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        this.animating = false;
        window.removeEventListener('wheel', cancel);
        window.removeEventListener('touchstart', cancel);
        window.removeEventListener('keydown', cancel);
      }
    };
    requestAnimationFrame(step);
  }
}
