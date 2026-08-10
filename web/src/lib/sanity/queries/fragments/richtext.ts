/**
 * Portable text projection for documentation bodies.
 *
 * Expands every embedded object type (image, video, code, callout, file)
 * and dereferences link annotations.
 */
import { LINK_FRAGMENT } from './link';
import {
	EXTERNAL_VIDEO_FRAGMENT,
	FILE_DOWNLOAD_FRAGMENT,
	IMAGE_FRAGMENT,
	VIDEO_FRAGMENT
} from './media';

const MARK_DEFS = /* groq */ `
	markDefs[] {
		...,
		_type == "link" => {
			${LINK_FRAGMENT}
		}
	}
`;

export const RICHTEXT_FRAGMENT = /* groq */ `
	...,
	${MARK_DEFS},
	${IMAGE_FRAGMENT},
	${VIDEO_FRAGMENT},
	_type == "externalVideo" => {
		_type,
		_key,
		${EXTERNAL_VIDEO_FRAGMENT}
	},
	_type == "codeBlock" => {
		_type,
		_key,
		language,
		filename,
		code
	},
	_type == "callout" => {
		_type,
		_key,
		tone,
		title,
		body[] {
			...,
			${MARK_DEFS}
		}
	},
	_type == "fileDownload" => {
		_type,
		_key,
		${FILE_DOWNLOAD_FRAGMENT}
	}
`;
