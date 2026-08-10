import { PUBLIC_SANITY_PREVIEW } from '$env/static/public';

// Production builds prerender the whole site (static pages + Pagefind index
// generated postbuild); unknown/legacy paths still fall back to the SSR
// function. Preview deploys (PUBLIC_SANITY_PREVIEW=true) skip prerendering
// entirely so drafts render live on every request.
export const prerender = PUBLIC_SANITY_PREVIEW !== 'true';
export const ssr = true;
// Pagefind wants folder-style URLs (/docs/pompe/ → docs/pompe/index.html).
export const trailingSlash = 'always';
