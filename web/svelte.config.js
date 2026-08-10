import adapter from '@sveltejs/adapter-netlify';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// SSR on Netlify. Production serves cached responses from Netlify's edge
	// with on-demand purge via the Sanity webhook (src/routes/api/revalidate).
	// Preview mode (PUBLIC_SANITY_PREVIEW=true) bypasses the cache to render
	// draft content.
	kit: {
		adapter: adapter(),
		prerender: {
			handleHttpError: 'warn',
			handleUnseenRoutes: 'warn'
		}
	},
	vitePlugin: {
		dynamicCompileOptions: ({ filename }) =>
			filename.includes('node_modules') ? undefined : { runes: true }
	}
};

export default config;
