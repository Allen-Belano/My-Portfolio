const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&';
const DURATION = 700;
const STEP_MS = 40;

// Each mono stage label scrambles and then resolves letter by letter whenever it scrolls into view.
// The labels are aria-hidden and monospaced, so neither screen readers nor the layout notice.
// The label as written is kept in data-text. Off under reduced motion.
export function initDecode() {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	if (!('IntersectionObserver' in window)) return;

	const labels = [...document.querySelectorAll('.portfolio-view .pf-eyebrow[aria-hidden="true"]')];
	for (const label of labels) label.dataset.text = label.textContent;

	const timers = new Map();
	const decode = (label) => {
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
	};

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) if (entry.isIntersecting) decode(entry.target);
		},
		{ threshold: 0.6 },
	);
	labels.forEach((label) => observer.observe(label));
}
