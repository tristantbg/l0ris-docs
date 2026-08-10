/**
 * Sanity webhook → rebuild + cache purge.
 *
 * The production site is fully prerendered (static pages + Pagefind index),
 * so publishing content must trigger a Netlify BUILD, not just a cache
 * purge. The endpoint verifies the Sanity webhook signature, then:
 *   1. POSTs to the Netlify build hook (NETLIFY_BUILD_HOOK_URL) so the site
 *      rebuilds with fresh content and a fresh search index;
 *   2. purges the tagged edge cache (covers any SSR-fallback rendered
 *      responses, e.g. legacy-URL redirects).
 *
 * Configure a webhook in Sanity (Manage → API → Webhooks):
 *   - URL:     https://<site>/api/revalidate
 *   - Trigger: Create / Update / Delete
 *   - Filter:  _type in ["docPage", "category", "home", "settings"]
 *   - Projection: { _type, _id, "slug": slug.current }
 *   - Secret:  same value as the SANITY_WEBHOOK_SECRET env var
 *   - HTTP method: POST
 *
 * Create the build hook in Netlify (Site settings → Build & deploy →
 * Build hooks) and set its URL as NETLIFY_BUILD_HOOK_URL.
 */

import { json, error } from '@sveltejs/kit';
import { purgeCache } from '@netlify/functions';
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook';
import { env } from '$env/dynamic/private';
import { GLOBAL_TAG } from '$lib/sanity/cache';
import type { RequestHandler } from './$types';

export const prerender = false;

interface SanityWebhookPayload {
	_type?: string;
	_id?: string;
	slug?: string | null;
}

export const POST: RequestHandler = async ({ request }) => {
	const secret = env.SANITY_WEBHOOK_SECRET;
	if (!secret) {
		throw error(500, 'SANITY_WEBHOOK_SECRET not configured');
	}

	const signature = request.headers.get(SIGNATURE_HEADER_NAME);
	const body = await request.text();

	if (!signature || !(await isValidSignature(body, signature, secret))) {
		throw error(401, 'Invalid webhook signature');
	}

	let payload: SanityWebhookPayload;
	try {
		payload = JSON.parse(body) as SanityWebhookPayload;
	} catch {
		throw error(400, 'Invalid JSON payload');
	}

	let rebuildTriggered = false;
	const buildHook = env.NETLIFY_BUILD_HOOK_URL;
	if (buildHook) {
		const res = await fetch(buildHook, { method: 'POST' });
		rebuildTriggered = res.ok;
	}

	await purgeCache({ tags: [GLOBAL_TAG] });

	return json({
		rebuildTriggered,
		purged: [GLOBAL_TAG],
		type: payload._type,
		slug: payload.slug ?? null
	});
};
