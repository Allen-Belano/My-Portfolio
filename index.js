const themeToggle = document.querySelector('.theme-toggle');

themeToggle.addEventListener('click', () => {
	const isPortfolio = document.body.dataset.theme === 'portfolio';
	document.body.dataset.theme = isPortfolio ? 'plain' : 'portfolio';
	themeToggle.textContent = isPortfolio ? 'Portfolio design' : 'Plain resume';
	themeToggle.setAttribute('aria-label', isPortfolio ? 'Switch to portfolio design' : 'Switch to plain resume');
	themeToggle.setAttribute('aria-pressed', String(!isPortfolio));
});
