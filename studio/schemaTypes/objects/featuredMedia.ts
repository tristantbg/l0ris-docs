import { ImageIcon } from '@sanity/icons/Image'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const featuredMedia = defineType({
  icon: ImageIcon,
  name: 'featuredMedia',
  type: 'object',
  fields: [
    defineField({
      name: 'media',
      type: 'array',
      of: [
        defineArrayMember({ type: 'imageAlt' }),
        defineArrayMember({ type: 'video' }),
      ],
      validation: (Rule) =>
        Rule.max(1).error('Only one media item is allowed.'),
    }),
  ],
  preview: {
    select: {
      media: 'media',
    },
    prepare({ media }) {
      const item = media?.[0]
      if (!item) return { title: 'No media' }

      const isVideo = item._type === 'video'
      return {
        title: isVideo ? 'Video' : 'Image',
        media: !isVideo ? item : undefined,
      }
    },
  },
})
