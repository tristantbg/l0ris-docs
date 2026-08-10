import type { LayoutServerLoad } from './$types';
import { SITE_URL } from '$env/static/private';
import { SETTINGS_QUERY } from '$lib/sanity/queries';

// NOTE: Cache headers are set by each leaf `+page.server.ts` / `+server.ts`.
// SvelteKit's `setHeaders` throws if the same header is set twice in one
// request, so the layout must not call `setSanityCache`. The page-level
// cache always includes the global `sanity` tag, which the revalidate
// webhook purges whenever `settings` (or any tagged doc) changes.

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const { loadQuery, previewEnabled } = locals.sanity;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const settings = await loadQuery<any>(SETTINGS_QUERY);

	// Absolute base for canonical / og:url. Static env (baked at build) so
	// prerendered pages never leak the crawler's synthetic origin.
	const siteUrl = (SITE_URL || url.origin).replace(/\/$/, '');

	return {
		previewEnabled,
		siteUrl,
		settings: settings.data
	};
};
