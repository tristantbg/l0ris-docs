import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { docsConfig } from '$lib/docs/config';

export const load: LayoutServerLoad = async ({ params }) => {
	const locale = params.lang;
	const validLocales = docsConfig.i18n?.locales.map((l) => l.code) ?? [];

	if (!validLocales.includes(locale)) {
		throw error(404, `Unknown locale: ${locale}`);
	}

	return { locale };
};
