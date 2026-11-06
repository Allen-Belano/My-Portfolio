const EASE = 0.08;

// Keeps the film alive at rest: as the mouse moves, --lean-x and --lean-y on the stage ease toward its
// position (-1 to 1 across the screen), and the CSS turns them into a small drift of each scene and its
// numeral. A real mouse only (a finger is scrolling), and only while the film runs; it stops asking for
// frames once it has settled.
export function initLean(film) {
	const main = document.querySelector('.pf-main');
	if (!film || !main) return;
	if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

	let x = 0;
	let y = 0;
	let targetX = 0;
	let targetY = 0;
	let frame = 0;

	const settle = () => {
		x += (targetX - x) * EASE;
		y += (targetY - y) * EASE;
		main.style.setProperty('--lean-x', x.toFixed(3));
		main.style.setProperty('--lean-y', y.toFixed(3));
		frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.002 ? requestAnimationFrame(settle) : 0;
	};

	window.addEventListener(
		'pointermove',
		(event) => {
			if (event.pointerType !== 'mouse') return;
			targetX = (event.clientX / window.innerWidth) * 2 - 1;
			targetY = (event.clientY / window.innerHeight) * 2 - 1;
			if (!frame) frame = requestAnimationFrame(settle);
		},
		{ passive: true },
	);
}
