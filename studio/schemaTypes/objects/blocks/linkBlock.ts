import { LinkIcon } from '@sanity/icons/Link'
import { defineField, defineType } from 'sanity'

/**
 * Link module: a labelled link (internal/external/file) built on
 * sanity-plugin-link-field. Replaces the old standalone press-release field.
 */
export const linkBlock = defineType({
  name: 'linkBlock',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'label',
      type: 'localeString',
      description: 'Text shown on the link / button.',
    }),
    defineField({
      name: 'link',
      type: 'link',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { label: 'label.en' },
    prepare({ label }) {
      return { title: label || 'Link' }
    },
  },
})
