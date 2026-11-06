const themeToggles = document.querySelectorAll('.theme-toggle');
let swarm = null;

function startSwarm() {
	if (swarm || !window.CursorSwarm) return;
	swarm = new window.CursorSwarm({
		root: '.portfolio-view',
		cursors: 2,
		colors: ['#ff5e00', '#3be8ff'],
		speed: 0.55,
		maxSpeed: 1,
		adaptiveSpeed: false,
		typeDuration: 2.6,
		hud: false,
		labels: false,
		guides: false,
		marquee: false,
		sparks: false,
		copyPaste: false,
		relocation: false,
	}).init();
}

function stopSwarm() {
	if (!swarm) return;
	swarm.destroy();
	swarm = null;
}

function setTheme(theme) {
	document.body.dataset.theme = theme;
	const isPortfolio = theme === 'portfolio';
	themeToggles.forEach((toggle) => {
		toggle.textContent = isPortfolio ? 'Plain resume' : 'Portfolio design';
		toggle.setAttribute('aria-label', isPortfolio ? 'Switch to plain resume' : 'Switch to portfolio design');
		toggle.setAttribute('aria-pressed', String(isPortfolio));
	});
	if (isPortfolio) startSwarm();
	else stopSwarm();
}

themeToggles.forEach((toggle) => {
	toggle.addEventListener('click', () => {
		setTheme(document.body.dataset.theme === 'portfolio' ? 'plain' : 'portfolio');
		window.scrollTo(0, 0);
	});
});
