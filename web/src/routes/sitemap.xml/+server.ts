import { SITE_URL } from '$env/static/private';
import { PUBLIC_SANITY_PREVIEW } from '$env/static/public';
import { setSanityCache } from '$lib/sanity/cache';
import { DOCS_NAV_QUERY } from '$lib/sanity/queries';
import { orderDocs } from '$lib/server/docs';
import type { RequestHandler } from './$types';

export const prerender = PUBLIC_SANITY_PREVIEW !== 'true';

export const GET: RequestHandler = async ({ url, locals, setHeaders }) => {
	const { loadQuery, previewEnabled } = locals.sanity;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const pages = await loadQuery<any[]>(DOCS_NAV_QUERY);
	const docs = orderDocs(pages.data ?? []);

	const siteUrl = (SITE_URL || url.origin).replace(/\/$/, '');

	const entries = [
		{ href: '/', priority: '1.0' },
		{ href: '/docs/', priority: '1.0' },
		...docs.map((doc) => ({ href: doc.href, priority: '0.8' }))
	];

	const urls = entries.map(
		({ href, priority }) => `
  <url>
    <loc>${siteUrl}${href}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
	);

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`.trim();

	setSanityCache(setHeaders, { tags: ['docPage'], disabled: previewEnabled });

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
};
