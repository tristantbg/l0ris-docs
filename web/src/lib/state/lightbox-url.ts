import { browser } from '$app/environment';
import { page } from '$app/state';
import { pushState, replaceState } from '$app/navigation';

/**
 * URL-addressable overlay lightboxes: `?lightbox=<name>&slide=<N>` (1-based,
 * no `slide` = first slide), so an open lightbox is deep-linkable and browser
 * back/forward reopens/closes it. Each lightbox kind on a page creates one
 * controller with its own `name` — only the controller whose name matches
 * reports an open index, so several kinds could coexist on one page.
 *
 * Kit's shallow routing updates the address bar and `page.state` but leaves
 * `page.url` at the last real navigation, so the reactive source of truth is
 * `page.state.lightbox`; the URL params only bootstrap it on a real
 * navigation (deep link, reload) and keep the address bar shareable.
 *
 * Opening pushes a history entry (`pushed`) so Back closes the overlay and
 * returns to the exact pre-open URL; on direct entry there is no entry to
 * pop, so closing strips the params in place instead.
 *
 * Server-side (including prerendering, where `url.searchParams` is off
 * limits) the lightbox is always closed — a deep link opens it on hydration.
 */
export function lightboxUrl(name: string) {
	/** Open slide (0-based), or null while this lightbox is closed. */
	function index(): number | null {
		if (!browser) return null;
		const state = page.state.lightbox;
		if (state !== undefined) return state?.name === name ? state.index : null;
		if (page.url.searchParams.get('lightbox') !== name) return null;
		const n = Number.parseInt(page.url.searchParams.get('slide') ?? '', 10);
		return Number.isFinite(n) && n > 0 ? n - 1 : 0;
	}

	return {
		get index() {
			return index();
		},
		/** Open on `index` — pushes a history entry so Back closes. */
		open(index: number) {
			pushState(withParams(name, index), {
				...page.state,
				lightbox: { name, index, pushed: true }
			});
		},
		/** Mirror the active slide while open (replaceState, same entry). Bails
		 *  when nothing would change — a deep-linked mount must not shallow-route
		 *  during hydration (kit's client isn't ready for replaceState yet). */
		sync(i: number) {
			if (index() === null) return;
			const prev = page.state.lightbox;
			const url = withParams(name, i);
			if (url.href === location.href && (prev === undefined || prev.index === i)) return;
			replaceState(url, {
				...page.state,
				lightbox: { name, index: i, pushed: prev?.pushed ?? false }
			});
		},
		/** Close: pop the pushed entry, or strip the params on direct entry. */
		close() {
			if (page.state.lightbox?.pushed) history.back();
			else replaceState(withParams(null, 0), { ...page.state, lightbox: null });
		}
	};
}

export type LightboxUrl = ReturnType<typeof lightboxUrl>;

function withParams(name: string | null, index: number): URL {
	const url = new URL(location.href);
	if (name) url.searchParams.set('lightbox', name);
	else url.searchParams.delete('lightbox');
	if (name && index > 0) url.searchParams.set('slide', String(index + 1));
	else url.searchParams.delete('slide');
	return url;
}

/**
 * Context handed down by the doc renderer to PortableText image blocks:
 * opens the page lightbox on the slide whose `_key` matches the block.
 */
export const LIGHTBOX_CONTEXT = 'doc-lightbox';
export interface LightboxOpener {
	open(key: string): void;
}
