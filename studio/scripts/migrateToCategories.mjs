/**
 * Migration: path-slug tree → sandocs-style categories + orderable articles.
 *
 * - Creates 4 `category` documents (Piscine, Jardin, Maison, Sécurité) with
 *   lexorank ordering.
 * - Converts every old `docPage` into a flat-slug article referencing its
 *   category; grandchild pages are merged into their parent article as h2
 *   sections (nothing is lost — bodies, galleries and attachments follow).
 * - Applies French spelling / grammar / punctuation / typography fixes to
 *   all portable-text spans (incl. callouts) and to the home body.
 * - Adds content-derived tags and short descriptions per article.
 * - Deletes the old documents in the same transaction.
 *
 * Run from /studio:
 *   pnpm sanity exec scripts/migrateToCategories.mjs --with-user-token
 */
import { getCliClient } from 'sanity/cli'

const API_VERSION = process.env.SANITY_STUDIO_API_VERSION || '2025-02-19'
const client = getCliClient({ apiVersion: API_VERSION })

let keyCounter = 0
const key = () => `mig${(keyCounter++).toString(36).padStart(5, '0')}`

const loc = (type, value) => ({ _type: type, fr: value })

/** Lexorank-shaped strings ("0|xxxxxx:") — evenly spaced, plugin-compatible. */
const rank = (i) => `0|${(parseInt('h00000', 36) + i * 36 ** 3).toString(36)}:`

// ── French text corrections ──────────────────────────────────────────

const GLOBAL_FIXES = [
  // Typos & spelling
  [/manoeuvre/g, 'manœuvre'],
  [/Manoeuvre/g, 'Manœuvre'],
  [/peristaltique/g, 'péristaltique'],
  [/ouvir/g, 'ouvrir'],
  [/antialgue/g, 'anti-algues'],
  [/l '/g, "l'"],
  // Brands & notation
  [/Poolcopilot/g, 'PoolCopilot'],
  [/\bPoolcop\b/g, 'PoolCop'],
  [/\bPH\b/g, 'pH'],
  // Units
  [/(\d)\s*m3/g, '$1 m³'],
  [/(\d)\s*mn\b/g, '$1 min'],
  [/(\d)\s*mm\b/g, '$1 mm'],
  [/(\d)\s*ml\b/g, '$1 ml'],
  [/(\d)l\/h/g, '$1 l/h'],
  [/(\d)\s*KW\b/g, '$1 kW'],
  [/380v\b/g, '380 V'],
  [/\b2CV\b/g, '2 CV'],
  // Punctuation & spacing
  [/\(\s+/g, '('],
  [/\s+\)/g, ')'],
  [/\s+\./g, '.'],
  [/\s+,/g, ','],
  [/([^\s:]):(?=\s|$)/g, '$1 :'],
  [/ {2,}/g, ' '],
]

/** Page-specific rewordings (agreement, missing commas/periods, casing). */
const PAGE_FIXES = {
  'piscine/caracteristiques': [
    ['762mm-', '762 mm'],
    ['à débit variable: voir graphique', 'À débit variable : voir graphique'],
  ],
  'piscine/couverture-de-piscine-automatique-motorisee-prima': [
    ['à plat parallèle au sol', 'à plat, parallèle au sol'],
  ],
  'piscine/recommandations-generales-surveillance-et-reglages': [
    ['par un adulte car on risque', 'par un adulte, car on risque'],
  ],
  'piscine/local-technique/tableau-electrique': [
    ['du local qui ne peut', 'du local, qui ne peut'],
    ['la coupure générale du local, qui ne peut être remis', 'la coupure générale du local, qui ne peut être remise'],
  ],
  'piscine/local-technique/cle-du-lt': [
    ['certains trousseaux', 'certains trousseaux.'],
  ],
  'piscine/pompe': [['pompe à vitesse variable', 'Pompe à vitesse variable.']],
}

function fixText(text, slug) {
  let out = text
  for (const [from, to] of PAGE_FIXES[slug] ?? []) out = out.split(from).join(to)
  for (const [re, to] of GLOBAL_FIXES) out = out.replace(re, to)
  return out
}

/** Apply text fixes to every span of a portable-text array (incl. callouts). */
function fixBlocks(blocks, slug) {
  if (!Array.isArray(blocks)) return blocks
  return blocks.map((block) => {
    if (block?._type === 'block' && Array.isArray(block.children)) {
      return {
        ...block,
        children: block.children.map((child) =>
          child?._type === 'span' && typeof child.text === 'string'
            ? { ...child, text: fixText(child.text, slug) }
            : child,
        ),
      }
    }
    if (block?._type === 'callout' && Array.isArray(block.body)) {
      return { ...block, body: fixBlocks(block.body, slug) }
    }
    return block
  })
}

const h2 = (text) => ({
  _type: 'block',
  _key: key(),
  style: 'h2',
  markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})

/** Nicer labels for the PDF downloads (inline fileDownload blocks). */
const FILE_LABELS = {
  'Pum v32 fr poolcop manuel installateur et utilisateur': 'PoolCop — Manuel installateur et utilisateur',
  'Pmm v31 fr poolcop manuel de maintenance': 'PoolCop — Manuel de maintenance',
  'Ppg v32 v42 fr poolcop guide pompes a vitesse variable': 'PoolCop — Guide pompes à vitesse variable',
  'Pqg v32 xx poolcop quick guidev10': 'PoolCop — Quick guide',
  'Contrat blue force': 'Contrat Blue Force',
  'Bagot contrat': 'Contrat Blue Force',
}

function fixFileLabels(blocks) {
  if (!Array.isArray(blocks)) return blocks
  return blocks.map((block) => {
    if (block?._type === 'fileDownload' && block.label?.fr && FILE_LABELS[block.label.fr]) {
      return { ...block, label: { ...block.label, fr: FILE_LABELS[block.label.fr] } }
    }
    return block
  })
}

// ── target hierarchy ─────────────────────────────────────────────────

const CATEGORIES = [
  { slug: 'piscine', title: 'Piscine', icon: 'waves', description: 'Fonctionnement, équipements et entretien de la piscine.' },
  { slug: 'jardin', title: 'Jardin', icon: 'flower-2', description: "Les plantes et l'entretien du jardin." },
  { slug: 'maison', title: 'Maison', icon: 'house', description: 'Équipements et matériel de la maison.' },
  { slug: 'securite', title: 'Sécurité', icon: 'shield', description: 'Alarme et caméras de surveillance.' },
]

/**
 * New articles. `from` = main source page; `merge` = child pages folded in
 * as h2 sections; `alsoFrom` = extra pages whose body/media is appended
 * without a heading.
 */
const ARTICLES = [
  // ── Piscine ────────────────────────────────────────────────────────
  {
    slug: 'caracteristiques', category: 'piscine', title: 'Caractéristiques',
    tags: ['équipement', "traitement de l'eau"],
    description: 'Bassin, filtration, régulation : la fiche technique de la piscine.',
    from: 'piscine/caracteristiques', alsoFrom: ['piscine'],
  },
  {
    slug: 'recommandations', category: 'piscine', title: 'Recommandations générales — Surveillance et réglages',
    tags: ['sécurité', 'réglages'],
    description: "Les règles d'usage : sécurité des enfants, couverture, robot et réglages de l'eau.",
    from: 'piscine/recommandations-generales-surveillance-et-reglages',
  },
  {
    slug: 'couverture-prima', category: 'piscine', title: 'Couverture PRIMA',
    tags: ['sécurité', 'équipement', "mode d'emploi"],
    description: 'Manœuvre de la couverture motorisée et pose des sangles.',
    from: 'piscine/couverture-de-piscine-automatique-motorisee-prima',
  },
  {
    slug: 'local-technique', category: 'piscine', title: 'Local technique',
    tags: ['accès', 'électricité'],
    description: 'Accès au local, clés et tableau électrique.',
    from: 'piscine/local-technique',
    merge: [
      { heading: 'Clé du local technique', from: 'piscine/local-technique/cle-du-lt' },
      { heading: 'Tableau électrique', from: 'piscine/local-technique/tableau-electrique' },
    ],
  },
  {
    slug: 'poolcop', category: 'piscine', title: 'PoolCop et PoolCopilot',
    tags: ['réglages', "mode d'emploi", "traitement de l'eau"],
    description: 'La régulation automatique de la piscine et sa gestion à distance.',
    from: 'piscine/poolcop',
    merge: [{ heading: "Mode d'emploi", from: 'piscine/poolcop/mode-d-emploi' }],
  },
  {
    slug: 'pompe', category: 'piscine', title: 'Pompe principale',
    tags: ['filtration', 'équipement'],
    description: 'La pompe à vitesse variable de la filtration.',
    from: 'piscine/pompe',
    merge: [{ heading: 'Vitesses', from: 'piscine/pompe/vitesse' }],
  },
  {
    slug: 'uv', category: 'piscine', title: 'Stérilisateur UV',
    tags: ["traitement de l'eau", 'équipement'],
    description: 'Le stérilisateur BIO-UV et ses pièces détachées.',
    from: 'piscine/uv',
  },
  {
    slug: 'ph', category: 'piscine', title: 'pH',
    tags: ["traitement de l'eau", 'réglages'],
    description: 'La régulation automatique du pH.',
    from: 'piscine/ph',
  },
  {
    slug: 'remanent-h2o2', category: 'piscine', title: "Rémanent H2O2 (peroxyde d'hydrogène)",
    tags: ["traitement de l'eau", 'réglages'],
    description: "L'injection de peroxyde d'hydrogène et ses réglages saisonniers.",
    from: 'piscine/remanent-h2o2-peroxyde-d-hydrogene',
  },
  {
    slug: 'pompe-a-chaleur', category: 'piscine', title: 'Pompe à chaleur (PAC)',
    tags: ['chauffage', 'équipement'],
    description: "Le chauffage de l'eau par la PAC.",
    from: 'piscine/pompe-a-chaleur',
  },
  {
    slug: 'filtre', category: 'piscine', title: 'Filtre',
    tags: ['filtration', 'entretien'],
    description: 'Le filtre à billes de verre recyclé.',
    from: 'piscine/filtre',
  },
  {
    slug: 'projecteurs-led', category: 'piscine', title: 'Projecteurs LED',
    tags: ['éclairage', 'électricité'],
    description: 'Les spots lumineux du bassin.',
    from: 'piscine/projecteurs-led',
  },
  {
    slug: 'hivernage', category: 'piscine', title: 'Hivernage',
    tags: ['hivernage', 'entretien'],
    description: "Le passage de la piscine en hivernage actif.",
    from: 'piscine/hivernage',
  },
  {
    slug: 'entretien', category: 'piscine', title: 'Entretien',
    tags: ['entretien', 'contrat'],
    description: "Le calendrier d'entretien et le contrat Blue Force.",
    from: 'piscine/entretien', alsoFrom: ['piscine/entretien/contrat'],
  },

  // ── Jardin ─────────────────────────────────────────────────────────
  {
    slug: 'plantes', category: 'jardin', title: 'Les plantes du jardin',
    tags: ['plantes'],
    description: 'Inventaire en photos des plantes du jardin.',
    from: 'jardin',
  },

  // ── Maison ─────────────────────────────────────────────────────────
  {
    slug: 'barbecue', category: 'maison', title: 'Barbecue',
    tags: ['cuisine extérieure'],
    description: "Le barbecue et son utilisation.",
    from: 'maison/barbecue',
  },
  {
    slug: 'plancha', category: 'maison', title: 'Plancha',
    tags: ['cuisine extérieure'],
    description: 'La plancha et son utilisation.',
    from: 'maison/plancha',
  },
  {
    slug: 'outillage', category: 'maison', title: 'Outillage',
    tags: ['matériel'],
    description: "Les outils de la maison et du jardin.",
    from: 'maison/outillage',
    merge: [{ heading: 'Souffleur', from: 'maison/outillage/souffleur' }],
  },

  // ── Sécurité ───────────────────────────────────────────────────────
  {
    slug: 'alarme-verisure', category: 'securite', title: 'Alarme Verisure',
    tags: ['alarme', 'sécurité'],
    description: "Le système d'alarme Verisure.",
    from: 'alarme-verisure',
  },
  {
    slug: 'cameras-exterieures', category: 'securite', title: 'Caméras extérieures',
    tags: ['caméras', 'sécurité'],
    description: 'Les caméras Arlo et leurs piles.',
    from: 'cameras-exterieures',
  },
]

// Old pages intentionally not carried over as articles (empty containers).
const CONSUMED_CONTAINERS = new Set(['maison'])

// ── main ─────────────────────────────────────────────────────────────

async function main() {
  const config = client.config()
  console.log(`Migrating ${config.projectId}/${config.dataset} to categories + orderable articles\n`)

  const oldDocs = await client.fetch('*[_type == "docPage"]')
  const bySlug = new Map(oldDocs.map((doc) => [doc.slug?.current, doc]))

  const pick = (slug) => {
    const doc = bySlug.get(slug)
    if (!doc) throw new Error(`Missing source page: ${slug}`)
    return doc
  }

  // Track coverage so no old page is silently dropped.
  const consumed = new Set(CONSUMED_CONTAINERS)

  const categories = CATEGORIES.map((cat, i) => ({
    _id: `category.${cat.slug}`,
    _type: 'category',
    orderRank: rank(i),
    title: loc('localeString', cat.title),
    slug: { _type: 'slug', current: cat.slug },
    description: loc('localeText', cat.description),
    icon: cat.icon,
  }))

  const dedupeByAsset = (items) => {
    const seen = new Set()
    return (items ?? []).filter((item) => {
      const ref = item?.file?.asset?._ref ?? item?.asset?._ref ?? item?._key
      if (seen.has(ref)) return false
      seen.add(ref)
      return true
    })
  }

  const articles = ARTICLES.map((spec, i) => {
    const main = pick(spec.from)
    consumed.add(spec.from)

    let body = fixFileLabels(fixBlocks(main.body?.fr ?? [], spec.from))
    let gallery = [...(main.gallery ?? [])]
    let attachments = [...(main.attachments ?? [])]

    for (const extraSlug of spec.alsoFrom ?? []) {
      const extra = pick(extraSlug)
      consumed.add(extraSlug)
      body = [...body, ...fixFileLabels(fixBlocks(extra.body?.fr ?? [], extraSlug))]
      gallery.push(...(extra.gallery ?? []))
      attachments.push(...(extra.attachments ?? []))
    }

    for (const section of spec.merge ?? []) {
      const child = pick(section.from)
      consumed.add(section.from)
      body = [
        ...body,
        h2(section.heading),
        ...fixFileLabels(fixBlocks(child.body?.fr ?? [], section.from)),
      ]
      gallery.push(...(child.gallery ?? []))
      attachments.push(...(child.attachments ?? []))
    }

    // Same PDF referenced twice (e.g. the duplicated Blue Force contract):
    // inline body downloads win over attachment copies.
    const inlineRefs = new Set(
      body.filter((b) => b?._type === 'fileDownload').map((b) => b.file?.asset?._ref),
    )
    attachments = dedupeByAsset(attachments).filter(
      (item) => !inlineRefs.has(item?.file?.asset?._ref),
    )
    attachments = fixFileLabels(attachments)
    gallery = dedupeByAsset(gallery)

    const doc = {
      _id: `docPage.${spec.slug}`,
      _type: 'docPage',
      orderRank: rank(i),
      title: loc('localeString', spec.title),
      slug: { _type: 'slug', current: spec.slug },
      category: { _type: 'reference', _ref: `category.${spec.category}` },
      tags: spec.tags,
      description: loc('localeText', spec.description),
      body: { _type: 'localeRichtext', fr: body },
    }
    if (gallery.length) doc.gallery = gallery
    if (attachments.length) doc.attachments = attachments
    return doc
  })

  const uncovered = oldDocs.filter((doc) => !consumed.has(doc.slug?.current))
  if (uncovered.length) {
    throw new Error(`Old pages not covered by the migration: ${uncovered.map((d) => d.slug?.current).join(', ')}`)
  }

  // Home body gets the same text fixes.
  const home = await client.fetch('*[_id == "home"][0]')
  const fixedHome = home
    ? { ...home, body: { ...home.body, fr: fixBlocks(home.body?.fr ?? [], 'home') } }
    : null

  console.log(`Categories: ${categories.length}`)
  console.log(`Articles:   ${articles.length} (from ${oldDocs.length} old pages)`)
  for (const article of articles) {
    console.log(`  • ${article.category._ref.replace('category.', '').padEnd(8)} /docs/${article.slug.current}`)
  }

  const tx = client.transaction()
  for (const doc of oldDocs) tx.delete(doc._id)
  for (const doc of categories) tx.createOrReplace(doc)
  for (const doc of articles) tx.createOrReplace(doc)
  if (fixedHome) tx.createOrReplace(fixedHome)
  await tx.commit()

  console.log('\n✔ Migration complete')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
