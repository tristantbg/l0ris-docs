import type { ParamMatcher } from '@sveltejs/kit';
import { DEFAULT_LOCALE, docsConfig } from '$lib/docs/config.js';

// Match only the locales actually configured (minus the default, which is
// unprefixed). A generic 2-letter pattern would swallow short article slugs
// like /docs/uv/ or /docs/ph/.
const localeCodes = new Set(
	(docsConfig.i18n?.locales ?? []).map((l) => l.code).filter((code) => code !== DEFAULT_LOCALE)
);

export const match: ParamMatcher = (param) => {
	return localeCodes.has(param);
};
