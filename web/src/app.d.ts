// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			sanity: {
				previewEnabled: boolean;
				loadQuery: <T>(query: string, params?: Record<string, unknown>) => Promise<{ data: T }>;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
