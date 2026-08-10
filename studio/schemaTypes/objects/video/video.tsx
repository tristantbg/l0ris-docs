import {
  defineType,
  defineField,
  type ObjectDefinition,
  type PreviewConfig,
} from 'sanity'
import { VideoIcon } from '@sanity/icons/Video'
import { getMuxThumbnailSrc } from '../../utils/resolvePreviewMedia'
import { VideoLoopInput } from './VideoLoopInput'
// import { layoutField } from '../../fields/layoutField'
import { MediaTypeBadge } from '../../components/MediaTypeBadge'

export type VideoSource = 'mux' | 'vimeo'

const muxFields = [
  defineField({
    name: 'file',
    title: 'Mux Video',
    type: 'mux.video',
  }),
  // layoutField,
]

const vimeoFields = [
  defineField({
    name: 'file',
    title: 'Vimeo Video',
    type: 'vimeo.video',
  }),
  // layoutField,
]

const muxPreview: PreviewConfig = {
  select: {
    assetId: 'file.asset.assetId',
    playbackId: 'file.asset.playbackId',
    filename: 'file.asset.filename',
    loopStart: 'loop.start',
    loopEnd: 'loop.end',
    duration: 'file.asset.data.duration',
    width: 'file.asset.data.tracks.0.max_width',
    height: 'file.asset.data.tracks.0.max_height',
  },
  prepare({
    assetId,
    playbackId,
    filename,
    loopStart,
    loopEnd,
    duration,
    width,
    height,
  }: {
    assetId?: string
    playbackId?: string
    filename?: string
    loopStart?: number
    loopEnd?: number
    duration?: number
    width?: number
    height?: number
  }) {
    const mediaSrc = getMuxThumbnailSrc(playbackId, loopStart, loopEnd)

    const parts: string[] = []
    if (width && height) parts.push(`${width}×${height}`)
    if (duration) parts.push(`${Math.round(duration)}s`)

    return {
      title: filename || assetId || 'No video',
      subtitle: parts.length > 0 ? parts.join(' – ') : undefined,
      media: <MediaTypeBadge kind="video" src={mediaSrc} />,
    }
  },
}

const vimeoPreview: PreviewConfig = {
  select: {
    name: 'file.name',
    width: 'file.width',
    height: 'file.height',
    duration: 'file.duration',
    image: 'file.pictures.1.link',
  },
  prepare({
    name,
    width,
    height,
    duration,
    image,
  }: {
    name?: string
    width?: number
    height?: number
    duration?: number
    image?: string
  }) {
    return {
      title: name || 'No title',
      subtitle:
        width && height && duration
          ? `${width}x${height} – ${duration}s`
          : undefined,
      media: <MediaTypeBadge kind="video" src={image?.split('?')?.[0]} />,
    }
  },
}

export function defineVideo(source: VideoSource = 'mux'): ObjectDefinition {
  return defineType({
    name: 'video',
    type: 'object',
    icon: VideoIcon,
    fields: [
      ...(source === 'mux' ? muxFields : vimeoFields),
      defineField({
        title: 'Caption',
        name: 'caption',
        type: 'localeSimpletext',
      }),
      ...(source === 'mux'
        ? [
            defineField({
              name: 'loop',
              type: 'object',
              description:
                'Select a loop range (max 10s). If only the start is set, the thumbnail will be a still image.',
              fields: [
                defineField({ name: 'start', type: 'number' }),
                defineField({ name: 'end', type: 'number' }),
              ],
              components: { input: VideoLoopInput },
              hidden: ({ parent }) => !parent?.file?.asset,
            }),
          ]
        : []),
    ],
    preview: source === 'mux' ? muxPreview : vimeoPreview,
  })
}

export default defineVideo()
