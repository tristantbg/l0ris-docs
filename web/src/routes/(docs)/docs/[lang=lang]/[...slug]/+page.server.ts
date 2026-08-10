import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { DOC_QUERY, DOCS_NAV_QUERY } from '$lib/sanity/queries';
import { setSanityCache, tagFor } from '$lib/sanity/cache';
import { enrichDoc, getPrevNext } from '$lib/server/docs';
import { toPlainText } from '$lib/utils/portable-text';

// Locale variants are not prerendered — they render on demand via the SSR
// fallback function (see the note in ../[...slug]/+page.server.ts).

export const load: PageServerLoad = async ({ params, locals, setHeaders }) => {
	const { loadQuery, previewEnabled } = locals.sanity;
	const { lang } = params;
	// trailingSlash 'always' leaves a trailing slash on the rest param.
	const slug = params.slug.replace(/\/+$/, '');

	if (slug.includes('/')) {
		const segments = slug.split('/').reverse();
		const target = await loadQuery<string | null>(
			`*[_type == "docPage" && slug.current in $candidates][0].slug.current`,
			{ candidates: segments }
		);
		if (target.data) throw redirect(301, `/docs/${lang}/${target.data}/`);
		throw error(404, `Page not found: ${slug}`);
	}

	const [docRes, pagesRes] = await Promise.all([
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		loadQuery<any>(DOC_QUERY, { slug, lang }),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		loadQuery<any[]>(DOCS_NAV_QUERY, { lang })
	]);

	if (!docRes.data) {
		const firstInCategory = await loadQuery<string | null>(
			`*[_type == "docPage" && category->slug.current == $slug]
				| order(orderRank asc)[0].slug.current`,
			{ slug }
		);
		if (firstInCategory.data) throw redirect(301, `/docs/${lang}/${firstInCategory.data}/`);
		throw error(404, `Page not found: ${slug}`);
	}

	const doc = await enrichDoc(docRes.data);
	const { prev, next } = getPrevNext(pagesRes.data ?? [], slug);

	setSanityCache(setHeaders, {
		tags: ['docPage', tagFor('docPage', slug)],
		disabled: previewEnabled
	});

	return {
		meta: {
			title: doc.title ?? '',
			description: doc.description ?? '',
			category: doc.category,
			tags: doc.tags ?? [],
			lastUpdated: doc.lastUpdated
		},
		categoryTitle: doc.categoryTitle ?? doc.category ?? '',
		slug,
		docId: doc._id,
		body: doc.body ?? [],
		gallery: doc.gallery ?? [],
		attachments: doc.attachments ?? [],
		rawContent: toPlainText(doc.body),
		prev,
		next
	};
};
