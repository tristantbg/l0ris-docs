import { CogIcon } from '@sanity/icons/Cog'
import { ListItemBuilder } from 'sanity/structure'
import defineStructure from '../schemaTypes/utils/defineStructure'

export default defineStructure<ListItemBuilder>((S) =>
  S.listItem()
    .title('Settings')
    .icon(CogIcon)
    .schemaType('settings')
    .child(
      S.defaultDocument({
        schemaType: 'settings',
        documentId: 'settings',
      }).title('Settings')
    )
)
