<script lang="ts">
	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		portableText: any;
	}

	let { portableText }: Props = $props();

	const value = $derived(portableText?.value ?? {});

	const embedUrl = $derived.by(() => {
		const url: string = value.url ?? '';
		if (!url) return null;
		if (value.provider === 'youtube' || /youtu\.?be/.test(url)) {
			const id = url.match(
				/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/
			)?.[1];
			return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
		}
		const vimeoId = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
		return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : null;
	});
</script>

{#if embedUrl}
	<div class="not-prose my-6 aspect-video overflow-hidden rounded-lg border">
		<iframe
			src={embedUrl}
			title="Video"
			class="size-full"
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowfullscreen
		></iframe>
	</div>
{/if}
