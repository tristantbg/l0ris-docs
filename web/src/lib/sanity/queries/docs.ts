import {
	$loc,
	$locBlocks,
	FILE_DOWNLOAD_FRAGMENT,
	MEDIA_FRAGMENT,
	RICHTEXT_FRAGMENT,
	SEO_FRAGMENT
} from './fragments';

/** Ordered sidebar sections. */
export const CATEGORIES_QUERY = /* groq */ `
	*[_type == "category" && defined(slug.current)] | order(orderRank asc) {
		_id,
		_type,
		${$loc('title')},
		"slug": slug.current,
		${$loc('description')},
		icon
	}
`;

/** Fields needed to build the sidebar, prev/next and listings. */
export const DOC_NAV_FIELDS = /* groq */ `
	_id,
	_type,
	${$loc('title')},
	"slug": slug.current,
	"category": category->slug.current,
	tags,
	${$loc('description')},
	"lastUpdated": _updatedAt
`;

/** Every article, in global reading order (category order, then rank). */
export const DOCS_NAV_QUERY = /* groq */ `
	*[_type == "docPage" && defined(slug.current)]
		| order(category->orderRank asc, orderRank asc) {
		${DOC_NAV_FIELDS}
	}
`;

/** Single article by slug. */
export const DOC_QUERY = /* groq */ `
	*[_type == "docPage" && slug.current == $slug][0] {
		${DOC_NAV_FIELDS},
		"categoryTitle": coalesce(category->title[$lang], category->title.fr),
		${$locBlocks('body', RICHTEXT_FRAGMENT)},
		gallery[] {
			${MEDIA_FRAGMENT}
		},
		attachments[] {
			_key,
			_type,
			${FILE_DOWNLOAD_FRAGMENT}
		},
		${SEO_FRAGMENT}
	}
`;

/**
 * Full-corpus dump for llms-full.txt: nav fields + body, in reading order.
 */
export const DOCS_FULL_QUERY = /* groq */ `
	*[_type == "docPage" && defined(slug.current)]
		| order(category->orderRank asc, orderRank asc) {
		${DOC_NAV_FIELDS},
		${$locBlocks('body', RICHTEXT_FRAGMENT)}
	}
`;
