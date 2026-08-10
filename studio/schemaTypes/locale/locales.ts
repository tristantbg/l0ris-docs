/**
 * Source of truth for the studio's supported languages.
 *
 * FR is the default (required at validation) — the wiki was authored in
 * French. EN is optional and the web side falls back to FR when an EN value
 * is missing. To add another locale, append it here and translators can
 * start filling it in.
 */
export interface Locale {
  id: string
  title: string
  isDefault?: boolean
}

export const LOCALES: Locale[] = [
  { id: 'fr', title: 'French', isDefault: true },
  { id: 'en', title: 'English' },
]

export const DEFAULT_LOCALE: Locale = LOCALES.find((l) => l.isDefault) ?? LOCALES[0]
