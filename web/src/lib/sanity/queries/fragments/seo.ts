import { $loc } from './locale';
import { MEDIA_FRAGMENT } from './media';

export const META = /* groq */ `
	${$loc('title')},
	${$loc('description')},
	"opengraph": opengraph.media[0] {
		${MEDIA_FRAGMENT}
	}
`;

export const SEO_FRAGMENT = /* groq */ `
	seo {
		${META}
	}
`;
