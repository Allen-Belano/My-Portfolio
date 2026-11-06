const INTRO_MS = 1500;
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
	const finish = () => {
		clearTimeout(timer);
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
}
