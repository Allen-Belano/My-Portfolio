const FIRST_DELAY = [8000, 15000];
const GAP_DELAY = [20000, 45000];
const SHOW_MS = 2000;
const EDGES = ['top', 'right', 'bottom', 'left'];

function between([min, max]) {
	return min + Math.random() * (max - min);
}

// A small creature that peeks in from a random screen edge of the resume now and then.
// Returns setActive(bool): it only runs while the resume view is showing.
export function initPeek(onActivate) {
	const peek = document.querySelector('[data-peek]');
	if (!peek) return { setActive() {} };

	let active = false;
	let timer = null;
	let range = FIRST_DELAY;
	let hovered = false;
	let focused = false;

	// Pick an edge and a spot along it. The move happens while hidden, so nothing slides across the page.
	function show() {
		const edge = EDGES[Math.floor(Math.random() * EDGES.length)];
		const spot = 15 + Math.random() * 70;
		peek.style.transition = 'none';
		peek.style.top = '';
		peek.style.right = '';
		peek.style.bottom = '';
		peek.style.left = '';
		peek.dataset.edge = edge;
		peek.style[edge] = '0';
		if (edge === 'top' || edge === 'bottom') peek.style.left = `calc(${spot}% - 32px)`;
		else peek.style.top = `calc(${spot}% - 32px)`;
		void peek.offsetWidth;
		peek.style.transition = '';
		peek.classList.add('is-shown');
	}

	function queue() {
		clearTimeout(timer);
		timer = null;
		if (!active || document.hidden) return;
		timer = setTimeout(appear, between(range));
	}

	function hide() {
		peek.classList.remove('is-shown');
		range = GAP_DELAY;
		queue();
	}

	function appear() {
		timer = null;
		show();
		timer = setTimeout(leave, SHOW_MS);
	}

	// It stays put while the pointer is on it or it has keyboard focus.
	function leave() {
		timer = null;
		if (!hovered && !focused) hide();
	}

	function setActive(value) {
		active = value;
		if (value) {
			queue();
			return;
		}
		clearTimeout(timer);
		timer = null;
		hovered = false;
		focused = false;
		peek.classList.remove('is-shown');
	}

	peek.addEventListener('pointerenter', () => {
		hovered = true;
	});
	peek.addEventListener('pointerleave', () => {
		hovered = false;
		if (!focused && peek.classList.contains('is-shown')) hide();
	});
	peek.addEventListener('focus', () => {
		focused = true;
		clearTimeout(timer);
		timer = null;
		if (!peek.classList.contains('is-shown')) show();
	});
	peek.addEventListener('blur', () => {
		focused = false;
		if (!hovered) hide();
	});
	peek.addEventListener('click', onActivate);

	// Timers stop while the tab is hidden and start again with a fresh delay when it returns.
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			clearTimeout(timer);
			timer = null;
			if (!focused && !hovered) peek.classList.remove('is-shown');
		} else if (!peek.classList.contains('is-shown')) {
			queue();
		}
	});

	return { setActive };
}
