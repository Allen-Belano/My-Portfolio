const IDLE_MS = 5000;
const SPEED = 60;
const SIZE = 64;
const EDGE_BIAS = 0.7;
const TEXT = 'p, h1, h2, h3, h4, li, span, a, strong, em, label, button, time';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const between = (min, max) => min + Math.random() * (max - min);

// After about 5 seconds without scrolling, the assistant probe becomes a rocket that roams the page.
// A scroll, keyboard focus or a click docks it back in the corner, and the chat panel keeps it docked.
// It also stays docked under reduced motion, below 860px, during the intro and while the tab is hidden.
export function initRocket() {
	const bot = document.querySelector('[data-bot]');
	const probe = bot?.querySelector('.pf-probe');
	const rocket = probe?.querySelector('.pf-rocket-svg');
	if (!probe || !rocket) return;

	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
	const wide = window.matchMedia('(min-width: 860px)');

	let roaming = false;
	let docking = false;
	let idleTimer = null;
	let frame = 0;
	let last = 0;
	let pos = { x: 0, y: 0 };
	let target = null;
	let heading = -Math.PI / 2;

	const introPlaying = () => {
		const intro = document.querySelector('.pf-intro');
		return Boolean(intro && !intro.hidden);
	};

	const allowed = () =>
		!reduce.matches &&
		wide.matches &&
		!document.hidden &&
		document.body.dataset.theme === 'portfolio' &&
		!bot.classList.contains('is-open') &&
		!introPlaying();

	const place = (x, y, angle) => {
		probe.style.transform = `translate3d(${x}px, ${y}px, 0)`;
		rocket.style.transform = `rotate(${angle}deg)`;
	};

	// A spot is clear when no text sits under its centre, so the rocket never stops on words.
	const isClear = (x, y) =>
		document.elementsFromPoint(x, y).every((el) => !el.matches(TEXT) || bot.contains(el));

	// Waypoints favour the left and right edges, below the top bar.
	const pickTarget = () => {
		const width = window.innerWidth;
		const height = window.innerHeight;
		for (let attempt = 0; attempt < 40; attempt += 1) {
			const x = Math.random() < EDGE_BIAS
				? (Math.random() < 0.5 ? between(0, width * 0.12) : between(width * 0.88, width - SIZE))
				: between(0, width - SIZE);
			const y = between(90, height - SIZE - 40);
			if (isClear(x + SIZE / 2, y + SIZE / 2)) return { x, y };
		}
		return null;
	};

	const startRoam = () => {
		if (roaming) return;
		const rect = probe.getBoundingClientRect();
		pos = { x: rect.left, y: rect.top };
		roaming = true;
		docking = false;
		target = null;
		probe.classList.add('is-roaming');
		last = performance.now();
		frame = requestAnimationFrame(tick);
	};

	// Puts the probe straight back in its corner, with no flight.
	const restoreDock = () => {
		roaming = false;
		docking = false;
		cancelAnimationFrame(frame);
		frame = 0;
		probe.classList.remove('is-roaming');
		probe.style.transform = '';
		rocket.style.transform = '';
	};

	// Flies back to the corner. The corner is measured with the roaming styles briefly removed.
	const dock = () => {
		if (!roaming || docking) return;
		probe.classList.remove('is-roaming');
		probe.style.transform = '';
		const corner = probe.getBoundingClientRect();
		probe.classList.add('is-roaming');
		place(pos.x, pos.y, 0);
		docking = true;
		target = { x: corner.left, y: corner.top };
	};

	// The idle timer does not check conditions when it is set, since the portfolio view may not be
	// showing yet. When it fires, it keeps checking each second until roaming is allowed.
	const waitThenRoam = () => {
		if (allowed()) startRoam();
		else idleTimer = setTimeout(waitThenRoam, 1000);
	};
	const resetIdle = () => {
		clearTimeout(idleTimer);
		idleTimer = setTimeout(waitThenRoam, IDLE_MS);
	};

	const tick = (now) => {
		const dt = Math.min(0.05, (now - last) / 1000);
		last = now;

		if (docking) {
			const ease = Math.min(1, dt * 6);
			pos.x += (target.x - pos.x) * ease;
			pos.y += (target.y - pos.y) * ease;
			place(pos.x, pos.y, 0);
			if (Math.hypot(target.x - pos.x, target.y - pos.y) < 1) {
				restoreDock();
				resetIdle();
				return;
			}
		} else {
			if (!target) target = pickTarget() || { x: pos.x, y: pos.y };
			const dx = target.x - pos.x;
			const dy = target.y - pos.y;
			if (Math.hypot(dx, dy) < 12) {
				target = null;
			} else {
				// Steer gently toward the waypoint with a slow wobble, so the path wanders.
				const desired = Math.atan2(dy, dx) + 0.4 * Math.sin(now / 700);
				const turn = Math.atan2(Math.sin(desired - heading), Math.cos(desired - heading));
				heading += clamp(turn, -2 * dt, 2 * dt);
				pos.x += Math.cos(heading) * SPEED * dt;
				pos.y += Math.sin(heading) * SPEED * dt;
			}
			pos.x = clamp(pos.x, 0, window.innerWidth - SIZE);
			pos.y = clamp(pos.y, 0, window.innerHeight - SIZE);
			// The drawing points up, so the nose follows the heading plus a quarter turn.
			place(pos.x, pos.y, (heading * 180) / Math.PI + 90);
		}

		frame = requestAnimationFrame(tick);
	};

	probe.addEventListener('click', dock);
	probe.addEventListener('focus', dock);
	window.addEventListener('scroll', () => {
		dock();
		resetIdle();
	}, { passive: true });
	window.addEventListener('resize', () => {
		if (!wide.matches) restoreDock();
	});

	// Only opening and closing the chat panel matters here. Blinks and wiggles also change the class
	// and must not restart the idle timer.
	let open = bot.classList.contains('is-open');
	new MutationObserver(() => {
		const nowOpen = bot.classList.contains('is-open');
		if (nowOpen === open) return;
		open = nowOpen;
		if (open) {
			dock();
			clearTimeout(idleTimer);
		} else {
			resetIdle();
		}
	}).observe(bot, { attributes: true, attributeFilter: ['class'] });

	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			clearTimeout(idleTimer);
			restoreDock();
		} else {
			resetIdle();
		}
	});

	resetIdle();
}
