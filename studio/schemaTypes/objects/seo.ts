import { defineField } from 'sanity'

export const seo = defineField({
  title: 'SEO',
  name: 'seo',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'localeString',
    }),
    defineField({
      name: 'description',
      type: 'localeText',
      description:
        'A short summary in order to provide visitors with an idea of what the document is about.',
    }),
    defineField({
      name: 'opengraph',
      title: 'Opengraph media',
      type: 'featuredMedia',
      description:
        'When sharing a link to the site from within social media, this image or video will be displayed in your post. The recommended image size is 1200x630. Falls back to the page’s featured media when empty.',
    }),
  ],
})
