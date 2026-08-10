import type { ComponentType } from 'react'
import {
  orderableDocumentListDeskItem,
  type OrderableListConfig,
} from '@sanity/orderable-document-list'
import { ListItem, ListItemBuilder, StructureBuilder } from 'sanity/structure'
import { apiVersion } from '../schemaTypes/utils/apiVersion'

type Ordering = { field: string; direction: 'asc' | 'desc' }

/**
 * Drop-in replacement for `orderableDocumentListDeskItem` that fixes a plugin
 * bug: the plugin sets `canHandleIntent(() => createIntent !== false)` on the
 * list's child node, which (with `createIntent` unset) evaluates to `true` for
 * *every* intent. That makes the node greedily claim the edit-intent for any
 * document type opened from global search, routing e.g. an artwork into this
 * list and rendering it with the wrong (`.schemaType(type)`) schema.
 *
 * We re-scope `canHandleIntent` to the orderable type only.
 */
export const orderableList = (config: OrderableListConfig): ListItem => {
  const item = orderableDocumentListDeskItem(config)
  const child = item.child
  if (!child || typeof child === 'function') return item
  return {
    ...item,
    child: {
      ...child,
      canHandleIntent: (_intentName: string, params: { type?: string }) =>
        params?.type === config.type,
    },
  } as ListItem
}

/**
 * A flat "view" list item: one filtered document list behind a labelled entry.
 * Use for state slices like "Upcoming", "Highlights", "Missing slug".
 */
export const filteredList = (
  S: StructureBuilder,
  opts: {
    title: string
    icon?: ComponentType
    filter: string
    params?: Record<string, unknown>
    ordering?: Ordering[]
  },
): ListItemBuilder => {
  let list = S.documentList().title(opts.title).apiVersion(apiVersion).filter(opts.filter)
  if (opts.params) list = list.params(opts.params)
  if (opts.ordering) list = list.defaultOrdering(opts.ordering)
  const item = S.listItem().title(opts.title)
  return (opts.icon ? item.icon(opts.icon) : item).child(list)
}

/**
 * A two-level "By <reference>" drill-down: pick a term from `referenceType`,
 * then see every `targetType` document that references it.
 *
 * `match` is the GROQ predicate that ties the target back to the selected
 * term id (available as `$id`), e.g.
 *   single ref:  `category._ref == $id`
 *   array ref:   `$id in types[]._ref`
 *
 * The first-level term list hides terms with no matching target: the predicate
 * is derived from `match` by swapping the selected-term placeholder (`$id`) for
 * the current term's id (`^._id`) inside an existence subquery, so e.g. "By
 * Type" lists only types actually used by an artwork. Pass `referenceFilter` to
 * override this with a custom term-list predicate.
 */
export const byReference = (
  S: StructureBuilder,
  opts: {
    title: string
    icon?: ComponentType
    referenceType: string
    referenceFilter?: string
    referenceOrdering?: Ordering[]
    targetType: string
    match: string
    targetOrdering?: Ordering[]
  },
): ListItemBuilder => {
  const usedFilter =
    opts.referenceFilter ??
    `count(*[_type == "${opts.targetType}" && ${opts.match.replace(/\$id/g, '^._id')}]) > 0`
  let refList = S.documentList()
    .title(opts.title)
    .apiVersion(apiVersion)
    .filter(`_type == "${opts.referenceType}" && ${usedFilter}`)
  if (opts.referenceOrdering) refList = refList.defaultOrdering(opts.referenceOrdering)

  refList = refList.child((id: string) => {
    let targetList = S.documentList()
      .title(opts.title)
      .apiVersion(apiVersion)
      .filter(`_type == "${opts.targetType}" && ${opts.match}`)
      .params({ id })
    if (opts.targetOrdering) targetList = targetList.defaultOrdering(opts.targetOrdering)
    return targetList
  })

  const item = S.listItem().title(opts.title)
  return (opts.icon ? item.icon(opts.icon) : item).child(refList)
}
