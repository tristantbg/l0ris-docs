# Tunnel Vision Sanity Studio

A custom [Sanity Studio](https://www.sanity.io/) v5 configuration for a portfolio/creative studio site. This studio is tailored with custom schemas, a bespoke desk structure, live preview, and flexible video provider support.

## Table of Contents

- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Plugins](#plugins)
- [Schema Types](#schema-types)
  - [Documents](#documents)
  - [Singletons](#singletons)
  - [Objects](#objects)
  - [Blocks (Page Builder)](#blocks-page-builder)
  - [Rich Text Variants](#rich-text-variants)
- [Custom Desk Structure](#custom-desk-structure)
- [Live Preview (Iframe Pane)](#live-preview-iframe-pane)
- [Video Provider Abstraction](#video-provider-abstraction)
- [Utilities](#utilities)
- [Development](#development)

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the studio in development mode
pnpm dev

# Build for production
pnpm build

# Deploy to Sanity
pnpm deploy
```

> **Package Manager:** pnpm (monorepo-ready via `pnpm-workspace.yaml`).

---

## Environment Variables

All configuration is driven by environment variables, making the studio fully portable across projects.

| Variable                        | Description                          | Default                 |
| ------------------------------- | ------------------------------------ | ----------------------- |
| `SANITY_STUDIO_PROJECT_ID`      | Sanity project ID                    | `your-project-id`       |
| `SANITY_STUDIO_DATASET`         | Dataset name                         | `production`            |
| `SANITY_STUDIO_PROJECT_TITLE`   | Studio title shown in the navbar     | `Project Title`         |
| `SANITY_STUDIO_HOST`            | Studio host slug for deployment      | —                       |
| `SANITY_STUDIO_VIDEO_PROVIDER`  | Video provider: `mux` or `vimeo`     | `mux`                   |
| `SANITY_STUDIO_VIMEO_FOLDER_ID` | Vimeo folder ID (when using Vimeo)   | —                       |
| `SANITY_STUDIO_PREVIEW_ORIGIN`  | Frontend origin URL for live preview | `http://localhost:4321` |

---

## Plugins

| Plugin                            | Purpose                                          |
| --------------------------------- | ------------------------------------------------ |
| `sanity-plugin-media`             | Enhanced image asset management & media library  |
| `sanity-plugin-mux-input`         | Mux video uploads & playback                     |
| `sanity-plugin-vimeo-sync`        | Vimeo video sync (swappable with Mux)            |
| `sanity-plugin-link-field`        | Reusable internal/external link field            |
| `sanity-plugin-iframe-pane`       | Iframe-based live preview in the document editor |
| `@sanity/orderable-document-list` | Drag-and-drop ordering for categories            |
| `@sanity/vision`                  | GROQ query playground (dev only)                 |

The image asset source is overridden to use `sanity-plugin-media` exclusively for images, while keeping the default sources for file uploads.

---

## Schema Types

### Documents

| Schema     | Icon             | Description                                                                                                                                                               |
| ---------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `project`  | `CaseIcon`       | Portfolio project with title, slug, client reference, categories, featured media, gallery (images + videos), and SEO. Custom preview displays client name and categories. |
| `category` | `TagIcon`        | Orderable category with title, slug, and drag-and-drop sorting via `orderRankField`.                                                                                      |
| `client`   | `ColorWheelIcon` | Simple client entity with title and slug.                                                                                                                                 |
| `page`     | `DocumentIcon`   | Generic page with title, slug, modular blocks (page builder), and SEO.                                                                                                    |

### Singletons

Singleton documents are presented as single editor panes (not lists) in the desk structure.

| Schema     | Icon       | Description                                                                              |
| ---------- | ---------- | ---------------------------------------------------------------------------------------- |
| `settings` | `CogIcon`  | Global site settings — footer links (via `link` field) and fallback SEO.                 |
| `about`    | `UserIcon` | About page content — title, description, biography (`simpletext`), events list, and SEO. |

### Objects

| Schema          | Description                                                                                                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `imageAlt`      | Image with hotspot, alt text, and caption. Custom preview shows filename and dimensions.                                                                                                                             |
| `video`         | Adaptive video object — renders Mux or Vimeo fields based on `SANITY_STUDIO_VIDEO_PROVIDER`. Includes a custom **Loop** input (Mux only) with a dual-range slider, animated preview, and a 10-second max constraint. |
| `featuredMedia` | Single media picker (image or video), limited to one item.                                                                                                                                                           |
| `credits`       | Title + simple text block, used for attribution/credits.                                                                                                                                                             |
| `event`         | Event entry with title, date (month/year format), and URL.                                                                                                                                                           |
| `seo`           | Reusable SEO object with title (max 50 chars), description (max 150 chars), and OG image.                                                                                                                            |

### Blocks (Page Builder)

The `blocks` field is a modular array used on the `page` document type. Available modules:

| Block         | Icon       | Description                                    |
| ------------- | ---------- | ---------------------------------------------- |
| `textSection` | `TextIcon` | Single title + content (`simpletext`) section. |

### Rich Text Variants

Three Portable Text configurations with increasing levels of formatting:

| Variant       | Styles              | Decorators                | Annotations |
| ------------- | ------------------- | ------------------------- | ----------- |
| `minimaltext` | Normal              | None                      | None        |
| `simpletext`  | Normal              | None                      | `link`      |
| `richtext`    | Normal, Medium (h5) | Strong, Italic, Underline | `link`      |

All link annotations use the `sanity-plugin-link-field` type.

---

## Custom Desk Structure

The studio uses a fully custom desk structure defined in `structure/index.ts`:

```
Content
├── Settings          → singleton editor
├── About             → singleton editor (title fetched dynamically from document)
├── ─────────
├── Projects
│   ├── All Projects  → full document list
│   └── By Category   → category list → filtered projects per category
├── ─────────
├── Categories        → orderable document list (drag-and-drop)
├── Clients           → standard document list
├── ─────────
└── (remaining types) → auto-generated
```

Hidden from the root pane: `about`, `category`, `project`, `client`, `settings`, `media.tag`, `media.folder`, `mux.videoAsset`, `__blank__`.

Each structure part is defined as an isolated, composable module using the `defineStructure` helper utility.

---

## Live Preview (Iframe Pane)

The `project` document type includes an iframe-based live preview tab alongside the form editor. Preview URLs are resolved per document type:

- **Projects** → `/projects/{slug}`
- **Default** → `/`

The preview URL includes `?preview=true` and a perspective parameter for draft content visualization. The frontend origin is configurable via `SANITY_STUDIO_PREVIEW_ORIGIN` and defaults to `http://localhost:4321` in development.

---

## Video Provider Abstraction

The video schema is dynamically generated based on the `SANITY_STUDIO_VIDEO_PROVIDER` environment variable:

- **Mux** (default) — Uses `mux.video` field type, includes a custom **VideoLoopInput** component with:
  - Dual-range slider for selecting a loop range (max 10 seconds)
  - Animated GIF/WebP preview thumbnail from Mux
  - Still frame preview when start equals end
  - Clear/reset functionality
  - Rich preview in document lists (dimensions, duration, animated thumbnail)
- **Vimeo** — Uses `vimeo.video` field type with name, dimensions, and duration preview.

Switching providers requires only changing the environment variable — no schema code changes needed.

---

## Utilities

| Utility           | Location                               | Description                                                                                                                                                   |
| ----------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defineSlugField` | `schemaTypes/utils/defineSlugField.ts` | Reusable slug field with custom slugify, max length, and uniqueness validation within document type.                                                          |
| `validateSlug`    | `schemaTypes/utils/validateSlug.ts`    | Slug validation rules: required, max 96 chars, lowercase alphanumeric + hyphens only. Includes `isUniqueWithinType` and `isUniqueAcrossAllDocuments` helpers. |
| `blocksToText`    | `schemaTypes/utils/blocksToText.ts`    | Converts Portable Text blocks to plain text for use in document previews.                                                                                     |
| `defineStructure` | `schemaTypes/utils/defineStructure.ts` | Typed factory helper for composable desk structure parts.                                                                                                     |

---

## Development

```bash
# Run the studio locally
pnpm dev

# The studio runs at http://localhost:3333 by default
```

The workspace uses a `styled-components@6.3.10` patch (via pnpm `patchedDependencies`).
