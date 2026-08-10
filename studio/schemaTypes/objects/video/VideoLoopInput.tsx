import { useCallback, useEffect, useId, useState } from 'react'
import {
  type ObjectInputProps,
  set,
  unset,
  useClient,
  useFormValue,
} from 'sanity'
import { Button, Flex, Spinner, Stack, Text } from '@sanity/ui'
import { ResetIcon } from '@sanity/icons/Reset'
import { apiVersion } from '../../utils/apiVersion'

const MAX_RANGE = 10

export function VideoLoopInput(props: ObjectInputProps) {
  const { value, onChange, path } = props
  const scopeId = useId().replace(/:/g, '')

  // Resolve the Mux asset reference from the parent video object
  const parentPath = path.slice(0, -1)
  const assetRef = useFormValue([...parentPath, 'file', 'asset', '_ref']) as
    | string
    | undefined
  const client = useClient({ apiVersion })
  const [duration, setDuration] = useState(0)
  const [playbackId, setPlaybackId] = useState<string | null>(null)
  const [thumbLoaded, setThumbLoaded] = useState(false)

  useEffect(() => {
    if (!assetRef) {
      setDuration(0)
      setPlaybackId(null)
      return
    }
    client
      .fetch<{
        duration: number
        playbackId: string
      }>(
        '*[_id == $ref][0]{ "duration": data.duration, "playbackId": data.playback_ids[0].id }',
        { ref: assetRef }
      )
      .then((result) => {
        if (result?.duration) setDuration(Math.ceil(result.duration))
        if (result?.playbackId) setPlaybackId(result.playbackId)
      })
  }, [assetRef, client])

  const start = (value as any)?.start ?? 0
  const end = (value as any)?.end ?? 0

  const handleStartChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newStart = Number(e.target.value)
      let newEnd = end
      if (newStart > newEnd) newStart = newEnd
      if (newEnd - newStart > MAX_RANGE) newEnd = newStart + MAX_RANGE
      onChange([
        set(newStart, ['start']),
        set(Math.min(newEnd, duration), ['end']),
      ])
    },
    [end, duration, onChange]
  )

  const handleEndChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newEnd = Number(e.target.value)
      let newStart = start
      if (newEnd < newStart) newEnd = newStart
      if (newEnd - newStart > MAX_RANGE) newStart = newEnd - MAX_RANGE
      onChange([set(Math.max(newStart, 0), ['start']), set(newEnd, ['end'])])
    },
    [start, onChange]
  )

  const handleClear = useCallback(() => {
    onChange(unset())
  }, [onChange])

  const hasLoop = start > 0 || end > 0
  const rawThumbnailUrl =
    playbackId && hasLoop
      ? end > start
        ? `https://image.mux.com/${playbackId}/animated.gif?start=${start}&end=${end}&width=200&fps=30`
        : `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${start}&width=200`
      : null

  // Debounce the thumbnail URL to avoid excessive requests while dragging
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    rawThumbnailUrl
  )

  useEffect(() => {
    if (!rawThumbnailUrl) {
      setThumbnailUrl(null)
      setThumbLoaded(false)
      return
    }
    setThumbLoaded(false)
    const timer = setTimeout(() => {
      setThumbnailUrl(rawThumbnailUrl)
    }, 300)
    return () => clearTimeout(timer)
  }, [rawThumbnailUrl])

  if (!duration) return null

  const startPct = (start / duration) * 100
  const endPct = (end / duration) * 100
  const cls = `vloop-${scopeId}`

  return (
    <Flex gap={3} align="stretch" style={{ userSelect: 'none' }}>
      {thumbnailUrl ? (
        <Flex
          align="center"
          justify="center"
          style={{
            width: 120,
            minHeight: 68,
            flexShrink: 0,
            position: 'relative',
            borderRadius: 4,
            border: '1px solid var(--card-border-color)',
          }}
        >
          {!thumbLoaded && <Spinner muted />}
          <img
            src={thumbnailUrl}
            alt="Loop preview"
            onLoad={() => setThumbLoaded(true)}
            style={{
              width: 120,
              height: 'auto',
              objectFit: 'cover',
              display: thumbLoaded ? 'block' : 'none',
            }}
          />
        </Flex>
      ) : (
        <Flex
          align="center"
          justify="center"
          style={{
            width: 120,
            minHeight: 68,
            borderRadius: 4,
            border: '1px dashed var(--card-border-color)',
            background: 'var(--card-code-bg-color, rgba(255,255,255,0.03))',
            flexShrink: 0,
            opacity: 0.5,
          }}
        >
          <Text size={0} muted>
            No preview
          </Text>
        </Flex>
      )}

      <Stack gap={3} style={{ flex: 1 }}>
        <style>{`
        .${cls} {
          position: relative;
          height: 24px;
        }
        .${cls} .vl-track {
          position: absolute; top: 50%; left: 0; right: 0;
          height: 4px; transform: translateY(-50%);
          background: var(--card-border-color);
          border-radius: 2px; pointer-events: none;
        }
        .${cls} .vl-active {
          position: absolute; top: 50%; height: 4px;
          transform: translateY(-50%);
          background: var(--card-accent-fg-color, #f97316);
          border-radius: 2px; pointer-events: none;
        }
        .${cls} input[type="range"] {
          position: absolute; top: 0; left: 0;
          width: 100%; height: 100%;
          margin: 0; padding: 0;
          background: none; pointer-events: none;
          -webkit-appearance: none; appearance: none;
        }
        .${cls} input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px; width: 16px; border-radius: 50%;
          background: var(--card-accent-fg-color, #f97316);
          border: 2px solid var(--card-bg-color, #1a1a1a);
          cursor: pointer; pointer-events: all;
        }
        .${cls} input[type="range"]::-moz-range-thumb {
          height: 16px; width: 16px; border-radius: 50%;
          background: var(--card-accent-fg-color, #f97316);
          border: 2px solid var(--card-bg-color, #1a1a1a);
          cursor: pointer; pointer-events: all;
        }
        .${cls} input[type="range"]::-webkit-slider-runnable-track { background: transparent; }
        .${cls} input[type="range"]::-moz-range-track { background: transparent; }
      `}</style>

        <Flex gap={2} align="center" justify="space-between">
          <Text
            size={1}
            weight="bold"
            muted
            style={{
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.05em',
            }}
          >
            FROM{' '}
            <span style={{ color: 'var(--card-accent-fg-color, #f97316)' }}>
              {start}s
            </span>{' '}
            TO{' '}
            <span style={{ color: 'var(--card-accent-fg-color, #f97316)' }}>
              {end}s
            </span>{' '}
            ({end - start}s)
          </Text>
          {hasLoop && (
            <Button
              icon={ResetIcon}
              mode="ghost"
              tone="critical"
              fontSize={1}
              padding={2}
              text="Clear"
              onClick={handleClear}
            />
          )}
        </Flex>

        <div className={cls}>
          <div className="vl-track" />
          <div
            className="vl-active"
            style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration}
            step={1}
            value={start}
            onChange={handleStartChange}
            style={{ zIndex: start === duration ? 5 : 3 }}
          />
          <input
            type="range"
            min={0}
            max={duration}
            step={1}
            value={end}
            onChange={handleEndChange}
            style={{ zIndex: 4 }}
          />
        </div>
      </Stack>
    </Flex>
  )
}
