<script lang="ts">
	import type { Snippet } from 'svelte';
	import SanityLink from './sanity-link.svelte';

	interface Props {
		// `@portabletext/svelte` passes the markDef itself as `value`.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		portableText: any;
		children?: Snippet;
	}

	let { portableText, children }: Props = $props();

	const link = $derived(portableText?.value ?? {});
</script>

<SanityLink {link}
	>{#if children}{@render children()}{/if}</SanityLink
>
