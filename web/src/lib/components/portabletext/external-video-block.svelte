<script lang="ts">
	import { getContext } from 'svelte';
	import Maximize2Icon from '@lucide/svelte/icons/maximize-2';
	import { getEmbedUrl } from '$lib/utils/video';
	import { LIGHTBOX_CONTEXT, type LightboxOpener } from '$lib/state/lightbox-url';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		portableText: any;
	}

	let { portableText }: Props = $props();

	// Present when rendered inside the doc renderer, which collects the page's
	// media into a lightbox. The iframe swallows clicks, so the lightbox is
	// opened from a corner button instead of the surface itself.
	const lightbox = getContext<LightboxOpener | undefined>(LIGHTBOX_CONTEXT);

	const value = $derived(portableText?.value ?? {});
	const embedUrl = $derived(getEmbedUrl(value));
</script>

{#if embedUrl}
	<div class="not-prose relative my-6 aspect-video overflow-hidden rounded-lg border">
		<iframe
			src={embedUrl}
			title="Video"
			class="size-full"
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowfullscreen
		></iframe>
		{#if lightbox && value._key}
			<button
				type="button"
				class="bg-background/80 text-muted-foreground hover:text-foreground absolute top-2 right-2 cursor-zoom-in rounded-md border p-1.5 transition-colors"
				onclick={() => lightbox.open(value._key)}
				aria-label="Agrandir la vidéo"
			>
				<Maximize2Icon class="size-4" />
			</button>
		{/if}
	</div>
{/if}
