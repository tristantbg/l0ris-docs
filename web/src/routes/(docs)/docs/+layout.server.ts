import type { LayoutServerLoad } from './$types';
import { DEFAULT_LOCALE, docsConfig } from '$lib/docs/config';
import { CATEGORIES_QUERY, DOCS_NAV_QUERY } from '$lib/sanity/queries';
import { buildNavigation } from '$lib/server/docs';

/**
 * Sidebar navigation for the whole /docs subtree. The active locale is
 * derived from the URL (`/docs/en/...`) since this layout sits above the
 * `[lang=lang]` routes and doesn't receive their params.
 *
 * No cache headers here — leaf loaders own them (setHeaders throws when the
 * same header is set twice in one request).
 */
export const load: LayoutServerLoad = async ({ locals, url }) => {
	const { loadQuery } = locals.sanity;

	const localeCodes = docsConfig.i18n?.locales.map((l) => l.code) ?? [];
	const match = url.pathname.match(/^\/docs\/([a-z]{2}(?:-[a-z]{2})?)(?=\/|$)/);
	const locale =
		match && localeCodes.includes(match[1]) && match[1] !== DEFAULT_LOCALE
			? match[1]
			: DEFAULT_LOCALE;
	const hrefPrefix = locale === DEFAULT_LOCALE ? '/docs' : `/docs/${locale}`;

	const [categories, pages] = await Promise.all([
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		loadQuery<any[]>(CATEGORIES_QUERY, { lang: locale }),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		loadQuery<any[]>(DOCS_NAV_QUERY, { lang: locale })
	]);

	return {
		navigation: buildNavigation(categories.data ?? [], pages.data ?? [], hrefPrefix),
		locale
	};
};
