import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'
import { defineField, defineType } from 'sanity'
import { isUniqueWithinType, validateSlug } from '../utils/validateSlug'

/**
 * Tag vocabulary — derived from the actual wiki content. Kept as a flat
 * list (sandocs-style simplicity); extend freely, the web renders whatever
 * is stored.
 */
export const DOC_TAGS = [
  "traitement de l'eau",
  'filtration',
  'électricité',
  'chauffage',
  'éclairage',
  'sécurité',
  'entretien',
  'hivernage',
  "mode d'emploi",
  'équipement',
  'réglages',
  'plantes',
  'cuisine extérieure',
  'matériel',
  'alarme',
  'caméras',
  'contrat',
  'accès',
]

/**
 * A documentation article (sandocs-style): flat slug, one category,
 * drag-and-drop ordering inside the category via orderRank.
 */
export const docPage = defineType({
  name: 'docPage',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  orderings: [orderRankOrdering],
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'media', title: 'Gallery & files' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    orderRankField({ type: 'docPage' }),
    defineField({
      name: 'title',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'URL segment under /docs/, e.g. "couverture-prima".',
      options: {
        source: 'title.fr',
        maxLength: 96,
        isUnique: isUniqueWithinType,
      },
      validation: validateSlug,
      group: 'content',
    }),
    defineField({
      name: 'category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [
        {
          type: 'string',
          options: { list: DOC_TAGS.map((tag) => ({ title: tag, value: tag })) },
        },
      ],
      options: { layout: 'tags' },
      description: 'Thèmes de l’article — utilisés comme filtres de recherche.',
      group: 'content',
    }),
    defineField({
      name: 'description',
      type: 'localeText',
      description: 'Short summary shown under the title, in search results and in SEO metadata.',
      group: 'content',
    }),
    defineField({
      name: 'body',
      type: 'localeRichtext',
      group: 'content',
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      of: [{ type: 'imageAlt' }, { type: 'video' }],
      description: 'Media shown as a grid after the body text.',
      group: 'media',
    }),
    defineField({
      name: 'attachments',
      type: 'array',
      of: [{ type: 'fileDownload' }],
      description: 'Downloadable files listed at the end of the page.',
      group: 'media',
    }),
    defineField({
      name: 'seo',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title.fr',
      titleEn: 'title.en',
      slug: 'slug.current',
      category: 'category.title.fr',
      media: 'gallery.0',
    },
    prepare({ title, titleEn, slug, category, media }) {
      return {
        title: title || titleEn || 'Untitled',
        subtitle: [category, slug && `/docs/${slug}`].filter(Boolean).join(' — '),
        media,
      }
    },
  },
})
