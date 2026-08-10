<script lang="ts">
	import { UnLazyImage } from '@unlazy/svelte';

	interface Props {
		src?: string | null;
		srcSet?: string | null;
		/** Base64 LQIP data-URI used as blurred placeholder. */
		lqip?: string | null;
		/** Overscale the placeholder to hide the blur bleed of a Sanity LQIP. */
		scalePlaceholder?: boolean;
		aspectRatio: number;
		loading?: 'lazy' | 'eager';
		containerClass?: string;
		mediaClass?: string;
		alt?: string;
	}

	let {
		src,
		srcSet = null,
		lqip = null,
		scalePlaceholder = true,
		aspectRatio,
		loading = 'lazy',
		containerClass,
		mediaClass,
		alt = ''
	}: Props = $props();

	let isLoaded = $state(false);
</script>

<div
	class={['lazy-media relative overflow-hidden', containerClass]}
	style="aspect-ratio: {aspectRatio};"
>
	<UnLazyImage
		src={src ?? undefined}
		srcSet={srcSet ?? undefined}
		placeholderSrc={lqip ?? undefined}
		autoSizes
		{loading}
		class={[
			'lazy-media-element size-full object-cover transition-[filter,transform] duration-300',
			lqip && scalePlaceholder && !isLoaded && 'scale-105 blur-sm',
			!lqip && !isLoaded && 'opacity-0',
			!lqip && isLoaded && 'opacity-100',
			mediaClass
		]
			.filter(Boolean)
			.join(' ')}
		{alt}
		onImageLoad={() => (isLoaded = true)}
	/>
</div>
