export interface DocMeta {
	title: string;
	description: string;
	/** Category slug the article belongs to. */
	category?: string;
	tags?: string[];
	lastUpdated?: string;
}

export interface DocCategory {
	slug: string;
	title: string;
	description: string;
	/** Lucide icon name. */
	icon?: string;
}

export interface DocPage {
	/** Sanity document id (used for the Studio edit link). */
	_id?: string;
	slug: string;
	href: string;
	meta: DocMeta;
	/** Portable text body (already locale-resolved and code-highlighted). */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	body?: any[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	gallery?: any[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	attachments?: any[];
}

export interface NavItem {
	title: string;
	href?: string;
	items?: NavItem[];
	order?: number;
	isActive?: boolean;
	/** Lucide icon name — resolved to a component in the sidebar. */
	icon?: string;
}

export interface SiteConfig {
	title: string;
	description: string;
	url?: string;
	logo?: string;
	logoDark?: string;
	favicon?: string;
}

export interface VersionConfig {
	current: string;
	versions: { label: string; href: string }[];
}

export interface LocaleConfig {
	defaultLocale: string;
	locales: { code: string; label: string; flag?: string }[];
}

export interface DocsConfig {
	site: SiteConfig;
	toc?: { minDepth?: number; maxDepth?: number };
	versions?: VersionConfig;
	i18n?: LocaleConfig;
}

export interface TableOfContentsItem {
	id: string;
	text: string;
	depth: number;
}

export interface SearchResult {
	title: string;
	href: string;
	excerpt?: string;
}
