import React from 'react'

/**
 * Build a Mux thumbnail/animated preview URL based on playbackId and optional loop range.
 * Returns `undefined` when no playbackId is provided.
 */
export function getMuxThumbnailSrc(
  playbackId?: string,
  loopStart?: number,
  loopEnd?: number
): string | undefined {
  if (!playbackId) return undefined

  const hasLoop =
    loopStart != null && loopEnd != null && (loopStart > 0 || loopEnd > 0)

  if (hasLoop && loopEnd! > loopStart!) {
    return `https://image.mux.com/${playbackId}/animated.webp?start=${loopStart}&end=${loopEnd}&width=100`
  }
  if (hasLoop && loopStart === loopEnd) {
    return `https://image.mux.com/${playbackId}/thumbnail.webp?time=${loopStart}&width=100`
  }
  return `https://image.mux.com/${playbackId}/animated.webp?width=100`
}

/**
 * Derive a still thumbnail for an external video URL.
 * Works for YouTube (thumbnails are addressable by video ID);
 * Vimeo thumbnails require an API call, so those return `undefined`.
 */
export function getExternalVideoThumbnailSrc(
  provider?: string,
  url?: string
): string | undefined {
  if (provider !== 'youtube' || !url) return undefined
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)
  return match
    ? `https://i.ytimg.com/vi/${match[1]}/mqdefault.jpg`
    : undefined
}

/**
 * Generate `select` paths for resolving a media preview thumbnail.
 *
 * @param prefix – GROQ-style path to the media item (e.g. `"featuredMedia.media.0"` or `"gallery.0"`)
 * @param key    – short alias used as a prefix for the selected values (e.g. `"fm"`, `"g0"`)
 *
 * Spread the return value into the preview `select` object:
 * ```ts
 * select: {
 *   ...mediaPreviewSelect("featuredMedia.media.0", "fm"),
 *   ...mediaPreviewSelect("gallery.0", "g0"),
 * }
 * ```
 */
export function mediaPreviewSelect(prefix: string, key: string) {
  return {
    [`${key}Type`]: `${prefix}._type`,
    // imageAlt
    [`${key}Asset`]: `${prefix}.asset`,
    // mux
    [`${key}PlaybackId`]: `${prefix}.file.asset.playbackId`,
    [`${key}LoopStart`]: `${prefix}.loop.start`,
    [`${key}LoopEnd`]: `${prefix}.loop.end`,
    // vimeo
    [`${key}VimeoImage`]: `${prefix}.file.pictures.1.link`,
  }
}

/**
 * Resolve a preview media element from the values produced by `mediaPreviewSelect`.
 *
 * Tries each `key` in order and returns the first valid media (image asset,
 * mux animated thumbnail, or vimeo still). Returns `undefined` when nothing matches.
 *
 * ```ts
 * prepare(values) {
 *   return {
 *     title: values.title,
 *     media: resolvePreviewMedia(values, "fm", "g0"),
 *   }
 * }
 * ```
 */
export function resolvePreviewMedia(
  values: Record<string, any>,
  ...keys: string[]
): React.ReactNode | undefined {
  for (const key of keys) {
    const type = values[`${key}Type`]
    if (!type) continue

    // ── Image ──────────────────────────────────────────────
    if (type === 'imageAlt' && values[`${key}Asset`]) {
      return values[`${key}Asset`]
    }

    // ── Mux video ──────────────────────────────────────────
    if (type === 'video' && values[`${key}PlaybackId`]) {
      const src = getMuxThumbnailSrc(
        values[`${key}PlaybackId`],
        values[`${key}LoopStart`],
        values[`${key}LoopEnd`]
      )
      if (src) return <img src={src} alt="" />
    }

    // ── Vimeo video ────────────────────────────────────────
    if (type === 'video' && values[`${key}VimeoImage`]) {
      return (
        <img
          src={values[`${key}VimeoImage`].split('?')?.[0]}
          alt=""
          style={{ aspectRatio: 1, height: '100%', objectFit: 'cover' }}
        />
      )
    }
  }

  return undefined
}
