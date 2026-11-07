// Kosmo Gaea's brain. Pure functions only (no DOM), so his behaviour can be tested in Node.
//
// He keeps a few feelings that drift and react: trust (how he feels about your cursor, -1 to 1),
// hunger (0 to 1) and irritation (0 to 1), plus timed moods (dizzy, angry, annoyed, happy, sad).
// Times are milliseconds on any steady clock; the runtime passes performance.now().

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const recent = (times, now, span) => times.filter((time) => now - time < span);

export const LINES = {
	greet: ["Hi! I'm Kosmo.", 'Psst. Got empanada?', 'Kosmo Gaea, reporting for snacks.'],
	back: ['You came back!', 'Oh, you again!', 'Hello again, cursor.'],
	tease: ['Catch me, slowpoke!', 'Bagal mo!', 'Too slow, cursor!', 'Nyeh nyeh!'],
	flee: ['Eep!', 'Nope!', 'Not today, cursor!', 'Ayoko!'],
	poke: ['Hehe, that tickles!', 'Boop!', 'Hi there!'],
	annoyed: ['Hoy! Stop that.', 'Rude.', 'Ugh, cursor.'],
	angry: ['GRRR!', "That's it, I'm mad!", 'Bad cursor!'],
	hungry: ['Empanada?!', 'I smell empanada!', 'Gutom na ako...'],
	wary: ['Move your cursor away first...', 'Is this a trap?', 'I see you, cursor.'],
	happy: ['Naimas! Salamat!', 'Yum, Ilocos empanada!', 'Burp. Excuse me.', 'Best. Snack. Ever.'],
	full: ['Busog na ako...', 'No more, I will pop.'],
	sad: ['Nobody plays with me...', 'Fine, I will just go.'],
	dizzy: ['Whoa... spinning...', 'Three cursors?!'],
	held: ['Put me down!', 'Hoy! Down!', 'I can fly?!'],
	again: ['Wheee! Again!', 'That was fun!'],
	friendly: ['Can we be friends?', 'You are okay, cursor.', 'Pet me?'],
	pet: ['Mmm, right there.', 'Hehe.', '*happy tail wag*'],
	portal: ['Come with me!', 'Come with me, I know a place.'],
	later: ['Maybe later, then.', 'Your loss!'],
	leave: ['Bye!', 'Gotta go!', 'Hmph. Bye.'],
	sleepy: ['*yawn*', 'Five more minutes...', 'Zzz...'],
};

export function pickLine(kind, rng = Math.random) {
	const lines = LINES[kind] || LINES.greet;
	return lines[Math.floor(rng() * lines.length) % lines.length];
}

// A small seeded random generator, so tests (and replays) can make him predictable.
export function seeded(seed) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function createMind({ trust = 0.2, hunger = 0.6, visits = 0 } = {}) {
	return {
		trust: clamp(trust, -1, 1),
		hunger: clamp(hunger, 0, 1),
		irritation: 0,
		visits,
		fed: [],
		pokes: [],
		dizzyUntil: -Infinity,
		angryUntil: -Infinity,
		annoyedUntil: -Infinity,
		happyUntil: -Infinity,
		sadUntil: -Infinity,
	};
}

// Returns a new mind after something happens to him. Never changes the mind it is given.
export function stimulate(mind, event, now) {
	const next = { ...mind, fed: [...mind.fed], pokes: [...mind.pokes] };
	const trust = (delta) => {
		next.trust = clamp(next.trust + delta, -1, 1);
	};
	const irritate = (delta) => {
		next.irritation = clamp(next.irritation + delta, 0, 1);
	};

	switch (event) {
		case 'fed':
			trust(0.22);
			irritate(-0.2);
			next.hunger = clamp(next.hunger - 0.4, 0, 1);
			next.fed = [...recent(next.fed, now, 90000), now];
			next.happyUntil = now + 4000;
			next.sadUntil = -Infinity;
			break;
		case 'pet':
			trust(0.12);
			irritate(-0.1);
			next.happyUntil = now + 2500;
			next.sadUntil = -Infinity;
			break;
		case 'poke': {
			next.pokes = [...recent(next.pokes, now, 5000), now];
			const count = next.pokes.length;
			if (count >= 5) {
				next.angryUntil = now + 5000;
				trust(-0.1);
				irritate(0.3);
			} else if (count >= 3) {
				next.annoyedUntil = now + 3000;
				trust(-0.03);
				irritate(0.15);
			} else {
				next.happyUntil = now + 1200;
			}
			break;
		}
		case 'shaken':
			next.dizzyUntil = now + 2500;
			next.angryUntil = now + 7000;
			trust(-0.35);
			irritate(0.5);
			break;
		case 'hard-landing':
			next.dizzyUntil = now + 1800;
			next.annoyedUntil = now + 4000;
			trust(-0.08);
			irritate(0.15);
			break;
		case 'fun-throw':
			next.happyUntil = now + 2000;
			trust(0.03);
			break;
		case 'chased':
			trust(-0.02);
			irritate(0.15);
			break;
		case 'ignored':
			next.sadUntil = now + 6000;
			break;
		case 'shooed':
			next.annoyedUntil = now + 3000;
			trust(-0.05);
			break;
		default:
			break;
	}
	return next;
}

export function isFull(mind, now) {
	return recent(mind.fed, now, 90000).length >= 3 || mind.hunger < 0.05;
}

// The mood that shows on his face, most urgent first.
export function moodOf(mind, now) {
	if (now < mind.dizzyUntil) return 'dizzy';
	if (now < mind.angryUntil) return 'angry';
	if (now < mind.annoyedUntil) return 'annoyed';
	if (now < mind.happyUntil) return 'happy';
	if (isFull(mind, now)) return 'full';
	if (now < mind.sadUntil) return 'sad';
	if (mind.trust >= 0.7) return 'friendly';
	if (mind.hunger > 0.85) return 'hungry';
	return 'neutral';
}

// He is enemies with the cursor until he trusts it. The more irritated he is, the earlier he bolts.
