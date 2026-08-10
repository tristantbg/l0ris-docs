/**
 * URL helpers for Vimeo-hosted video (sanity-plugin-vimeo-sync shape,
 * projected by VIMEO_FRAGMENT).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VimeoVideo = Record<string, any>;

/** Vimeo picture links end in a `_WIDTH` suffix — swap it for the requested width. */
export function getVimeoThumbnailUrl(video: VimeoVideo, width?: number): string | null {
	const thumb: string | undefined = video.thumbnail;
	if (!thumb) return null;
	if (!width) return thumb;
	return thumb.replace(/_\d+$/, `_${width}`);
}

export function getVimeoSources(video: VimeoVideo) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const sources: any[] = video.sources ?? [];
	const byHeight = (max: number) =>
		sources.filter((s) => (s.height ?? 0) <= max).at(-1)?.link ?? null;

	return {
		stream: video.stream ?? null,
		hd: byHeight(1080) ?? sources.at(-1)?.link ?? null,
		md: byHeight(720),
		sd: byHeight(360)
	};
}
