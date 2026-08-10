import type { Handle } from '@sveltejs/kit';
import { PUBLIC_SANITY_PREVIEW } from '$env/static/public';
import { serverClient } from '$lib/sanity/client.server';
import { token } from '$lib/sanity/api.server';
import { DEFAULT_LOCALE } from '$lib/docs/config';

/**
 * Preview is a whole-deploy mode: a second Netlify site (or local dev) with
 * `PUBLIC_SANITY_PREVIEW=true` and a read token flips every query to the
 * `drafts` perspective and disables edge caching (see $lib/sanity/cache).
 */
const previewEnabled = PUBLIC_SANITY_PREVIEW === 'true' && !!token;

const queryClient = previewEnabled
	? serverClient.withConfig({ perspective: 'drafts', token, useCdn: false })
	: serverClient;

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.sanity = {
		previewEnabled,
		loadQuery: async <T>(query: string, params?: Record<string, unknown>) => {
			// `$lang` is used by the locale fragments; loaders can override it
			// (e.g. the /docs/[lang] routes pass their route param).
			const data = await queryClient.fetch<T>(query, {
				lang: DEFAULT_LOCALE,
				...(params ?? {})
			});
			return { data };
		}
	};

	return resolve(event);
};
