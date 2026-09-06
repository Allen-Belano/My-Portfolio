const themeToggle = document.querySelector('.theme-toggle');
const xpTransition = document.querySelector('.xp-transition');
const xpSaving = document.querySelector('.xp-saving');
const xpComplete = document.querySelector('.xp-complete');
const xpContinue = document.querySelector('.xp-continue');
const xpCancel = document.querySelector('.xp-cancel');
const xpTitle = document.querySelector('.xp-title');

let isTransitioning = false;
let pendingTheme;

function setTheme(theme) {
	document.body.dataset.theme = theme;
	const isPortfolio = theme === 'portfolio';
	themeToggle.textContent = isPortfolio ? 'Plain resume' : 'Portfolio design';
	themeToggle.setAttribute('aria-label', isPortfolio ? 'Switch to plain resume' : 'Switch to portfolio design');
	themeToggle.setAttribute('aria-pressed', String(isPortfolio));
}

function closeTransition() {
	xpTransition.classList.remove('is-active');
	xpTransition.setAttribute('aria-hidden', 'true');
	isTransitioning = false;
}

themeToggle.addEventListener('click', () => {
	if (isTransitioning) return;
	isTransitioning = true;
	pendingTheme = document.body.dataset.theme === 'portfolio' ? 'plain' : 'portfolio';
	xpSaving.hidden = false;
	xpComplete.hidden = true;
	xpContinue.hidden = true;
	xpTitle.textContent = 'Saving (95%)';
	xpTransition.setAttribute('aria-hidden', 'false');
	xpTransition.classList.add('is-active');

	window.setTimeout(() => {
		xpSaving.hidden = true;
		xpComplete.hidden = false;
		xpContinue.hidden = false;
		xpTitle.textContent = 'Setup';
		xpContinue.focus();
	}, 950);
});

xpContinue.addEventListener('click', () => {
	setTheme(pendingTheme);
	closeTransition();
});

xpCancel.addEventListener('click', closeTransition);

export { setTheme };
