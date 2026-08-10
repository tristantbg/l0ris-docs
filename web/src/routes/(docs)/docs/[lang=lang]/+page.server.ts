import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { HOME_QUERY } from '$lib/sanity/queries';
import { setSanityCache } from '$lib/sanity/cache';
import { enrichDoc } from '$lib/server/docs';
import { toPlainText } from '$lib/utils/portable-text';

export const load: PageServerLoad = async ({ params, locals, setHeaders }) => {
	const { loadQuery, previewEnabled } = locals.sanity;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const homeRes = await loadQuery<any>(HOME_QUERY, { lang: params.lang });
	if (!homeRes.data) throw error(404, 'Documentation index not found');

	const home = await enrichDoc(homeRes.data);

	setSanityCache(setHeaders, {
		tags: ['home'],
		disabled: previewEnabled
	});

	return {
		meta: {
			title: home.title ?? 'Documentation',
			description: home.tagline ?? '',
			lastUpdated: home.lastUpdated
		},
		slug: '',
		docId: home._id,
		body: home.body ?? [],
		rawContent: toPlainText(home.body)
	};
};
