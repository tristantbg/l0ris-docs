import { ImageIcon } from '@sanity/icons/Image'
import { defineField } from 'sanity'
// import { layoutField } from '../../fields/layoutField'
import { IMAGE_ACCEPT } from 'sanity-plugin-image-resizer'
import { MediaTypeBadge } from '../../components/MediaTypeBadge'
import blocksToText from '../../utils/blocksToText'

export const imageAlt = defineField({
  title: 'Image',
  name: 'imageAlt',
  type: 'image',
  icon: ImageIcon,
  options: {
    hotspot: true,
    accept: IMAGE_ACCEPT,
  },
  description: 'JPG, PNG, GIF, WebP. Max. 20Mb / Max. 7000px wide.',
  fieldsets: [
    {
      title: 'Options',
      name: 'options',
      options: {
        collapsible: false,
        columns: 2,
      },
    },
  ],
  fields: [
    // layoutField,
    {
      name: 'caption',
      type: 'localeSimpletext',
    },
  ],
  preview: {
    select: {
      filename: 'asset.originalFilename',
      caption: 'caption.en',
      dimensions: 'asset.metadata.dimensions',
      url: 'asset.url',
    },
    prepare(selection) {
      const { filename, caption, dimensions, url } = selection
      const captionText = blocksToText(caption)
      return {
        title: filename ?? '',
        subtitle: captionText
          ? captionText
          : dimensions
            ? `(${dimensions.width}px × ${dimensions.height}px)`
            : '…',
        media: <MediaTypeBadge kind="image" src={url} />,
      }
    },
  },
})
