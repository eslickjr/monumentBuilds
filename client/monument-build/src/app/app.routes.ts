import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Gallery } from './features/gallery/gallery';
import { Services } from './features/services/services';
import { Contact } from './features/contact/contact';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'gallery', component: Gallery },
    { path: 'services', component: Services },
    { path: 'contact', component: Contact },
];
