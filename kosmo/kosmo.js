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
	remember,
	recall,
	startingTrust,
	foodClickAllowed,
	seeded,
} from './brain.js';
import { NS, stageSvg, empanada } from './art.js';

// Kosmo Gaea, the paper view's alien dog. He is not always there: he wanders in when the page has been
// idle for a while, and stays about a minute unless you play with him. He is enemies with the cursor and
// runs from it, until he trusts you. Click or tap empty space to drop an Ilocos empanada; he grabs it with
// his tail and eats it. He can be poked, petted (hover slowly), dragged, thrown and shaken, and his face
// shows how he feels about it. If he likes you enough he opens a portal to the portfolio.
//
// The brain (brain.js) decides how he feels; this file moves and draws him.
// Test hooks: window.__kosmoConfig = { arriveAfter, cooldown, stay, seed, trust }.
// State for tests and debugging is mirrored on #kosmo-stage as data-present, data-state, data-mood, data-foods.

const MEMORY_KEY = 'kosmo-memory';
const GROUND = 22;
const GRAVITY = 2000;
const MAX_FOODS = 2;
const PHASES = [
	['open', 0.45],
	['reach', 0.7],
	['grab', 0.25],
	['carry', 0.8],
	['chomp', 1.6],
	['retract', 0.55],
	['close', 0.45],
	['happy', 1.4],
];
const BITES = [
	[-16, -10],
	[14, -12],
	[-2, -16],
	[2, 2],
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;
const lp = (p, q, t) => ({ x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t) });
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function manilaHour() {
	try {
		return Number(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', hour12: false })) % 24;
	} catch {
		return 12;
	}
}

function loadMemory() {
	try {
		return recall(localStorage.getItem(MEMORY_KEY));
	} catch {
		return recall(null);
	}
}

// Is (x, y) on a character of text? caretRangeFromPoint snaps to the nearest character, so check that the
// character's own box really is under the point.
function textAt(x, y) {
	let node;
	let offset;
	if (document.caretRangeFromPoint) {
		const range = document.caretRangeFromPoint(x, y);
		if (!range) return false;
		node = range.startContainer;
		offset = range.startOffset;
	} else if (document.caretPositionFromPoint) {
		const position = document.caretPositionFromPoint(x, y);
		if (!position) return false;
		node = position.offsetNode;
		offset = position.offset;
	}
	if (!node || node.nodeType !== Node.TEXT_NODE) return false;
	const range = document.createRange();
	for (const at of [offset - 1, offset]) {
		if (at < 0 || at >= node.length) continue;
		range.setStart(node, at);
		range.setEnd(node, at + 1);
		for (const rect of range.getClientRects()) {
			if (x >= rect.left - 2 && x <= rect.right + 2 && y >= rect.top - 2 && y <= rect.bottom + 2) return true;
		}
	}
	return false;
}

export function initKosmo({ onPortal } = {}) {
	const config = window.__kosmoConfig || {};
	const rng = Number.isFinite(config.seed) ? seeded(config.seed) : Math.random;
	const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
	const memory = loadMemory();
	let mind = createMind({
		trust: Number.isFinite(config.trust) ? config.trust : startingTrust(memory, rng),
		hunger: 0.55 + rng() * 0.4,
		visits: memory.visits,
	});
	const night = manilaHour() < 5;

	// ----- DOM -----
	const stage = document.createElement('div');
	stage.id = 'kosmo-stage';
	stage.setAttribute('aria-hidden', 'true');
	stage.innerHTML = stageSvg;
	const live = document.createElement('div');
	live.id = 'kosmo-live';
	live.className = 'kosmo-sr';
	live.setAttribute('aria-live', 'polite');
	const portalBtn = document.createElement('button');
	portalBtn.id = 'kosmo-portal';
	portalBtn.type = 'button';
	portalBtn.hidden = true;
	portalBtn.innerHTML = '<span class="kosmo-sr">Go through Kosmo’s portal to the portfolio</span>';
	const btn = document.createElement('button');
	btn.id = 'kosmo-btn';
	btn.type = 'button';
	btn.setAttribute('aria-label', 'Kosmo Gaea, the alien dog. Enter to pet him, F to feed him, Escape to send him away.');
	btn.textContent = 'Kosmo: Enter to pet, F to feed, Esc to shoo';
	// Kosmo's button stays the last stop in the tab order, as the peeker was.
	document.body.append(stage, live, portalBtn, btn);

	const $ = (id) => document.getElementById(id);
	const el = {
		svg: $('k-svg'),
		kosmo: $('k-kosmo'),
		bob: $('k-bob'),
		lid: $('k-lid'),
		eyes: $('k-eyes'),
		pupils: $('k-pupils'),
		eyesHappy: $('k-eyes-happy'),
		eyesShut: $('k-eyes-shut'),
		eyesDizzy: $('k-eyes-dizzy'),
		brows: $('k-brows'),
		browL: $('k-brow-l'),
		browR: $('k-brow-r'),
		mouths: { mc: $('k-mc'), mo: $('k-mo'), frown: $('k-mfrown'), flat: $('k-mflat'), wavy: $('k-mwavy'), grin: $('k-mgrin') },
		blush: $('k-blush'),
		tear: $('k-tear'),
		ears: $('k-ears'),
		legs: [$('kl0'), $('kl1'), $('kl2'), $('kl3')],
		t1: $('k-t1'),
		t2: $('k-t2'),
		t3: $('k-t3'),
		tip: $('k-tip'),
		p1: $('k-p1'),
		p2: $('k-p2'),
		shadow: $('k-shadow'),
		foods: $('k-foods'),
		biteDefs: $('k-bite-defs'),
		fx: $('k-fx'),
		emote: $('k-emote'),
		emotes: { vein: $('k-e-vein'), sweat: $('k-e-sweat'), zzz: $('k-e-zzz'), bang: $('k-e-bang'), q: $('k-e-q'), note: $('k-e-note'), stars: $('k-e-stars') },
		bub: $('k-bub'),
		bubR: $('k-bub-r'),
		bubT: $('k-bub-t'),
		bubTl: $('k-bub-tl'),
		portal: $('k-portal'),
		portalR1: $('k-portal-r1'),
		portalR2: $('k-portal-r2'),
	};
	for (let i = 0; i < 3; i++) {
		const star = document.createElementNS(NS, 'path');
		star.setAttribute('d', 'M0 -6 L1.8 -1.8 L6 0 L1.8 1.8 L0 6 L-1.8 1.8 L-6 0 L-1.8 -1.8 Z');
		el.emotes.stars.append(star);
	}
	const tailParts = [el.t1, el.t2, el.t3, el.tip];

	// ----- World -----
	let Wd = 0;
	let Ht = 0;
	let gy = 0;
	let s = 0.8;
	let minX = 80;
	let maxX = 300;
	function resize() {
		Wd = window.innerWidth;
		Ht = window.innerHeight;
		gy = Ht - GROUND;
		s = Wd < 720 ? 0.55 : 0.8;
		el.svg.setAttribute('viewBox', `0 0 ${Wd} ${Ht}`);
		minX = 84 * s + 6;
		maxX = Math.max(minX + 10, Wd - 84 * s - 6);
		if (state !== 'away' && state !== 'enter' && state !== 'leave') k.x = clamp(k.x, minX, maxX);
		if (state !== 'air' && state !== 'held') k.footY = gy;
	}

	const k = {
		x: -200,
		footY: 0,
		vx: 0,
		vy: 0,
		dir: 1,
		facing: 'left',
		walking: false,
		ph: 0,
		hopY: 0,
		hopV: 0,
		rot: 0,
		shrink: 1,
		helmet: 0,
		mouth: false,
		blinkT: 3,
		blink: 0,
		phase: 0,
		pt: 0,
		from: null,
		lastChomp: 0,
		prong: 32,
		pause: 0,
		walkT: 4,
		wagUntil: 0,
		target: null,
		enterTarget: 0,
		speed: 150,
		bounces: 0,
		hard: false,
		fast: false,
		calm: 0,
		fleeing: 0,
		tellUntil: 0,
		tell: null,
		saidWary: false,
		sad: false,
	};
	let state = 'away';
	let stateT = 0;
	let active = false;
	let running = false;
	let time = 0;
	let now = performance.now();
	let lastActivity = now;
	let lastEngaged = now;
	let arrivedAt = 0;
	let lastTease = -Infinity;
	let portalShownAt = -Infinity;
	let cooldownUntil = 0;
	let arriveAfter = Number.isFinite(config.arriveAfter) ? config.arriveAfter : 12000 + rng() * 33000;
	const stayIgnored = Number.isFinite(config.stay) ? config.stay : 60000;
	let greeted = false;
	let foodSeq = 0;
	const foods = [];
	const parts = [];
	const bub = { t: 0, w: 60 };
	const portal = { open: 0, target: 0, x: 0, y: 0 };
	let tip = { x: 0, y: 0 };
	let tan = { x: 1, y: 0 };
	let curve = null;
	let base = { x: 0, y: 0 };
	const pointer = { x: 0, y: 0, inside: false, lastMove: 0, speed: 0, t: 0 };
	let drag = null;
	let justDragged = false;
	let petT = 0;
	const shake = createShakeDetector();

	const reduce = () => reduceQuery.matches;
	const S = () => (k.facing === 'left' ? s : -s) * k.shrink;
	const sy = () => s * k.shrink;

	// Local design units to screen pixels, including his tilt while held or flying.
	function W(lx, ly) {
		const ox = k.x;
		const oy = k.footY - 77 * s + k.hopY;
		const px = S() * lx;
		const py = sy() * ly;
		const a = (k.rot * Math.PI) / 180;
		return { x: ox + px * Math.cos(a) - py * Math.sin(a), y: oy + px * Math.sin(a) + py * Math.cos(a) };
	}
	const center = () => W(-5, -10);
	const pointerDistance = () => (pointer.inside ? Math.hypot(pointer.x - center().x, pointer.y - center().y) : Infinity);

	// ----- Speech -----
	function say(kind, duration = 2.2) {
		const text = LINE_OVERRIDE[kind] || pickLine(kind, rng);
		bub.t = duration;
		el.bubT.textContent = text;
		el.bub.setAttribute('opacity', '1');
		const w = el.bubT.getComputedTextLength() + 24;
		bub.w = w;
		el.bubR.setAttribute('x', -w / 2);
		el.bubR.setAttribute('width', w);
		if (document.activeElement === btn || document.activeElement === portalBtn) live.textContent = text;
		return text;
	}
	const LINE_OVERRIDE = {};
	function announce(text) {
		live.textContent = text;
	}
	function hop(power = 240) {
		if (!reduce() && k.hopY === 0) k.hopV = -power;
	}
	function tell(mark, seconds = 1.2) {
		k.tell = mark;
		k.tellUntil = time + seconds;
	}

	function spawn(type, x, y) {
		let node;
		if (type === 'crumb') {
			node = document.createElementNS(NS, 'circle');
			node.setAttribute('r', (1.5 + rng() * 1.6).toFixed(1));
			node.setAttribute('fill', ['#E9742A', '#F4A04E', '#C9541A', '#F8C27A'][Math.floor(rng() * 4)]);
		} else {
			node = document.createElementNS(NS, 'path');
			node.setAttribute('d', 'M0 3.5 C-7 -2 -4.5 -8 0 -4.5 C4.5 -8 7 -2 0 3.5 Z');
			node.setAttribute('fill', '#FF6F91');
			node.setAttribute('stroke', '#1F2A55');
			node.setAttribute('stroke-width', '1.5');
		}
		el.fx.append(node);
		const p =
			type === 'crumb'
				? { vx: (rng() - 0.5) * 120, vy: -40 - rng() * 80, g: 650, life: 0.9 }
				: { vx: (rng() - 0.5) * 30, vy: -45 - rng() * 25, g: 0, life: 1.5 };
		Object.assign(p, { type, x, y, max: p.life, node });
		parts.push(p);
	}
	function hearts(count = 4) {
		const head = W(-22, -70);
		for (let i = 0; i < count; i++) spawn('heart', head.x + (rng() - 0.5) * 34, head.y);
	}

	// ----- Food -----
	function spawnFood(x, y) {
		const id = ++foodSeq;
		const mask = document.createElementNS(NS, 'mask');
		mask.id = `kosmo-bite-${id}`;
		mask.setAttribute('maskUnits', 'userSpaceOnUse');
		for (const [name, value] of Object.entries({ x: -40, y: -40, width: 80, height: 80 })) mask.setAttribute(name, value);
		mask.innerHTML = '<rect x="-40" y="-40" width="80" height="80" fill="#fff"/><g fill="#000"></g>';
		el.biteDefs.append(mask);
		const group = document.createElementNS(NS, 'g');
		group.innerHTML = `<g mask="url(#kosmo-bite-${id})">${empanada}</g>`;
		el.foods.append(group);
		const food = { id, node: group, mask, bites: mask.lastChild, x, y, vy: 0, rot: (rng() - 0.5) * 40, vr: (rng() - 0.5) * 200, scale: 1, state: 'fall', born: time, refused: false };
		foods.push(food);
		syncFoods();
		return food;
	}
	function removeFood(food) {
		food.node.remove();
		food.mask.remove();
		foods.splice(foods.indexOf(food), 1);
		syncFoods();
	}
	function syncFoods() {
		stage.dataset.foods = String(foods.length);
	}
	const groundFood = () =>
		foods
			.filter((food) => food.state === 'ground' && !food.refused)
			.sort((a, b) => Math.abs(a.x - k.x) - Math.abs(b.x - k.x))[0];

	// ----- States -----
	function setState(next) {
		state = next;
		stateT = 0;
		stage.dataset.state = next;
		k.calm = 0;
	}

	function arrive({ fast = false, side, target } = {}) {
		if (state !== 'away' || !active) return;
		resize();
		const from = side || (rng() < 0.5 ? 'left' : 'right');
		k.x = from === 'left' ? -120 : Wd + 120;
		k.footY = gy;
		k.rot = 0;
		k.shrink = 1;
		k.hopY = 0;
		k.helmet = 0;
		k.fast = fast;
		k.enterTarget = clamp(
			target ?? (from === 'left' ? Wd * (0.3 + rng() * 0.2) : Wd * (0.7 - rng() * 0.2)),
			minX,
			maxX,
		);
		k.saidWary = false;
		k.sad = false;
		el.kosmo.style.display = '';
		for (const part of tailParts) part.style.display = '';
		el.shadow.style.display = '';
		arrivedAt = now;
		lastEngaged = now;
		stage.dataset.present = 'true';
		setState('enter');
		start();
	}

	function goAway() {
		setState('away');
		stage.dataset.present = 'false';
		el.kosmo.style.display = 'none';
		for (const part of tailParts) part.style.display = 'none';
		el.shadow.style.display = 'none';
		el.emote.style.display = 'none';
		closePortal(true);
		bub.t = 0;
		el.bub.setAttribute('opacity', '0');
		for (const food of [...foods]) if (food.state === 'held') removeFood(food);
		cooldownUntil = now + (Number.isFinite(config.cooldown) ? config.cooldown : 40000 + rng() * 50000);
		arriveAfter = Number.isFinite(config.arriveAfter) ? config.arriveAfter : 12000 + rng() * 33000;
		lastActivity = now;
		save();
	}

	function save() {
		try {
			localStorage.setItem(MEMORY_KEY, remember(mind));
		} catch {
			/* storage blocked: he simply won't remember */
		}
	}

	function leave(kind = 'leave') {
		if (state === 'away' || state === 'leave' || state === 'enter-portal') return;
		if (state === 'portal') closePortal(true);
		dropHeldFood();
		say(kind, 1.8);
		setState('leave');
	}

	function openPortal() {
		portal.x = clamp(k.x + (k.x < Wd / 2 ? 170 : -170) * (s / 0.8), 70, Wd - 70);
		portal.y = gy - 80 * (s / 0.8);
		portal.target = 1;
		portalShownAt = now;
		el.portal.style.display = '';
		portalBtn.hidden = false;
		k.facing = portal.x < k.x ? 'left' : 'right';
		say('portal', 6);
		hearts(3);
		setState('portal');
		if (document.activeElement === btn) announce('Kosmo opened a portal to the portfolio. Press Tab to go through it.');
	}

	function closePortal(instant = false) {
		portal.target = 0;
		portalBtn.hidden = true;
		if (instant) {
			portal.open = 0;
			el.portal.style.display = 'none';
		}
	}

	function enterPortal() {
		if (state !== 'portal') return;
		portalBtn.hidden = true;
		mind = stimulate(mind, 'pet', now);
		save();
		setState('enter-portal');
		k.from = { x: k.x };
	}

	function dropHeldFood() {
		for (const food of foods) {
			if (food.state === 'held') {
				food.state = 'fall';
				food.vy = 0;
			}
		}
		k.helmet = 0;
		k.mouth = false;
		k.prong = 32;
	}

	function startEat(food) {
		k.target = food;
		k.facing = food.x < k.x ? 'left' : 'right';
		setState('eat');
		enterPhase(0);
	}

	function enterPhase(i) {
		k.phase = i;
		k.pt = 0;
		k.from = { x: tip.x, y: tip.y };
		const name = PHASES[i][0];
		const food = k.target;
		if (name === 'grab' && food) food.state = 'held';
		if (name === 'chomp') k.lastChomp = 0;
		if (name === 'retract' && food) {
			removeFood(food);
			k.target = null;
			k.mouth = false;
		}
		if (name === 'happy') {
			mind = stimulate(mind, 'fed', now);
			lastEngaged = now;
			hop();
			hearts(4);
			say(isFull(mind, now) ? 'full' : 'happy', 2.4);
		}
	}

	// ----- Update -----
	function update(dt) {
		time += dt;
		stateT += dt;
		mind.hunger = Math.min(1, mind.hunger + dt * 0.004);

		if (k.hopV !== 0 || k.hopY < 0) {
			k.hopV += 900 * dt;
			k.hopY += k.hopV * dt;
			if (k.hopY > 0) {
				k.hopY = 0;
				k.hopV = 0;
			}
		}
		k.blinkT -= dt;
		if (k.blinkT <= 0) {
			k.blink = 0.14;
			k.blinkT = 2.5 + rng() * 3;
		}
		if (k.blink > 0) k.blink -= dt;

		updateFoods(dt);
		updatePet(dt);

		k.walking = false;
		const d = pointerDistance();
		const walk = reduce() ? 28 : 55;
		const run = reduce() ? 90 : 300;
		const hurry = reduce() ? 60 : 160;

		switch (state) {
			case 'enter': {
				const food = groundFood() || foods.find((item) => item.state === 'fall');
				const target = food ? standFor(food) : k.enterTarget;
				if (moveTo(target, k.fast || food ? 260 : 150, dt)) {
					if (food) {
						say('hungry', 1.4);
						tell('bang');
						setState('seek');
					} else {
						say(!greeted && mind.visits > 0 ? 'back' : night ? 'sleepy' : 'greet', 2.2);
						greeted = true;
						setState('roam');
					}
				}
				break;
			}
			case 'roam':
				roam(dt, d, walk);
				break;
			case 'flee': {
				const radius = 150 + mind.irritation * 80 + (mind.trust < 0 ? 40 : 0);
				if (d > radius + 80) {
					k.calm += dt;
					if (k.calm > 0.6) {
						if (!reduce() && rng() < 0.45) {
							say('tease', 1.8);
							tell('note');
						}
						setState('roam');
						break;
					}
				} else k.calm = 0;
				const away = Math.sign(center().x - pointer.x) || (k.x < Wd / 2 ? 1 : -1);
				k.x += away * run * dt;
				k.facing = away < 0 ? 'left' : 'right';
				k.walking = true;
				const cornered = k.x <= minX || k.x >= maxX;
				k.x = clamp(k.x, minX, maxX);
				k.fleeing += dt;
				if (cornered && d < 90 && !reduce()) {
					// Cartoon dodge: leap over the cursor to the open side.
					k.vx = -away * 480;
					k.vy = -860;
					k.bounces = 0;
					k.hard = false;
					k.fast = false;
					say('tease', 1.4);
					setState('air');
				} else if (k.fleeing > 7) {
					k.fleeing = 0;
					mind = stimulate(mind, 'chased', now);
					if (mind.irritation > 0.8) leave('leave');
				}
				break;
			}
			case 'approach': {
				if (wantsToFlee(mind, d, now)) {
					setState('flee');
					break;
				}
				if (!pointer.inside) {
					if (portalReady()) openPortal();
					else setState('roam');
					break;
				}
				const side = pointer.x > k.x ? -1 : 1;
				const target = clamp(pointer.x + side * 190 * (s / 0.8), minX, maxX);
				if (moveTo(target, 110, dt) || Math.abs(k.x - pointer.x) < 200 * (s / 0.8)) {
					k.facing = pointer.x < k.x ? 'left' : 'right';
					if (portalReady()) openPortal();
					else {
						say('friendly', 2);
						k.wagUntil = time + 2;
						k.pause = 2;
						setState('roam');
					}
				}
				break;
			}
			case 'portal':
				if (pointer.inside) k.facing = pointer.x < k.x ? 'left' : 'right';
				k.wagUntil = time + 0.5;
				if (stateT > 14) {
					closePortal();
					say('later', 2);
					setState('roam');
				}
				break;
			case 'enter-portal': {
				const t = Math.min(1, stateT / 0.75);
				k.x = lerp(k.from.x, portal.x, ease(t));
				k.hopY = -Math.sin(t * Math.PI) * 60 * (s / 0.8);
				k.shrink = 1 - ease(t) * 0.95;
				if (t >= 1) {
					portal.target = 0;
					goAway();
					onPortal?.();
				}
				break;
			}
			case 'seek': {
				const food = k.target && foods.includes(k.target) && k.target.state === 'ground' ? k.target : groundFood();
				k.target = food;
				if (!food || isFull(mind, now)) {
					if (food) {
						food.refused = true;
						say('full', 2);
					}
					setState('roam');
					break;
				}
				if (wantsToFlee(mind, d, now) && mind.hunger < 0.8) {
					setState('flee');
					break;
				}
				const guarded = pointer.inside && Math.hypot(pointer.x - food.x, pointer.y - food.y) < 120 && mind.trust < 0.6 && mind.hunger < 0.9;
				if (guarded) {
					k.facing = food.x < k.x ? 'left' : 'right';
					if (!k.saidWary) {
						say('wary', 2);
						k.saidWary = true;
					}
					tell('q', 0.3);
					break;
				}
				if (moveTo(standFor(food), hurry, dt)) startEat(food);
				break;
			}
			case 'eat':
				eat(dt, d);
				break;
			case 'held':
				if (drag) {
					k.x = drag.x + S() * 22;
					k.footY = drag.y + 137 * s;
					k.rot = lerp(k.rot, clamp(-drag.vx * 0.012, -28, 28), 1 - Math.exp(-dt * 10));
				}
				break;
			case 'air':
				air(dt);
				break;
			case 'dizzy':
				k.rot = Math.sin(time * 9) * 6;
				if (stateT > 1.5 && moodOf(mind, now) !== 'dizzy') {
					k.rot = 0;
					if (moodOf(mind, now) === 'angry') {
						say('angry', 2.2);
						setState('sulk');
					} else setState('roam');
				}
				break;
			case 'sulk':
				if (pointer.inside) k.facing = pointer.x < k.x ? 'right' : 'left';
				if (stateT > 3.5) {
					if (mind.trust < -0.2) leave('leave');
					else setState('roam');
				}
				break;
			case 'tease':
				if (pointer.inside) k.facing = pointer.x < k.x ? 'left' : 'right';
				if (!reduce() && Math.floor(stateT / 0.45) !== Math.floor((stateT - dt) / 0.45)) hop(200);
				if (wantsToFlee(mind, d, now)) setState('flee');
				else if (stateT > 2.6) setState('roam');
				break;
			case 'sleep':
				if (groundFood() && !isFull(mind, now)) {
					say('hungry', 1.4);
					setState('seek');
				} else if (now - lastEngaged > stayIgnored) leave('sleepy');
				break;
			case 'leave': {
				const edge = k.x < Wd / 2 ? -160 : Wd + 160;
				moveTo(edge, moodOf(mind, now) === 'angry' ? 200 : 150, dt, true);
				if (k.x <= -150 || k.x >= Wd + 150) goAway();
				break;
			}
			default:
				break;
		}

		// Particles and speech
		for (let i = parts.length - 1; i >= 0; i--) {
			const p = parts[i];
			p.vy += p.g * dt;
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.life -= dt;
			if (p.type === 'crumb' && p.y > gy) {
				p.y = gy;
				p.vy *= -0.3;
				p.vx *= 0.6;
			}
			if (p.life <= 0) {
				p.node.remove();
				parts.splice(i, 1);
			}
		}
		if (bub.t > 0) {
			bub.t -= dt;
			if (bub.t <= 0) el.bub.setAttribute('opacity', '0');
		}
		portal.open = lerp(portal.open, portal.target, 1 - Math.exp(-dt * (portal.target ? 6 : 10)));
		if (portal.target === 0 && portal.open < 0.02) el.portal.style.display = 'none';
	}

	const standFor = (food) => clamp(food.x + (food.x > k.x ? -1 : 1) * 144 * s, minX - 40, maxX + 40);

	function moveTo(target, speed, dt, free = false) {
		const d = target - k.x;
		if (Math.abs(d) < 3) {
			k.x = target;
			return true;
		}
		let step = Math.sign(d) * speed * dt;
		if (Math.abs(step) > Math.abs(d)) step = d;
		k.x += step;
		if (!free && state !== 'enter') k.x = clamp(k.x, minX - 40, maxX + 40);
		k.facing = d < 0 ? 'left' : 'right';
		k.walking = true;
		return false;
	}

	const portalReady = () => wantsPortal(mind, now) && portal.target === 0 && now - portalShownAt > 25000 && now - arrivedAt > 2500;

	function roam(dt, d, walk) {
		const food = groundFood();
		if (food) {
			if (!isFull(mind, now)) {
				k.target = food;
				say('hungry', 1.4);
				tell('bang');
				setState('seek');
				return;
			}
			food.refused = true;
			say('full', 2);
		}
		if (wantsToFlee(mind, d, now)) {
			k.fleeing = 0;
			if (rng() < 0.4) say('flee', 1.2);
			tell('sweat', 1);
			setState('flee');
			return;
		}
		if (portalReady()) {
			if (pointer.inside && d > 240) setState('approach');
			else openPortal();
			return;
		}
		if (mind.trust >= 0.6 && pointer.inside && d > 280 && rng() < dt * 0.15) {
			setState('approach');
			return;
		}
		const still = pointer.inside ? now - pointer.lastMove > 3500 : stateT > 6;
		if (now - lastTease > 9000 && still && stateT > 2.5 && moodOf(mind, now) !== 'sad') {
			lastTease = now;
			say('tease', 2.4);
			tell('note', 2.4);
			setState('tease');
			return;
		}
		if (night && stateT > 12 && rng() < dt * 0.05) {
			say('sleepy', 1.6);
			setState('sleep');
			return;
		}
		if (now - lastEngaged > stayIgnored && !k.sad) {
			k.sad = true;
			mind = stimulate(mind, 'ignored', now);
			say('sad', 2.4);
			setTimeout(() => state === 'roam' && leave('leave'), 2600);
			return;
		}
		if (pointer.inside && d < 260) lastEngaged = now;
		// Wander: walk a while, pause a while, sometimes turn around.
		if (k.pause > 0) {
			k.pause -= dt;
			if (pointer.inside) k.facing = pointer.x < k.x ? 'left' : 'right';
		} else {
			k.walking = true;
			k.x += k.dir * walk * dt;
			k.walkT -= dt;
			if (k.walkT <= 0) {
				k.pause = 1 + rng() * 2.2;
				k.walkT = 3 + rng() * 4;
				if (rng() < 0.4) k.dir *= -1;
			}
			if (k.x < minX && k.dir < 0) k.dir = 1;
			if (k.x > maxX && k.dir > 0) k.dir = -1;
			k.facing = k.dir < 0 ? 'left' : 'right';
		}
	}

	function eat(dt, d) {
		const food = k.target;
		const [name, duration] = PHASES[k.phase];
		if (!food && k.phase < 5) {
			dropHeldFood();
			setState('roam');
			return;
		}
		// Startled before he has the food: he lets it go and runs.
		if ((name === 'open' || name === 'reach') && d < 80 && mind.trust < 0.6) {
			dropHeldFood();
			if (food) food.state = 'ground';
			say('flee', 1.2);
			setState('flee');
			return;
		}
		k.pt += dt;
		const t = Math.min(1, k.pt / duration);
		const e = ease(t);
		k.mouth = false;
		let prong = 32;
		if (name === 'open') k.helmet = e;
		else if (name === 'close') k.helmet = 1 - e;
		else if (name === 'grab') prong = lerp(32, 6, e);
		else if (name === 'carry') prong = 6;
		else if (name === 'chomp') {
			prong = 6;
			const bite = Math.floor(k.pt / 0.4);
			k.mouth = k.pt % 0.4 < 0.2 && bite < 4;
			if (bite > k.lastChomp && bite <= 4 && food) {
				k.lastChomp = bite;
				const [bx, by] = BITES[bite - 1];
				const hole = document.createElementNS(NS, 'circle');
				hole.setAttribute('cx', bx);
				hole.setAttribute('cy', by);
				hole.setAttribute('r', 9);
				food.bites.append(hole);
				food.scale = 1 - bite * 0.18;
				for (let q = 0; q < 6; q++) spawn('crumb', food.x, food.y);
			}
		} else if (name === 'retract') prong = lerp(6, 32, e);
		k.prong = prong;
		if (t >= 1) {
			if (k.phase < PHASES.length - 1) enterPhase(k.phase + 1);
			else {
				k.pause = 0.6;
				setState('roam');
			}
		}
	}

	function air(dt) {
		k.vy += GRAVITY * dt;
		k.x += k.vx * dt;
		k.footY += k.vy * dt;
		if (k.fast && !reduce()) k.rot += k.vx * dt * 0.3;
		else k.rot = lerp(k.rot, 0, 1 - Math.exp(-dt * 6));
		if (k.x < minX || k.x > maxX) {
			k.x = clamp(k.x, minX, maxX);
			if (Math.abs(k.vx) > 900) k.hard = true;
			k.vx = -k.vx * 0.45;
		}
		const top = k.footY - 190 * s;
		if (top < 0) {
			k.footY = 190 * s;
			k.vy = Math.abs(k.vy) * 0.3;
		}
		if (k.footY >= gy) {
			k.footY = gy;
			if (k.vy > 1300) k.hard = true;
			if (k.vy > 600 && k.bounces < 2 && !reduce()) {
				k.vy = -k.vy * 0.32;
				k.vx *= 0.6;
				k.bounces += 1;
			} else land();
		}
	}

	function land() {
		k.vx = 0;
		k.vy = 0;
		k.rot = 0;
		k.footY = gy;
		if (moodOf(mind, now) === 'dizzy') {
			say('dizzy', 2);
			setState('dizzy');
		} else if (k.hard) {
			mind = stimulate(mind, 'hard-landing', now);
			say('dizzy', 2);
			setState('dizzy');
		} else if (k.fast) {
			if (mind.trust > 0.45 && rng() < 0.6) {
				mind = stimulate(mind, 'fun-throw', now);
				say('again', 1.8);
				hop();
			} else say('annoyed', 1.8);
			setState('roam');
		} else setState('roam');
		k.fast = false;
		k.hard = false;
	}

	function updateFoods(dt) {
		for (const food of [...foods]) {
			if (food.state === 'fall') {
				food.vy += 1300 * dt;
				food.y += food.vy * dt;
				food.rot += food.vr * dt;
				if (food.y >= gy - 8) {
					food.y = gy - 8;
					if (food.vy > 220) {
						food.vy = -food.vy * 0.33;
						food.vr *= -0.5;
					} else {
						food.vy = 0;
						food.rot = 0;
						food.state = 'ground';
						food.landed = time;
					}
				}
			} else if (food.state === 'ground' && time - food.landed > 30 && k.target !== food) {
				removeFood(food);
			}
		}
	}

	// Hovering slowly over him while he is calm is petting.
	function updatePet(dt) {
		const calmStates = ['roam', 'approach', 'portal', 'eat', 'sleep', 'tease'];
		const over = pointer.inside && !drag && pointerDistance() < 85 * s && pointer.speed < 300;
		if (over && calmStates.includes(state)) petT += dt;
		else petT = Math.max(0, petT - dt);
		if (petT > 1.1) pet();
	}

	function pet() {
		petT = 0;
		lastEngaged = now;
		if (state === 'sleep') {
			say('sleepy', 1.6);
			setState('roam');
		}
		mind = stimulate(mind, 'pet', now);
		k.wagUntil = time + 1.8;
		hearts(3);
		say('pet', 1.8);
	}

	function poke() {
		lastEngaged = now;
		mind = stimulate(mind, 'poke', now);
		const mood = moodOf(mind, now);
		if (state === 'sleep') {
			say('annoyed', 1.8);
			tell('bang');
			setState('roam');
			return;
		}
		if (mood === 'angry') {
			say('angry', 2.2);
			tell('vein', 2);
			if (state !== 'eat') setState('sulk');
		} else if (mood === 'annoyed') {
			say('annoyed', 1.8);
			tell('vein', 1.4);
			hop(160);
		} else {
			say(mind.trust >= 0.6 ? 'poke' : 'poke', 1.6);
			hop();
			if (mind.trust >= 0.6) hearts(2);
		}
	}

	// ----- Render -----
	function moodNow() {
		const mood = moodOf(mind, now);
		if (mood === 'dizzy' || mood === 'angry') return mood;
		if (state === 'flee' || (state === 'held' && mind.trust < 0.6)) return 'scared';
		if (state === 'sleep') return 'sleepy';
		return mood;
	}

	function face(mood) {
		const eyes = state === 'sleep' ? 'shut' : mood === 'dizzy' ? 'dizzy' : ['happy'].includes(mood) || state === 'tease' ? 'happy' : 'open';
		el.eyes.style.display = eyes === 'open' ? '' : 'none';
		el.eyesHappy.style.display = eyes === 'happy' ? '' : 'none';
		el.eyesShut.style.display = eyes === 'shut' ? '' : 'none';
		el.eyesDizzy.style.display = eyes === 'dizzy' ? '' : 'none';
		if (eyes === 'open') {
			const blink = k.blink > 0 ? 0.12 : 1;
			el.eyes.setAttribute('transform', `translate(0 -14) scale(1 ${blink}) translate(0 14)`);
			// Pupils look at the cursor (or the food).
			let look = { x: 0, y: 0 };
			const target = k.target && state !== 'roam' ? k.target : pointer.inside ? pointer : null;
			if (target) {
				const head = W(-22, -14);
				const dx = (target.x - head.x) * Math.sign(S());
				const dy = target.y - head.y;
				const len = Math.hypot(dx, dy) || 1;
				look = { x: (dx / len) * 3, y: (dy / len) * 3 };
			}
			if (mood === 'scared') look.y -= 1;
			el.pupils.setAttribute('transform', `translate(${look.x.toFixed(2)} ${look.y.toFixed(2)})`);
		}
		if (eyes === 'dizzy') {
			const a = (time * 400) % 360;
			const [l, r] = el.eyesDizzy.querySelectorAll('path');
			l.setAttribute('transform', `rotate(${a} -36 -14)`);
			r.setAttribute('transform', `rotate(${a} -8 -14)`);
		}

		const brows = { angry: [16, -16, 2], annoyed: [6, -6, 3], sad: [-14, 14, 0], scared: [-12, 12, -4] }[mood];
		el.brows.style.display = brows ? '' : 'none';
		if (brows) {
			el.browL.setAttribute('transform', `translate(0 ${brows[2]}) rotate(${brows[0]} -36 -33)`);
			el.browR.setAttribute('transform', `translate(0 ${brows[2]}) rotate(${brows[1]} -8 -33)`);
		}

		let mouth = 'mc';
		if (k.mouth) mouth = 'mo';
		else if (state === 'held' || mood === 'scared') mouth = 'mo';
		else if (mood === 'angry' || mood === 'sad') mouth = 'frown';
		else if (mood === 'annoyed' || state === 'sleep') mouth = 'flat';
		else if (mood === 'dizzy') mouth = 'wavy';
		else if (mood === 'happy' || state === 'tease' || state === 'portal') mouth = 'grin';
		for (const [name, node] of Object.entries(el.mouths)) node.style.display = name === mouth ? '' : 'none';

		el.blush.setAttribute('opacity', { happy: 1, friendly: 0.95, angry: 0.2, scared: 0.3 }[mood] ?? 0.6);
		el.tear.style.display = mood === 'sad' ? '' : 'none';
		const ear = { sad: 8, scared: 10, angry: -6, happy: -4 }[mood] ?? 0;
		el.ears.setAttribute('transform', ear ? `rotate(${ear} -22 -46)` : '');
	}

	function emote(mood) {
		let mark = time < k.tellUntil ? k.tell : null;
		if (!mark) mark = { angry: 'vein', annoyed: 'vein', scared: 'sweat', sleepy: 'zzz', dizzy: 'stars' }[mood] || (state === 'tease' ? 'note' : null);
		el.emote.style.display = mark ? '' : 'none';
		if (!mark) return;
		for (const [name, node] of Object.entries(el.emotes)) node.style.display = name === mark ? '' : 'none';
		const head = W(-22, -96);
		const bobble = Math.sin(time * 5) * 2;
		el.emote.setAttribute('transform', `translate(${(head.x + (mark === 'zzz' ? 26 : 30) * Math.sign(-S())).toFixed(1)} ${(head.y + bobble).toFixed(1)}) scale(${(s / 0.8).toFixed(2)})`);
		if (mark === 'stars') {
			el.emotes.stars.setAttribute('transform', `translate(${(-30 * Math.sign(-S())).toFixed(1)} 40)`);
			[...el.emotes.stars.children].forEach((star, i) => {
				const a = time * 4 + (i * Math.PI * 2) / 3;
				star.setAttribute('transform', `translate(${(Math.cos(a) * 30).toFixed(1)} ${(Math.sin(a) * 8).toFixed(1)})`);
			});
		}
	}

	function render() {
		const present = state !== 'away';
		if (present) {
			const sxv = S();
			const oy = k.footY - 77 * s + k.hopY;
			el.kosmo.setAttribute('transform', `translate(${k.x.toFixed(1)} ${oy.toFixed(1)}) rotate(${k.rot.toFixed(1)}) scale(${sxv.toFixed(3)} ${sy().toFixed(3)})`);

			// Legs: walking, dangling while held, tucked in the air.
			let a = 0;
			let b = 0;
			if (k.walking) {
				const speed = state === 'flee' ? 2.2 : 1;
				k.ph += 0.016 * 13 * speed;
				a = Math.max(0, Math.sin(k.ph)) * 4;
				b = Math.max(0, -Math.sin(k.ph)) * 4;
			}
			const legY = (i) => {
				if (state === 'held') return 6 + Math.sin(time * 8 + i) * 3;
				if (state === 'air') return -3;
				return -(i === 0 || i === 3 ? a : b);
			};
			el.legs.forEach((leg, i) => leg.setAttribute('transform', `translate(0 ${legY(i).toFixed(1)})`));

			let bob = k.walking ? -Math.abs(Math.sin(k.ph)) * 1.6 : Math.sin(time * 2) * 0.8;
			if (state === 'sleep') bob = Math.sin(time * 1.4) * 1.6;
			el.bob.setAttribute('transform', `translate(0 ${bob.toFixed(2)})`);
			el.lid.setAttribute('transform', `rotate(${(k.helmet * 66).toFixed(1)} 34.7 -6)`);

			const mood = moodNow();
			face(mood);
			emote(mood);
			stage.dataset.mood = mood;

			el.shadow.setAttribute('cx', (k.x + sxv * 18).toFixed(1));
			el.shadow.setAttribute('cy', (gy + 2).toFixed(1));
			const lift = clamp(1 - (gy - k.footY) / 400, 0.3, 1);
			el.shadow.setAttribute('rx', (56 * s * 1.25 * lift * k.shrink).toFixed(1));
			el.shadow.setAttribute('opacity', (0.13 * lift).toFixed(3));

			renderTail(mood);
		}

		for (const food of foods) {
			food.node.setAttribute('transform', `translate(${food.x.toFixed(1)} ${food.y.toFixed(1)}) rotate(${food.rot.toFixed(1)}) scale(${(food.scale * 1.1 * (s / 0.8)).toFixed(2)})`);
		}
		for (const p of parts) {
			const o = Math.max(0, p.life / p.max);
			if (p.type === 'crumb') {
				p.node.setAttribute('cx', p.x.toFixed(1));
				p.node.setAttribute('cy', p.y.toFixed(1));
			} else p.node.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${(1 + (1 - o) * 0.4).toFixed(2)})`);
			p.node.setAttribute('opacity', o.toFixed(2));
		}

		if (bub.t > 0 && present) {
			const head = W(-22, 0);
			const top = Math.min(W(-22, -104).y, W(-22, -60).y) - (k.helmet > 0.3 ? 14 : 0);
			const bx = clamp(head.x, bub.w / 2 + 8, Wd - bub.w / 2 - 8);
			const by = clamp(top, 40, Ht);
			el.bub.setAttribute('transform', `translate(${bx.toFixed(1)} ${by.toFixed(1)})`);
			const off = clamp(head.x - bx, -bub.w / 2 + 14, bub.w / 2 - 14);
			el.bubTl.setAttribute('d', `M${off - 6} -3 L${off} 7 L${off + 6} -3`);
		}

		if (portal.open > 0.01) {
			const scale = portal.open * (s / 0.8);
			el.portal.setAttribute('transform', `translate(${portal.x.toFixed(1)} ${portal.y.toFixed(1)}) scale(${scale.toFixed(3)})`);
			el.portalR1.setAttribute('transform', `rotate(${((time * 90) % 360).toFixed(1)})`);
			el.portalR2.setAttribute('transform', `rotate(${(-(time * 140) % 360).toFixed(1)})`);
			const w = 100 * (s / 0.8);
			const h = 132 * (s / 0.8);
			Object.assign(portalBtn.style, { left: `${portal.x - w / 2}px`, top: `${portal.y - h / 2}px`, width: `${w}px`, height: `${h}px` });
		}
	}

	function renderTail(mood) {
		if (state === 'enter-portal' && k.shrink < 0.2) {
			for (const part of tailParts) part.style.display = 'none';
			return;
		}
		const wag = time < k.wagUntil || mood === 'happy' || mood === 'friendly';
		const idle = () => {
			if (state === 'held') return W(118, 52 + Math.sin(time * 5) * 6);
			if (state === 'flee') return W(140, -18 + Math.sin(time * 14) * 8);
			if (state === 'air') return W(122, -30 + Math.sin(time * 9) * 10);
			if (state === 'sleep') return W(104, 62);
			if (mood === 'sad') return W(100, 58);
			if (mood === 'angry') return W(106, -78 + Math.sin(time * 20) * 2);
			if (wag) return W(112 + 12 * Math.sin(time * 12), -45 + 6 * Math.cos(time * 12));
			return W(112 + 7 * Math.sin(time * 2), -45 + 6 * Math.cos(time * 2.6));
		};
		let target = idle();
		let mode = 'idle';
		const mouth = () => W(-30, 2);
		if (state === 'eat' && k.target !== undefined) {
			const [name, duration] = PHASES[k.phase];
			const t = ease(Math.min(1, k.pt / duration));
			const food = k.target;
			if (name === 'reach' && food) {
				target = lp(k.from, { x: food.x, y: food.y - 6 }, t);
				mode = 'reach';
			} else if (name === 'grab' && food) {
				target = { x: food.x, y: food.y - 6 };
				mode = 'reach';
			} else if (name === 'carry') {
				target = lp(k.from, mouth(), t);
				mode = 'mouth';
			} else if (name === 'chomp') {
				const m = mouth();
				target = { x: m.x + Math.sin(time * 38), y: m.y };
				mode = 'mouth';
			} else if (name === 'retract') {
				target = lp(k.from, idle(), t);
				mode = 'mouth';
			}
		} else k.prong = 32;

		tip = target;
		base = W(62, 28);
		let c1;
		let c2;
		if (mode === 'reach') {
			c1 = W(95, -120);
			c2 = { x: tip.x, y: tip.y - 110 * s };
		} else if (mode === 'mouth') {
			const m = mouth();
			c1 = W(95, -130);
			c2 = { x: m.x + Math.sign(S()) * -10, y: m.y - 115 * s };
		} else {
			c1 = W(92, 12);
			c2 = W(126, -12);
		}
		if (!curve) curve = { c1, c2 };
		const follow = 1 - Math.exp(-0.016 * 8);
		curve.c1 = lp(curve.c1, c1, follow);
		curve.c2 = lp(curve.c2, c2, follow);
		const tx = tip.x - curve.c2.x;
		const ty = tip.y - curve.c2.y;
		const tl = Math.hypot(tx, ty) || 1;
		tan = { x: tx / tl, y: ty / tl };
		const food = k.target;
		if (food && food.state === 'held') {
			food.x = tip.x + tan.x * 13 * (s / 0.8);
			food.y = tip.y + tan.y * 13 * (s / 0.8) + 4;
			food.rot = Math.sin(time * 6) * 6;
		}

		const f = (n) => n.toFixed(1);
		const d = `M${f(base.x)} ${f(base.y)} C${f(curve.c1.x)} ${f(curve.c1.y)} ${f(curve.c2.x)} ${f(curve.c2.y)} ${f(tip.x)} ${f(tip.y)}`;
		const width = s / 0.8;
		el.t1.setAttribute('d', d);
		el.t2.setAttribute('d', d);
		el.t3.setAttribute('d', d);
		el.t1.setAttribute('stroke-width', (13 * width * k.shrink).toFixed(1));
		el.t2.setAttribute('stroke-width', (7 * width * k.shrink).toFixed(1));
		el.t3.setAttribute('stroke-width', (7 * width * k.shrink).toFixed(1));
		const angle = (Math.atan2(tan.y, tan.x) * 180) / Math.PI;
		el.tip.setAttribute('transform', `translate(${f(tip.x)} ${f(tip.y)}) rotate(${angle.toFixed(1)}) scale(${(width * k.shrink).toFixed(2)})`);
		el.p1.setAttribute('transform', `rotate(${(-k.prong).toFixed(1)})`);
		el.p2.setAttribute('transform', `rotate(${k.prong.toFixed(1)})`);
	}

	// ----- Loop -----
	let last = 0;
	function frame(t) {
		const dt = Math.min(0.05, (t - last) / 1000);
		last = t;
		now = t;
		update(dt);
		render();
		if (state === 'away' && !foods.length && !parts.length) {
			running = false;
			return;
		}
		requestAnimationFrame(frame);
	}
	function start() {
		if (running) return;
		running = true;
		last = performance.now();
		requestAnimationFrame(frame);
	}

	// ----- Input -----
	const markActive = () => {
		lastActivity = performance.now();
	};
	for (const type of ['scroll', 'keydown', 'pointerdown', 'wheel']) window.addEventListener(type, markActive, { passive: true });

	window.addEventListener(
		'pointermove',
		(event) => {
			if (event.pointerType === 'touch' && !event.buttons) return;
			const t = performance.now();
			const dt = Math.max(1, t - pointer.t) / 1000;
			const speed = Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) / dt;
			pointer.speed = lerp(pointer.speed, speed, 0.5);
			pointer.x = event.clientX;
			pointer.y = event.clientY;
			pointer.t = t;
			pointer.lastMove = t;
			pointer.inside = true;
		},
		{ passive: true },
	);
	window.addEventListener('pointerdown', (event) => {
		pointer.x = event.clientX;
		pointer.y = event.clientY;
		pointer.lastMove = performance.now();
		pointer.inside = true;
	});
	window.addEventListener('pointerup', (event) => {
		if (event.pointerType === 'touch') pointer.inside = false;
	});
	document.documentElement.addEventListener('mouseleave', () => {
		pointer.inside = false;
	});
	window.addEventListener('blur', () => {
		pointer.inside = false;
	});

	// Grab, poke, drag, throw, shake.
	el.kosmo.addEventListener('pointerdown', (event) => {
		if (!active || ['away', 'leave', 'enter-portal'].includes(state)) return;
		event.preventDefault();
		event.stopPropagation();
		el.kosmo.setPointerCapture?.(event.pointerId);
		const t = performance.now();
		drag = { id: event.pointerId, sx: event.clientX, sy: event.clientY, x: event.clientX, y: event.clientY, vx: 0, samples: [{ t, x: event.clientX, y: event.clientY }], dragging: false, shaken: false };
		shake.reset();
		lastEngaged = now;
	});
	el.kosmo.addEventListener('pointermove', (event) => {
		if (!drag || event.pointerId !== drag.id) return;
		const t = performance.now();
		const prev = drag.samples[drag.samples.length - 1];
		drag.samples.push({ t, x: event.clientX, y: event.clientY });
		if (drag.samples.length > 16) drag.samples.shift();
		const dt = Math.max(1, t - prev.t) / 1000;
		const vx = (event.clientX - prev.x) / dt;
		const vy = (event.clientY - prev.y) / dt;
		drag.vx = vx;
		drag.x = event.clientX;
		drag.y = event.clientY;
		if (!drag.dragging && Math.hypot(event.clientX - drag.sx, event.clientY - drag.sy) > 6) {
			drag.dragging = true;
			if (state === 'eat') dropHeldFood();
			if (state === 'portal') closePortal();
			say('held', 1.6);
			setState('held');
			stage.classList.add('is-holding');
		}
		if (drag.dragging && shake.sample(t, vx, vy) && !drag.shaken) {
			drag.shaken = true;
			mind = stimulate(mind, 'shaken', now);
			say('dizzy', 2);
			tell('stars', 2);
		}
	});
	const release = (event) => {
		if (!drag || event.pointerId !== drag.id) return;
		const wasDragging = drag.dragging;
		const samples = drag.samples;
		drag = null;
		stage.classList.remove('is-holding');
		if (wasDragging) {
			justDragged = true;
			setTimeout(() => {
				justDragged = false;
			}, 0);
			const v = reduce() || event.type === 'pointercancel' ? { vx: 0, vy: 0 } : throwVelocity(samples);
			k.vx = v.vx;
			k.vy = v.vy;
			k.fast = Math.hypot(v.vx, v.vy) > 600;
			k.bounces = 0;
			k.hard = false;
			setState('air');
		} else poke();
	};
	el.kosmo.addEventListener('pointerup', release);
	el.kosmo.addEventListener('pointercancel', release);

	// Click or tap on empty space drops an empanada.
	document.addEventListener('click', (event) => {
		if (!active || justDragged || event.detail === 0) return;
		const target = event.target instanceof Element ? event.target : null;
		if (target?.closest('#kosmo-stage, #kosmo-btn, #kosmo-portal')) return;
		const interactive = Boolean(target?.closest('a, button, input, textarea, select, label, summary, [role="button"], [contenteditable="true"], [contenteditable=""]'));
		const selecting = String(window.getSelection?.() || '').length > 0;
		const onText = !interactive && textAt(event.clientX, event.clientY);
		if (!foodClickAllowed({ interactive, onText, selecting, foods: foods.length, maxFoods: MAX_FOODS })) return;
		resize();
		spawnFood(event.clientX, Math.min(event.clientY, gy - 8));
		lastEngaged = now;
		start();
		if (state === 'away') arrive({ fast: true, side: event.clientX < Wd / 2 ? 'left' : 'right' });
	});

	// Keyboard: his button is the last tab stop. Focus summons him, Enter pets him, F feeds him.
	btn.addEventListener('focus', () => {
		if (!active) return;
		if (state === 'away') arrive({ fast: true, side: 'right' });
		announce('Kosmo Gaea is here. Press Enter to pet him, F to feed him, or Escape to send him away.');
	});
	btn.addEventListener('click', () => {
		if (!active) return;
		if (state === 'away') {
			arrive({ fast: true, side: 'right' });
			return;
		}
		if (['held', 'air', 'leave', 'enter-portal'].includes(state)) return;
		pet();
	});
	btn.addEventListener('keydown', (event) => {
		if ((event.key === 'f' || event.key === 'F') && active && foods.length < MAX_FOODS) {
			resize();
			const x = clamp(k.x + (k.x < Wd / 2 ? 240 : -240), 40, Wd - 40);
			spawnFood(x, Ht * 0.35);
			lastEngaged = now;
			announce('An empanada drops for Kosmo.');
			start();
			if (state === 'away') arrive({ fast: true });
		}
	});
	portalBtn.addEventListener('click', enterPortal);
	window.addEventListener('keydown', (event) => {
		if (event.key !== 'Escape' || !active || state === 'away') return;
		mind = stimulate(mind, 'shooed', now);
		leave('leave');
		if (document.activeElement === btn) announce('Kosmo left.');
	});

	// He drops in when the page has been idle a while (no scrolling, clicking or typing).
	setInterval(() => {
		const t = performance.now();
		if (!active || state !== 'away' || document.hidden) return;
		if (t - lastActivity > arriveAfter && t >= cooldownUntil) {
			now = t;
			arrive();
		}
	}, 250);

	window.addEventListener('resize', resize);
	window.addEventListener('pagehide', save);
	resize();
	k.footY = gy;
	stage.dataset.present = 'false';
	stage.dataset.state = 'away';
	stage.dataset.mood = 'neutral';
	syncFoods();
	el.kosmo.style.display = 'none';
	for (const part of tailParts) part.style.display = 'none';
	el.shadow.style.display = 'none';
	el.emote.style.display = 'none';

	return {
		setActive(value) {
			active = value;
			btn.hidden = !value;
			stage.hidden = !value;
			if (!value) {
				if (state !== 'away') goAway();
				for (const food of [...foods]) removeFood(food);
			} else {
				lastActivity = performance.now();
			}
		},
	};
}
