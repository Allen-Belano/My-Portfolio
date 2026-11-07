import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, launch, openPage } from './helpers.mjs';

let server;
let browser;
before(async () => {
	server = await startServer();
	browser = await launch();
});
after(async () => {
	await browser?.close();
	server?.close();
});

// The bug from the screenshot: "01 / LAUNCH" showed in the bottom-left corner of the paper view.
test('the portfolio stage indicator does not show in the paper view', async () => {
	const { page, context, errors } = await openPage(browser, server.url);
	await page.waitForTimeout(600);
	assert.equal(await page.locator('.pf-progress').isVisible(), false);
	assert.deepEqual(errors, []);
	await context.close();
});

test('the paper view is one sheet of paper wrapping the resume', async () => {
	const { page, context } = await openPage(browser, server.url);
	assert.equal(await page.locator('.paper[data-paper] > main#top').count(), 1);
	await context.close();
});

test('the paper tilts toward the mouse and settles flat when scrolling', async () => {
	const { page, context } = await openPage(browser, server.url);
	await page.mouse.move(640, 400);
	await page.mouse.move(150, 120, { steps: 8 });
	await page.waitForTimeout(500);
	const tilted = await page.locator('.paper').evaluate((el) => el.style.transform);
	assert.match(tilted, /rotateX\(-?\d/);
	assert.match(tilted, /rotateY\(-?\d/);

	await page.mouse.wheel(0, 400);
	await page.waitForTimeout(1600);
	const flat = await page.locator('.paper').evaluate((el) => getComputedStyle(el).transform);
	assert.equal(flat, 'none');
	await context.close();
});

test('the paper stays flat with reduced motion', async () => {
	const { page, context } = await openPage(browser, server.url, { reducedMotion: true });
	await page.mouse.move(150, 120, { steps: 8 });
	await page.waitForTimeout(500);
	assert.equal(await page.locator('.paper').evaluate((el) => getComputedStyle(el).transform), 'none');
	await context.close();
});

test('printing gives a flat paper with no Kosmo', async () => {
	const { page, context } = await openPage(browser, server.url, { kosmo: { arriveAfter: 200 } });
	await page.mouse.move(150, 120, { steps: 8 });
	await page.emulateMedia({ media: 'print' });
	await page.waitForTimeout(300);
	assert.equal(await page.locator('.paper').evaluate((el) => getComputedStyle(el).transform), 'none');
	assert.equal(await page.locator('#kosmo-stage').isVisible(), false);
	await context.close();
});

test('#portfolio still opens the portfolio view directly, without Kosmo or the tilt', async () => {
	const { page, context, errors } = await openPage(browser, server.url, { hash: '#portfolio', kosmo: { arriveAfter: 100 } });
	await page.waitForTimeout(500);
	assert.equal(await page.evaluate(() => document.body.dataset.theme), 'portfolio');
	assert.equal(await page.locator('#kosmo-stage').getAttribute('data-present'), 'false');
	assert.equal(await page.locator('.paper').isVisible(), false);
	assert.deepEqual(errors, []);
	await context.close();
});

test('on a phone the paper stays flat and nothing scrolls sideways', async () => {
	const { page, context } = await openPage(browser, server.url, { viewport: { width: 390, height: 844 }, touch: true });
	await page.waitForTimeout(400);
	assert.equal(await page.locator('.paper').evaluate((el) => getComputedStyle(el).transform), 'none');
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
	assert.ok(overflow <= 0, `page is ${overflow}px wider than the screen`);
	await context.close();
});
