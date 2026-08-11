<script lang="ts">
	import AutoBreadcrumb from '$lib/components/nav/auto-breadcrumb.svelte';
	import DarkModeSwitcher from '$lib/components/theme/dark-mode-switcher.svelte';
	import LanguageSwitcher from '$lib/components/language-switcher.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
</script>

<!-- Canonical shadcn inset header: trigger + vertical separator + breadcrumb,
     easing from h-16 to h-12 while the sidebar is collapsed to icons. -->
<header
	class="bg-background sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
>
	<div class="flex w-full items-center gap-2 px-4">
		<Sidebar.Trigger class="-ms-1" />
		<Separator orientation="vertical" class="me-2 data-[orientation=vertical]:h-4" />
		<AutoBreadcrumb />
		<div class="ms-auto flex items-center gap-1">
			<LanguageSwitcher />
			<DarkModeSwitcher />
		</div>
	</div>
</header>
