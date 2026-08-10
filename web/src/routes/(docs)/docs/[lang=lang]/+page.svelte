<script lang="ts">
	import DocRenderer from '$lib/components/doc-renderer.svelte';
	import SeoHead from '$lib/components/seo-head.svelte';

	let { data } = $props();
</script>

<SeoHead title={data.meta.title} description={data.meta.description} />

<DocRenderer meta={data.meta} body={data.body} slug={data.slug} rawContent={data.rawContent} />
