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
