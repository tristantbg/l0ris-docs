<script lang="ts">
	import { goto } from '$app/navigation';
	import SearchIcon from '@lucide/svelte/icons/search';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import HashIcon from '@lucide/svelte/icons/hash';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import type { NavItem } from '$lib/docs/types.js';

	let { navigation = [] }: { navigation?: NavItem[] } = $props();

	interface SubResult {
		title: string;
		url: string;
		excerpt: string;
	}
	interface Result {
		url: string;
		title: string;
		excerpt: string;
		subResults: SubResult[];
	}

	let open = $state(false);
	let query = $state('');
	let searchResults = $state<Result[]>([]);
	let searching = $state(false);

	// Facets from the Pagefind index, refined by the current search.
	let categoryFilters = $state<Record<string, number>>({});
	let tagFilters = $state<Record<string, number>>({});
	let selectedCategory = $state<string | null>(null);
	let selectedTags = $state<string[]>([]);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let pagefind: any = null;
	let pagefindFailed = false;

	async function loadPagefind() {
		if (pagefind || pagefindFailed) return;
		try {
			// The index is generated postbuild into /pagefind — dynamic import
			// with a full URL to bypass Vite's static analysis.
			const pagefindUrl = `${window.location.origin}/pagefind/pagefind.js`;
			pagefind = await import(/* @vite-ignore */ pagefindUrl);
			await pagefind.init();
			// Preload global facet counts so the chips render before typing.
			const filters = await pagefind.filters();
			categoryFilters = filters?.['Catégorie'] ?? {};
			tagFilters = filters?.['Tag'] ?? {};
		} catch {
			// Not available (dev server or preview deploy) → GROQ API fallback.
			pagefind = null;
			pagefindFailed = true;
		}
	}

	function activeFilters() {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const filters: Record<string, any> = {};
		if (selectedCategory) filters['Catégorie'] = [selectedCategory];
		if (selectedTags.length) filters['Tag'] = { any: selectedTags };
		return filters;
	}

	async function runPagefindSearch(q: string) {
		const search = await pagefind.debouncedSearch(q, { filters: activeFilters() }, 200);
		if (search === null) return; // superseded by a newer keystroke

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const data = await Promise.all(search.results.slice(0, 8).map((r: any) => r.data()));
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		searchResults = data.map((r: any) => ({
			url: r.url,
			title: r.meta?.title ?? r.url,
			excerpt: r.excerpt ?? '',
			subResults: (r.sub_results ?? [])
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				.filter((sub: any) => sub.title && sub.title !== r.meta?.title && sub.url?.includes('#'))
				.slice(0, 3)
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				.map((sub: any) => ({ title: sub.title, url: sub.url, excerpt: sub.excerpt ?? '' }))
		}));
		// Facet counts refined by this search.
		categoryFilters = search.filters?.['Catégorie'] ?? categoryFilters;
		tagFilters = search.filters?.['Tag'] ?? tagFilters;
		searching = false;
	}

	let apiDebounce: ReturnType<typeof setTimeout>;
	function runApiSearch(q: string) {
		clearTimeout(apiDebounce);
		apiDebounce = setTimeout(async () => {
			try {
				const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
				const data = await res.json();
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				searchResults = (data.results ?? []).map((r: any) => ({
					url: r.href,
					title: r.title,
					excerpt: r.excerpt ?? '',
					subResults: []
				}));
			} catch {
				searchResults = [];
			}
			searching = false;
		}, 200);
	}

	$effect(() => {
		const q = query;
		// Track filter state so toggling chips re-runs the search.
		void selectedCategory;
		void selectedTags;

		if (!q || q.length < 2) {
			searchResults = [];
			searching = false;
			return;
		}

		searching = true;
		loadPagefind().then(() => {
			if (pagefind) runPagefindSearch(q);
			else runApiSearch(q);
		});

		return () => clearTimeout(apiDebounce);
	});

	function toggleCategory(name: string) {
		selectedCategory = selectedCategory === name ? null : name;
	}

	function toggleTag(name: string) {
		selectedTags = selectedTags.includes(name)
			? selectedTags.filter((tag) => tag !== name)
			: [...selectedTags, name];
	}

	function navigate(url: string) {
		open = false;
		query = '';
		searchResults = [];
		goto(url);
	}

	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			open = !open;
			if (open) loadPagefind();
		}
	}

	function handleOpenChange(isOpen: boolean) {
		if (isOpen) loadPagefind();
		else {
			query = '';
			searchResults = [];
			selectedCategory = null;
			selectedTags = [];
		}
	}

	const topTags = $derived(
		Object.entries(tagFilters)
			.filter(([, count]) => count > 0)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 8)
	);
</script>

<svelte:window onkeydown={handleKeydown} />

<Button
	variant="outline"
	class="text-muted-foreground relative h-8 w-full justify-start rounded-md text-sm"
	onclick={() => {
		open = true;
		loadPagefind();
	}}
>
	<SearchIcon class="mr-2 size-4" />
	<span class="inline-flex">Rechercher...</span>
	<kbd
		class="bg-muted text-muted-foreground pointer-events-none ml-auto hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none sm:flex"
	>
		<span class="text-xs">⌘</span>K
	</kbd>
</Button>

<Command.Dialog bind:open onOpenChange={handleOpenChange} shouldFilter={false}>
	<Command.Input placeholder="Rechercher dans la documentation..." bind:value={query} />

	{#if !pagefindFailed && (Object.keys(categoryFilters).length || topTags.length)}
		<div class="flex flex-wrap items-center gap-1.5 border-b px-3 py-2">
			{#each Object.entries(categoryFilters) as [name, count] (name)}
				<button type="button" onclick={() => toggleCategory(name)} class="cursor-pointer">
					<Badge variant={selectedCategory === name ? 'default' : 'secondary'}>
						{name}
						{#if query.length >= 2}<span class="opacity-60">&nbsp;{count}</span>{/if}
					</Badge>
				</button>
			{/each}
			{#if query.length >= 2 && topTags.length}
				<span class="bg-border mx-1 h-4 w-px"></span>
				{#each topTags as [name, count] (name)}
					<button type="button" onclick={() => toggleTag(name)} class="cursor-pointer">
						<Badge variant={selectedTags.includes(name) ? 'default' : 'outline'}>
							{name}
							<span class="opacity-60">&nbsp;{count}</span>
						</Badge>
					</button>
				{/each}
			{/if}
		</div>
	{/if}

	<Command.List>
		<Command.Empty>
			{#if searching}
				Recherche...
			{:else if query.length > 0}
				Aucun résultat.
			{:else}
				Tapez pour rechercher...
			{/if}
		</Command.Empty>

		{#if searchResults.length > 0}
			<Command.Group heading="Résultats">
				{#each searchResults as result (result.url)}
					<Command.Item value={result.url} onSelect={() => navigate(result.url)}>
						<FileTextIcon class="shrink-0" />
						<div class="flex min-w-0 flex-col gap-0.5 overflow-hidden">
							<span class="truncate font-medium">{result.title}</span>
							{#if result.excerpt}
								<span class="text-muted-foreground truncate text-xs">
									{@html result.excerpt}
								</span>
							{/if}
						</div>
					</Command.Item>
					{#each result.subResults as sub (sub.url)}
						<Command.Item value={sub.url} onSelect={() => navigate(sub.url)} class="ps-8">
							<HashIcon class="size-3.5 shrink-0 opacity-60" />
							<div class="flex min-w-0 flex-col gap-0.5 overflow-hidden">
								<span class="truncate text-sm">{sub.title}</span>
								{#if sub.excerpt}
									<span class="text-muted-foreground truncate text-xs">
										{@html sub.excerpt}
									</span>
								{/if}
							</div>
						</Command.Item>
					{/each}
				{/each}
			</Command.Group>
		{:else if !query}
			{#each navigation as section (section.title)}
				<Command.Group heading={section.title}>
					{#each section.items ?? [] as item (item.href ?? item.title)}
						{#if item.href}
							<Command.Item value={item.href} onSelect={() => navigate(item.href ?? '')}>
								<FileTextIcon />
								<span>{item.title}</span>
							</Command.Item>
						{/if}
					{/each}
				</Command.Group>
			{/each}
		{/if}
	</Command.List>
</Command.Dialog>
