<script lang="ts">
	import { getVideoAnimatedUrl, getVideoThumbUrl } from '$lib/utils/video';
	import LazyMedia from './lazy-media.svelte';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		video: any;
		/** Render the animated thumbnail (Mux animated.webp / Vimeo animated). */
		isAnimated?: boolean;
		/** Timestamp (s) of the static thumbnail frame. */
		posterTime?: number;
		aspectRatio?: number;
		maxWidth?: number;
		loading?: 'lazy' | 'eager';
		containerClass?: string;
		mediaClass?: string;
	}

	let {
		video,
		isAnimated = false,
		posterTime,
		aspectRatio: aspectRatioProp,
		maxWidth = 1280,
		loading = 'lazy',
		containerClass,
		mediaClass
	}: Props = $props();

	const time = $derived(posterTime ?? video.loop?.start ?? video.thumbTime ?? 0);
	const aspectRatio = $derived(
		aspectRatioProp ??
			video.aspectRatio ??
			(video.width && video.height ? video.width / video.height : 16 / 9)
	);

	const buildStatic = (w: number) => getVideoThumbUrl(video, w, time) ?? '';
	const buildAnimated = (w: number) => getVideoAnimatedUrl(video, { width: w }) ?? buildStatic(w);
	const buildUrl = $derived(isAnimated ? buildAnimated : buildStatic);

	// Mux's animated-image API rejects widths above 640.
	const providerMaxWidth = $derived(video.provider !== 'vimeo' && isAnimated ? 640 : Infinity);
	const effectiveMaxWidth = $derived(Math.min(maxWidth, video.width ?? maxWidth, providerMaxWidth));

	const src = $derived(buildUrl(640));
	const srcSet = $derived(
		[
			`${buildUrl(100)} 100w`,
			...Array.from(
				{ length: Math.max(1, Math.floor(effectiveMaxWidth / 320)) },
				(_, i) => `${buildUrl((i + 1) * 320)} ${(i + 1) * 320}w`
			)
		].join(', ')
	);

	// LQIP for videos = a small static thumbnail (must stay sharp, no overscale).
	const lqip = $derived(buildStatic(320) || null);
</script>

<LazyMedia
	{src}
	{srcSet}
	{lqip}
	scalePlaceholder={false}
	{aspectRatio}
	{loading}
	{containerClass}
	{mediaClass}
	alt={video.title ?? ''}
/>
