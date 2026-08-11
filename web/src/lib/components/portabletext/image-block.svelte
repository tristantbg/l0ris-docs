<script lang="ts">
	import { getContext } from 'svelte';
	import Image from '$lib/components/media/image.svelte';
	import { toPlainText } from '$lib/utils/portable-text';
	import { LIGHTBOX_CONTEXT, type LightboxOpener } from '$lib/state/lightbox-url';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		portableText: any;
	}

	let { portableText }: Props = $props();

	// Present when rendered inside the doc renderer, which collects the page's
	// media into a lightbox — the image then opens fullscreen on click.
	const lightbox = getContext<LightboxOpener | undefined>(LIGHTBOX_CONTEXT);

	const image = $derived(portableText?.value ?? {});
	const caption = $derived(
		typeof image.caption === 'string' ? image.caption : toPlainText(image.caption)
	);
	const zoomable = $derived(
		Boolean(lightbox && image._key && (image.asset?._ref ?? image.asset?._id))
	);
</script>

<figure class="not-prose my-6">
	{#if zoomable}
		<button
			type="button"
			class="block w-full cursor-zoom-in"
			onclick={() => lightbox?.open(image._key)}
			aria-label="Agrandir l'image"
		>
			<Image {image} containerClass="rounded-lg border" />
		</button>
	{:else}
		<Image {image} containerClass="rounded-lg border" />
	{/if}
	{#if caption}
		<figcaption class="text-muted-foreground mt-2 text-center text-sm">{caption}</figcaption>
	{/if}
</figure>
