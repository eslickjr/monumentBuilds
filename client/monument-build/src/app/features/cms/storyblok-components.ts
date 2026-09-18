/**
 * Maps each Storyblok block's technical name to the Angular component that
 * renders it. The keys MUST match the block names you create in Storyblok
 * (page, hero, feature). Components are lazy-loaded so they only ship when
 * a story actually uses them.
 */
export const storyblokComponents = {
  page: () => import('./blocks/page-block').then((m) => m.PageBlock),
  hero: () => import('./blocks/hero-block').then((m) => m.HeroBlock),
  feature: () => import('./blocks/feature-block').then((m) => m.FeatureBlock),
};
