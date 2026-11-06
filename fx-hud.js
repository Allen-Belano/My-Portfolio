// Local time where Allen is (Angono, Rizal), as 24-hour HH:MM:SS.
const MANILA_TIME = new Intl.DateTimeFormat('en-GB', {
	timeZone: 'Asia/Manila',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	hour12: false,
});

// Fills the HUD: the scroll progress bar, the altitude readout (scroll depth), the local clock, and
// hides the hero's scroll cue once the visitor scrolls. Returns start() and stop() for the clock, which
// only ticks while the portfolio view is open and the tab is visible.
export function initHud() {
	const bar = document.querySelector('.pf-hud-bar');
	const clock = document.querySelector('[data-hud-clock]');
	const altitude = document.querySelector('[data-hud-alt]');
	const cue = document.querySelector('.pf-cue');
	if (!bar) return { start() {}, stop() {} };

	let clockTimer = null;
	let running = false;
	let queued = false;

	const tickClock = () => {
		if (clock) clock.textContent = `UTC+8 ${MANILA_TIME.format(new Date())}`;
	};
	const stopClock = () => {
		clearInterval(clockTimer);
		clockTimer = null;
	};
	const startClock = () => {
		if (clockTimer || !running || document.hidden) return;
		tickClock();
		clockTimer = setInterval(tickClock, 1000);
	};

	const update = () => {
		queued = false;
		const max = document.documentElement.scrollHeight - window.innerHeight;
		const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
		bar.style.transform = `scaleX(${progress.toFixed(4)})`;
		if (altitude) altitude.textContent = `ALT ${String(Math.round(progress * 100)).padStart(3, '0')}%`;
		cue?.classList.toggle('is-hidden', window.scrollY > 40);
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
	window.addEventListener('resize', update);
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) stopClock();
		else startClock();
	});
	update();

	return {
		start() {
			running = true;
			startClock();
			update();
		},
		stop() {
			running = false;
			stopClock();
		},
	};
}
