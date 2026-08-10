<script lang="ts">
	/**
	 * Renders a sanity-plugin-link-field value as an <a>: internal links go
	 * through the shared linkResolver, external/email/phone map to their
	 * schemes.
	 */
	import type { Snippet } from 'svelte';
	import { linkResolver } from '$lib/utils/linkResolver';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		link: any;
		class?: string;
		children?: Snippet;
	}

	let { link, class: className, children }: Props = $props();

	const href = $derived.by(() => {
		if (!link) return '#';
		switch (link.type) {
			case 'internal':
				return linkResolver(link.internalLink);
			case 'email':
				return `mailto:${link.email ?? ''}`;
			case 'phone':
				return `tel:${(link.phone ?? '').replace(/\s+/g, '')}`;
			default:
				return link.url ?? link.href ?? '#';
		}
	});

	const isExternal = $derived(link?.type === 'external' || /^https?:\/\//.test(href));
	const target = $derived(link?.blank || isExternal ? '_blank' : undefined);
</script>

<a {href} {target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} class={className}
	>{#if children}{@render children()}{/if}</a
>
