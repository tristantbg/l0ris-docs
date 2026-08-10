/**
 * Server-side docs data layer — sandocs-style model: ordered categories,
 * each holding orderable articles (flat slugs). Queries already return both
 * lists in reading order (orderRank), so this layer only groups, maps and
 * derives navigation / prev-next.
 */
import type { DocCategory, DocPage, NavItem } from '$lib/docs/types';
import { highlightCodeBlocks } from './shiki';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SanityDoc = Record<string, any>;

function toDocPage(page: SanityDoc): DocPage {
	return {
		_id: page._id,
		slug: page.slug,
		// Trailing slash: the site prerenders with trailingSlash 'always' —
		// slash-less links would make the crawler save redirect stubs instead
		// of real pages (and break the Pagefind index).
		href: `/docs/${page.slug}/`,
		meta: {
			title: page.title ?? page.slug ?? '',
			description: page.description ?? '',
			tags: page.tags ?? [],
			category: page.category ?? undefined,
			lastUpdated: page.lastUpdated
		}
	};
}

function toCategory(cat: SanityDoc): DocCategory {
	return {
		slug: cat.slug,
		title: cat.title ?? cat.slug,
		description: cat.description ?? '',
		icon: cat.icon ?? undefined
	};
}

/** Articles in global reading order (queries sort by category, then rank). */
export function orderDocs(pages: SanityDoc[]): DocPage[] {
	return pages.filter((p) => p?.slug).map(toDocPage);
}

/** Ordered categories, each with its articles attached. */
export function categoriesWithDocs(
	categories: SanityDoc[],
	pages: SanityDoc[]
): (DocCategory & { docs: DocPage[] })[] {
	const docs = orderDocs(pages);
	return categories
		.filter((c) => c?.slug)
		.map((cat) => ({
			...toCategory(cat),
			docs: docs.filter((doc) => doc.meta.category === cat.slug)
		}));
}

/**
 * Sidebar navigation: one section per category, items are its articles in
 * rank order. Articles without a resolvable category land in a trailing
 * "Autres" section rather than disappearing.
 */
export function buildNavigation(
	categories: SanityDoc[],
	pages: SanityDoc[],
	hrefPrefix = '/docs'
): NavItem[] {
	const grouped = categoriesWithDocs(categories, pages);
	const nav: NavItem[] = grouped
		.filter((cat) => cat.docs.length)
		.map((cat) => ({
			title: cat.title,
			icon: cat.icon,
			items: cat.docs.map((doc) => ({
				title: doc.meta.title,
				href: doc.href.replace(/^\/docs/, hrefPrefix)
			}))
		}));

	const known = new Set(grouped.map((cat) => cat.slug));
	const orphans = orderDocs(pages).filter(
		(doc) => !doc.meta.category || !known.has(doc.meta.category)
	);
	if (orphans.length) {
		nav.push({
			title: 'Autres',
			items: orphans.map((doc) => ({
				title: doc.meta.title,
				href: doc.href.replace(/^\/docs/, hrefPrefix)
			}))
		});
	}

	return nav;
}

export function getPrevNext(
	pages: SanityDoc[],
	currentSlug: string
): { prev?: NavItem; next?: NavItem } {
	const docs = orderDocs(pages);
	const index = docs.findIndex((doc) => doc.slug === currentSlug);
	if (index === -1) return {};

	return {
		prev: index > 0 ? { title: docs[index - 1].meta.title, href: docs[index - 1].href } : undefined,
		next:
			index < docs.length - 1
				? { title: docs[index + 1].meta.title, href: docs[index + 1].href }
				: undefined
	};
}

/**
 * Prepare a fetched article for rendering: pre-highlight code blocks.
 */
export async function enrichDoc<T extends SanityDoc>(doc: T): Promise<T> {
	if (!doc) return doc;
	return {
		...doc,
		body: await highlightCodeBlocks(doc.body)
	};
}
