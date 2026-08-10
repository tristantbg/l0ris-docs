import { SITE_URL } from '$env/static/private';
import { PUBLIC_SANITY_PREVIEW } from '$env/static/public';
import { docsConfig } from '$lib/docs/config.js';
import { setSanityCache } from '$lib/sanity/cache';
import { DOCS_FULL_QUERY } from '$lib/sanity/queries';
import { toMarkdown } from '$lib/utils/portable-text';
import type { RequestHandler } from './$types';

export const prerender = PUBLIC_SANITY_PREVIEW !== 'true';

export const GET: RequestHandler = async ({ url, locals, setHeaders }) => {
	const { loadQuery, previewEnabled } = locals.sanity;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const pagesRes = await loadQuery<any[]>(DOCS_FULL_QUERY);
	const pages = pagesRes.data ?? [];

	const baseUrl = (SITE_URL || url.origin).replace(/\/$/, '');
	const lines: string[] = [];
	lines.push(`# ${docsConfig.site.title} — Full Documentation`);
	lines.push('');

	for (const page of pages) {
		lines.push('---');
		lines.push('');
		lines.push(`# ${page.title}`);
		lines.push('');
		lines.push(`URL: ${baseUrl}/docs/${page.slug}/`);
		if (page.description) {
			lines.push('');
			lines.push(`> ${page.description}`);
		}
		if (page.tags?.length) {
			lines.push('');
			lines.push(`Tags: ${page.tags.join(', ')}`);
		}
		lines.push('');
		const body = toMarkdown(page.body);
		if (body) {
			lines.push(body);
			lines.push('');
		}
	}

	setSanityCache(setHeaders, { tags: ['docPage'], disabled: previewEnabled });

	return new Response(lines.join('\n'), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	});
};
