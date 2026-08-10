<script lang="ts">
	import Image from '$lib/components/media/image.svelte';
	import { toPlainText } from '$lib/utils/portable-text';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		portableText: any;
	}

	let { portableText }: Props = $props();

	const image = $derived(portableText?.value ?? {});
	const caption = $derived(
		typeof image.caption === 'string' ? image.caption : toPlainText(image.caption)
	);
</script>

<figure class="not-prose my-6">
	<Image {image} containerClass="rounded-lg border" />
	{#if caption}
		<figcaption class="text-muted-foreground mt-2 text-center text-sm">{caption}</figcaption>
	{/if}
</figure>
