import { HomeIcon } from '@sanity/icons/Home'
import { defineField, defineType } from 'sanity'

/**
 * Home singleton.
 *
 * Feeds two routes on the web app:
 * - `/`      — the landing hero (title + tagline + call-to-action).
 * - `/docs`  — the documentation index page (body).
 */
export const home = defineType({
  name: 'home',
  title: 'Home',
  type: 'document',
  icon: HomeIcon,
  groups: [
    { name: 'landing', title: 'Landing', default: true },
    { name: 'docs', title: 'Docs index' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'localeString',
      description: 'Hero title on the landing page.',
      validation: (Rule) => Rule.required(),
      group: 'landing',
    }),
    defineField({
      name: 'tagline',
      type: 'localeText',
      description: 'Short line under the hero title.',
      group: 'landing',
    }),
    defineField({
      name: 'body',
      type: 'localeRichtext',
      description: 'Content of the documentation index page (/docs).',
      group: 'docs',
    }),
    defineField({
      name: 'seo',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Home' }
    },
  },
})
