<script lang="ts">
	/**
	 * Image-or-video media slot (Sanity CDN images, Mux/Vimeo video).
	 *
	 * - images        → <Image> (Sanity CDN srcset + LQIP)
	 * - videos        → inline <Video> player (muted autoplay loop), or
	 * - videos + thumb → <VideoThumb> (static/animated thumbnail via the
	 *   provider's image API) for grids and cards.
	 */
	import Image from './image.svelte';
	import Video from './video.svelte';
	import VideoThumb from './video-thumb.svelte';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		media: any;
		/** Render videos as a (possibly animated) thumbnail instead of a player. */
		thumb?: boolean;
		/** Animate the video thumbnail. */
		isAnimated?: boolean;
		aspectRatio?: number;
		maxWidth?: number;
		quality?: number;
		loading?: 'lazy' | 'eager';
		autoplay?: boolean;
		/** Show native controls on inline video players. */
		controls?: boolean;
		containerClass?: string;
		mediaClass?: string;
		alt?: string;
	}

	let {
		media,
		thumb = false,
		isAnimated = false,
		aspectRatio,
		maxWidth,
		quality,
		loading,
		autoplay = true,
		controls = false,
		containerClass,
		mediaClass,
		alt
	}: Props = $props();

	const isVideo = $derived(media?._type === 'video');
</script>

{#if isVideo && thumb}
	<VideoThumb
		video={media}
		{isAnimated}
		{aspectRatio}
		{maxWidth}
		{loading}
		{containerClass}
		{mediaClass}
	/>
{:else if isVideo}
	<Video video={media} {aspectRatio} {autoplay} {controls} {containerClass} {mediaClass} />
{:else if media}
	<Image
		image={media}
		{aspectRatio}
		{maxWidth}
		{quality}
		{loading}
		{containerClass}
		{mediaClass}
		{alt}
	/>
{/if}
