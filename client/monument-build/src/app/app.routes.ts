import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Gallery } from './features/gallery/gallery';
import { Services } from './features/services/services';
import { Contact } from './features/contact/contact';

// `data.title` / `data.description` drive per-page <title> + meta (see SeoService).
export const routes: Routes = [
    {
        path: '',
        component: Home,
        data: {
            title: 'Web Design & Development',
            description:
                'Monument Builds designs and builds fast, modern, responsive websites for small businesses — based in Upstate South Carolina, working with clients anywhere.',
        },
    },
    {
        path: 'gallery',
        component: Gallery,
        data: {
            title: 'Portfolio',
            description:
                'See recent Monument Builds website projects and the range of styles we design and build — one studio, five distinct looks.',
        },
    },
    {
        path: 'services',
        component: Services,
        data: {
            title: 'Services & Pricing',
            description:
                'Website design, development, hosting, CMS, and marketing setup with clear, honest pricing for small businesses. Based in Upstate SC.',
        },
    },
    {
        path: 'contact',
        component: Contact,
        data: {
            title: 'Contact',
            description:
                'Start your website project with Monument Builds. Get in touch for a fast, modern, responsive site that grows with your business.',
        },
    },
    {
        // Lazy-loaded so the Builder.io SDK only ships in this route's chunk.
        path: 'cms-demo',
        loadComponent: () => import('./features/cms-demo/cms-demo').then((m) => m.CmsDemo),
        data: {
            title: 'CMS Demo',
            description:
                'A live demo of visual, no-code content editing powered by Builder.io — see how content on a Monument Builds site can be managed without touching code.',
        },
    },
];
