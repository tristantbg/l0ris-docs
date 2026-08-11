/**
 * Cross-component search palette state: the palette itself lives in the left
 * sidebar, but other components can open it — optionally with a tag filter
 * preselected (tag badges on doc pages do this).
 */
export const searchPalette = $state({
	open: false,
	/** Tag filter to apply on the next open (consumed by the palette). */
	pendingTag: null as string | null
});

export function openSearch(tag?: string) {
	searchPalette.pendingTag = tag ?? null;
	searchPalette.open = true;
}
