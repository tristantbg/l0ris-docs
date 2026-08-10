<script lang="ts">
	import Video from '$lib/components/media/video.svelte';
	import { toPlainText } from '$lib/utils/portable-text';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		portableText: any;
	}

	let { portableText }: Props = $props();

	const video = $derived(portableText?.value ?? {});
	const caption = $derived(
		typeof video.caption === 'string' ? video.caption : toPlainText(video.caption)
	);
</script>

<figure class="not-prose my-6">
	<Video {video} containerClass="rounded-lg border" />
	{#if caption}
		<figcaption class="text-muted-foreground mt-2 text-center text-sm">{caption}</figcaption>
	{/if}
</figure>
