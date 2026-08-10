/**
 * Edge-cache helpers for SvelteKit loaders running on Netlify.
 *
 * - Uses `Netlify-CDN-Cache-Control` so caching only happens on Netlify's edge,
 *   not in user browsers (which would defeat on-demand revalidation).
 * - Tags responses with `Netlify-Cache-Tag` so the Sanity webhook
 *   (src/routes/api/revalidate/+server.ts) can purge them on publish.
 * - Skips caching entirely in preview mode (drafts must always be live).
 *
 * Default policy: serve from edge for 6 months, then serve stale for up to
 * 6 more months while revalidating in the background. The webhook makes this
 * transparent — the cache is purged the moment content is published in Sanity.
 *
 * NOTE: `setHeaders` throws if the same header is set twice in one request,
 * so only leaf loaders (`+page.server.ts` / `+server.ts`) may call
 * `setSanityCache` — never `+layout.server.ts`.
 */

import { building } from '$app/environment';

const ONE_DAY = 60 * 60 * 24;
const ONE_WEEK = ONE_DAY * 7;
const SIX_MONTH = ONE_WEEK * 4 * 6;

export const GLOBAL_TAG = 'sanity';

type SetHeaders = (headers: Record<string, string>) => void;

interface CacheOptions {
	/** Edge cache TTL in seconds. Default: 6 months. */
	maxAge?: number;
	/** Stale-while-revalidate window in seconds. Default: 6 months. */
	swr?: number;
	/** Extra cache tags (the global `sanity` tag is always added). */
	tags?: string[];
	/** When true (preview mode), disable all caching. */
	disabled?: boolean;
}

/**
 * Apply Netlify edge cache headers + cache tags to a SvelteKit response.
 *
 * Call from a `+page.server.ts` / `+server.ts` `load` function:
 *
 *     setSanityCache(setHeaders, {
 *       tags: ['docPage', tagFor('docPage', slug)],
 *       disabled: locals.sanity.previewEnabled,
 *     });
 */
export function setSanityCache(setHeaders: SetHeaders, options: CacheOptions = {}) {
	// Prerendered responses are static files — headers would be meaningless
	// (and setHeaders is unsupported at build time).
	if (building) return;

	const { maxAge = SIX_MONTH, swr = SIX_MONTH, tags = [], disabled = false } = options;

	if (disabled) {
		setHeaders({
			'cache-control': 'no-store',
			'netlify-cdn-cache-control': 'no-store'
		});
		return;
	}

	const allTags = [GLOBAL_TAG, ...tags];

	setHeaders({
		// Browsers always revalidate — only the edge holds the response.
		'cache-control': 'public, max-age=0, must-revalidate',
		'netlify-cdn-cache-control': `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}, durable`,
		'netlify-cache-tag': allTags.join(',')
	});
}

/** Build a cache tag for a typed document, e.g. `tagFor('docPage', 'piscine')`. */
export function tagFor(type: string, slug?: string) {
	return slug ? `${type}:${slug}` : type;
}
