import { initAsk } from './fx-ask.js';
import { initTilt } from './fx-tilt.js';
import { initTimeline } from './fx-timeline.js';
import { initFilters } from './fx-filters.js';
import { initCounters } from './fx-counters.js';
const themeToggles = document.querySelectorAll('.theme-toggle');
const modeToggles = document.querySelectorAll('.pf-mode');
const PALETTES = {
	dark: ['#ff5e00', '#3be8ff'],
	light: ['#c94400', '#00677d'],
};
let swarm = null;

function savedMode() {
	try {
		return localStorage.getItem('portfolio-mode') === 'light' ? 'light' : 'dark';
	} catch {
		return 'dark';
	}
}

function saveMode(mode) {
	try {
		localStorage.setItem('portfolio-mode', mode);
	} catch {
		/* storage blocked: the choice simply isn't remembered */
	}
}

function setMode(mode) {
	document.body.dataset.mode = mode;
	const isLight = mode === 'light';
	modeToggles.forEach((toggle) => {
		toggle.textContent = isLight ? 'Dark mode' : 'Light mode';
		toggle.setAttribute('aria-pressed', String(isLight));
	});
	saveMode(mode);
	if (swarm) swarm.setPalette(PALETTES[mode]);
}

function startSwarm() {
	if (swarm || !window.CursorSwarm) return;
	swarm = new window.CursorSwarm({
		root: '.portfolio-view',
		cursors: 2,
		colors: PALETTES[document.body.dataset.mode || 'dark'],
		speed: 0.85,
		maxSpeed: 1.4,
		adaptiveSpeed: false,
		typeDuration: 2.0,
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

modeToggles.forEach((toggle) => {
	toggle.addEventListener('click', () => {
		setMode(document.body.dataset.mode === 'light' ? 'dark' : 'light');
	});
});

setMode(savedMode());
initCounters();
initFilters();
initTimeline();
initTilt();
initAsk();
