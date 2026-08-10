<script lang="ts">
	import { getVideoSources, getVideoThumbUrl } from '$lib/utils/video';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		video: any;
		aspectRatio?: number;
		/** Poster image width. */
		posterWidth?: number;
		/** Autoplay (muted) while in view. Set false to stay paused on the poster. */
		autoplay?: boolean;
		/** Show native controls (paused inline player). */
		controls?: boolean;
		containerClass?: string;
		mediaClass?: string;
	}

	let {
		video,
		aspectRatio: aspectRatioProp,
		posterWidth = 960,
		autoplay = true,
		controls = false,
		containerClass,
		mediaClass
	}: Props = $props();

	const time = $derived(video.loop?.start ?? video.thumbTime ?? 0);
	const poster = $derived(getVideoThumbUrl(video, posterWidth, time));
	const aspectRatio = $derived(
		aspectRatioProp ??
			video.aspectRatio ??
			(video.width && video.height ? video.width / video.height : 16 / 9)
	);

	// Progressive rendition (Mux static renditions / Vimeo files) so it stays a
	// lightweight, image-like loop — no HLS pipeline.
	const sources = $derived(getVideoSources(video));
	const src = $derived(sources.medium ?? sources.high ?? sources.low ?? null);

	function autoplayInView(node: HTMLVideoElement) {
		if (!autoplay) return {};
		node.muted = true;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) node.play().catch(() => {});
					else node.pause();
				}
			},
			{ threshold: 0.1 }
		);
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}
</script>

<div
	class={['relative overflow-hidden', containerClass].filter(Boolean).join(' ')}
	style="aspect-ratio: {aspectRatio};"
>
	<video
		class={['size-full object-cover', mediaClass].filter(Boolean).join(' ')}
		src={src ?? undefined}
		poster={poster ?? undefined}
		muted={autoplay}
		loop={autoplay}
		playsinline
		controls={controls || !autoplay}
		preload="metadata"
		use:autoplayInView
	></video>
</div>
