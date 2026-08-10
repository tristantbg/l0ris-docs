import { $loc, LINK_FRAGMENT, META } from './fragments';

/**
 * Site-wide settings singleton.
 */
export const SETTINGS_QUERY = /* groq */ `
	*[_type == "settings"][0] {
		_id,
		_type,
		${$loc('siteTitle')},
		${$loc('description')},
		footerMenu[] {
			_key,
			${$loc('label')},
			link { ${LINK_FRAGMENT} }
		},
		seo {
			${META}
		}
	}
`;
