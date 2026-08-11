/**
 * Provider-agnostic video URL helpers, switched by the studio's configured
 * provider (mux | vimeo).
 */
import { PUBLIC_SANITY_STUDIO_VIDEO_PROVIDER } from '$env/static/public';
import { getMuxAnimatedUrl, getMuxSources, getMuxThumbnailUrl } from './mux';
import { getVimeoSources, getVimeoThumbnailUrl } from './vimeo';

export * from './mux';
export * from './vimeo';

const provider = PUBLIC_SANITY_STUDIO_VIDEO_PROVIDER || 'mux';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyVideo = Record<string, any>;

export function getVideoSources(video: AnyVideo) {
	if (video.provider === 'vimeo' || provider === 'vimeo') {
		const { stream, hd, md, sd } = getVimeoSources(video);
		return { stream, high: hd, medium: md, low: sd };
	}
	return getMuxSources(video);
}

export function getVideoThumbUrl(video: AnyVideo, width?: number, time?: number): string | null {
	if (video.provider === 'vimeo' || provider === 'vimeo') {
		return getVimeoThumbnailUrl(video, width);
	}
	if (!video.playbackId) return null;
	return getMuxThumbnailUrl(video.playbackId, {
		time: time ?? video.loop?.start ?? video.thumbTime ?? 0,
		width
	});
}

/**
 * Privacy-friendly embed URL for an `externalVideo` value (YouTube / Vimeo
 * page links pasted in the studio), or null when the URL isn't recognized.
 */
export function getEmbedUrl(value: AnyVideo): string | null {
	const url: string = value?.url ?? '';
	if (!url) return null;
	if (value.provider === 'youtube' || /youtu\.?be/.test(url)) {
		const id = url.match(
			/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/
		)?.[1];
		return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
	}
	const vimeoId = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
	return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : null;
}

export function getVideoAnimatedUrl(
	video: AnyVideo,
	{ width, fps, start, end }: { width?: number; fps?: number; start?: number; end?: number } = {}
): string | null {
	if (video.provider === 'vimeo' || provider === 'vimeo') {
		return video.thumbnailAnimated ?? null;
	}
	if (!video.playbackId) return null;
	return getMuxAnimatedUrl(video.playbackId, {
		width,
		fps,
		start: start ?? video.loop?.start,
		end: end ?? video.loop?.end
	});
}
