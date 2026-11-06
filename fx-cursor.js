const EASE = 0.2;
const HOT = 'a, button, input, [role="button"]';

// A ring that trails the pointer across the portfolio view and widens over links and buttons.
// Desktop with a fine pointer only, and off under reduced motion; the normal cursor always stays visible.
// The ring lives inside the portfolio view, so it disappears with it.
export function initCursor() {
	const view = document.querySelector('.portfolio-view');
	if (!view) return;
	if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const reticle = document.createElement('div');
	reticle.className = 'pf-reticle';
	reticle.setAttribute('aria-hidden', 'true');
	reticle.append(document.createElement('i'));
	view.append(reticle);

	let x = -100;
	let y = -100;
	let targetX = -100;
	let targetY = -100;
	let frame = 0;

	// Eases toward the pointer and stops asking for frames once it has caught up.
	const follow = () => {
		x += (targetX - x) * EASE;
		y += (targetY - y) * EASE;
		reticle.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
		frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.2 ? requestAnimationFrame(follow) : 0;
	};

	window.addEventListener(
		'pointermove',
		(event) => {
			if (event.pointerType !== 'mouse') return;
			targetX = event.clientX;
			targetY = event.clientY;
			reticle.classList.add('is-on');
			reticle.classList.toggle('is-hot', Boolean(event.target.closest?.(HOT)));
			if (!frame) frame = requestAnimationFrame(follow);
		},
		{ passive: true },
	);
	document.documentElement.addEventListener('mouseleave', () => reticle.classList.remove('is-on'));
}
