import {
  Component,
  ElementRef,
  ViewChild,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';
import { StyleSlider } from './shared/style-slider/style-slider';
import { RevealService } from './shared/theme/reveal.service';
import { SeoService } from './shared/seo/seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, StyleSlider],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'monument-build';

  readonly reveal = inject(RevealService);
  private router = inject(Router);
  private seo = inject(SeoService);

  @ViewChild('baseLayer') baseLayer?: ElementRef<HTMLElement>;
  @ViewChild('ghostInner') ghostInner?: ElementRef<HTMLElement>;

  /** Vertical scroll mirrored onto the ghost so both layers stay aligned. */
  readonly scrollY = signal(0);
  /** Width of the live layer, copied to the ghost clone. */
  readonly baseWidth = signal(0);
  readonly ghostTransform = computed(() => `translateY(${-this.scrollY()}px)`);

  constructor() {
    // Keep <title>/meta/canonical in sync with the route (runs on server + client).
    this.seo.init();

    // Browser-only: set up the clone + scroll mirror after the first render.
    afterNextRender(() => {
      this.cloneBase();

      window.addEventListener('scroll', () => this.scrollY.set(window.scrollY), { passive: true });
      window.addEventListener('resize', () => {
        this.updateWidth();
        this.cloneBase();
      });

      // Mirror form typing onto the inert ghost clone so both halves of a field
      // show the same text while the slider seam runs through it.
      const base = this.baseLayer?.nativeElement;
      if (base) {
        const sync = () => this.syncFormValues();
        base.addEventListener('input', sync);
        base.addEventListener('change', sync);

        // Mirror focus + caret position too, so the ghost half of a field shows a
        // floated placeholder and a blinking cursor that track the live field.
        const syncFocus = () => this.syncFormFocus();
        base.addEventListener('focusin', syncFocus);
        base.addEventListener('focusout', syncFocus);
        base.addEventListener('input', syncFocus);
        base.addEventListener('keyup', syncFocus);
        base.addEventListener('click', syncFocus);
        document.addEventListener('selectionchange', syncFocus);
      }

      // Re-clone the ghost when navigating to another page (new content).
      this.router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe(() => requestAnimationFrame(() => this.cloneBase()));
    });
  }

  private updateWidth(): void {
    const base = this.baseLayer?.nativeElement;
    if (base) this.baseWidth.set(base.clientWidth);
  }

  /** Copy the live layer's rendered DOM into the ghost (visual-only, inert). */
  private cloneBase(): void {
    const base = this.baseLayer?.nativeElement;
    const inner = this.ghostInner?.nativeElement;
    if (!base || !inner) return;
    inner.replaceChildren(...Array.from(base.children).map((c) => c.cloneNode(true)));
    this.updateWidth();
    this.scrollY.set(window.scrollY);
    // cloneNode copies the value *attribute*, not live user-typed input — so
    // re-mirror current values onto the fresh clone right away.
    this.syncFormValues();
    this.syncFormFocus();
  }

  /** Copy live form-control values from the base layer onto the ghost clone so
   *  text typed on one side of the seam also appears on the other. The ghost is
   *  a static DOM snapshot (pointer-events:none), so without this only the live
   *  half of a field bisected by the seam would show what the user typed. */
  private syncFormValues(): void {
    const base = this.baseLayer?.nativeElement;
    const inner = this.ghostInner?.nativeElement;
    if (!base || !inner) return;
    const selector = 'input, textarea, select';
    const src = base.querySelectorAll<HTMLElement>(selector);
    const dst = inner.querySelectorAll<HTMLElement>(selector);
    src.forEach((s, i) => {
      const d = dst[i];
      if (!d) return;
      if (s instanceof HTMLInputElement && d instanceof HTMLInputElement) {
        if (s.type === 'checkbox' || s.type === 'radio') {
          d.checked = s.checked;
        } else {
          d.value = s.value;
          // Float the ghost's placeholder when it has content (matches the
          // .content-inside rule Angular sets on the live layer).
          d.classList.toggle('content-inside', s.value.length > 0);
        }
      } else if (s instanceof HTMLTextAreaElement && d instanceof HTMLTextAreaElement) {
        d.value = s.value;
        d.classList.toggle('content-inside', s.value.length > 0);
      } else if (s instanceof HTMLSelectElement && d instanceof HTMLSelectElement) {
        d.selectedIndex = s.selectedIndex;
      }
    });
  }

  /** Mirror the live layer's focused field onto the ghost clone: float its
   *  placeholder and draw a blinking fake caret at the same position (the clone
   *  can't take real focus, so it has neither on its own). */
  private syncFormFocus(): void {
    const base = this.baseLayer?.nativeElement;
    const inner = this.ghostInner?.nativeElement;
    if (!base || !inner) return;
    const selector = 'input, textarea, select';
    const src = Array.from(base.querySelectorAll<HTMLElement>(selector));
    const dst = Array.from(inner.querySelectorAll<HTMLElement>(selector));
    const active = document.activeElement as HTMLElement | null;
    src.forEach((s, i) => {
      const d = dst[i];
      if (!d) return;
      const focused = s === active && base.contains(s);
      d.classList.toggle('mb-ghost-focused', focused);
      if (
        (s instanceof HTMLInputElement || s instanceof HTMLTextAreaElement) &&
        (d instanceof HTMLInputElement || d instanceof HTMLTextAreaElement)
      ) {
        this.positionGhostCaret(s, d, focused);
      }
    });
  }

  /** Create/position/remove the blinking fake caret inside a ghost field. */
  private positionGhostCaret(
    src: HTMLInputElement | HTMLTextAreaElement,
    dst: HTMLInputElement | HTMLTextAreaElement,
    focused: boolean,
  ): void {
    const container = dst.parentElement;
    if (!container) return;
    let caret = container.querySelector<HTMLElement>('.mb-ghost-caret');

    // Only single-line text inputs / textareas get a caret (skip radios, etc.).
    const textish =
      src instanceof HTMLTextAreaElement ||
      ['text', 'search', 'url', 'tel', 'email', 'password', 'number', ''].includes(src.type);
    if (!focused || !textish) {
      caret?.remove();
      return;
    }

    let pos = 0;
    try {
      pos = src.selectionStart ?? src.value.length;
    } catch {
      pos = src.value.length;
    }
    const coords = getCaretCoordinates(src, pos);

    if (!caret) {
      caret = document.createElement('span');
      caret.className = 'mb-ghost-caret';
      container.appendChild(caret);
    }
    caret.style.left = `${dst.offsetLeft + coords.left - dst.scrollLeft}px`;
    caret.style.top = `${dst.offsetTop + coords.top - dst.scrollTop}px`;
    caret.style.height = `${coords.height}px`;
    caret.style.background = getComputedStyle(dst).color;
  }
}

/** Pixel position of the caret within an input/textarea, using a hidden mirror
 *  element that copies the field's text-layout styles. Adapted from the
 *  well-known textarea-caret-position technique. */
function getCaretCoordinates(
  element: HTMLInputElement | HTMLTextAreaElement,
  position: number,
): { left: number; top: number; height: number } {
  const isInput = element.nodeName === 'INPUT';
  const computed = getComputedStyle(element);
  const div = document.createElement('div');
  const style = div.style;
  style.position = 'absolute';
  style.visibility = 'hidden';
  style.whiteSpace = isInput ? 'nowrap' : 'pre-wrap';
  if (!isInput) style.wordWrap = 'break-word';

  const props = [
    'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
    'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent',
    'letterSpacing', 'wordSpacing', 'tabSize',
  ] as const;
  props.forEach((p) => {
    (style as unknown as Record<string, string>)[p] =
      (computed as unknown as Record<string, string>)[p];
  });

  let text = element.value.substring(0, position);
  if (isInput) text = text.replace(/\s/g, ' ');
  div.textContent = text;

  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);
  document.body.appendChild(div);

  const coords = {
    left: span.offsetLeft + parseInt(computed.borderLeftWidth || '0', 10),
    top: span.offsetTop + parseInt(computed.borderTopWidth || '0', 10),
    height: parseInt(computed.lineHeight || '0', 10) || parseInt(computed.fontSize || '16', 10),
  };
  document.body.removeChild(div);
  return coords;
}
