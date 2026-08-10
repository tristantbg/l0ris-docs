/**
 * Pure URL builders for Mux-hosted video (stream + image APIs).
 */

const MUX_STREAM_BASE = 'https://stream.mux.com';
const MUX_IMAGE_BASE = 'https://image.mux.com';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MuxVideo = Record<string, any>;

export function getMuxStreamUrl(playbackId: string): string {
	return `${MUX_STREAM_BASE}/${playbackId}`;
}

export function getMuxThumbnailUrl(
	playbackId: string,
	{ time = 0, width }: { time?: number; width?: number } = {}
): string {
	let url = `${MUX_IMAGE_BASE}/${playbackId}/thumbnail.jpg?time=${time}`;
	if (width) url += `&width=${width}`;
	return url;
}

export function getMuxAnimatedUrl(
	playbackId: string,
	{
		width,
		fps = 20,
		start,
		end
	}: { width?: number; fps?: number; start?: number; end?: number } = {}
): string {
	let url = `${MUX_IMAGE_BASE}/${playbackId}/animated.webp?fps=${fps}`;
	// Mux's animated-image API rejects widths above 640.
	if (width) url += `&width=${Math.min(width, 640)}`;
	if (start != null) url += `&start=${start}`;
	if (start != null && end != null) url += `&end=${end}`;
	return url;
}

export function getMuxPoster(video: MuxVideo, width?: number, thumbTime?: number): string {
	const time = thumbTime ?? video.loop?.start ?? video.thumbTime ?? 0;
	return getMuxThumbnailUrl(video.playbackId, { time, width });
}

export function getMuxSources(video: MuxVideo) {
	const { playbackId, stream } = video;
	// GROQ returns `null` (not `undefined`) when no renditions are ready, so a
	// destructuring default won't apply — coalesce explicitly to an array.
	const staticRenditions: string[] = video.static_renditions ?? [];
	const has1080 = staticRenditions.includes('1080p.mp4');
	const has720 = staticRenditions.includes('720p.mp4');
	const has270 = staticRenditions.includes('270p.mp4');

	return {
		stream: stream || getMuxStreamUrl(playbackId),
		high: has1080
			? `${MUX_STREAM_BASE}/${playbackId}/1080p.mp4`
			: has720
				? `${MUX_STREAM_BASE}/${playbackId}/720p.mp4`
				: null,
		medium: has720
			? `${MUX_STREAM_BASE}/${playbackId}/720p.mp4`
			: has1080
				? `${MUX_STREAM_BASE}/${playbackId}/1080p.mp4`
				: null,
		low: has270
			? `${MUX_STREAM_BASE}/${playbackId}/270p.mp4`
			: has720
				? `${MUX_STREAM_BASE}/${playbackId}/720p.mp4`
				: null
	};
}
