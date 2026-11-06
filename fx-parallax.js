const QUERY = '(min-width: 860px) and (prefers-reduced-motion: no-preference)';

// Adds a large outline numeral behind each stage (02 to 07) that drifts against the scroll, and lets
// the hero portrait drift up slightly as the hero scrolls away. Desktop with reduced motion off only;
// the numerals are decorative and removed again if the screen narrows.
export function initParallax() {
	const gsap = window.gsap;
	const ScrollTrigger = window.ScrollTrigger;
	if (!gsap || !ScrollTrigger) return;

	const stages = [...document.querySelectorAll('.portfolio-view .pf-section[data-stage]')];
	const portrait = document.querySelector('.pf-portrait');
	const hero = document.querySelector('.pf-hero');

	gsap.matchMedia().add(QUERY, () => {
		const numerals = stages.map((stage) => {
			const numeral = document.createElement('span');
			numeral.className = 'pf-numeral';
			numeral.setAttribute('aria-hidden', 'true');
			numeral.textContent = stage.dataset.stage.padStart(2, '0');
			stage.append(numeral);
			gsap.fromTo(
				numeral,
				{ y: 80 },
				{ y: -80, ease: 'none', scrollTrigger: { trigger: stage, start: 'top bottom', end: 'bottom top', scrub: true } },
			);
			return numeral;
		});

		if (portrait && hero) {
			gsap.to(portrait, { y: -60, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
		}

		return () => numerals.forEach((numeral) => numeral.remove());
	});
}
