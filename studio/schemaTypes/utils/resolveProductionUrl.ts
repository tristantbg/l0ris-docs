import { type ResolveProductionUrlContext } from 'sanity'
import { linkResolver } from '../../../web/src/lib/utils/linkResolver'

const PRODUCTION_URL =
    process.env.SANITY_STUDIO_PRODUCTION_URL ||
    process.env.SANITY_STUDIO_PREVIEW_ORIGIN ||
    ''

/**
 * Resolves a production URL for the "Open preview" button in the Studio.
 * Used with the `document.productionUrl` config option.
 */
export async function resolveProductionUrl(
    prev: string | undefined,
    context: ResolveProductionUrlContext
): Promise<string | undefined> {
    const { document: doc } = context
    const path = linkResolver(doc as Parameters<typeof linkResolver>[0])

    if (!path) return prev

    return `${PRODUCTION_URL}${path}`
}
