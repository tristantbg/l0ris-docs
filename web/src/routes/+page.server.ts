import type { PageServerLoad } from './$types';
import { CATEGORIES_QUERY, DOCS_NAV_QUERY, HOME_QUERY } from '$lib/sanity/queries';
import { setSanityCache } from '$lib/sanity/cache';
import { categoriesWithDocs } from '$lib/server/docs';

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
	const { loadQuery, previewEnabled } = locals.sanity;
	const [home, categories, pages] = await Promise.all([
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		loadQuery<any>(HOME_QUERY),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		loadQuery<any[]>(CATEGORIES_QUERY),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		loadQuery<any[]>(DOCS_NAV_QUERY)
	]);

	setSanityCache(setHeaders, {
		tags: ['home', 'docPage'],
		disabled: previewEnabled
	});

	// Category cards link to the category's first article.
	const sections = categoriesWithDocs(categories.data ?? [], pages.data ?? [])
		.filter((cat) => cat.docs.length)
		.map((cat) => ({
			slug: cat.slug,
			title: cat.title,
			description: cat.description,
			icon: cat.icon,
			href: cat.docs[0].href
		}));

	return {
		home: home.data,
		sections
	};
};
