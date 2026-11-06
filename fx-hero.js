const SCALE_FROM = 0.86;

// Grows the hero name from SCALE_FROM to full size over the first 40% of a screen of scrolling.
// Under reduced motion the name stays at full size.
export function initHeroName() {
	const name = document.querySelector('#pf-title');
	if (!name) return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	let queued = false;
	const update = () => {
		queued = false;
		const progress = Math.min(1, window.scrollY / (window.innerHeight * 0.4));
		const scale = SCALE_FROM + (1 - SCALE_FROM) * progress;
		name.style.transform = `scale(${scale.toFixed(3)})`;
	};
	window.addEventListener(
		'scroll',
		() => {
			if (queued) return;
			queued = true;
			requestAnimationFrame(update);
		},
		{ passive: true },
	);
	update();
}
