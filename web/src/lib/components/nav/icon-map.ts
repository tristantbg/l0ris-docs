/**
 * Resolves the Lucide icon names stored on Sanity doc pages to components.
 * Icons must be statically imported (no dynamic lucide imports with Vite),
 * so this map covers a practical set for a house wiki — extend as needed.
 */
import type { Component } from 'svelte';
import BellIcon from '@lucide/svelte/icons/bell';
import BookOpenIcon from '@lucide/svelte/icons/book-open';
import CameraIcon from '@lucide/svelte/icons/camera';
import CctvIcon from '@lucide/svelte/icons/cctv';
import DropletsIcon from '@lucide/svelte/icons/droplets';
import FileTextIcon from '@lucide/svelte/icons/file-text';
import FlameIcon from '@lucide/svelte/icons/flame';
import FlowerIcon from '@lucide/svelte/icons/flower-2';
import HammerIcon from '@lucide/svelte/icons/hammer';
import HouseIcon from '@lucide/svelte/icons/house';
import KeyIcon from '@lucide/svelte/icons/key';
import LeafIcon from '@lucide/svelte/icons/leaf';
import LightbulbIcon from '@lucide/svelte/icons/lightbulb';
import MapPinIcon from '@lucide/svelte/icons/map-pin';
import RocketIcon from '@lucide/svelte/icons/rocket';
import SettingsIcon from '@lucide/svelte/icons/settings';
import ShieldIcon from '@lucide/svelte/icons/shield';
import SunIcon from '@lucide/svelte/icons/sun';
import ThermometerIcon from '@lucide/svelte/icons/thermometer';
import TreePineIcon from '@lucide/svelte/icons/tree-pine';
import TreesIcon from '@lucide/svelte/icons/trees';
import UtensilsIcon from '@lucide/svelte/icons/utensils';
import WavesIcon from '@lucide/svelte/icons/waves';
import WrenchIcon from '@lucide/svelte/icons/wrench';
import ZapIcon from '@lucide/svelte/icons/zap';

const iconMap: Record<string, Component> = {
	bell: BellIcon,
	'book-open': BookOpenIcon,
	camera: CameraIcon,
	cctv: CctvIcon,
	droplets: DropletsIcon,
	'file-text': FileTextIcon,
	flame: FlameIcon,
	'flower-2': FlowerIcon,
	flower: FlowerIcon,
	hammer: HammerIcon,
	house: HouseIcon,
	home: HouseIcon,
	key: KeyIcon,
	leaf: LeafIcon,
	lightbulb: LightbulbIcon,
	'map-pin': MapPinIcon,
	rocket: RocketIcon,
	settings: SettingsIcon,
	shield: ShieldIcon,
	sun: SunIcon,
	thermometer: ThermometerIcon,
	'tree-pine': TreePineIcon,
	trees: TreesIcon,
	utensils: UtensilsIcon,
	waves: WavesIcon,
	wrench: WrenchIcon,
	zap: ZapIcon
};

export function resolveIcon(name?: string | null): Component | undefined {
	if (!name) return undefined;
	return iconMap[name] ?? undefined;
}

export const fallbackIcon = FileTextIcon;
