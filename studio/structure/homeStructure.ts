import { HomeIcon } from '@sanity/icons/Home'
import { ListItemBuilder } from 'sanity/structure'
import defineStructure from '../schemaTypes/utils/defineStructure'

export default defineStructure<ListItemBuilder>((S) =>
  S.listItem()
    .title('Home')
    .icon(HomeIcon)
    .schemaType('home')
    .child(
      S.defaultDocument({ schemaType: 'home', documentId: 'home' }).title(
        'Home'
      )
    )
)
