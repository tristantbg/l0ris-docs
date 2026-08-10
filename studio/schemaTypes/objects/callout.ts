import { WarningOutlineIcon } from '@sanity/icons/WarningOutline'
import { defineField, defineType } from 'sanity'
import blocksToText from '../utils/blocksToText'

/**
 * Callout / admonition block used inside `richtext`.
 *
 * Tones mirror the web app's Callout component (note / tip / warning /
 * danger). The body is plain `simpletext` — the surrounding richtext is
 * already locale-wrapped, so no locale types in here.
 */
export const callout = defineType({
  name: 'callout',
  title: 'Callout',
  type: 'object',
  icon: WarningOutlineIcon,
  fields: [
    defineField({
      name: 'tone',
      type: 'string',
      options: {
        list: [
          { title: 'Note', value: 'note' },
          { title: 'Tip', value: 'tip' },
          { title: 'Warning', value: 'warning' },
          { title: 'Danger', value: 'danger' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'note',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      description: 'Optional heading. Falls back to the tone label.',
    }),
    defineField({
      name: 'body',
      type: 'simpletext',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { tone: 'tone', title: 'title', body: 'body' },
    prepare({ tone, title, body }) {
      return {
        title: title || blocksToText(body) || 'Callout',
        subtitle: tone ? tone.charAt(0).toUpperCase() + tone.slice(1) : undefined,
      }
    },
  },
})
