/**
 * Plain-text and markdown-ish serializers for Portable Text — used for
 * reading time, search excerpts and the llms.txt endpoints.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Block = Record<string, any>;

export function toPlainText(blocks: Block[] | null | undefined): string {
	if (!Array.isArray(blocks)) return '';
	return blocks
		.map((block) => {
			if (block?._type !== 'block' || !Array.isArray(block.children)) return '';
			return block.children.map((child: Block) => child?.text ?? '').join('');
		})
		.filter(Boolean)
		.join('\n\n');
}

/**
 * Lossy Portable Text → markdown conversion for the llms endpoints.
 * Handles the block shapes the doc body can contain.
 */
export function toMarkdown(blocks: Block[] | null | undefined): string {
	if (!Array.isArray(blocks)) return '';

	const lines: string[] = [];

	for (const block of blocks) {
		if (!block?._type) continue;

		switch (block._type) {
			case 'block': {
				const text = (block.children ?? [])
					.map((child: Block) => {
						let t = child?.text ?? '';
						const marks: string[] = child?.marks ?? [];
						if (marks.includes('code')) t = `\`${t}\``;
						if (marks.includes('strong')) t = `**${t}**`;
						if (marks.includes('em')) t = `*${t}*`;
						return t;
					})
					.join('');
				if (!text.trim()) break;

				if (block.listItem === 'bullet') lines.push(`- ${text}`);
				else if (block.listItem === 'number') lines.push(`1. ${text}`);
				else if (block.style === 'h2') lines.push(`## ${text}`);
				else if (block.style === 'h3') lines.push(`### ${text}`);
				else if (block.style === 'h4') lines.push(`#### ${text}`);
				else if (block.style === 'blockquote') lines.push(`> ${text}`);
				else lines.push(text);
				break;
			}
			case 'image':
			case 'imageAlt':
				lines.push(`![${block.alt ?? ''}](${block.url ?? ''})`);
				break;
			case 'video':
				lines.push(`[Video${block.title ? `: ${block.title}` : ''}](${block.stream ?? ''})`);
				break;
			case 'externalVideo':
				lines.push(`[Video](${block.url ?? ''})`);
				break;
			case 'codeBlock':
				lines.push(`\`\`\`${block.language ?? ''}\n${block.code ?? ''}\n\`\`\``);
				break;
			case 'callout':
				lines.push(`> **${block.title ?? block.tone ?? 'Note'}**: ${toPlainText(block.body)}`);
				break;
			case 'fileDownload':
				lines.push(`[${block.label ?? block.filename ?? 'File'}](${block.url ?? ''})`);
				break;
		}
	}

	return lines.join('\n\n');
}
