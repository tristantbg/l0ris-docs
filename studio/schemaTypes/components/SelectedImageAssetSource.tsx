import { ImagesIcon } from '@sanity/icons/Images'
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  Spinner,
  Stack,
  Text,
  TextInput,
} from '@sanity/ui'
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  AssetFromSource,
  AssetSource,
  AssetSourceComponentProps,
} from 'sanity'
import { useClient, useFormValue } from 'sanity'
import { mediaAssetSource } from 'sanity-plugin-media'
import { apiVersion } from '../utils/apiVersion'

type ImageAssetDoc = {
  _id: string
  url: string
  _updatedAt?: string
  originalFilename?: string
  metadata?: {
    dimensions?: { width?: number; height?: number }
  }
  docTitles?: string[]
}

type DocImageRef = {
  title?: string
  assetIds: string[]
}

// Every image-carrying field on a document, flattened to asset ids. Fields a
// type doesn't have coalesce to [] so the same projection works for any
// referenced document type. Gallery videos (mux) are filtered out.
const IMAGE_DOC_PROJECTION = /* groq */ `
  "title": coalesce(title.en, "Untitled"),
  "assetIds": array::compact(
    coalesce(gallery[_type == "imageAlt"].asset._ref, []) +
    coalesce(featuredMedia.media[_type == "imageAlt"].asset._ref, []) +
    coalesce(annexeSketches[].asset._ref, [])
  )
`

// Browse images from the documents referenced on the current page (annexe
// artworks / books / press, related exhibitions, …). $ids holds both the
// published and the draft id of every outgoing reference.
const REFERENCED_DOCS_QUERY = /* groq */ `
*[_id in $ids]{${IMAGE_DOC_PROJECTION}}
`

// Collect every reference on the form value, wherever it lives: image assets
// used on the page itself (gallery, featured media, sketches, …) and outgoing
// document references (annexe lists, related items, …). File refs are
// skipped; stray non-image doc refs (taxonomies, venues, mux assets) are
// harmless — they contribute no assets.
function collectRefs(
  value: unknown,
  imageIds: Set<string>,
  docIds: Set<string>
): void {
  if (Array.isArray(value)) {
    for (const item of value) collectRefs(item, imageIds, docIds)
    return
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (key === '_ref' && typeof child === 'string') {
        if (child.startsWith('image-')) imageIds.add(child)
        else if (!child.startsWith('file-')) docIds.add(child)
      } else {
        collectRefs(child, imageIds, docIds)
      }
    }
  }
}

// How many cards to reveal per infinite-scroll page.
const PAGE_SIZE = 24

// The "used images" picker only makes sense on documents that reference a
// pool of related items. Everything else falls back to the studio default.
const SCOPED_TYPES = ['artwork', 'exhibition', 'book']

function ScopedImagePicker(props: AssetSourceComponentProps) {
  const { onSelect, onClose, selectionType, selectedAssets } = props
  const client = useClient({ apiVersion })

  const existingAssetIds = useMemo(
    () => new Set((selectedAssets ?? []).map((a) => a._id)),
    [selectedAssets]
  )

  // Outgoing references live in many fields (annexe lists, related
  // exhibitions, …), so collect them from the whole form value.
  const doc = useFormValue([]) as Record<string, unknown> | undefined

  // The form value changes identity on every keystroke; key the fetch on the
  // actual set of referenced ids so typing elsewhere doesn't refetch.
  const refKey = useMemo(() => {
    const images = new Set<string>()
    const docs = new Set<string>()
    collectRefs(doc, images, docs)
    return JSON.stringify({
      imageIds: Array.from(images).sort(),
      docIds: Array.from(docs).sort(),
    })
  }, [doc])

  const { imageIds, docIds } = useMemo(
    () => JSON.parse(refKey) as { imageIds: string[]; docIds: string[] },
    [refKey]
  )

  const [loading, setLoading] = useState(false)
  const [assets, setAssets] = useState<ImageAssetDoc[]>([])
  const [selected, setSelected] = useState<Record<string, ImageAssetDoc>>({})
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 200)
    return () => clearTimeout(handle)
  }, [search])

  // Reset the infinite-scroll window whenever the result set changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [debouncedSearch, assets])

  useEffect(() => {
    if (imageIds.length === 0 && docIds.length === 0) {
      setAssets([])
      setLoading(false)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    // Referenced documents may still be unpublished, so match draft ids too.
    const draftAwareIds = [...docIds, ...docIds.map((id) => `drafts.${id}`)]
    const referenced =
      docIds.length > 0
        ? client.fetch<DocImageRef[]>(REFERENCED_DOCS_QUERY, {
            ids: draftAwareIds,
          })
        : Promise.resolve([] as DocImageRef[])
    referenced
      .then(async (docsWithImages: DocImageRef[]) => {
        if (cancelled) return

        // Build a map of assetId -> Set of document titles
        const titlesByAsset = new Map<string, Set<string>>()
        for (const doc of docsWithImages ?? []) {
          const title = doc.title?.trim()
          if (!title) continue
          for (const assetId of doc.assetIds ?? []) {
            if (!assetId) continue
            if (!titlesByAsset.has(assetId)) {
              titlesByAsset.set(assetId, new Set())
            }
            titlesByAsset.get(assetId)!.add(title)
          }
        }

        // The page's own images join the pool without a document label.
        const ids = Array.from(
          new Set([...imageIds, ...titlesByAsset.keys()])
        )
        if (ids.length === 0) {
          setAssets([])
          return
        }
        const docs = await client.fetch<ImageAssetDoc[]>(
          `*[_type == "sanity.imageAsset" && _id in $ids]
              | order(_updatedAt desc){
              _id, url, _updatedAt, originalFilename, metadata { dimensions }
            }`,
          { ids }
        )
        if (!cancelled) {
          setAssets(
            (docs ?? []).map((doc: ImageAssetDoc) => ({
              ...doc,
              docTitles: Array.from(titlesByAsset.get(doc._id) ?? []),
            }))
          )
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message ?? 'Failed to load images')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [imageIds, docIds, client])

  const isMultiple = (selectionType as string) === 'multiple'

  const toggle = useCallback(
    (asset: ImageAssetDoc) => {
      setSelected((prev) => {
        if (prev[asset._id]) {
          const next = { ...prev }
          delete next[asset._id]
          return next
        }
        // In single mode, replace the current selection
        if (!isMultiple) return { [asset._id]: asset }
        return { ...prev, [asset._id]: asset }
      })
    },
    [isMultiple]
  )

  const handleConfirm = useCallback(() => {
    const items = Object.values(selected).map<AssetFromSource>((a) => ({
      kind: 'assetDocumentId',
      value: a._id,
    }))
    if (items.length > 0) onSelect(items)
  }, [onSelect, selected])

  const filteredAssets = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return assets
    return assets.filter((asset) => {
      const haystack = [asset.originalFilename ?? '', ...(asset.docTitles ?? [])]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [assets, debouncedSearch])

  const visibleAssets = useMemo(
    () => filteredAssets.slice(0, visibleCount),
    [filteredAssets, visibleCount]
  )
  const hasMore = visibleCount < filteredAssets.length

  // Infinite scroll: reveal the next page when the sentinel scrolls into view.
  // The observer is re-created after each page so that a sentinel still in view
  // (e.g. a short first page) keeps loading until the viewport is filled.
  useEffect(() => {
    if (!hasMore) return
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) => count + PAGE_SIZE)
        }
      },
      { rootMargin: '300px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, visibleCount, filteredAssets.length])

  const headerText = 'Images used on this page & referenced items'

  const emptyText = 'No images found on this page or its referenced items.'

  const emptyHint =
    'Add images to this page, or reference items that have images (annexe, related items…), then try again.'

  return (
    <Dialog
      id="selected-image-asset-source"
      header={headerText}
      onClose={onClose}
      width={2}
      open
      footer={
        <Flex padding={3} justify="flex-end" gap={2}>
          <Button mode="bleed" text="Cancel" onClick={onClose} />
          <Button
            tone="primary"
            text={
              isMultiple ? `Select (${Object.keys(selected).length})` : 'Select'
            }
            disabled={Object.keys(selected).length === 0}
            onClick={handleConfirm}
          />
        </Flex>
      }
    >
      <Box paddingX={4}>
        {loading ? (
          <Flex justify="center" padding={5}>
            <Spinner muted />
          </Flex>
        ) : error ? (
          <Text size={1} muted>
            {error}
          </Text>
        ) : assets.length === 0 ? (
          <Stack gap={3}>
            <Text>{emptyText}</Text>
            <Text size={1} muted>
              {emptyHint}
            </Text>
          </Stack>
        ) : (
          <Stack gap={3}>
            <Stack
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <TextInput
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                placeholder="Search by filename or document title"
                clearButton={search.length > 0}
                onClear={() => setSearch('')}
              />
            </Stack>
            {filteredAssets.length === 0 ? (
              <Text size={1} muted>
                No images match “{debouncedSearch}”.
              </Text>
            ) : (
              <Grid gridTemplateColumns={[3, 4, 5, 7]} gap={2}>
                {visibleAssets.map((asset) => {
                  const hasStagedSelection = Object.keys(selected).length > 0
                  const isSelected =
                    !!selected[asset._id] ||
                    (!hasStagedSelection && existingAssetIds.has(asset._id))
                  return (
                    <Card
                      key={asset._id}
                      padding={1}
                      radius={2}
                      shadow={1}
                      tone={isSelected ? 'positive' : 'default'}
                      onClick={() => toggle(asset)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Stack gap={2}>
                        <img
                          src={`${asset.url}?w=200&q=70&auto=format`}
                          alt={asset.originalFilename ?? ''}
                          style={{
                            width: '100%',
                            aspectRatio: '4 / 5',
                            objectFit: 'contain',
                            display: 'block',
                          }}
                        />
                        <Stack gap={1}>
                          {asset.docTitles && asset.docTitles.length > 0 ? (
                            <Text
                              size={0}
                              weight="semibold"
                              textOverflow="ellipsis"
                            >
                              {asset.docTitles.join(', ')}
                            </Text>
                          ) : null}

                          <Text size={0} muted textOverflow="ellipsis">
                            {asset.originalFilename ?? asset._id}
                          </Text>
                        </Stack>
                      </Stack>
                    </Card>
                  )
                })}
              </Grid>
            )}
            {hasMore ? (
              <div ref={sentinelRef}>
                <Flex justify="center" padding={4}>
                  <Spinner muted />
                </Flex>
              </div>
            ) : filteredAssets.length > PAGE_SIZE ? (
              <Flex justify="center" padding={3}>
                <Text size={1} muted>
                  Showing all {filteredAssets.length} images
                </Text>
              </Flex>
            ) : null}
          </Stack>
        )}
      </Box>
    </Dialog>
  )
}

// Entry point for the asset source. The "used images" picker only applies to
// artwork, exhibition and book documents; on any other document type there is
// no curated pool to offer, so we defer to the studio's default asset source
// (the media library configured in sanity.config).
const SelectedImagePicker = forwardRef<
  HTMLDivElement,
  AssetSourceComponentProps
>(function SelectedImagePicker(props, _ref) {
  const docType = useFormValue(['_type']) as string | undefined

  if (!docType || !SCOPED_TYPES.includes(docType)) {
    const DefaultSource = mediaAssetSource.component
    return <DefaultSource {...props} assetSource={mediaAssetSource} />
  }

  return <ScopedImagePicker {...props} />
})

export const selectedImageAssetSource: AssetSource = {
  name: 'selected-images',
  title: 'Used images',
  icon: ImagesIcon,
  component: SelectedImagePicker,
}
