import { SITE_URL } from '$env/static/private';
import { PUBLIC_SANITY_PREVIEW } from '$env/static/public';
import { docsConfig } from '$lib/docs/config.js';
import { setSanityCache } from '$lib/sanity/cache';
import { CATEGORIES_QUERY, DOCS_NAV_QUERY } from '$lib/sanity/queries';
import { categoriesWithDocs } from '$lib/server/docs';
import type { RequestHandler } from './$types';

export const prerender = PUBLIC_SANITY_PREVIEW !== 'true';

export const GET: RequestHandler = async ({ url, locals, setHeaders }) => {
	const { loadQuery, previewEnabled } = locals.sanity;
	const [categories, pages] = await Promise.all([
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		loadQuery<any[]>(CATEGORIES_QUERY),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		loadQuery<any[]>(DOCS_NAV_QUERY)
	]);

	const grouped = categoriesWithDocs(categories.data ?? [], pages.data ?? []);
	const baseUrl = (SITE_URL || url.origin).replace(/\/$/, '');

	const lines: string[] = [];
	lines.push(`# ${docsConfig.site.title}`);
	lines.push('');
	lines.push(`> ${docsConfig.site.description}`);
	lines.push('');
	lines.push(`This file provides an overview of all documentation pages for LLM consumption.`);
	lines.push(`For full documentation content, see: ${baseUrl}/llms-full.txt`);
	lines.push('');

	for (const cat of grouped) {
		if (!cat.docs.length) continue;
		lines.push(`## ${cat.title}`);
		if (cat.description) {
			lines.push('');
			lines.push(`> ${cat.description}`);
		}
		lines.push('');
		for (const doc of cat.docs) {
			lines.push(`- [${doc.meta.title}](${baseUrl}${doc.href}): ${doc.meta.description}`);
		}
		lines.push('');
	}

	setSanityCache(setHeaders, { tags: ['docPage'], disabled: previewEnabled });

	return new Response(lines.join('\n'), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	});
};
