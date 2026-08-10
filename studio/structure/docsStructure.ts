import { BookIcon } from '@sanity/icons/Book'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { FolderIcon } from '@sanity/icons/Folder'
import { ListItemBuilder } from 'sanity/structure'
import { apiVersion } from '../schemaTypes/utils/apiVersion'
import defineStructure from '../schemaTypes/utils/defineStructure'
import { orderableList } from './helpers'

/**
 * Documentation desk (sandocs-style):
 * - Categories — drag-and-drop ordered sidebar sections.
 * - All articles — one global orderable list.
 * - By category — browse a category's articles in reading order.
 */
export default defineStructure<ListItemBuilder>(async (S, context) =>
  S.listItem()
    .title('Documentation')
    .icon(BookIcon)
    .child(
      S.list()
        .title('Documentation')
        .items([
          orderableList({
            type: 'category',
            title: 'Categories',
            icon: FolderIcon,
            S,
            context,
          }),
          orderableList({
            type: 'docPage',
            title: 'All articles',
            icon: DocumentTextIcon,
            S,
            context,
          }),
          S.divider(),
          S.listItem()
            .title('By category')
            .icon(FolderIcon)
            .child(
              S.documentTypeList('category')
                .title('By category')
                .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                .child((categoryId: string) =>
                  S.documentList()
                    .title('Articles')
                    .apiVersion(apiVersion)
                    .filter('_type == "docPage" && category._ref == $categoryId')
                    .params({ categoryId })
                    .defaultOrdering([{ field: 'orderRank', direction: 'asc' }]),
                ),
            ),
        ]),
    ),
)
