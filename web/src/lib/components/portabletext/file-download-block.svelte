<script lang="ts">
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import DownloadIcon from '@lucide/svelte/icons/download';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		portableText?: any;
		/** Direct value (used by the attachments list outside portable text). */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		value?: any;
	}

	let { portableText, value: valueProp }: Props = $props();

	const value = $derived(valueProp ?? portableText?.value ?? {});
	const label = $derived(value.label || value.filename || 'Download');

	const sizeLabel = $derived.by(() => {
		const bytes = value.size;
		if (!bytes) return null;
		if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
		return `${Math.max(1, Math.round(bytes / 1024))} KB`;
	});

	// `?dl=` makes the Sanity CDN send a content-disposition: attachment header.
	const href = $derived(
		value.url ? `${value.url}?dl=${encodeURIComponent(value.filename ?? '')}` : '#'
	);
</script>

<div class="not-prose my-4">
	<a
		{href}
		class="hover:border-primary/40 hover:bg-muted/50 group flex items-center gap-3 rounded-lg border p-3 transition-colors"
		download={value.filename}
	>
		<div
			class="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg"
		>
			<FileTextIcon class="size-5" />
		</div>
		<div class="min-w-0 flex-1">
			<div class="text-foreground truncate text-sm font-medium">{label}</div>
			<div class="text-muted-foreground text-xs">
				{value.filename}{#if sizeLabel}&nbsp;·&nbsp;{sizeLabel}{/if}
			</div>
		</div>
		<DownloadIcon
			class="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-colors"
		/>
	</a>
</div>
