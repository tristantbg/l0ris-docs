<script lang="ts">
	import type { DocMeta, DocPage } from '$lib/docs/types.js';
	import { toc } from '$lib/docs/toc.svelte';
	import MobileToc from '$lib/components/mobile-toc.svelte';
	import BackToTop from '$lib/components/nav/back-to-top.svelte';
	import CopyUrl from '$lib/components/nav/copy-url.svelte';
	import LinkCard from '$lib/components/docs/link-card.svelte';
	import Badge from '$lib/components/docs/badge.svelte';
	import Media from '$lib/components/media/media.svelte';
	import FileDownloadBlock from '$lib/components/portabletext/file-download-block.svelte';
	import { PortableText } from '$lib/components/portabletext/index.js';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import ClockIcon from '@lucide/svelte/icons/clock';
	// import { calculateReadingTime } from '$lib/docs/reading-time.js';

	let {
		meta,
		categoryTitle = '',
		body = [],
		gallery = [],
		attachments = [],
		subpages = [],
		slug = '',
		rawContent = ''
	}: {
		meta: DocMeta;
		categoryTitle?: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		body?: any[];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		gallery?: any[];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		attachments?: any[];
		subpages?: DocPage[];
		slug?: string;
		rawContent?: string;
	} = $props();

	// let readingTime = $derived(rawContent ? calculateReadingTime(rawContent) : '');

	let contentEl: HTMLDivElement | undefined = $state();

	function enhanceContent(container: HTMLElement) {
		const headings = container.querySelectorAll<HTMLElement>('h2, h3, h4, h5, h6');
		for (const heading of headings) {
			if (!heading.id) {
				heading.id =
					heading.textContent
						?.trim()
						.toLowerCase()
						.replace(/[^a-z0-9]+/g, '-')
						.replace(/(^-|-$)/g, '') ?? '';
			}
			if (!heading.querySelector('.anchor-link')) {
				heading.classList.add('group', 'relative');
				const anchor = document.createElement('a');
				anchor.href = `#${heading.id}`;
				anchor.className =
					'anchor-link text-muted-foreground/0 group-hover:text-muted-foreground absolute -left-5 top-0 no-underline transition-colors';
				anchor.textContent = '#';
				anchor.setAttribute('aria-hidden', 'true');
				heading.prepend(anchor);
			}
		}

		const codeBlocks = container.querySelectorAll<HTMLElement>('pre');
		for (const pre of codeBlocks) {
			if (pre.querySelector('.copy-btn')) continue;
			pre.classList.add('relative', 'group/code');

			const btn = document.createElement('button');
			btn.className =
				'copy-btn absolute right-2 top-2 rounded-md border bg-background/80 px-2 py-1 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover/code:opacity-100';
			btn.textContent = 'Copy';
			btn.addEventListener('click', () => {
				const code = pre.querySelector('code');
				if (code) {
					navigator.clipboard.writeText(code.textContent ?? '');
					btn.textContent = 'Copied!';
					setTimeout(() => (btn.textContent = 'Copy'), 2000);
				}
			});
			pre.appendChild(btn);
		}

		// Add click-to-zoom on images
		const images = container.querySelectorAll<HTMLImageElement>('img');
		for (const img of images) {
			if (img.dataset.zoomEnabled) continue;
			img.dataset.zoomEnabled = 'true';
			img.classList.add('cursor-zoom-in', 'transition-transform');
			img.addEventListener('click', () => {
				const overlay = document.createElement('div');
				overlay.className =
					'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 cursor-zoom-out p-8';
				const clone = img.cloneNode() as HTMLImageElement;
				clone.className = 'max-h-full max-w-full rounded-lg object-contain';
				// Zoom the full-size original, not the currently selected srcset entry.
				clone.removeAttribute('srcset');
				clone.removeAttribute('sizes');
				overlay.appendChild(clone);
				overlay.addEventListener('click', () => overlay.remove());
				document.addEventListener('keydown', function handler(e) {
					if (e.key === 'Escape') {
						overlay.remove();
						document.removeEventListener('keydown', handler);
					}
				});
				document.body.appendChild(overlay);
			});
		}

		toc.extractHeadings(container);
	}

	$effect(() => {
		void body;

		const timer = setTimeout(() => {
			if (contentEl) enhanceContent(contentEl);
		}, 0);

		return () => {
			clearTimeout(timer);
			toc.clear();
		};
	});
</script>

<article id="doc-content" class="doc-content mx-auto w-full max-w-4xl" data-pagefind-body>
	<header class="mb-8">
		{#if categoryTitle}
			<!-- Pagefind facet: category (hidden from the index text itself) -->
			<p
				class="text-muted-foreground mb-2 text-sm font-medium"
				data-pagefind-filter="Catégorie"
				data-pagefind-ignore="index"
			>
				{categoryTitle}
			</p>
		{/if}
		<h1 class="text-3xl font-bold tracking-tight">{meta.title}</h1>
		{#if meta.description}
			<p class="text-muted-foreground mt-2 text-lg" data-pagefind-meta="description">
				{meta.description}
			</p>
		{/if}
		<div class="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
			{#if meta.tags?.length}
				<span class="flex flex-wrap items-center gap-1.5">
					{#each meta.tags as tag (tag)}
						<!-- Indexed (searching "électricité" should surface tagged pages)
						     AND registered as a facet value. The trailing space keeps
						     adjacent tags from concatenating in search excerpts. -->
						<span data-pagefind-filter="Tag">
							<Badge text={tag} />&#32;
						</span>
					{/each}
				</span>
			{/if}
		</div>
	</header>

	<MobileToc />

	<div class="prose dark:prose-invert max-w-none" bind:this={contentEl}>
		<PortableText value={body} />
	</div>

	{#if gallery.length}
		<div class="mt-10 grid gap-4 sm:grid-cols-2">
			{#each gallery as media (media._key ?? media.url)}
				<Media {media} thumb containerClass="rounded-lg border" />
			{/each}
		</div>
	{/if}

	{#if attachments.length}
		<div class="mt-10">
			<h2 class="text-foreground mb-3 text-lg font-semibold">Fichiers</h2>
			{#each attachments as attachment (attachment._key)}
				<FileDownloadBlock value={attachment} />
			{/each}
		</div>
	{/if}

	{#if subpages.length}
		<div class="mt-10" data-pagefind-ignore>
			<h2 class="text-foreground mb-3 text-lg font-semibold">Rubriques</h2>
			<div class="grid gap-4 sm:grid-cols-2">
				{#each subpages as page (page.slug)}
					<LinkCard title={page.meta.title} description={page.meta.description} href={page.href} />
				{/each}
			</div>
		</div>
	{/if}

	<footer class="mt-12 border-t pt-6" data-pagefind-ignore>
		{#if meta.lastUpdated}
			<div class="mb-4">
				<span class="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
					<CalendarIcon class="size-3.5" />
					Dernière mise à jour : {new Date(meta.lastUpdated).toLocaleDateString('fr-FR', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</span>
			</div>
		{/if}
		<div class="flex items-center justify-end">
			<div class="flex items-center gap-1">
				<CopyUrl />
				<BackToTop />
			</div>
		</div>
	</footer>
</article>
