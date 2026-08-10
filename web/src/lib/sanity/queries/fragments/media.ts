/**
 * Media fragments — Sanity CDN images and Mux/Vimeo video.
 *
 * Image alt / description / credit live on the image ASSET
 * (sanity-plugin-media locale-keyed fields); captions are per-usage
 * portable text on the member, falling back to the asset description.
 */
import { $assetLoc, $loc } from './locale';

/**
 * Image caption — the member's own portable-text `caption` when it has any
 * text, else the asset-level `description` string.
 */
const IMAGE_CAPTION = /* groq */ `
	"caption": select(
		length(pt::text(coalesce(caption[$lang], caption.fr))) > 0 =>
			coalesce(caption[$lang], caption.fr),
		${$assetLoc('description')}
	)
`;

/**
 * Base image projection — asset metadata used for rendering (dimensions,
 * lqip, palette, hotspot/crop).
 */
export const IMAGE_FIELDS = /* groq */ `
	"_type": "image",
	asset,
	"url": asset->url,
	"width": asset->metadata.dimensions.width,
	"height": asset->metadata.dimensions.height,
	"aspectRatio": asset->metadata.dimensions.aspectRatio,
	"lqip": asset->metadata.lqip,
	"color": asset->metadata.palette.darkVibrant.background,
	hotspot { x, y, height, width },
	crop { bottom, left, right, top }
`;

export const IMAGE_FRAGMENT = /* groq */ `
	_type in ["imageAlt", "image"] => {
		${IMAGE_FIELDS},
		_key,
		"alt": ${$assetLoc('altText')},
		${IMAGE_CAPTION},
		"credits": ${$assetLoc('creditLine')}
	}
`;

export const MUX_FRAGMENT = /* groq */ `
	file._type == "mux.video" => {
		"title": file.asset->data.meta.name,
		"playbackId": file.asset->playbackId,
		"stream": "https://stream.mux.com/" + file.asset->playbackId,
		"duration": file.asset->data.duration,
		"width": file.asset->data.tracks[0].max_width,
		"height": file.asset->data.tracks[0].max_height,
		"aspectRatio": file.asset->data.tracks[0].max_width / file.asset->data.tracks[0].max_height,
		"thumbTime": file.asset->thumbTime,
		"thumbnail": "https://image.mux.com/" + file.asset->playbackId + "/thumbnail.jpg",
		"thumbnailAnimated": "https://image.mux.com/" + file.asset->playbackId + "/animated.webp",
		"static_renditions": file.asset->data.static_renditions.files[status == 'ready'].name,
		loop
	}
`;

export const VIMEO_FRAGMENT = /* groq */ `
	file._type == "vimeo.video" => {
		"url": file->link,
		"title": file->name,
		"width": file->width,
		"height": file->height,
		"aspectRatio": file->width / file->height,
		"duration": file->duration,
		"thumbnail": string::split(string::split(file->pictures[2].link, "?")[0], "_")[0] + "_400",
		"thumbnailAnimated": file->animatedThumbnails.thumbnails[0].sizes[1].link,
		"sources": file->srcset[quality != 'hls'] | order(width asc) {
			width,
			height,
			quality,
			rendition,
			link
		},
		"stream": file->srcset[quality == 'hls'][0].link
	}
`;

export const VIDEO_FRAGMENT = /* groq */ `
	_type == "video" => {
		_type,
		_key,
		"provider": select(
			file._type == "mux.video" => "mux",
			file._type == "vimeo.video" => "vimeo",
			null
		),
		${MUX_FRAGMENT},
		${VIMEO_FRAGMENT},
		${$loc('caption')}
	}
`;

/** Single image-or-video slot. */
export const MEDIA_FRAGMENT = /* groq */ `
	${IMAGE_FRAGMENT},
	${VIDEO_FRAGMENT}
`;

/** External video embed (Vimeo / YouTube) by URL. */
export const EXTERNAL_VIDEO_FRAGMENT = /* groq */ `
	provider,
	url
`;

/** Downloadable file (fileDownload object). */
export const FILE_DOWNLOAD_FRAGMENT = /* groq */ `
	"url": file.asset->url,
	"filename": file.asset->originalFilename,
	"size": file.asset->size,
	"mimeType": file.asset->mimeType,
	${$loc('label')}
`;
