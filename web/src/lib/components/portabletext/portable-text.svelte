<script lang="ts">
	/**
	 * Documentation body renderer: @portabletext/svelte wired to the doc
	 * block components (media, code, callouts, downloads) and the
	 * link-field mark. Extra components can be merged in via the
	 * `components` prop.
	 */
	import { PortableText as PT } from '@portabletext/svelte';
	import CalloutBlock from './callout-block.svelte';
	import CodeBlock from './code-block.svelte';
	import ExternalVideoBlock from './external-video-block.svelte';
	import FileDownloadBlock from './file-download-block.svelte';
	import ImageBlock from './image-block.svelte';
	import LinkMark from './link-mark.svelte';
	import VideoBlock from './video-block.svelte';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		value: any;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		components?: any;
	}

	let { value, components: extraComponents = {} }: Props = $props();

	// A missing field arrives as null; normalize to a clean array so absent
	// or sparse content renders nothing.
	const blocks = $derived(Array.isArray(value) ? value.filter(Boolean) : value ? [value] : []);

	const components = $derived({
		types: {
			image: ImageBlock,
			imageAlt: ImageBlock,
			video: VideoBlock,
			externalVideo: ExternalVideoBlock,
			codeBlock: CodeBlock,
			callout: CalloutBlock,
			fileDownload: FileDownloadBlock,
			...(extraComponents.types ?? {})
		},
		marks: {
			link: LinkMark,
			...(extraComponents.marks ?? {})
		},
		...extraComponents
	});
</script>

{#if blocks.length}
	<PT value={blocks} {components} />
{/if}
