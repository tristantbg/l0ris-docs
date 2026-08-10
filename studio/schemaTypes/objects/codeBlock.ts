import { CodeBlockIcon } from '@sanity/icons/CodeBlock'
import { defineType } from 'sanity'

/**
 * Fenced code block for `richtext` bodies, backed by @sanity/code-input.
 *
 * The language list mirrors the Shiki languages bundled by the web app so
 * every stored language can be highlighted at render time.
 */
export const codeBlock = defineType({
  name: 'codeBlock',
  title: 'Code block',
  type: 'code',
  icon: CodeBlockIcon,
  options: {
    languageAlternatives: [
      { title: 'Plain text', value: 'text' },
      { title: 'Bash', value: 'bash' },
      { title: 'JavaScript', value: 'javascript' },
      { title: 'TypeScript', value: 'typescript' },
      { title: 'Svelte', value: 'svelte' },
      { title: 'HTML', value: 'html' },
      { title: 'CSS', value: 'css' },
      { title: 'JSON', value: 'json' },
      { title: 'YAML', value: 'yaml' },
      { title: 'Markdown', value: 'markdown' },
    ],
    withFilename: true,
  },
})
