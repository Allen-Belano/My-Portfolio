// Draws the Experience timeline line down as the list scrolls, and lights up each role as the line reaches it.
// Without GSAP, or under reduced motion, the line and every role simply show in full.
export function initTrajectory() {
	const gsap = window.gsap;
	const ScrollTrigger = window.ScrollTrigger;
	const list = document.querySelector('[data-trajectory]');
	if (!gsap || !ScrollTrigger || !list) return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const line = list.querySelector('.pf-timeline-line');
	list.classList.add('is-animated');

	ScrollTrigger.create({
		trigger: list,
		start: 'top 70%',
		end: 'bottom 60%',
		scrub: true,
		animation: gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none' }),
	});

	for (const job of list.querySelectorAll('.pf-job')) {
		ScrollTrigger.create({
			trigger: job,
			start: 'top 60%',
			onEnter: () => job.classList.add('is-lit'),
			onLeaveBack: () => job.classList.remove('is-lit'),
		});
	}
}
