import { ListItemBuilder, StructureResolver } from 'sanity/structure'
import docsStructure from './docsStructure'
import homeStructure from './homeStructure'
import settingsStructure from './settingsStructure'

// Types placed by hand below. Anything not listed here falls through to the
// catch-all at the bottom so newly added schema types stay reachable.
const placedTopLevel = new Set([
  // singletons
  'home',
  'settings',
  // documents (nested inside the sections above)
  'docPage',
  'category',
  // built-ins we don't want as top-level items
  'media.tag',
  'media.folder',
  'mux.videoAsset',
  '__blank__',
])

const unplacedDocTypes = (listItem: ListItemBuilder) => {
  const id = listItem.getId()
  if (!id) return false
  return !placedTopLevel.has(id)
}

export const structure: StructureResolver = async (S, context) =>
  S.list()
    .title('Content')
    .items([
      // ── Site-wide singletons ─────────────────────────────
      await settingsStructure(S, context),
      await homeStructure(S, context),
      S.divider(),

      // ── Documentation ────────────────────────────────────
      await docsStructure(S, context),
      S.divider(),

      // ── Anything else (newly added / unplaced types) ─────
      ...S.documentTypeListItems().filter(unplacedDocTypes),
    ])
