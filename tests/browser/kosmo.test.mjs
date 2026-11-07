import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, launch, openPage, kosmoCenter, stage } from './helpers.mjs';

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

// Waits until Kosmo has walked on and is free to react.
async function waitForKosmo(page) {
	await page.waitForFunction(() => {
		const el = document.getElementById('kosmo-stage');
		return el?.dataset.present === 'true' && !['enter', 'away'].includes(el.dataset.state);
	}, null, { timeout: 8000 });
}

test('the old peeking alien is gone', async () => {
	const { page, context } = await openPage(browser, server.url);
	assert.equal(await page.locator('[data-peek]').count(), 0);
	await context.close();
});

test('Kosmo is away at first and arrives when the page is idle', async () => {
	const { page, context, errors } = await openPage(browser, server.url, { kosmo: { arriveAfter: 400, seed: 3 } });
	assert.equal(await stage(page).getAttribute('data-present'), 'false');
	await waitForKosmo(page);
	assert.equal(await stage(page).getAttribute('data-present'), 'true');
	assert.deepEqual(errors, []);
	await context.close();
});

test('a wary Kosmo runs away from the cursor', async () => {
	const { page, context } = await openPage(browser, server.url, { kosmo: { arriveAfter: 300, seed: 5, trust: -0.3 } });
	await waitForKosmo(page);
	const start = await kosmoCenter(page);
	const fromLeft = start.x > 640;
	await page.mouse.move(start.x + (fromLeft ? -70 : 70), start.y, { steps: 4 });
	await page.waitForTimeout(700);
	const end = await kosmoCenter(page);
	const moved = fromLeft ? end.x - start.x : start.x - end.x;
	assert.ok(moved > 30, `expected Kosmo to flee, he moved ${moved}px away`);
	assert.equal(await stage(page).getAttribute('data-mood'), 'scared');
	await context.close();
});

test('clicking empty space drops an empanada and lures him in', async () => {
	const { page, context } = await openPage(browser, server.url, { kosmo: { arriveAfter: 600000, seed: 2 } });
	await page.mouse.click(80, 300);
	assert.equal(await stage(page).getAttribute('data-foods'), '1');
	await page.mouse.move(1270, 10);
	await page.waitForFunction(() => document.getElementById('kosmo-stage').dataset.present === 'true', null, { timeout: 5000 });
	await page.waitForFunction(() => document.getElementById('kosmo-stage').dataset.foods === '0', null, { timeout: 15000 });
	await context.close();
});

test('clicking resume text or a link drops no food', async () => {
	const { page, context } = await openPage(browser, server.url, { kosmo: { arriveAfter: 600000 } });
	const lede = page.locator('.hero-lede');
	const box = await lede.boundingBox();
	await page.mouse.click(box.x + 40, box.y + 6);
	await page.locator('.resume-contact a[href^="mailto"]').click();
	assert.equal(await stage(page).getAttribute('data-foods'), '0');
	await context.close();
});

test('he can be dragged and thrown, and lands again', async () => {
	const { page, context } = await openPage(browser, server.url, { kosmo: { arriveAfter: 300, seed: 7, trust: 0.5 } });
	await waitForKosmo(page);
	const { x, y } = await kosmoCenter(page);
	await page.mouse.move(x, y);
	await page.mouse.down();
	await page.mouse.move(x + 20, y - 40, { steps: 3 });
	assert.equal(await stage(page).getAttribute('data-state'), 'held');
	await page.mouse.move(x + 120, y - 260, { steps: 2 });
	await page.mouse.up();
	assert.equal(await stage(page).getAttribute('data-state'), 'air');
	await page.waitForFunction(() => document.getElementById('kosmo-stage').dataset.state !== 'air', null, { timeout: 6000 });
	await context.close();
});

test('shaking him makes him dizzy', async () => {
	const { page, context } = await openPage(browser, server.url, { kosmo: { arriveAfter: 300, seed: 7, trust: 0.5 } });
	await waitForKosmo(page);
	const { x, y } = await kosmoCenter(page);
	await page.mouse.move(x, y);
	await page.mouse.down();
	await page.mouse.move(x, y - 150, { steps: 3 });
	for (let i = 0; i < 10; i++) {
		await page.mouse.move(x + (i % 2 ? 140 : -140), y - 150);
		await page.waitForTimeout(40);
	}
	await page.mouse.up();
	await page.waitForTimeout(200);
	assert.equal(await stage(page).getAttribute('data-mood'), 'dizzy');
	await context.close();
});

test('poking him gets a reaction', async () => {
	const { page, context } = await openPage(browser, server.url, { kosmo: { arriveAfter: 300, seed: 9, trust: 0.9 } });
	await waitForKosmo(page);
	const { x, y } = await kosmoCenter(page);
	await page.mouse.click(x, y);
	await page.waitForTimeout(150);
	const said = await page.locator('#k-bub-t').textContent();
	assert.ok(said.length > 0);
	await context.close();
});

test('Escape sends him away', async () => {
	const { page, context } = await openPage(browser, server.url, { kosmo: { arriveAfter: 300, seed: 4 } });
	await waitForKosmo(page);
	await page.keyboard.press('Escape');
	await page.waitForFunction(() => document.getElementById('kosmo-stage').dataset.present === 'false', null, { timeout: 10000 });
	await context.close();
});

test('when he likes you he opens a portal to the portfolio', async () => {
	const { page, context, errors } = await openPage(browser, server.url, { kosmo: { arriveAfter: 300, seed: 1, trust: 0.95 } });
	await waitForKosmo(page);
	const portal = page.locator('#kosmo-portal');
	await portal.waitFor({ state: 'visible', timeout: 15000 });
	assert.match(await page.locator('#k-bub-t').textContent(), /come with me/i);
	await portal.click();
	await page.waitForFunction(() => document.body.dataset.theme === 'portfolio', null, { timeout: 5000 });
	assert.equal(await page.evaluate(() => location.hash), '#portfolio');
	assert.deepEqual(errors, []);
	await context.close();
});

test('keyboard users can reach him last, summon him, and pet him', async () => {
	const { page, context } = await openPage(browser, server.url, { kosmo: { arriveAfter: 600000, seed: 6, trust: 0.4 } });
	const last = await page.evaluate(() => {
		const items = [...document.querySelectorAll('a[href], button, input, [tabindex]')].filter(
			(el) => el.tabIndex >= 0 && !el.disabled && el.getClientRects().length && !el.closest('[hidden], .portfolio-view'),
		);
		return items.at(-1)?.id;
	});
	assert.equal(last, 'kosmo-btn');
	await page.focus('#kosmo-btn');
	await waitForKosmo(page);
	await page.keyboard.press('Enter');
	await page.waitForTimeout(150);
	assert.match(await stage(page).getAttribute('data-mood'), /happy|friendly/);
	await context.close();
});

test('on a phone, tapping empty paper drops an empanada', async () => {
	const { page, context } = await openPage(browser, server.url, {
		viewport: { width: 390, height: 844 },
		touch: true,
		kosmo: { arriveAfter: 600000 },
	});
	await page.touchscreen.tap(376, 420);
	assert.equal(await stage(page).getAttribute('data-foods'), '1');
	await context.close();
});
