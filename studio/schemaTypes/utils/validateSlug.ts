import groq from 'groq'
import { getPublishedId, SlugRule, SlugValidationContext } from 'sanity'
import { apiVersion } from './apiVersion'

const MAX_LENGTH = 96

export const validateSlug = (Rule: SlugRule) => {
  return Rule.required().custom((value) => {
    const currentSlug = value && value.current
    if (!currentSlug) {
      return true
    }

    if (currentSlug.length >= MAX_LENGTH) {
      return `Must be less than ${MAX_LENGTH} characters`
    }

    if (/[^a-z0-9-]/.test(currentSlug)) {
      return "Slug cannot contain accents, uppercase characters, or special characters except '-'"
    }

    return true
  })
}

/**
 * Path-style slug: lowercase segments separated by single slashes, e.g.
 * `piscine/local-technique/tableau-electrique`. The full path is the page's
 * URL under /docs/ and its position in the sidebar tree (parent = the
 * page whose slug is the path minus the last segment).
 */
export const validatePathSlug = (Rule: SlugRule) => {
  return Rule.required().custom((value) => {
    const currentSlug = value && value.current
    if (!currentSlug) {
      return true
    }

    if (currentSlug.length >= MAX_LENGTH * 2) {
      return `Must be less than ${MAX_LENGTH * 2} characters`
    }

    if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(currentSlug)) {
      return "Use lowercase segments separated by '/' — letters, numbers and '-' only (no leading or trailing slash)"
    }

    return true
  })
}

/** Slugify one path: slugifies each '/'-separated segment, keeps the slashes. */
export const slugifyPath = (input: string): string =>
  input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split('/')
    .map((segment) =>
      segment
        .replace(/[^a-z0-9-\s]/g, '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, ''),
    )
    .filter(Boolean)
    .join('/')

// Create the function
// This checks that there are no other documents
// With this published or draft _id
// Or this schema type
// With the same slug and language
export async function isUniqueOtherThanLanguage(
  slug: string,
  context: SlugValidationContext
) {
  const { document, getClient } = context
  if (!document?.language) {
    return true
  }
  const client = getClient({ apiVersion })
  const id = document._id.replace(/^drafts\./, '')
  const params = {
    draft: `drafts.${id}`,
    published: id,
    language: document.language,
    slug,
  }
  const query = groq`!defined(*[
    !(_id in [$draft, $published]) &&
    slug.current == $slug &&
    language == $language
  ][0]._id)`
  const result = await client.fetch(query, params)
  return result
}

export async function isUniqueWithinType(
  slug: string,
  context: SlugValidationContext
) {
  const { document, getClient } = context
  const client = getClient({ apiVersion })
  const id = document?._id
  const type = document?._type

  if (!id || !slug || !type) {
    return true
  }

  const publishedId = getPublishedId(id)

  const params = {
    published: publishedId,
    slug: slug,
    type: type,
  }

  const query = groq`!defined(*[
    _type == $type &&
    !sanity::versionOf($published) &&
    slug.current == $slug
  ][0]._id)`

  const isUnique = await client.fetch(query, params)
  return isUnique || false
}

export async function isUniqueAcrossAllDocuments(
  slug: { current?: string },
  context: SlugValidationContext
) {
  const { document, getClient } = context
  const client = getClient({ apiVersion })
  const id = document?._id

  if (!id || !slug?.current) {
    return true
  }

  const publishedId = getPublishedId(id)

  const params = {
    published: publishedId,
    slug: slug.current,
  }

  const query = groq`!defined(*[
    !sanity::versionOf($published) &&
    slug.current == $slug
  ][0]._id)`

  const isUnique = await client.fetch(query, params)
  return isUnique || false
}
