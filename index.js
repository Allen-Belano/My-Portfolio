const themeToggle = document.querySelector('.theme-toggle');
const xpTransition = document.querySelector('.xp-transition');
let isTransitioning = false;

themeToggle.addEventListener('click', () => {
	if (isTransitioning) return;
	isTransitioning = true;
	const isPortfolio = document.body.dataset.theme === 'portfolio';
	xpTransition.classList.add('is-active');

	window.setTimeout(() => {
		document.body.dataset.theme = isPortfolio ? 'plain' : 'portfolio';
		themeToggle.textContent = isPortfolio ? 'Portfolio design' : 'Plain resume';
		themeToggle.setAttribute('aria-label', isPortfolio ? 'Switch to portfolio design' : 'Switch to plain resume');
		themeToggle.setAttribute('aria-pressed', String(!isPortfolio));
		xpTransition.classList.remove('is-active');
		isTransitioning = false;
	}, 900);
});
