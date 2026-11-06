// Groups whose items slide in one after another as they arrive. Project cards are left out:
// their tilt effect already sets their transform.
const STAGGER_GROUPS = ['.pf-stats > div', '.pf-skills > div', '.pf-edu > div', '.pf-certs li', '#pf-contact .pf-actions > a'];

// Splits an element's plain text into masked words and returns the inner spans that move.
// The text and the element (with its id) stay the same, so headings keep their accessible names.
export function splitWords(element) {
	const words = element.textContent.trim().split(/\s+/);
	element.textContent = '';
	return words.map((word, index) => {
		const mask = document.createElement('span');
		mask.className = 'pf-word';
		const inner = document.createElement('span');
		inner.textContent = word;
		mask.append(inner);
		element.append(mask);
		if (index < words.length - 1) element.append(' ');
		return inner;
	});
}

// Stage headings rise in word by word, and the groups above slide in with a stagger, each time they
// come into view (and back out when scrolled away above). Without GSAP or with reduced motion nothing moves.
export function initReveal() {
	const gsap = window.gsap;
	const ScrollTrigger = window.ScrollTrigger;
	if (!gsap || !ScrollTrigger) return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	for (const heading of document.querySelectorAll('.portfolio-view .pf-section h2')) {
		gsap.from(splitWords(heading), {
			yPercent: 110,
			duration: 0.8,
			ease: 'power3.out',
			stagger: 0.06,
			scrollTrigger: { trigger: heading, start: 'top 85%', toggleActions: 'play none none reverse' },
		});
	}

	for (const selector of STAGGER_GROUPS) {
		const items = [...document.querySelectorAll(selector)];
		if (!items.length) continue;
		gsap.from(items, {
			y: 28,
			opacity: 0,
			duration: 0.7,
			ease: 'power2.out',
			stagger: 0.08,
			scrollTrigger: { trigger: items[0].parentElement, start: 'top 85%', toggleActions: 'play none none reverse' },
		});
	}
}
