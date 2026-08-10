// ./src/defaultDocumentNode.ts

import { urlSearchParamPreviewPerspective } from '@sanity/preview-url-secret/constants'
import { isDev, type SanityDocument } from 'sanity'
import { Iframe, UrlResolver } from 'sanity-plugin-iframe-pane'
import { referencesView } from 'sanity-plugin-references'
import { type DefaultDocumentNodeResolver } from 'sanity/structure'
import { linkResolver } from '../web/src/lib/utils/linkResolver'

const frontendUrl = isDev
  ? 'http://localhost:5173'
  : process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'http://localhost:5173'

const getPreviewUrl: UrlResolver = (
  doc: any | SanityDocument | null,
  perspective
) => {
  const path = linkResolver(doc ?? {})
  const url = new URL(path, frontendUrl)

  url.searchParams.set('preview', 'true')
  url.searchParams.set('token', 'preview-token')
  url.searchParams.set(
    urlSearchParamPreviewPerspective,
    perspective.perspectiveStack.toString()
  )

  return url.toString()
}

// Import this into the deskTool() plugin
// Documents with a meaningful frontend route worth an iframe preview pane.
const previewTypes = new Set(['home', 'docPage'])

export const defaultDocumentNode: DefaultDocumentNodeResolver = (
  S,
  { schemaType }
) => {
  const hasPreview = previewTypes.has(schemaType)

  if (hasPreview) {
    return S.document().views([
      S.view.form(),
      S.view
        .component(Iframe)
        .options({
          url: getPreviewUrl,
          reload: {
            button: true,
          },
        })
        .title('Preview'),
      referencesView(S),
    ])
  }

  return S.document().views([S.view.form(), referencesView(S)])
}
