import { splitWords } from './fx-reveal.js';

// Lights up the About paragraph word by word, tied to scroll: dim as it arrives, fully lit by the time
// it reaches the upper part of the screen. Without GSAP or with reduced motion the text is simply lit.
export function initHighlight() {
	const gsap = window.gsap;
	const ScrollTrigger = window.ScrollTrigger;
	const paragraph = document.querySelector('#pf-about p:not(.pf-eyebrow)');
	if (!gsap || !ScrollTrigger || !paragraph) return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	gsap.fromTo(
		splitWords(paragraph),
		{ opacity: 0.18 },
		{
			opacity: 1,
			ease: 'none',
			stagger: 0.05,
			scrollTrigger: { trigger: paragraph, start: 'top 80%', end: 'bottom 45%', scrub: true },
		},
	);
}
