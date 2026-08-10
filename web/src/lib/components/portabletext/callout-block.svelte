<script lang="ts">
	import { PortableText as PT } from '@portabletext/svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import LinkMark from './link-mark.svelte';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		portableText: any;
	}

	let { portableText }: Props = $props();

	const value = $derived(portableText?.value ?? {});
	const tone = $derived(value.tone ?? 'note');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const body = $derived((value.body ?? []).filter(Boolean) as any[]);

	const components = {
		marks: { link: LinkMark }
	};
</script>

<Callout type={tone} title={value.title}>
	{#if body.length}
		<PT value={body} {components} />
	{/if}
</Callout>
