<script lang="ts">
	import { docsConfig } from '$lib/docs/config.js';
	import type { NavItem } from '$lib/docs/types.js';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	let { prev, next }: { prev?: NavItem; next?: NavItem } = $props();

	let scrollProgress = $state(0);

	function updateProgress() {
		const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
		scrollProgress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
	}
</script>

<svelte:window onscroll={updateProgress} />

<footer class="bg-background sticky bottom-0 z-40">
	<div class="grid h-12 grid-cols-2 items-center justify-between px-4">
		<div class="flex-1">
			{#if prev}
				<a
					href={prev.href}
					class="text-muted-foreground hover:text-foreground inline-flex shrink items-center gap-1 overflow-hidden text-sm text-ellipsis whitespace-nowrap"
				>
					<ChevronLeftIcon class="size-4" />
					<span class="hidden overflow-hidden text-ellipsis sm:inline">{prev.title}</span>
					<span class="sm:hidden">Previous</span>
				</a>
			{/if}
		</div>

		<div class="flex flex-1 justify-end">
			{#if next}
				<a
					href={next.href}
					class="text-muted-foreground hover:text-foreground inline-flex shrink items-center gap-1 overflow-hidden text-sm text-ellipsis whitespace-nowrap"
				>
					<span class="hidden overflow-hidden text-ellipsis sm:inline">{next.title}</span>
					<span class="sm:hidden">Next</span>
					<ChevronRightIcon class="size-4" />
				</a>
			{/if}
		</div>
	</div>
	<div class="bg-muted h-1 w-full overflow-hidden">
		<div
			class="bg-primary h-full transition-[width] duration-150"
			style:width="{scrollProgress}%"
		></div>
	</div>
	<div class="h-2"></div>
</footer>
