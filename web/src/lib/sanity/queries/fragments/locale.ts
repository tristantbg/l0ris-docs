/**
 * GROQ helpers for field-level translations.
 *
 * Every locale* type in the studio is an object with subfields per language.
 * Queries project the active language via $lang (injected by
 * `locals.sanity.loadQuery`, default 'fr') and fall back to FR — the wiki's
 * default language — when the requested language is empty.
 */

/**
 * Project a localized scalar/text field as a flat value.
 *   `${$loc('title')}` → `"title": coalesce(title[$lang], title.fr)`
 */
export const $loc = (field: string, alias = field) =>
	`"${alias}": coalesce(${field}[$lang], ${field}.fr)`;

/**
 * Project a localized rich-text field as an array of blocks with the given
 * inner fragment applied.
 */
export const $locBlocks = (field: string, blocksFragment: string, alias = field) =>
	`"${alias}": coalesce(${field}[$lang], ${field}.fr)[] { ${blocksFragment} }`;

/** Localized value living on the image/file asset (sanity-plugin-media). */
export const $assetLoc = (field: string) => `coalesce(asset->${field}[$lang], asset->${field}.fr)`;
