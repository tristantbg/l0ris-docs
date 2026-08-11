/**
 * Locks body scrolling while an overlay is open, compensating for the
 * scrollbar width so the page doesn't shift. Returns the unlock function —
 * usable directly as a Svelte effect: `$effect(() => lockBodyScroll())`.
 */
export function lockBodyScroll() {
	const html = document.documentElement;
	const scrollbar = window.innerWidth - html.clientWidth;
	const prev = { overflow: html.style.overflow, paddingRight: html.style.paddingRight };
	html.style.overflow = 'hidden';
	if (scrollbar > 0) html.style.paddingRight = `${scrollbar}px`;
	return () => {
		html.style.overflow = prev.overflow;
		html.style.paddingRight = prev.paddingRight;
	};
}
