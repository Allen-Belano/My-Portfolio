// Marks the stage across the middle of the screen as current in the jump nav, and glides to a stage when
// its link is used. Focus moves to the stage too, so keyboard users continue from there.
export function initJump(smooth) {
	const links = [...document.querySelectorAll('[data-jump]')];
	if (!links.length) return;

	const targets = links.map((link) => document.querySelector(link.getAttribute('href')));
	// The first link points at <main>; its stage is the hero section inside it.
	const watched = targets.map((target) => target?.closest('[data-stage]') || target?.querySelector('[data-stage]'));

	links.forEach((link, index) => {
		link.addEventListener('click', (event) => {
			const target = targets[index];
			if (!target) return;
			event.preventDefault();
			smooth.scrollTo(target);
			if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
			target.focus({ preventScroll: true });
		});
	});

	if (!('IntersectionObserver' in window)) return;
	const setCurrent = (index) => {
		links.forEach((link, i) => {
			if (i === index) link.setAttribute('aria-current', 'true');
			else link.removeAttribute('aria-current');
		});
	};
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) setCurrent(watched.indexOf(entry.target));
			}
		},
		{ rootMargin: '-45% 0px -45% 0px' },
	);
	watched.forEach((stage) => stage && observer.observe(stage));
}
