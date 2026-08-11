<script lang="ts">
	/**
	 * Fullscreen media lightbox: a fixed overlay above the page showing one
	 * slide at a time (Sanity images or videos via <Media>), with prev/next
	 * arrows, caption, counter and close button. Escape dismisses it, arrow
	 * keys navigate, and the `url` controller mirrors the active slide into
	 * `?lightbox=&slide=` so an open lightbox is deep-linkable and the
	 * browser Back button closes it.
	 */
	import { untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import XIcon from '@lucide/svelte/icons/x';
	import { Button } from '$lib/components/ui/button/index.js';
	import Media from '$lib/components/media/media.svelte';
	import { getEmbedUrl } from '$lib/utils/video/index.js';
	import { lockBodyScroll } from '$lib/utils/dom.js';
	import { toPlainText } from '$lib/utils/portable-text.js';
	import type { LightboxUrl } from '$lib/state/lightbox-url.js';

	interface Props {
		/** Gallery items (imageAlt / video), same shape as <Media> media. */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		slides: any[];
		/** Slide the lightbox opens on (0-based) — the clicked item. */
		initialIndex?: number;
		/** URL controller (lightboxUrl) — mirrors the active slide into `?slide`. */
		url?: LightboxUrl;
		onclose: () => void;
	}

	let { slides, initialIndex = 0, url, onclose }: Props = $props();

	// A stale deep link can point past the end — clamp instead of blank.
	// svelte-ignore state_referenced_locally
	let activeIndex = $state(Math.min(Math.max(initialIndex, 0), slides.length - 1));

	// Keep `?slide` in step while the visitor navigates. Starts at initialIndex
	// (not 0) so the first run is a no-op against the URL that opened us.
	$effect(() => {
		const index = activeIndex;
		untrack(() => url?.sync(index));
	});

	// Lock the page behind the overlay while open.
	$effect(() => lockBodyScroll());

	const slide = $derived(slides[activeIndex]);
	const ratio = $derived(
		slide?.aspectRatio ?? (slide?.width && slide?.height ? slide.width / slide.height : 16 / 9)
	);
	const caption = $derived(
		typeof slide?.caption === 'string'
			? slide.caption
			: toPlainText(slide?.caption) || (slide?.alt ?? '')
	);

	function prev() {
		activeIndex = (activeIndex - 1 + slides.length) % slides.length;
	}
	function next() {
		activeIndex = (activeIndex + 1) % slides.length;
	}
</script>

<!-- Capture phase so the overlay wins over any other document-level key
     handlers while it is open (same pattern as the command palette). -->
<svelte:window
	onkeydowncapture={(e) => {
		if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
		const action = {
			Escape: onclose,
			ArrowRight: slides.length > 1 ? next : undefined,
			ArrowLeft: slides.length > 1 ? prev : undefined
		}[e.key];
		if (!action) return;
		e.preventDefault();
		e.stopPropagation();
		action();
	}}
/>

<div
	class="bg-background/95 fixed inset-0 z-[100] backdrop-blur-sm"
	role="dialog"
	aria-modal="true"
	aria-label="Galerie d'images"
	transition:fade={{ duration: 150 }}
>
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		class="absolute inset-0 flex items-center justify-center px-4 py-16 sm:px-16"
		onclick={(e) => e.target === e.currentTarget && onclose()}
	>
		{#key slide?._key ?? activeIndex}
			<figure
				class="max-h-full min-w-0"
				style="width: min(100%, calc((100dvh - 11rem) * {ratio}))"
				in:fade={{ duration: 200 }}
			>
				{#if slide?._type === 'externalVideo'}
					<div class="bg-background aspect-video overflow-hidden rounded-lg border shadow-lg">
						<iframe
							src={getEmbedUrl(slide)}
							title={caption || 'Vidéo'}
							class="size-full"
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowfullscreen
						></iframe>
					</div>
				{:else}
					<Media
						media={slide}
						maxWidth={2400}
						quality={90}
						loading="eager"
						controls
						containerClass="rounded-lg border shadow-lg"
						mediaClass="object-contain"
					/>
				{/if}
				{#if caption}
					<figcaption class="text-muted-foreground mt-3 truncate text-center text-sm">
						{caption}
					</figcaption>
				{/if}
			</figure>
		{/key}
	</div>

	<Button
		variant="outline"
		size="icon"
		class="absolute top-4 right-4 rounded-full"
		onclick={onclose}
		aria-label="Fermer"
	>
		<XIcon />
	</Button>

	{#if slides.length > 1}
		<Button
			variant="outline"
			size="icon"
			class="absolute top-1/2 left-2 -translate-y-1/2 rounded-full sm:left-4"
			onclick={prev}
			aria-label="Image précédente"
		>
			<ChevronLeftIcon />
		</Button>
		<Button
			variant="outline"
			size="icon"
			class="absolute top-1/2 right-2 -translate-y-1/2 rounded-full sm:right-4"
			onclick={next}
			aria-label="Image suivante"
		>
			<ChevronRightIcon />
		</Button>

		<div
			class="bg-background/80 text-muted-foreground absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border px-2.5 py-0.5 text-xs tabular-nums"
		>
			{activeIndex + 1} / {slides.length}
		</div>
	{/if}
</div>
