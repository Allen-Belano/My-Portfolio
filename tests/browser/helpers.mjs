import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const types = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.jpg': 'image/jpeg',
	'.svg': 'image/svg+xml',
	'.pdf': 'application/pdf',
};

// The page loads GSAP and Lenis from CDNs. Tests serve the same versions from node_modules,
// so they run offline and still exercise the real libraries.
const vendor = {
	'gsap.min.js': 'node_modules/gsap/dist/gsap.min.js',
	'ScrollTrigger.min.js': 'node_modules/gsap/dist/ScrollTrigger.min.js',
	'lenis.min.js': 'node_modules/lenis/dist/lenis.min.js',
};

export async function startServer() {
	const server = http.createServer(async (request, response) => {
		let file = decodeURIComponent(request.url.split('?')[0]);
		if (file.endsWith('/')) file += 'index.html';
		try {
			const body = await readFile(path.join(root, file));
			response.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
			response.end(body);
		} catch {
			response.writeHead(404);
			response.end();
		}
	});
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
	return { url: `http://127.0.0.1:${server.address().port}/`, close: () => server.close() };
}

export async function launch() {
	return chromium.launch();
}

// Opens the site. options.kosmo is passed to the mascot as window.__kosmoConfig (test timings),
// options.memory seeds what Kosmo remembers about the visitor, options.reducedMotion emulates the setting.
export async function openPage(browser, url, options = {}) {
	const context = await browser.newContext({
		viewport: options.viewport || { width: 1280, height: 800 },
		reducedMotion: options.reducedMotion ? 'reduce' : 'no-preference',
		hasTouch: Boolean(options.touch),
		isMobile: Boolean(options.touch),
	});
	const page = await context.newPage();
	const errors = [];
	page.on('pageerror', (error) => errors.push(error.message));
	page.on('console', (message) => {
		if (message.type() === 'error' && !/net::|Failed to load resource/.test(message.text())) errors.push(message.text());
	});
	await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => {
		const name = Object.keys(vendor).find((key) => route.request().url().endsWith(`/${key}`));
		if (name) return route.fulfill({ path: path.join(root, vendor[name]), contentType: 'text/javascript' });
		return route.abort();
	});
	await page.addInitScript(
		({ kosmo, memory }) => {
			if (kosmo) window.__kosmoConfig = kosmo;
			if (memory) localStorage.setItem('kosmo-memory', JSON.stringify(memory));
		},
		{ kosmo: options.kosmo || null, memory: options.memory || null },
	);
	await page.goto(url + (options.hash || ''));
	await page.waitForLoadState('load');
	return { page, context, errors };
}

// Kosmo's centre on screen, read from his drawing.
export async function kosmoCenter(page) {
	const box = await page.locator('#k-kosmo').boundingBox();
	return { x: box.x + box.width / 2, y: box.y + box.height / 2, box };
}

export function stage(page) {
	return page.locator('#kosmo-stage');
}
