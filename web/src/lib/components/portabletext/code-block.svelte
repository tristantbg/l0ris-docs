<script lang="ts">
	/**
	 * Code block. The docs loader pre-highlights `value.html` with Shiki
	 * (same themes/classes as the old mdsvex pipeline, so the `.shiki` and
	 * `.code-block-titled` styles in layout.css keep working). Falls back to
	 * a plain <pre> when no highlighted HTML is present (e.g. preview of an
	 * unknown language).
	 */
	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		portableText: any;
	}

	let { portableText }: Props = $props();

	const value = $derived(portableText?.value ?? {});
</script>

<div class="not-prose my-6">
	{#if value.filename}
		<div class="code-block-titled">
			<div class="code-block-title">{value.filename}</div>
			{#if value.html}
				{@html value.html}
			{:else}
				<pre><code>{value.code}</code></pre>
			{/if}
		</div>
	{:else if value.html}
		{@html value.html}
	{:else}
		<pre><code>{value.code}</code></pre>
	{/if}
</div>
