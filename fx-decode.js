const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&';
const DURATION = 700;
const STEP_MS = 40;
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const timers = new WeakMap();

// Scrambles a mono stage label and resolves it letter by letter over 0.7s. The label as written is
// kept in data-text. The labels are aria-hidden and monospaced, so neither screen readers nor the layout notice.
export function decodeLabel(label) {
	if (!label || reduceMotion()) return;
	if (!label.dataset.text) label.dataset.text = label.textContent;
	clearTimeout(timers.get(label));
	const text = label.dataset.text;
	const start = performance.now();
	const step = () => {
		const progress = Math.min(1, (performance.now() - start) / DURATION);
		const settled = Math.floor(progress * text.length);
		label.textContent = [...text]
			.map((char, i) => (i < settled || char === ' ' || char === '/' ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
			.join('');
		if (progress < 1) timers.set(label, setTimeout(step, STEP_MS));
		else label.textContent = text;
	};
	step();
}

// Keeps each stage label's text in data-text and, unless observe is false, decodes a label whenever it
// scrolls into view. The film passes observe: false and decodes each scene's label itself, because its
// stacked scenes are always "in view". Off under reduced motion.
export function initDecode({ observe = true } = {}) {
	const labels = [...document.querySelectorAll('.portfolio-view .pf-eyebrow[aria-hidden="true"]')];
	for (const label of labels) label.dataset.text = label.textContent;
	if (!observe || reduceMotion() || !('IntersectionObserver' in window)) return;

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) if (entry.isIntersecting) decodeLabel(entry.target);
		},
		{ threshold: 0.6 },
	);
	labels.forEach((label) => observer.observe(label));
}
