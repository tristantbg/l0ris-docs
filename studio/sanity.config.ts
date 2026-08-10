import { codeInput } from '@sanity/code-input'
import { languageFilter } from '@sanity/language-filter'
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { media, mediaAssetSource } from 'sanity-plugin-media'
import { muxInput } from 'sanity-plugin-mux-input'
import { vimeoSync } from 'sanity-plugin-vimeo-sync'
import { linkField } from 'sanity-plugin-link-field'
import { structureTool } from 'sanity/structure'
import { references } from 'sanity-plugin-references'
import { defaultDocumentNode } from './documentNode'
import { documents } from './schemaTypes/documents'
import { LOCALES, DEFAULT_LOCALE } from './schemaTypes/locale'
import { resolveProductionUrl } from './schemaTypes/utils/resolveProductionUrl'
import { schemaTypes, singletons } from './schemaTypes'
import { structure } from './structure'
import { imageResizerPlugin } from 'sanity-plugin-image-resizer'
import { selectedImageAssetSource } from './schemaTypes/components/SelectedImageAssetSource'

const videoProvider = process.env.SANITY_STUDIO_VIDEO_PROVIDER || 'mux'
const folderId = process.env.SANITY_STUDIO_VIMEO_FOLDER_ID
const videoPlugin =
  videoProvider === 'vimeo' ? vimeoSync({ folderId }) : muxInput({ static_renditions: ['270p', '720p', '1080p'] })

const devOnlyPlugins = [visionTool(), imageResizerPlugin({ imageMaxWidth: 7000 })]

export default defineConfig({
  name: 'default',
  title: process.env.SANITY_STUDIO_PROJECT_TITLE || 'Project Title',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool({
      defaultDocumentNode: defaultDocumentNode,
      structure,
    }),
    languageFilter({
      supportedLanguages: LOCALES.map(({ id, title }) => ({ id, title })),
      defaultLanguages: [DEFAULT_LOCALE.id],
      // Apply to every locale-wrapped field; un-prefixed object fields stay visible.
      documentTypes: undefined,
      filterField: (enclosingType, field, selectedLanguageIds) =>
        !enclosingType.name.startsWith('locale') ||
        selectedLanguageIds.includes(field.name),
    }),
    media({
      locales: LOCALES.map(({ id, title }) => ({ id, title })),
      creditLine: { enabled: true },
    }),
    codeInput(),
    videoPlugin,
    // Every document type plus the page singletons (settings is not a page).
    linkField({
      linkableSchemaTypes: [...documents, ...singletons]
        .map((doc) => doc.name)
        .filter((name) => name !== 'settings'),
      enableLinkParameters: false,
      enableAnchorLinks: false,
    }),
    references(),
    ...devOnlyPlugins,
  ],

  form: {
    image: {
      // "Used images" lets editors reuse already-referenced assets alongside
      // the default media library, instead of re-uploading.
      assetSources: () => [mediaAssetSource, selectedImageAssetSource],
    },
    // Don't use this plugin when selecting files only (but allow all other enabled asset sources)
    file: {
      assetSources: (previousAssetSources) => {
        return previousAssetSources.filter(
          (assetSource) => assetSource !== mediaAssetSource
        )
      },
    },
  },
  schema: {
    types: schemaTypes,
  },
  document: {
    productionUrl: resolveProductionUrl,
  },
})
