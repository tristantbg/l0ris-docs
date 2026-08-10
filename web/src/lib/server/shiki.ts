/**
 * Server-side Shiki highlighting for Sanity `codeBlock` portable-text nodes.
 *
 * Reuses the exact themes/classes of the starter's old mdsvex pipeline so the
 * `.shiki` styles in layout.css apply unchanged. Runs in load functions —
 * responses are edge-cached, so the cost is paid once per publish.
 */
import { createHighlighter, type Highlighter } from 'shiki';

const LANGS = [
	'typescript',
	'javascript',
	'svelte',
	'bash',
	'json',
	'css',
	'html',
	'markdown',
	'yaml',
	'shell'
];

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
	highlighterPromise ??= createHighlighter({
		themes: ['github-dark', 'github-light'],
		langs: LANGS
	});
	return highlighterPromise;
}

export async function highlightCode(code: string, lang?: string): Promise<string> {
	const highlighter = await getHighlighter();
	const language = lang && highlighter.getLoadedLanguages().includes(lang) ? lang : 'text';
	return highlighter.codeToHtml(code, {
		lang: language,
		themes: { light: 'github-light', dark: 'github-dark' }
	});
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Block = Record<string, any>;

/**
 * Walk a portable-text array and attach pre-highlighted `html` to every
 * `codeBlock` node. Mutates copies, returns a new array.
 */
export async function highlightCodeBlocks(
	blocks: Block[] | null | undefined
): Promise<Block[] | null | undefined> {
	if (!Array.isArray(blocks)) return blocks;

	return Promise.all(
		blocks.map(async (block) => {
			if (block?._type === 'codeBlock' && typeof block.code === 'string') {
				return { ...block, html: await highlightCode(block.code, block.language) };
			}
			return block;
		})
	);
}
