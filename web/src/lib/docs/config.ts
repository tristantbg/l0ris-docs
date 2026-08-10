import type { DocsConfig } from './types.js';

/**
 * Static site configuration. Content-level values (site title, social
 * links, footer) come from the Sanity `settings` singleton at runtime —
 * the values below are fallbacks while that document is empty.
 *
 * The sidebar is no longer configured here: it is generated from the
 * Sanity doc tree (top-level pages become sections).
 */
export const docsConfig: DocsConfig = {
	site: {
		title: 'Lauris Docs',
		description: 'Base de connaissances de la maison de Lauris.'
	},
	toc: {
		minDepth: 2,
		maxDepth: 3
	},
	i18n: {
		defaultLocale: 'fr',
		locales: [
			{ code: 'fr', label: 'Français', flag: '🇫🇷' },
			{ code: 'en', label: 'English', flag: '🇬🇧' }
		]
	}
};

export const DEFAULT_LOCALE = docsConfig.i18n?.defaultLocale ?? 'fr';
