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
