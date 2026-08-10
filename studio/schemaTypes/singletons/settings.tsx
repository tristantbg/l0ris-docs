import { CogIcon } from '@sanity/icons/Cog'
import { defineField, defineType } from 'sanity'

/**
 * Global site settings: site identity, footer menu, default SEO fallbacks.
 */
export const settings = defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'site', title: 'Site', default: true },
    { name: 'seo', title: 'Default SEO' },
  ],
  fields: [
    defineField({
      name: 'siteTitle',
      type: 'localeString',
      description: 'Site name shown in the header, footer and page titles.',
      validation: (Rule) => Rule.required(),
      group: 'site',
    }),
    defineField({
      name: 'description',
      type: 'localeText',
      description: 'Default site description for SEO and the landing page.',
      group: 'site',
    }),
    defineField({
      name: 'footerMenu',
      title: 'Footer menu',
      type: 'array',
      of: [{ type: 'linkBlock' }],
      description: 'Links shown in the site footer, in order.',
      group: 'site',
    }),
    defineField({
      name: 'seo',
      type: 'seo',
      title: 'Default SEO',
      group: 'seo',
      description: 'Fallback metadata when a document does not set its own.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Settings' }
    },
  },
})
