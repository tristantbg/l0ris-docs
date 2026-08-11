<script lang="ts">
	import { page } from '$app/state';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { docsConfig } from '$lib/docs/config.js';
	import type { NavItem } from '$lib/docs/types.js';
	import { goto } from '$app/navigation';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import WarehouseIcon from '@lucide/svelte/icons/warehouse';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CheckIcon from '@lucide/svelte/icons/check';
	import SearchCommand from '$lib/components/search/search-command.svelte';
	import { resolveIcon } from '$lib/components/nav/icon-map';
	import type { ComponentProps } from 'svelte';

	let {
		navigation = [],
		siteTitle = docsConfig.site.title,
		ref = $bindable(null),
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & {
		navigation?: NavItem[];
		siteTitle?: string;
	} = $props();

	function isActive(href: string | undefined): boolean {
		if (!href) return false;
		return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	}

	function sectionHasActive(section: NavItem): boolean {
		return section.items?.some((item) => isActive(item.href)) ?? false;
	}

	const sidebar = Sidebar.useSidebar();

	// Icon-collapsed mode hides the submenus, so a click on a section icon
	// would toggle an invisible collapsible. Navigate to the section's first
	// page instead; expanded (and mobile sheet) keeps the accordion behavior.
	function handleSectionClick(e: MouseEvent, section: NavItem, toggle: unknown) {
		if (sidebar.state === 'collapsed' && !sidebar.isMobile) {
			const first = section.items?.find((item) => item.href)?.href;
			if (first) {
				goto(first);
				return;
			}
		}
		(toggle as ((ev: MouseEvent) => void) | undefined)?.(e);
	}
</script>

<Sidebar.Root bind:ref collapsible="icon" aria-label="Documentation navigation" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				{#if docsConfig.versions}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Sidebar.MenuButton
									size="lg"
									class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
									{...props}
								>
									<div
										class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
									>
										<WarehouseIcon class="size-4" />
									</div>
									<div class="flex flex-col gap-0.5 leading-none">
										<span class="font-semibold">{siteTitle}</span>
										<span class="">{docsConfig.versions?.current}</span>
									</div>
									<ChevronsUpDownIcon class="ms-auto" />
								</Sidebar.MenuButton>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-(--bits-dropdown-menu-anchor-width)" align="start">
							{#each docsConfig.versions.versions as version (version.label)}
								<DropdownMenu.Item
									onSelect={() => {
										if (version.href.startsWith('http')) {
											window.open(version.href, '_blank');
										} else {
											goto(version.href);
										}
									}}
								>
									{version.label}
									{#if version.label.includes(docsConfig.versions?.current ?? '')}
										<CheckIcon class="ms-auto" />
									{/if}
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{:else}
					<Sidebar.MenuButton size="lg">
						{#snippet child({ props })}
							<a href="/docs/" {...props}>
								<div
									class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
								>
									<WarehouseIcon class="size-4" />
								</div>
								<div class="flex flex-col gap-0.5 leading-none">
									<span class="font-medium">{siteTitle}</span>
								</div>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				{/if}
			</Sidebar.MenuItem>
		</Sidebar.Menu>
		<!-- Canonical spot for search in the shadcn docs sidebar; hidden while
		     collapsed to icons — the global ⌘K shortcut keeps working. -->
		<div class="group-data-[collapsible=icon]:hidden">
			<SearchCommand {navigation} />
		</div>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Documentation</Sidebar.GroupLabel>
			<Sidebar.Menu>
				{#each navigation as section (section.title)}
					<Collapsible.Root open={sectionHasActive(section)} class="group/collapsible">
						{#snippet child({ props })}
							<Sidebar.MenuItem {...props}>
								<Collapsible.Trigger>
									{#snippet child({ props })}
										{@const SectionIcon = resolveIcon(section.icon)}
										<Sidebar.MenuButton
											{...props}
											isActive={sectionHasActive(section)}
											tooltipContent={section.title}
											onclick={(e) => handleSectionClick(e, section, props.onclick)}
										>
											{#if SectionIcon}
												<SectionIcon />
											{/if}
											<span>{section.title}</span>
											<ChevronRightIcon
												class="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
											/>
										</Sidebar.MenuButton>
									{/snippet}
								</Collapsible.Trigger>
								<Collapsible.Content>
									<Sidebar.MenuSub>
										{#each section.items ?? [] as item (item.title)}
											<Sidebar.MenuSubItem>
												<Sidebar.MenuSubButton isActive={isActive(item.href)}>
													{#snippet child({ props })}
														<a href={item.href ?? '#'} {...props}>
															<span>{item.title}</span>
														</a>
													{/snippet}
												</Sidebar.MenuSubButton>
											</Sidebar.MenuSubItem>
										{/each}
									</Sidebar.MenuSub>
								</Collapsible.Content>
							</Sidebar.MenuItem>
						{/snippet}
					</Collapsible.Root>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
