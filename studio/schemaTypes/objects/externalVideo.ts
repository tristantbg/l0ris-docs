import { defineField, defineType } from 'sanity'
import { VideoIcon } from '@sanity/icons/Video'
/**
 * External video reference (Vimeo or YouTube) used in the Resources > Videos page.
 *
 * Site-owned content uses the Mux `video` type; external interviews / institutional
 * uploads live on Vimeo or YouTube and we just embed them by URL.
 */
export const externalVideo = defineType({
  name: 'externalVideo',
  title: 'External video',
  type: 'object',
  icon: VideoIcon,
  fields: [
    defineField({
      name: 'provider',
      type: 'string',
      options: {
        list: [
          { title: 'Vimeo', value: 'vimeo' },
          { title: 'YouTube', value: 'youtube' },
        ],
        layout: 'radio',
      },
      initialValue: 'vimeo',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Embed URL',
      type: 'url',
      description: 'Full Vimeo or YouTube URL (we will derive the embed ID).',
      validation: (Rule) =>
        Rule.required().uri({ scheme: ['http', 'https'] }),
    }),
  ],
  preview: {
    select: { url: 'url', provider: 'provider' },
    prepare({ url, provider }) {
      return {
        title: url || 'No URL set',
        subtitle: provider,
      }
    },
  },
})
