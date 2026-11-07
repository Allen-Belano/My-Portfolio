import test from 'node:test';
import assert from 'node:assert/strict';
import { tiltFor, springStep, MAX_TILT } from '../../fx-paper.js';

const viewport = { w: 1000, h: 800 };

test('the paper lies flat when the cursor is at the centre of the screen', () => {
	const { rx, ry } = tiltFor({ x: 500, y: 400 }, viewport);
	assert.equal(Math.abs(rx), 0);
	assert.equal(Math.abs(ry), 0);
});

test('the paper presses down under the cursor: right side away, top away', () => {
	const right = tiltFor({ x: 1000, y: 400 }, viewport);
	assert.equal(right.ry, MAX_TILT);
	const top = tiltFor({ x: 500, y: 0 }, viewport);
	assert.equal(top.rx, MAX_TILT);
	const corner = tiltFor({ x: 0, y: 800 }, viewport);
	assert.equal(corner.ry, -MAX_TILT);
	assert.equal(corner.rx, -MAX_TILT);
});

test('the tilt never exceeds the maximum, even outside the window', () => {
	const { rx, ry } = tiltFor({ x: 5000, y: -900 }, viewport);
	assert.ok(Math.abs(rx) <= MAX_TILT && Math.abs(ry) <= MAX_TILT);
});

test('the maximum stays small enough to keep the resume text crisp', () => {
	assert.ok(MAX_TILT > 0 && MAX_TILT <= 6);
});

test('the spring settles on its target and stops', () => {
	let state = { value: 0, velocity: 0 };
	for (let i = 0; i < 240; i++) state = springStep(state, 4, 1 / 60);
	assert.ok(Math.abs(state.value - 4) < 0.01);
	assert.ok(Math.abs(state.velocity) < 0.01);
});
