# Monument Builds

The flagship marketing site for **Monument Builds**, a web design & development studio.
Built with **Angular 20**, its signature feature is a live **style slider** that restyles
the entire site between five fully-realized visual themes in real time — one build that
shows range at the drag of a control.

## Highlights

- **Live style slider** — drag to transform the whole site across five complete themes
  (cartoon, futuristic, professional, computer, 1920s art-deco), each with its own palette,
  typography, imagery, and corner styling.
- **Custom reveal architecture** — a base layer plus a scroll-mirrored, clip-path "ghost"
  layer produces a seamless theme transition across every page. The selected theme persists
  as you navigate.
- **Portfolio gallery** with an animated lightbox (fly-to-center open/close, sliding image
  navigation) and clickable theme showcase tiles.
- **Services & pricing** page and a **contact** page wired to **Netlify Forms** with
  floating-label inputs and per-theme artwork.
- **Performance-minded**: images served as **AVIF** with WebP/original fallbacks
  (~90% smaller than the source PNG/JPG), lazy loading, code splitting, CDN delivery.
- **SEO**: per-route `<title>`/meta via a small SEO service, Open Graph + Twitter cards,
  JSON-LD structured data, `sitemap.xml`, and `robots.txt`.
- **Responsive** across phone, tablet, and desktop, with a custom favicon and brand mark.

## Tech stack

- **Angular 20** — standalone components, signals, lazy-loaded routes
- **TypeScript**
- Custom CSS theming driven by CSS custom properties (one variable set per theme)
- **@storyblok/angular** — powers the `/cms-demo` visual-CMS integration
- **Netlify** — hosting, SPA redirects, and Netlify Forms

## Getting started

Prerequisites: **Node.js 20+** and npm.

```bash
npm install
npm start          # ng serve → http://localhost:4200
```

Other useful commands:

```bash
npm run build      # production build to dist/
ng serve --ssl     # serve over HTTPS (required by the Storyblok visual editor)
npm test           # unit tests (Karma/Jasmine)
```

## Project structure

```
src/
  app/
    features/
      home/         # hero + style-slider showcase, services overview, pricing, gallery teaser
      gallery/      # portfolio grid + animated lightbox + theme showcase
      services/     # services & pricing (incl. the CMS offering)
      contact/      # Netlify Forms contact page with floating labels
      cms/          # Storyblok-powered /cms-demo (blocks: page, hero, feature)
    shared/
      navbar/  footer/  theme/  style-slider/  seo/
    app.config.ts   # providers (router, hydration, Storyblok)
    app.routes.ts   # route table + per-route SEO data
  index.html        # meta tags, fonts, JSON-LD, Netlify Forms detection form
public/             # images (png/jpg + generated .avif/.webp), icons, favicon,
                    # robots.txt, sitemap.xml, _redirects
```

## Content management

The `/cms-demo` route demonstrates a visual CMS integration via Storyblok
(`src/app/features/cms/`). To run it, set your Storyblok **Preview token** and
**region** in `src/app/features/cms/storyblok.config.ts`, and create a `page` story
with the slug `cms-demo`.

> **Note:** A purpose-built in-house visual CMS — **Content Canvas** — is in development
> and will become the studio's standard client-editing offering.

## Deployment

Deployed on **Netlify**. `public/_redirects` provides the SPA fallback
(`/* /index.html 200`) so client-side routes survive a refresh. Netlify Forms captures
contact submissions (a hidden detection form lives in `index.html`).

## Configuration notes

Before deploying to a custom domain, update the placeholder domain
(`https://monumentbuilds.com`) in:

- `src/index.html` (canonical, Open Graph, Twitter, JSON-LD)
- `src/app/shared/seo/seo.service.ts` (`BASE_URL`)
- `public/sitemap.xml` and `public/robots.txt`

---

Designed & built by Joshua Eslick — Monument Builds.
