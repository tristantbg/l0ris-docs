/**
 * Resolve a Sanity document into the web-app URL it represents.
 *
 * Single source of truth shared by the web app (internal links, prev/next,
 * sitemap) and the Studio ("Open preview" button, iframe preview pane —
 * imported directly from ../web).
 */
export function linkResolver(document: Record<string, any> | null | undefined): string {
	if (!document) return '/';
	const { _type, slug } = document;
	const type = _type ?? document.type;
	const resolvedSlug: string | undefined = slug?.current ?? slug;

	switch (type) {
		case 'home':
			return '/';
		case 'docPage':
			return resolvedSlug ? `/docs/${resolvedSlug}/` : '/docs/';
		case 'category':
			return '/docs/';
		case 'settings':
			return '/';
		default:
			return '/';
	}
}
