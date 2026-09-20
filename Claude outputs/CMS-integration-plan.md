# Monument Builds — CMS Integration Plan (Builder.io & Strapi)

*Prepared for Josh Eslick · Angular 20 SPA hosted on Netlify*

## Why this needs a plan

Your site today is a **static Angular single-page app** deployed to Netlify. All
content is hard-coded in components/templates and there is no server. A CMS
("content management system") lets content be edited without touching code. To
demo this to clients, you want to *show* content changing without a redeploy.

There are two families here, and they solve the problem very differently:

- **Builder.io** is a *cloud, visual* CMS. Someone drags blocks around on a
  visual canvas, hits publish, and the live site updates. Nothing to host.
- **Strapi** is a *self-hosted, structured* CMS. You define content types
  (e.g. "Project", "Service"), editors fill in fields, and your app fetches the
  data over an API. You run and own the server.

Both keep your Angular site as the front end. The difference is where the content
lives and who runs the machine that stores it.

---

## Option A — Builder.io (recommended to demo first)

### What it is
A hosted headless CMS with a **visual drag-and-drop editor**. You register a
"model" (say, a page or a section), drop an editable region into your Angular
app, and Builder renders whatever the editor published into that region. Editors
work in Builder's web app; changes appear on your site with no code change and no
redeploy.

### Why it fits you
- **Works on your current Netlify setup as-is** — content is fetched in the
  browser at runtime, so no server and no build change.
- **The demo sells itself**: you can literally sit with a client, open the
  Builder canvas on one screen and the live site on another, drag a headline or
  swap an image, publish, and watch the site change. That "aha" moment is the
  whole point.
- **Free tier** is enough for a portfolio/demo.
- Has a maintained Angular SDK.

### How it plugs into the app
1. Create a free Builder.io account and a Space; copy its **public API key**.
2. Install the SDK: `npm i @builder.io/sdk-angular`.
3. Add a demo route, e.g. `/cms-demo`, whose component renders a Builder content
   area. Sketch:

   ```ts
   // cms-demo.ts
   import { Component } from '@angular/core';
   import { Content, fetchOneEntry } from '@builder.io/sdk-angular';

   @Component({
     selector: 'app-cms-demo',
     standalone: true,
     imports: [Content],
     template: `
       @if (content) {
         <builder-content [content]="content" model="page" [apiKey]="apiKey"></builder-content>
       }
     `,
   })
   export class CmsDemo {
     apiKey = 'YOUR_PUBLIC_API_KEY';
     content: any;
     async ngOnInit() {
       this.content = await fetchOneEntry({ model: 'page', apiKey: this.apiKey, userAttributes: { urlPath: '/cms-demo' } });
     }
   }
   ```

4. In Builder, create a "page" entry targeted at `/cms-demo`, drop in some
   editable text/image/section blocks, and publish.
5. (Optional, stronger demo) register a couple of *your own* Angular components
   (e.g. a service card, a pricing tile) as Builder blocks so the client edits
   real branded components, not generic boxes.

### What I'd need from you
- A Builder.io account and its **public API key** (safe to embed in the front
  end — it's read-only public content).

### Trade-offs
- **Pros:** zero hosting, fastest to stand up, best live-editing demo, free to
  start, no redeploys.
- **Cons:** content lives on Builder's servers (vendor lock-in for that
  content); pricing scales up if you later need many editors/among advanced
  features; content is fetched client-side (fine for a demo; for SEO-critical
  pages you'd later want server-side rendering).

### Rough effort
Half a day to a day for a polished `/cms-demo` page with a few registered
components.

---

## Option B — Strapi (self-hosted, "you own everything")

### What it is
An open-source headless CMS you run yourself. You define **content types** with
fields (e.g. a *Project* with title, blurb, URL, screenshots), editors manage
entries in Strapi's admin panel, and your Angular app pulls the data via REST or
GraphQL. It's the natural fit for structured, repeatable content — exactly like
your gallery's project list.

### Why it's compelling
- **You (or the client) own the whole stack** — data, server, no per-seat SaaS
  fees. Appealing for clients who want control or have data-residency concerns.
- Great when content is *structured and listy* (projects, blog posts, team
  members) rather than free-form page layouts.
- Open source; no vendor lock-in on the CMS itself.

### The catch: it needs hosting
Strapi is a Node.js server plus a database. **It cannot run on Netlify's static
hosting.** You'd host it on something like Railway, Render, Fly.io, or a small
VPS, backed by a database (SQLite for a demo; Postgres for production). That's an
extra always-on service to run, secure, and pay for (small, but not zero).

### How it plugs into the app
1. Stand up Strapi somewhere: `npx create-strapi-app@latest monument-cms`,
   deploy it to Railway/Render (+ a Postgres DB for anything beyond a demo).
2. In the Strapi admin, define a **Project** content type (title, blurb, url,
   category, images) and set the API permissions so the list is public-readable.
3. In Angular, fetch it with `HttpClient` and render — e.g. drive the existing
   gallery from Strapi instead of the hard-coded array:

   ```ts
   // A CMS-backed version of the gallery's project list
   import { inject } from '@angular/core';
   import { HttpClient } from '@angular/common/http';

   const http = inject(HttpClient);
   const STRAPI = 'https://your-strapi-host.up.railway.app';
   http.get(`${STRAPI}/api/projects?populate=images`).subscribe((res: any) => {
     this.projects = res.data.map((d: any) => ({
       title: d.title, blurb: d.blurb, url: d.url, category: d.category,
       images: d.images.map((i: any) => STRAPI + i.url),
     }));
   });
   ```

4. To demo: edit a project in the Strapi admin, refresh the site, watch the
   gallery update from the CMS.

### What I'd need from you
- A decision on **where to host Strapi** (Railway/Render/Fly/VPS) and an account
  there; for production, a Postgres database.
- Access/credentials for whatever host you pick (or we do it together).

### Trade-offs
- **Pros:** full ownership, no SaaS fees, ideal for structured content, no lock-in.
- **Cons:** you run a server + DB (setup, updates, security, ~$5–20/mo hosting);
  no visual drag-and-drop page building (it's forms/fields); more up-front work
  before it's demoable.

### Rough effort
1–2 days: standing up + deploying Strapi, modeling content, wiring the gallery
(or a dedicated demo section) to it.

---

## Side-by-side

| | Builder.io | Strapi |
|---|---|---|
| Hosting | Cloud (theirs) | You host it (Node + DB) |
| Runs on current Netlify setup | Yes, as-is | Front end yes; CMS needs its own host |
| Editing style | Visual drag-and-drop | Structured fields/forms |
| Best for | Page layouts, marketing pages, live-edit demos | Structured lists (projects, posts) |
| Ownership | Content on their servers | You own everything |
| Cost to start | Free tier | ~$5–20/mo hosting once live |
| Time to first demo | Fastest (½–1 day) | Slower (1–2 days) |
| Client "wow" factor | Very high (live visual editing) | Moderate (admin panel) |

---

## Recommendation

For **showing clients how it works**, start with **Builder.io** — the live
visual editing demo is the most persuasive and it needs nothing beyond your
current hosting. Add **Strapi** as a second phase if a client specifically wants
a self-hosted/owned solution or structured content management; the most natural
Strapi demo is to make your existing gallery pull its projects from the CMS.

A clean way to present both: a single `/cms-demo` page on your site with two
sections — "Visual editing (Builder.io)" and "Structured content (Strapi)" —
so a prospective client can see both approaches side by side and pick what suits
them.

## What happens next (when you're ready to build)
- **Builder.io:** create the account, send me the public API key, and I'll wire
  up a `/cms-demo` page and register a couple of your components as editable blocks.
- **Strapi:** decide on a host, and I'll scaffold the Strapi project, model a
  `Project` content type, deploy it, and switch the gallery to read from it
  (keeping the current hard-coded list as a fallback).
