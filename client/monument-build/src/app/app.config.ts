import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideStoryblok, withStoryblokComponents, withLivePreview } from '@storyblok/angular';
import { STORYBLOK_TOKEN, STORYBLOK_REGION } from './features/cms/storyblok.config';
import { storyblokComponents } from './features/cms/storyblok-components';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      })
    ),
    provideClientHydration(withEventReplay()),
    // Storyblok visual CMS. Token + region live in features/cms/storyblok.config.ts.
    // withLivePreview() loads the Storyblok bridge so edits update live in the
    // visual editor.
    provideStoryblok(
      { accessToken: STORYBLOK_TOKEN, region: STORYBLOK_REGION },
      withStoryblokComponents(storyblokComponents),
      withLivePreview()
    )
  ]
};
