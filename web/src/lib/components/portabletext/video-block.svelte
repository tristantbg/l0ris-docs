<script lang="ts">
	import { getContext } from 'svelte';
	import Video from '$lib/components/media/video.svelte';
	import { toPlainText } from '$lib/utils/portable-text';
	import { LIGHTBOX_CONTEXT, type LightboxOpener } from '$lib/state/lightbox-url';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		portableText: any;
	}

	let { portableText }: Props = $props();

	// Present when rendered inside the doc renderer, which collects the page's
	// media into a lightbox — the video then opens fullscreen on click (the
	// inline player is a muted controlless loop, so the whole surface is free).
	const lightbox = getContext<LightboxOpener | undefined>(LIGHTBOX_CONTEXT);

	const video = $derived(portableText?.value ?? {});
	const caption = $derived(
		typeof video.caption === 'string' ? video.caption : toPlainText(video.caption)
	);
	const zoomable = $derived(Boolean(lightbox && video._key));
</script>

<figure class="not-prose my-6">
	{#if zoomable}
		<button
			type="button"
			class="block w-full cursor-zoom-in"
			onclick={() => lightbox?.open(video._key)}
			aria-label="Agrandir la vidéo"
		>
			<Video {video} containerClass="rounded-lg border" />
		</button>
	{:else}
		<Video {video} containerClass="rounded-lg border" />
	{/if}
	{#if caption}
		<figcaption class="text-muted-foreground mt-2 text-center text-sm">{caption}</figcaption>
	{/if}
</figure>
