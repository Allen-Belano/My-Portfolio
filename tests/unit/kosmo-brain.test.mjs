import test from 'node:test';
import assert from 'node:assert/strict';
import {
	createMind,
	stimulate,
	moodOf,
	wantsToFlee,
	wantsPortal,
	isFull,
	createShakeDetector,
	throwVelocity,
	pickLine,
	LINES,
	remember,
	recall,
	startingTrust,
	foodClickAllowed,
	createSecretWord,
	createTapCounter,
} from '../../kosmo/brain.js';

const fixed = (value) => () => value;

test('a wary Kosmo flees a nearby cursor but ignores a distant one', () => {
	const mind = createMind({ trust: 0.1 });
	assert.equal(wantsToFlee(mind, 80, 0), true);
	assert.equal(wantsToFlee(mind, 900, 0), false);
});

test('a friendly Kosmo does not flee, and opens a portal', () => {
	const mind = createMind({ trust: 0.85 });
	assert.equal(wantsToFlee(mind, 60, 0), false);
	assert.equal(wantsPortal(mind, 0), true);
	assert.equal(moodOf(mind, 0), 'friendly');
});

test('an angry Kosmo opens no portal, however much he trusted you', () => {
	let mind = createMind({ trust: 0.9 });
	mind = stimulate(mind, 'shaken', 1000);
	assert.equal(wantsPortal(mind, 1500), false);
});

test('feeding raises trust and lowers hunger, and he is happy afterwards', () => {
	const before = createMind({ trust: 0.2, hunger: 0.8 });
	const after = stimulate(before, 'fed', 1000);
	assert.ok(after.trust > before.trust);
	assert.ok(after.hunger < before.hunger);
	assert.equal(moodOf(after, 1200), 'happy');
});

test('three empanadas in a row and he is full', () => {
	let mind = createMind({ hunger: 0.9 });
	for (let i = 0; i < 3; i++) mind = stimulate(mind, 'fed', 1000 + i * 5000);
	assert.equal(isFull(mind, 16000), true);
	assert.equal(moodOf(mind, 30000), 'full');
});

test('one poke is fine, a flurry of pokes makes him angry', () => {
	let mind = createMind({ trust: 0.3 });
	mind = stimulate(mind, 'poke', 1000);
	assert.notEqual(moodOf(mind, 1100), 'angry');
	for (let i = 1; i <= 4; i++) mind = stimulate(mind, 'poke', 1000 + i * 400);
	assert.equal(moodOf(mind, 3000), 'angry');
});

test('pokes spread out over time stay friendly', () => {
	let mind = createMind({ trust: 0.3 });
	for (let i = 0; i < 5; i++) mind = stimulate(mind, 'poke', i * 20000);
	assert.notEqual(moodOf(mind, 80500), 'angry');
});

test('shaking makes him dizzy first, then angry, and costs trust', () => {
	const before = createMind({ trust: 0.6 });
	const after = stimulate(before, 'shaken', 1000);
	assert.equal(moodOf(after, 1200), 'dizzy');
	assert.equal(moodOf(after, 1000 + 3500), 'angry');
	assert.ok(after.trust < before.trust);
});

test('petting builds trust', () => {
	const before = createMind({ trust: 0.4 });
	const after = stimulate(before, 'pet', 1000);
	assert.ok(after.trust > before.trust);
});

test('being ignored makes him sad', () => {
	const mind = stimulate(createMind(), 'ignored', 1000);
	assert.equal(moodOf(mind, 1500), 'sad');
});

test('trust always stays between -1 and 1', () => {
	let mind = createMind({ trust: 0.95 });
	for (let i = 0; i < 20; i++) mind = stimulate(mind, 'pet', i * 10000);
	assert.ok(mind.trust <= 1);
	for (let i = 0; i < 20; i++) mind = stimulate(mind, 'shaken', 300000 + i * 10000);
	assert.ok(mind.trust >= -1);
});

test('stimulate does not change the mind it was given', () => {
	const mind = createMind({ trust: 0.3 });
	stimulate(mind, 'fed', 1000);
	assert.equal(mind.trust, 0.3);
});

test('a fast back-and-forth drag counts as a shake', () => {
	const shake = createShakeDetector();
	let shaken = false;
	for (let i = 0; i < 10; i++) shaken = shake.sample(i * 60, i % 2 ? 1400 : -1400, 0) || shaken;
	assert.equal(shaken, true);
});

test('a slow drag is not a shake', () => {
	const shake = createShakeDetector();
	let shaken = false;
	for (let i = 0; i < 10; i++) shaken = shake.sample(i * 60, i % 2 ? 120 : -120, 0) || shaken;
	assert.equal(shaken, false);
});

test('throw speed comes from the last moments of the drag, capped', () => {
	const samples = [
		{ t: 0, x: 0, y: 0 },
		{ t: 900, x: 0, y: 0 },
		{ t: 950, x: 50, y: -20 },
		{ t: 1000, x: 100, y: -40 },
	];
	const { vx, vy } = throwVelocity(samples);
	assert.ok(vx > 900 && vx < 1100);
	assert.ok(vy < 0);
	const wild = throwVelocity([
		{ t: 0, x: 0, y: 0 },
		{ t: 10, x: 900, y: 0 },
	]);
	assert.ok(Math.hypot(wild.vx, wild.vy) <= 2600);
});

test('he has something to say in every mood, including the tease', () => {
	for (const kind of Object.keys(LINES)) assert.equal(typeof pickLine(kind, fixed(0)), 'string');
	assert.ok(LINES.tease.includes('Catch me, slowpoke!'));
	assert.ok(LINES.portal.some((line) => /come with me/i.test(line)));
});

test('he remembers trust between visits, and forgets bad data safely', () => {
	const mind = stimulate(createMind({ trust: 0.5 }), 'fed', 1000);
	const memory = recall(remember(mind));
	assert.ok(Math.abs(memory.trust - mind.trust) < 1e-9);
	assert.equal(memory.visits, 1);
	assert.deepEqual(recall('not json'), { trust: 0.2, visits: 0 });
	assert.deepEqual(recall(JSON.stringify({ trust: 99, visits: -3 })), { trust: 1, visits: 0 });
});

test('his temperament varies by visit around what he remembers', () => {
	const low = startingTrust({ trust: 0.5, visits: 3 }, fixed(0));
	const high = startingTrust({ trust: 0.5, visits: 3 }, fixed(0.999));
	assert.ok(low < 0.5 && high > 0.5);
});

test('food only drops on empty space, never on links, text or a selection', () => {
	const empty = { interactive: false, onText: false, selecting: false, foods: 0 };
	assert.equal(foodClickAllowed(empty), true);
	assert.equal(foodClickAllowed({ ...empty, interactive: true }), false);
	assert.equal(foodClickAllowed({ ...empty, onText: true }), false);
	assert.equal(foodClickAllowed({ ...empty, selecting: true }), false);
	assert.equal(foodClickAllowed({ ...empty, foods: 2 }), false);
});

test('typing the secret word anywhere opens his portal, in any case', () => {
	const secret = createSecretWord('kosmo');
	const typed = [...'hiKOSMo'].map((key) => secret.push(key));
	assert.deepEqual(typed, [false, false, false, false, false, false, true]);
});

test('a wrong key restarts the secret word, but can start it again', () => {
	const secret = createSecretWord('kosmo');
	assert.equal([...'koskosmo'].map((key) => secret.push(key)).at(-1), true);
	assert.equal([...'kosxmo'].some((key) => secret.push(key)), false);
	assert.equal(secret.push('Shift'), false);
});

test('five quick taps count, slow taps do not', () => {
	const taps = createTapCounter(5, 2000);
	assert.deepEqual([0, 300, 600, 900, 1200].map((t) => taps.tap(t)), [false, false, false, false, true]);
	assert.equal(taps.tap(1300), false, 'the count starts over after it fires');
	const slow = createTapCounter(5, 2000);
	assert.equal([0, 700, 1400, 2100, 2800].some((t) => slow.tap(t)), false);
});
