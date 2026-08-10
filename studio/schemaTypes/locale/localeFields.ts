import { defineField, defineType } from 'sanity'
import { LOCALES, DEFAULT_LOCALE } from './locales'

/**
 * Field-level localization following Sanity's "field-level translations"
 * pattern: https://www.sanity.io/docs/studio/localization
 *
 * Each locale* type is an object whose subfields are the per-language values.
 * The default locale (EN) is required; all others are optional and the web
 * side falls back to EN at render time. The @sanity/language-filter plugin
 * (see sanity.config.ts) lets editors hide/show one language at a time.
 */

const localeFieldsFor = (innerType: string) =>
  LOCALES.map((locale) =>
    defineField({
      name: locale.id,
      title: locale.title,
      type: innerType,
      validation: locale.isDefault
        ? (Rule) => Rule.required()
        : undefined,
    }),
  )

/** One-line text (titles, labels, captions). */
export const localeString = defineType({
  name: 'localeString',
  title: 'Localized string',
  type: 'object',
  fieldsets: [{ name: 'translations', title: 'Translations' }],
  fields: localeFieldsFor('string'),
})

/** Multi-line plain text (long captions, dimension blurbs). */
export const localeText = defineType({
  name: 'localeText',
  title: 'Localized text',
  type: 'object',
  fieldsets: [{ name: 'translations', title: 'Translations' }],
  fields: localeFieldsFor('text'),
})

/** Portable-text rich text (full block content with marks + lists). */
export const localeRichtext = defineType({
  name: 'localeRichtext',
  title: 'Localized rich text',
  type: 'object',
  fieldsets: [{ name: 'translations', title: 'Translations' }],
  fields: localeFieldsFor('richtext'),
})

/** Portable-text without lists/headings (used for short bodies). */
export const localeSimpletext = defineType({
  name: 'localeSimpletext',
  title: 'Localized simple text',
  type: 'object',
  fieldsets: [{ name: 'translations', title: 'Translations' }],
  fields: localeFieldsFor('simpletext'),
})

/** Portable-text with no decorators (used for caption-like inline lists). */
export const localeMinimaltext = defineType({
  name: 'localeMinimaltext',
  title: 'Localized minimal text',
  type: 'object',
  fieldsets: [{ name: 'translations', title: 'Translations' }],
  fields: localeFieldsFor('minimaltext'),
})

export { DEFAULT_LOCALE }
