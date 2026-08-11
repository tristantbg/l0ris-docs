// Site-wide password gate.
//
// Runs at the Netlify edge in front of EVERY request — prerendered pages,
// static assets, the Pagefind index and the SSR fallback function alike —
// which is the only reliable way to protect a fully prerendered site.
//
// The password is read from the SITE_PASSWORD environment variable
// (Netlify UI → Site configuration → Environment variables). While it is
// not set, the site stays locked with an explanatory page: fail closed,
// never silently public.
//
// Successful login sets an HttpOnly cookie holding a SHA-256 digest of the
// password, so changing SITE_PASSWORD invalidates every existing session.

declare const Netlify: { env: { get(name: string): string | undefined } };

const COOKIE_NAME = 'lauris_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function tokenFor(password: string): Promise<string> {
	const bytes = new TextEncoder().encode(`lauris-docs:${password}`);
	const digest = await crypto.subtle.digest('SHA-256', bytes);
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function readCookie(request: Request, name: string): string | null {
	const header = request.headers.get('cookie');
	if (!header) return null;
	for (const part of header.split(';')) {
		const eq = part.indexOf('=');
		if (eq === -1) continue;
		if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
	}
	return null;
}

function page(body: string, status: number): Response {
	const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Lauris Docs — Accès protégé</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔒</text></svg>">
<style>
:root { color-scheme: light dark; }
* { box-sizing: border-box; }
body { margin: 0; min-height: 100dvh; display: grid; place-items: center;
	font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
	background: #fafafa; color: #18181b; }
.card { width: min(92vw, 22rem); border: 1px solid #e4e4e7; border-radius: 12px;
	padding: 2rem; background: #fff; }
h1 { font-size: 1.05rem; margin: 0 0 0.25rem; }
p { margin: 0 0 1.25rem; font-size: 0.85rem; opacity: 0.65; line-height: 1.5; }
input { width: 100%; font: inherit; padding: 0.55rem 0.75rem;
	border: 1px solid #d4d4d8; border-radius: 8px; background: #fff; color: inherit; }
button { width: 100%; margin-top: 0.75rem; font: inherit; font-weight: 500;
	padding: 0.55rem; border: 0; border-radius: 8px; background: #18181b;
	color: #fff; cursor: pointer; }
.error { color: #dc2626; font-size: 0.8rem; margin: 0.6rem 0 0; }
@media (prefers-color-scheme: dark) {
	body { background: #09090b; color: #fafafa; }
	.card { background: #18181b; border-color: #27272a; }
	input { background: #09090b; border-color: #3f3f46; }
	button { background: #fafafa; color: #18181b; }
}
</style>
</head>
<body>
${body}
</body>
</html>`;
	return new Response(html, {
		status,
		headers: {
			'content-type': 'text/html; charset=utf-8',
			'cache-control': 'no-store',
			'x-robots-tag': 'noindex, nofollow, noarchive'
		}
	});
}

function loginPage(withError: boolean): Response {
	return page(
		`<form class="card" method="post">
<h1>🔒 Lauris Docs</h1>
<p>Cette documentation est privée. Entrez le mot de passe pour continuer.</p>
<input type="password" name="password" placeholder="Mot de passe" autofocus required autocomplete="current-password">
${withError ? '<p class="error">Mot de passe incorrect.</p>' : ''}
<button type="submit">Entrer</button>
</form>`,
		401
	);
}

function unconfiguredPage(): Response {
	return page(
		`<div class="card">
<h1>🔒 Lauris Docs</h1>
<p>Le site est verrouillé : la variable d'environnement <strong>SITE_PASSWORD</strong>
n'est pas définie. Ajoutez-la dans Netlify (Site configuration → Environment variables),
puis redéployez.</p>
</div>`,
		503
	);
}

export default async (request: Request, context: { next: () => Promise<Response> }) => {
	const password = typeof Netlify !== 'undefined' ? Netlify.env.get('SITE_PASSWORD') : undefined;
	if (!password) return unconfiguredPage();

	const token = await tokenFor(password);

	if (readCookie(request, COOKIE_NAME) === token) {
		const response = await context.next();
		response.headers.set('x-robots-tag', 'noindex, nofollow, noarchive');
		return response;
	}

	if (request.method === 'POST') {
		const form = await request.formData().catch(() => null);
		const attempt = form?.get('password');
		if (typeof attempt === 'string' && attempt === password) {
			const url = new URL(request.url);
			return new Response(null, {
				status: 303,
				headers: {
					location: url.pathname + url.search,
					'set-cookie': `${COOKIE_NAME}=${token}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
					'cache-control': 'no-store'
				}
			});
		}
		return loginPage(true);
	}

	return loginPage(false);
};

export const config = {
	path: '/*',
	// robots.txt must stay reachable so crawlers can read the Disallow rules;
	// /api/revalidate is the Sanity webhook (protected by its own signature).
	excludedPath: ['/robots.txt', '/api/revalidate']
};
