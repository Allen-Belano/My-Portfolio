const INTRO_MS = 1500;
const LOAD_MS = 1200; // matches the load bar's fill in the CSS
let stopCurrent = null;

// Plays the stage 0 intro each time the portfolio view opens. A click or key press skips it,
// and it is skipped entirely under reduced motion. The page content sits underneath it in the HTML.
export function playIntro() {
	const intro = document.querySelector('.pf-intro');
	if (!intro) return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	// Starting again while it plays ends the previous run first, so its listeners do not pile up.
	stopCurrent?.();

	let timer = null;
	let counter = null;
	const percent = intro.querySelector('[data-intro-pct]');
	const finish = () => {
		clearTimeout(timer);
		clearInterval(counter);
		intro.removeEventListener('click', finish);
		window.removeEventListener('keydown', finish);
		intro.classList.remove('is-playing');
		intro.hidden = true;
		stopCurrent = null;
	};

	intro.hidden = false;
	intro.classList.remove('is-playing');
	void intro.offsetWidth;
	intro.classList.add('is-playing');
	intro.addEventListener('click', finish);
	window.addEventListener('keydown', finish);
	timer = setTimeout(finish, INTRO_MS);
	stopCurrent = finish;

	// The percentage counts up beside the load bar, easing out like the bar does.
	const start = performance.now();
	const count = () => {
		const t = Math.min(1, (performance.now() - start) / LOAD_MS);
		const eased = 1 - Math.pow(1 - t, 3);
		if (percent) percent.textContent = `${String(Math.round(eased * 100)).padStart(3, '0')}%`;
		if (t >= 1) clearInterval(counter);
	};
	count();
	counter = setInterval(count, 40);
}
