import { $loc, $locBlocks, META, RICHTEXT_FRAGMENT } from './fragments';

/**
 * Home singleton — landing hero (/) and docs index body (/docs).
 */
export const HOME_QUERY = /* groq */ `
	*[_type == "home"][0] {
		_id,
		_type,
		${$loc('title')},
		${$loc('tagline')},
		${$locBlocks('body', RICHTEXT_FRAGMENT)},
		"lastUpdated": _updatedAt,
		seo {
			${META}
		}
	}
`;
