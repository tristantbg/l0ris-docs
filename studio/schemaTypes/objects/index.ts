import { callout } from './callout'
import { codeBlock } from './codeBlock'
import { externalVideo } from './externalVideo'
import { featuredMedia } from './featuredMedia'
import { fileDownload } from './fileDownload'
import { imageAlt } from './image/imageAlt'
import { minimaltext, richtext, simpletext } from './richtext'
import { seo } from './seo'
import type { VideoSource } from './video/video'
import { defineVideo } from './video/video'

const videoProvider = (process.env.SANITY_STUDIO_VIDEO_PROVIDER ||
  'mux') as VideoSource
const video = defineVideo(videoProvider)

export const objects = [
  // ── Media primitives ──────────────────────────────────────
  imageAlt,
  video,

  // ── Media compositions ────────────────────────────────────
  externalVideo,
  featuredMedia,

  // ── Doc blocks ────────────────────────────────────────────
  codeBlock,
  callout,
  fileDownload,

  // ── Text ──────────────────────────────────────────────────
  minimaltext,
  simpletext,
  richtext,

  // ── Metadata ──────────────────────────────────────────────
  seo,
]
