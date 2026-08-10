/**
 * Full-text search over articles, ranked by where the term hits
 * (title > description > body). Used as the fallback when the static
 * Pagefind index is unavailable (dev server, preview deploys).
 *
 * `$qs` is the wildcard form of the query (`term*`) bound by the caller —
 * score() rejects string concatenation and coalesce() in its arguments, so
 * boosts target the language fields directly.
 */
export const SEARCH_QUERY = /* groq */ `
	*[
		_type == "docPage" &&
		defined(slug.current) &&
		(
			coalesce(title[$lang], title.fr) match $qs ||
			coalesce(description[$lang], description.fr) match $qs ||
			$q in tags ||
			pt::text(coalesce(body[$lang], body.fr)) match $qs
		)
	] | score(
		boost(title[$lang] match $qs, 4),
		boost(title.fr match $qs, 3),
		boost(description[$lang] match $qs, 2),
		boost(description.fr match $qs, 2),
		boost(pt::text(body[$lang]) match $qs, 1),
		pt::text(body.fr) match $qs
	) | order(_score desc) [0...8] {
		"title": coalesce(title[$lang], title.fr),
		"slug": slug.current,
		"description": coalesce(description[$lang], description.fr),
		"text": pt::text(coalesce(body[$lang], body.fr))
	}
`;
