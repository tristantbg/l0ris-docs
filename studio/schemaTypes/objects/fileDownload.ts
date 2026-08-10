import { DownloadIcon } from '@sanity/icons/Download'
import { defineField, defineType } from 'sanity'

/**
 * Downloadable file (PDF, manual, contract…).
 *
 * Used inline in `richtext` bodies and in the `attachments` array on doc
 * pages. The label is localized; the web falls back to the original
 * filename when no label is set.
 */
export const fileDownload = defineType({
  name: 'fileDownload',
  title: 'File download',
  type: 'object',
  icon: DownloadIcon,
  fields: [
    defineField({
      name: 'file',
      type: 'file',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'label',
      type: 'localeString',
      description: 'Link text. Falls back to the file name.',
    }),
  ],
  preview: {
    select: {
      label: 'label.fr',
      labelEn: 'label.en',
      filename: 'file.asset.originalFilename',
    },
    prepare({ label, labelEn, filename }) {
      return {
        title: label || labelEn || filename || 'File',
        subtitle: filename,
      }
    },
  },
})
