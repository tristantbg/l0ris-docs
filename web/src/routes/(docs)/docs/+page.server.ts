import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { CATEGORIES_QUERY, DOCS_NAV_QUERY, HOME_QUERY } from '$lib/sanity/queries';
import { setSanityCache } from '$lib/sanity/cache';
import { categoriesWithDocs, enrichDoc } from '$lib/server/docs';
import { toPlainText } from '$lib/utils/portable-text';

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
	const { loadQuery, previewEnabled } = locals.sanity;

	const [homeRes, categoriesRes, pagesRes] = await Promise.all([
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		loadQuery<any>(HOME_QUERY),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		loadQuery<any[]>(CATEGORIES_QUERY),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		loadQuery<any[]>(DOCS_NAV_QUERY)
	]);

	if (!homeRes.data) throw error(404, 'Documentation index not found');

	const home = await enrichDoc(homeRes.data);

	setSanityCache(setHeaders, {
		tags: ['home', 'docPage'],
		disabled: previewEnabled
	});

	// Category cards shown under the index body.
	const sections = categoriesWithDocs(categoriesRes.data ?? [], pagesRes.data ?? [])
		.filter((cat) => cat.docs.length)
		.map((cat) => ({
			slug: cat.slug,
			href: cat.docs[0].href,
			meta: { title: cat.title, description: cat.description }
		}));

	return {
		meta: {
			title: home.title ?? 'Documentation',
			description: home.tagline ?? '',
			lastUpdated: home.lastUpdated
		},
		slug: '',
		docId: home._id,
		body: home.body ?? [],
		rawContent: toPlainText(home.body),
		sections
	};
};
