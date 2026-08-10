import { SITE_URL } from '$env/static/private';
import { PUBLIC_SANITY_PREVIEW } from '$env/static/public';
import { docsConfig } from '$lib/docs/index.js';
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
	const siteTitle = docsConfig.site.title;
	const siteDescription = docsConfig.site.description;

	const items = docs
		.map(
			(doc) => `
    <item>
      <title>${escapeXml(doc.meta.title)}</title>
      <link>${siteUrl}${doc.href}</link>
      <guid>${siteUrl}${doc.href}</guid>
      <description>${escapeXml(doc.meta.description)}</description>
      ${doc.meta.lastUpdated ? `<pubDate>${new Date(doc.meta.lastUpdated).toUTCString()}</pubDate>` : ''}
    </item>`
		)
		.join('');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${siteUrl}/docs</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>fr</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`.trim();

	setSanityCache(setHeaders, { tags: ['docPage'], disabled: previewEnabled });

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
};

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}
