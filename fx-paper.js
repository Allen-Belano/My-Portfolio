// Tilts the resume sheet toward the mouse, as if it were a real sheet of paper on a desk: the part under
// the cursor presses down and the light shifts across it. The tilt springs to its target, settles flat while
// the page scrolls or the mouse rests (so the text is crisp to read), and clears the transform entirely when
// flat. Mouse and trackpad only, wide screens only, and never with reduced motion or in print.

export const MAX_TILT = 4.5; // degrees; small enough that the resume text stays sharp
const REST_AFTER = 1600; // ms without mouse movement before the paper settles flat
const PERSPECTIVE = 1600; // px

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// The tilt for a cursor position. Cursor on the right: the right side presses away (rotateY > 0).
// Cursor at the top: the top presses away (rotateX > 0).
export function tiltFor({ x, y }, { w, h }, max = MAX_TILT) {
	const nx = clamp((x / w) * 2 - 1, -1, 1);
	const ny = clamp((y / h) * 2 - 1, -1, 1);
	return { rx: -ny * max + 0, ry: nx * max + 0 };
}

// One step of a damped spring toward target. Returns the new { value, velocity }.
export function springStep({ value, velocity }, target, dt, stiffness = 140, damping = 20) {
	const force = (target - value) * stiffness - velocity * damping;
	const nextVelocity = velocity + force * dt;
	return { value: value + nextVelocity * dt, velocity: nextVelocity };
}

const atRest = (spring, target) => Math.abs(spring.value - target) < 0.01 && Math.abs(spring.velocity) < 0.01;

export function initPaper() {
	const paper = document.querySelector('[data-paper]');
	if (!paper) return { setActive() {} };

	const canTilt = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px) and (prefers-reduced-motion: no-preference)');
	const print = window.matchMedia('print');
	const rx = { value: 0, velocity: 0 };
	const ry = { value: 0, velocity: 0 };
	let target = { rx: 0, ry: 0 };
	let active = false;
	let frame = 0;
	let last = 0;
	let restTimer = 0;

	const enabled = () => active && canTilt.matches && !print.matches;

	function flatten() {
		target = { rx: 0, ry: 0 };
		wake();
	}

	function clear() {
		paper.style.transform = '';
		paper.style.transformOrigin = '';
		paper.style.removeProperty('--paper-light-x');
		paper.style.removeProperty('--paper-light');
		paper.classList.remove('is-tilting');
	}

	function render() {
		// Rotate around the middle of the part of the sheet that is on screen, not the middle of the whole
		// sheet, so a long resume does not swing its far end around.
		const originY = window.scrollY + window.innerHeight / 2 - paper.offsetTop;
		paper.style.transformOrigin = `50% ${originY.toFixed(0)}px`;
		paper.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rx.value.toFixed(3)}deg) rotateY(${ry.value.toFixed(3)}deg)`;
		// Light falls from the side that rises toward the viewer.
		const strength = Math.min(1, Math.hypot(rx.value, ry.value) / MAX_TILT);
		paper.style.setProperty('--paper-light-x', `${(50 - (ry.value / MAX_TILT) * 50).toFixed(1)}%`);
		paper.style.setProperty('--paper-light', strength.toFixed(3));
		paper.classList.add('is-tilting');
	}

	function tick(now) {
		const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
		last = now;
		Object.assign(rx, springStep(rx, target.rx, dt));
		Object.assign(ry, springStep(ry, target.ry, dt));
		if (atRest(rx, target.rx) && atRest(ry, target.ry)) {
			rx.value = target.rx;
			ry.value = target.ry;
			rx.velocity = ry.velocity = 0;
			frame = 0;
			if (target.rx === 0 && target.ry === 0) clear();
			else render();
			return;
		}
		render();
		frame = requestAnimationFrame(tick);
	}

	function wake() {
		if (frame || !active) return;
		last = performance.now();
		frame = requestAnimationFrame(tick);
	}

	function onMove(event) {
		if (!enabled() || event.pointerType !== 'mouse') return;
		target = tiltFor({ x: event.clientX, y: event.clientY }, { w: window.innerWidth, h: window.innerHeight });
		wake();
		clearTimeout(restTimer);
		restTimer = setTimeout(flatten, REST_AFTER);
	}

	function stop() {
		cancelAnimationFrame(frame);
		frame = 0;
		clearTimeout(restTimer);
		Object.assign(rx, { value: 0, velocity: 0 });
		Object.assign(ry, { value: 0, velocity: 0 });
		target = { rx: 0, ry: 0 };
		clear();
	}

	window.addEventListener('pointermove', onMove, { passive: true });
	window.addEventListener('scroll', () => enabled() && flatten(), { passive: true });
	document.documentElement.addEventListener('mouseleave', () => enabled() && flatten());
	window.addEventListener('blur', () => enabled() && flatten());
	canTilt.addEventListener('change', () => !canTilt.matches && stop());
	print.addEventListener('change', () => print.matches && stop());
	window.addEventListener('beforeprint', stop);

	return {
		setActive(value) {
			active = value;
			if (!value) stop();
		},
	};
}
