// The jump nav: glides to a stage when its link is used and marks the current stage.
// On the flowing page it finds the current stage itself (whichever crosses the middle of the screen) and moves
// focus to the stage it jumped to. With the film, a link glides to that scene's resting frame instead, and the
// film reports the current scene through setCurrent(), because its stacked scenes never move.
// Returns setCurrent(index).
export function initJump(smooth, film = null) {
	const links = [...document.querySelectorAll('[data-jump]')];
	const setCurrent = (index) => {
		links.forEach((link, i) => {
			if (i === index) link.setAttribute('aria-current', 'true');
			else link.removeAttribute('aria-current');
		});
	};
	if (!links.length) return { setCurrent };

	const targets = links.map((link) => document.querySelector(link.getAttribute('href')));
	// The first link points at <main>; its stage is the hero section inside it.
	const stages = targets.map((target) => target?.closest('[data-stage]') || target?.querySelector('[data-stage]'));

	links.forEach((link, index) => {
		link.addEventListener('click', (event) => {
			const target = targets[index];
			if (!target) return;
			event.preventDefault();
			if (film) {
				smooth.scrollTo(film.positionOf(index));
				return;
			}
			smooth.scrollTo(target);
			if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
			target.focus({ preventScroll: true });
		});
	});

	if (film || !('IntersectionObserver' in window)) return { setCurrent };
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) setCurrent(stages.indexOf(entry.target));
			}
		},
		{ rootMargin: '-45% 0px -45% 0px' },
	);
	stages.forEach((stage) => stage && observer.observe(stage));
	return { setCurrent };
}
