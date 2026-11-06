const PIN_QUERY = '(min-width: 860px) and (prefers-reduced-motion: no-preference)';

// Pins the stages marked data-pin on desktop, one after another. A pinned stage stays on screen while its
// own content scrolls past inside it. A small indicator shows the stage number and label while a pinned
// stage is on screen. Returns refresh(), or null when GSAP did not load (the page then scrolls normally).
export function initStages() {
	const gsap = window.gsap;
	const ScrollTrigger = window.ScrollTrigger;
	const progress = document.querySelector('[data-progress]');
	if (!gsap || !ScrollTrigger || !progress) return null;

	gsap.registerPlugin(ScrollTrigger);
	const pinning = window.matchMedia(PIN_QUERY);
	const num = progress.querySelector('.pf-progress-num');
	const label = progress.querySelector('.pf-progress-label');
	const stages = [...document.querySelectorAll('[data-stage]:not([data-stage="0"])')];
	const pinned = [...document.querySelectorAll('[data-pin]')];

	// Wrap each pinned stage's content, so the content can move while the stage itself stays pinned.
	for (const section of pinned) {
		const inner = document.createElement('div');
		inner.className = 'pf-stage-inner';
		inner.append(...section.childNodes);
		section.append(inner);
	}

	const pinStage = (section) => {
		const inner = section.querySelector('.pf-stage-inner');
		const overflow = () => Math.max(0, inner.offsetHeight - section.clientHeight);
		section.classList.add('is-pinned');
		ScrollTrigger.create({
			trigger: section,
			start: 'top top',
			end: () => `+=${overflow()}`,
			pin: true,
			scrub: true,
			invalidateOnRefresh: true,
			animation: gsap.fromTo(inner, { y: 0 }, { y: () => -overflow(), ease: 'none' }),
		});
	};

	// The indicator follows whichever stage is across the middle of the screen.
	let current = null;
	const updateIndicator = () => {
		const show = Boolean(current && current.hasAttribute('data-pin') && pinning.matches);
		if (show) {
			const [number, name] = current.querySelector('.pf-eyebrow').textContent.trim().split(' / ');
			num.textContent = `${number} /`;
			label.textContent = name;
		}
		progress.hidden = !show;
	};
	for (const section of stages) {
		ScrollTrigger.create({
			trigger: section,
			start: 'top center',
			end: 'bottom center',
			onToggle: (self) => {
				if (self.isActive) current = section;
				else if (current === section) current = null;
				updateIndicator();
			},
		});
	}

	gsap.matchMedia().add(PIN_QUERY, () => {
		pinned.forEach(pinStage);
		return () => pinned.forEach((section) => section.classList.remove('is-pinned'));
	});

	window.addEventListener('load', () => ScrollTrigger.refresh());

	// The stages are measured while the portfolio view may still be hidden, so the caller refreshes once it shows.
	return { refresh: () => ScrollTrigger.refresh() };
}
