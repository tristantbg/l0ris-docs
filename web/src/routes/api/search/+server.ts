/**
 * GROQ-backed docs search — the FALLBACK for contexts without the static
 * Pagefind index (dev server, preview deploys rendering drafts). Production
 * search runs on Pagefind client-side. Returns the top matches with a text
 * excerpt centred on the first hit.
 */
import { json } from '@sveltejs/kit';
import { SEARCH_QUERY } from '$lib/sanity/queries';
import { setSanityCache } from '$lib/sanity/cache';
import type { RequestHandler } from './$types';

export const prerender = false;

interface SearchRow {
	title: string;
	slug: string;
	description?: string;
	text?: string;
}

function excerptAround(text: string, query: string, radius = 90): string {
	if (!text) return '';
	const haystack = text.toLowerCase();
	const index = haystack.indexOf(query.toLowerCase());
	if (index === -1) return text.slice(0, radius * 2) + (text.length > radius * 2 ? '…' : '');

	const start = Math.max(0, index - radius);
	const end = Math.min(text.length, index + query.length + radius);
	const marked =
		text.slice(start, index) +
		'<mark>' +
		text.slice(index, index + query.length) +
		'</mark>' +
		text.slice(index + query.length, end);
	return (start > 0 ? '…' : '') + marked + (end < text.length ? '…' : '');
}

export const GET: RequestHandler = async ({ url, locals, setHeaders }) => {
	const { loadQuery, previewEnabled } = locals.sanity;
	const q = (url.searchParams.get('q') ?? '').trim();
	const lang = url.searchParams.get('lang') ?? undefined;

	if (q.length < 2) return json({ results: [] });

	const { data } = await loadQuery<SearchRow[]>(SEARCH_QUERY, {
		q,
		qs: `${q}*`,
		...(lang ? { lang } : {})
	});

	const results = (data ?? []).map((row) => ({
		title: row.title,
		href: `/docs/${row.slug}/`,
		excerpt: excerptAround(row.text ?? row.description ?? '', q)
	}));

	// Search responses are cached per query string and purged with everything
	// else on publish.
	setSanityCache(setHeaders, {
		tags: ['docPage'],
		disabled: previewEnabled
	});

	return json({ results });
};
