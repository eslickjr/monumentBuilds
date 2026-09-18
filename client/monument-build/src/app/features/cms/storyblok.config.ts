/**
 * Storyblok connection settings.
 *
 * Setup:
 *  1. Create a free space at https://app.storyblok.com
 *  2. Settings → Access Tokens → copy the "Preview" token → paste it below.
 *  3. Set the region to match your space (shown at signup / in the space URL):
 *     'us' | 'eu' | 'ap' | 'ca' | 'cn'.
 *
 * Note: the Preview token can read *draft* (unpublished) content, which is what
 * makes the visual editor and live preview work. For a purely public production
 * site you can instead use a Public token and fetch version: 'published'.
 */
export const STORYBLOK_TOKEN = 'fXMyoY1pO6DuicAgbTrouQtt';

// Match this to your space's region.
export const STORYBLOK_REGION = 'eu' as const;

// Story slug this demo page loads. Create a story with this slug in Storyblok.
export const STORYBLOK_DEMO_SLUG = 'cms-demo';
