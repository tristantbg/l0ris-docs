<script lang="ts">
	import { urlFor } from '$lib/sanity/image';
	import LazyMedia from './lazy-media.svelte';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		image: any;
		/** Overrides the image's intrinsic ratio (the source gets cropped). */
		aspectRatio?: number;
		maxWidth?: number;
		quality?: number;
		loading?: 'lazy' | 'eager';
		containerClass?: string;
		mediaClass?: string;
		/** Overrides the image's own alt text. */
		alt?: string;
	}

	let {
		image,
		aspectRatio: aspectRatioProp,
		maxWidth = 1920,
		quality = 90,
		loading = 'lazy',
		containerClass,
		mediaClass,
		alt
	}: Props = $props();

	// An imageAlt member can exist without an asset (editor cleared the slot) —
	// skip rendering entirely rather than crash in the URL builder.
	const hasAsset = $derived(Boolean(image?.asset?._ref ?? image?.asset?._id));

	// Studio-set crop rect (fractions trimmed from each edge). The URL builder
	// applies it to delivered files, so layout math must use the cropped shape.
	const crop = $derived.by(() => {
		const c = image?.crop;
		const w = 1 - (c?.left ?? 0) - (c?.right ?? 0);
		const h = 1 - (c?.top ?? 0) - (c?.bottom ?? 0);
		return c && w > 0 && h > 0 && (w < 1 || h < 1) ? { w, h } : null;
	});

	const croppedWidth = $derived(crop && image?.width ? image.width * crop.w : image?.width);

	const aspectRatio = $derived(
		aspectRatioProp ?? (crop ? (image.aspectRatio * crop.w) / crop.h : (image?.aspectRatio ?? 1.5))
	);

	// An explicit aspectRatio prop crops the source (entropy keeps the busiest
	// region) instead of letting object-fit crop a full-frame download.
	const atWidth = (width: number) => {
		let builder = urlFor(image).width(width);
		if (aspectRatioProp && Number.isFinite(aspectRatioProp)) {
			builder = builder.height(Math.floor(width / aspectRatioProp)).fit('crop');
			if (!image.hotspot) builder = builder.crop('entropy');
		}
		return builder.quality(quality).auto('format');
	};

	const src = $derived(atWidth(320).url());

	const effectiveMaxWidth = $derived(Math.min(maxWidth, croppedWidth ?? maxWidth));

	// 320px srcset ladder up to the (cropped) intrinsic width.
	const srcSet = $derived(
		[
			`${atWidth(100).url()} 100w`,
			...Array.from(
				{ length: Math.max(1, Math.floor(effectiveMaxWidth / 320)) },
				(_, i) => `${atWidth((i + 1) * 320).url()} ${(i + 1) * 320}w`
			)
		].join(', ')
	);
</script>

{#if hasAsset}
	<LazyMedia
		{src}
		{srcSet}
		lqip={image.lqip ?? null}
		{aspectRatio}
		{loading}
		{containerClass}
		{mediaClass}
		alt={alt ?? image.alt ?? ''}
	/>
{/if}
