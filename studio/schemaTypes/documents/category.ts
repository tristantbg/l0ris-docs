import { FolderIcon } from '@sanity/icons/Folder'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'
import { defineField, defineType } from 'sanity'
import { isUniqueWithinType, validateSlug } from '../utils/validateSlug'

/**
 * Documentation category (sandocs-style). Categories are the sidebar
 * sections; articles reference one category and are ordered inside it
 * by drag-and-drop (orderRank).
 */
export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: FolderIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'category' }),
    defineField({
      name: 'title',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title.fr',
        maxLength: 96,
        isUnique: isUniqueWithinType,
      },
      validation: validateSlug,
    }),
    defineField({
      name: 'description',
      type: 'localeText',
      description: 'Short line shown on the docs index and category cards.',
    }),
    defineField({
      name: 'icon',
      type: 'string',
      description:
        'Lucide icon name shown in the sidebar (e.g. "waves", "flower-2", "house", "shield"). See lucide.dev/icons.',
    }),
  ],
  preview: {
    select: { title: 'title.fr', titleEn: 'title.en', slug: 'slug.current' },
    prepare({ title, titleEn, slug }) {
      return {
        title: title || titleEn || 'Untitled',
        subtitle: slug,
      }
    },
  },
})
