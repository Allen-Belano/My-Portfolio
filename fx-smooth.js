const QUERY = '(min-width: 860px) and (prefers-reduced-motion: no-preference)';
// Elements that scroll on their own (the chat log, the terminal) keep their native scrolling.
const OWN_SCROLL = '.pf-bot-panel, .pf-term';

// Weighted, smooth scrolling for the portfolio view (Lenis), driven by GSAP's ticker so the pinned
// stages stay in step. It only runs at 860px and wider with reduced motion off; elsewhere the page
// scrolls natively and nothing else changes.
export function createSmoothScroll() {
	const Lenis = window.Lenis;
	const gsap = window.gsap;
	const ScrollTrigger = window.ScrollTrigger;
	const allowed = window.matchMedia(QUERY);
	let lenis = null;

	const tick = (time) => lenis?.raf(time * 1000);

	function stop() {
		if (!lenis) return;
		gsap.ticker.remove(tick);
		gsap.ticker.lagSmoothing(500, 33);
		lenis.destroy();
		lenis = null;
	}

	function start() {
		if (!allowed.matches) {
			stop();
			return;
		}
		if (lenis || !Lenis || !gsap || !ScrollTrigger) return;
		lenis = new Lenis({
			lerp: 0.085,
			wheelMultiplier: 0.9,
			prevent: (node) => Boolean(node.closest?.(OWN_SCROLL)),
		});
		lenis.on('scroll', ScrollTrigger.update);
		gsap.ticker.add(tick);
		gsap.ticker.lagSmoothing(0);
	}

	// Glides to an element or a scroll position (px) while Lenis runs, and jumps there natively when it does not.
	function scrollTo(target) {
		if (lenis) lenis.scrollTo(target);
		else if (typeof target === 'number') window.scrollTo(0, target);
		else target.scrollIntoView();
	}

	allowed.addEventListener('change', () => {
		if (!allowed.matches) stop();
	});

	return { start, stop, scrollTo };
}
