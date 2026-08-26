const themeToggle = document.querySelector('.theme-toggle');

themeToggle.addEventListener('click', () => {
	const isDark = document.body.dataset.theme === 'dark';
	document.body.dataset.theme = isDark ? 'light' : 'dark';
	themeToggle.textContent = isDark ? 'Dark mode' : 'Light mode';
	themeToggle.setAttribute('aria-label', isDark ? 'Switch to dark theme' : 'Switch to light theme');
	themeToggle.setAttribute('aria-pressed', String(!isDark));
});
