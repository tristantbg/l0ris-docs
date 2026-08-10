/**
 * Shared Sanity API version for all Studio clients and structure lists.
 *
 * Sourced from the `SANITY_STUDIO_API_VERSION` env var (see `.env.example`),
 * with a fallback so the Studio still builds if the var is missing.
 */
export const apiVersion =
  process.env.SANITY_STUDIO_API_VERSION || '2025-02-19'
