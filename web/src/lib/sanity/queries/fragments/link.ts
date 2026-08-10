/**
 * Link fragment for sanity-plugin-link-field annotations and linkBlock.
 * `internalLink` is dereferenced so the web can resolve it to a route.
 */
export const LINK_FRAGMENT = /* groq */ `
	...,
	internalLink->{
		_type,
		slug,
		title
	}
`;
