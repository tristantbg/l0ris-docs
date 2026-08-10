<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import DarkModeSwitcher from '$lib/components/theme/dark-mode-switcher.svelte';
	import SanityLink from '$lib/components/portabletext/sanity-link.svelte';
	import { fallbackIcon, resolveIcon } from '$lib/components/nav/icon-map';
	import { docsConfig } from '$lib/docs/config.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';

	let { data } = $props();

	const siteTitle = $derived(data.settings?.siteTitle ?? docsConfig.site.title);
	const heroTitle = $derived(data.home?.title ?? siteTitle);
	const tagline = $derived(
		data.home?.tagline ?? data.settings?.description ?? docsConfig.site.description
	);
</script>

<svelte:head>
	<title>{siteTitle}</title>
	{#if tagline}
		<meta name="description" content={tagline} />
	{/if}
</svelte:head>

<!-- Navbar -->
<nav class="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
	<div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
		<div class="flex items-center gap-2">
			<BookOpenIcon class="text-primary size-6" />
			<span class="text-lg font-bold">{siteTitle}</span>
		</div>
		<div class="hidden items-center gap-6 md:flex">
			<a href="/" class="text-foreground text-sm font-medium">Accueil</a>
			<a href="/docs/" class="text-muted-foreground hover:text-foreground text-sm">Documentation</a>
		</div>
		<div class="flex items-center gap-2">
			<DarkModeSwitcher />
		</div>
	</div>
</nav>

<!-- Hero Section -->
<section class="relative overflow-hidden">
	<div class="from-primary/5 via-background to-background absolute inset-0 bg-linear-to-b"></div>
	<div
		class="from-primary/10 to-primary/0 absolute top-0 left-1/2 hidden size-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-b blur-3xl sm:block"
	></div>
	<div class="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:py-40">
		<h1 class="text-foreground mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
			{heroTitle}
		</h1>
		{#if tagline}
			<p class="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg sm:text-xl">
				{tagline}
			</p>
		{/if}
		<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
			<Button size="lg" href="/docs/" class="gap-2 px-6">
				Consulter la documentation
				<ArrowRightIcon class="size-4" />
			</Button>
		</div>
	</div>
</section>

<!-- Sections -->
{#if data.sections?.length}
	<section class="border-t py-20 sm:py-28">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="mb-14 text-center">
				<h2 class="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
					Les rubriques
				</h2>
			</div>
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each data.sections as section (section.slug)}
					{@const Icon = resolveIcon(section.icon) ?? fallbackIcon}
					<a
						href={section.href}
						class="group hover:border-primary/20 rounded-xl border p-6 transition-all hover:shadow-lg"
					>
						<div
							class="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-lg"
						>
							<Icon class="size-6" />
						</div>
						<h3 class="text-foreground mb-2 text-lg font-semibold">{section.title}</h3>
						{#if section.description}
							<p class="text-muted-foreground text-sm leading-relaxed">
								{section.description}
							</p>
						{/if}
					</a>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- Footer -->
<footer class="border-t py-12">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		{#if data.settings?.footerMenu?.length}
			<ul class="mb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
				{#each data.settings.footerMenu as item (item._key)}
					<li>
						<SanityLink
							link={item.link}
							class="text-muted-foreground hover:text-foreground text-sm"
						>
							{item.label}
						</SanityLink>
					</li>
				{/each}
			</ul>
		{/if}
		<div class="text-muted-foreground text-center text-sm">
			&copy; {new Date().getFullYear()}
			{siteTitle}
		</div>
	</div>
</footer>
