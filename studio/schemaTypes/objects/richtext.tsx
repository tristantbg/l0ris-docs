import { defineArrayMember, defineType } from 'sanity'

/**
 * Rich text definitions.
 *
 * - `minimaltext`: single style, no marks — caption-like values.
 * - `simpletext`: single style + links — short bodies (callouts, captions).
 * - `richtext`: the full documentation body. Headings h2–h4, lists,
 *   inline code, links, plus embedded media / code / callout / file blocks.
 *
 * All three are wrapped per-locale by the locale* types (localeRichtext…),
 * so embedded objects must NOT be locale-wrapped themselves.
 */

export const minimaltext = defineType({
  title: 'Minimal Text',
  name: 'minimaltext',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{ title: 'Normal', value: 'normal' }],
      lists: [],
      marks: {
        decorators: [],
        annotations: [],
      },
    }),
  ],
})

export const simpletext = defineType({
  title: 'Simple Text',
  name: 'simpletext',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{ title: 'Default', value: 'normal' }],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Italic', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'link',
          },
        ],
      },
    }),
  ],
})

export const richtext = defineType({
  name: 'richtext',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Default', value: 'normal' },
        { title: 'Heading 2', value: 'h2' },
        { title: 'Heading 3', value: 'h3' },
        { title: 'Heading 4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Italic', value: 'em' },
          { title: 'Underline', value: 'underline' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'link',
          },
        ],
      },
    }),
    defineArrayMember({ type: 'imageAlt' }),
    defineArrayMember({ type: 'video' }),
    defineArrayMember({ type: 'externalVideo' }),
    defineArrayMember({ type: 'codeBlock' }),
    defineArrayMember({ type: 'callout' }),
    defineArrayMember({ type: 'fileDownload' }),
  ],
})
