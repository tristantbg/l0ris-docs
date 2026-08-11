<script lang="ts">
	import { setContext } from 'svelte';
	import type { DocMeta, DocPage } from '$lib/docs/types.js';
	import { toc } from '$lib/docs/toc.svelte';
	import { lightboxUrl, LIGHTBOX_CONTEXT } from '$lib/state/lightbox-url';
	import { openSearch } from '$lib/state/search.svelte';
	import Lightbox from '$lib/components/lightbox.svelte';
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

	// Every visual on the page — body media first (images, videos, external
	// embeds, in document order), then the gallery grid — becomes a slide of
	// one shared lightbox, opened by clicking any of them.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function isSlide(block: any): boolean {
		if (block?._type === 'video') return true;
		if (block?._type === 'externalVideo') return Boolean(block.url);
		if (block?._type === 'image' || block?._type === 'imageAlt')
			return Boolean(block.asset?._ref ?? block.asset?._id);
		return false;
	}

	const lightbox = lightboxUrl('media');
	const slides = $derived([...body.filter(isSlide), ...gallery.filter(isSlide)]);

	function openByKey(key: string | undefined) {
		const index = slides.findIndex((slide) => slide._key === key);
		if (index !== -1) lightbox.open(index);
	}

	// Lets PortableText image blocks (rendered deep inside <PortableText>)
	// open the lightbox on their own slide.
	setContext(LIGHTBOX_CONTEXT, { open: openByKey });

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
					<!-- Tag words are indexed once from this hidden, comma-separated
					     text (searching "électricité" surfaces tagged pages, with
					     clean excerpts). The visible chips only register the facet
					     values — their text is ignored, so adjacent badges can't
					     concatenate into "filtrationéquipement" in excerpts.
					     Clicking a chip opens the search palette filtered on it. -->
					<span class="sr-only">{meta.tags.join(', ')}</span>
					{#each meta.tags as tag (tag)}
						<span data-pagefind-filter="Tag" data-pagefind-ignore="index">
							<button
								type="button"
								class="cursor-pointer transition-opacity hover:opacity-75"
								onclick={() => openSearch(tag)}
								aria-label={`Rechercher le tag ${tag}`}
							>
								<Badge text={tag} />
							</button>
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
				<button
					type="button"
					class="block cursor-zoom-in text-left"
					onclick={() => openByKey(media._key)}
					aria-label="Agrandir le média"
				>
					<Media {media} thumb containerClass="rounded-lg border" />
				</button>
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

	{#if lightbox.index !== null && slides.length}
		<Lightbox {slides} initialIndex={lightbox.index} url={lightbox} onclose={lightbox.close} />
	{/if}
</article>
