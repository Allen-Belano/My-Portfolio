const QUERY = '(min-width: 860px) and (prefers-reduced-motion: no-preference)';

// Sweeps the scan line down the screen each time a new stage (02 to 07) reaches the middle of the
// screen, from either direction. Desktop with reduced motion off only.
export function initCut() {
	const gsap = window.gsap;
	const ScrollTrigger = window.ScrollTrigger;
	const cut = document.querySelector('.pf-cut');
	if (!gsap || !ScrollTrigger || !cut) return;

	const play = () => {
		cut.classList.remove('is-cutting');
		void cut.offsetWidth;
		cut.classList.add('is-cutting');
	};

	gsap.matchMedia().add(QUERY, () => {
		for (const stage of document.querySelectorAll('.portfolio-view .pf-section[data-stage]')) {
			ScrollTrigger.create({ trigger: stage, start: 'top 55%', end: 'bottom 45%', onEnter: play, onEnterBack: play });
		}
		return () => cut.classList.remove('is-cutting');
	});
}
