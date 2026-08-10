import React from 'react'
import { ImageIcon } from '@sanity/icons/Image'
import { VideoIcon } from '@sanity/icons/Video'
type MediaKind = 'image' | 'video'

/**
 * Renders a media thumbnail with a small corner badge indicating whether the
 * item is an image or a video. Used by gallery previews so each grid card
 * clearly shows its media type.
 */
export function MediaTypeBadge({
  kind,
  src,
}: {
  kind: MediaKind
  src?: string
}) {
  const Icon = kind === 'video' ? VideoIcon : ImageIcon

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {src ? (
        <img
          src={src}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      ) : null}
      <span
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          borderRadius: 4,
          background: 'rgba(0, 0, 0, 0.65)',
          color: '#fff',
        }}
        title={kind === 'video' ? 'Video' : 'Image'}
      >
        <Icon style={{ fontSize: 16, color: 'white' }} />
      </span>
    </div>
  )
}
