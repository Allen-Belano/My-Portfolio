import { initCounters } from './fx-counters.js';
import { initFilters } from './fx-filters.js';
import { initTimeline } from './fx-timeline.js';
import { initTilt } from './fx-tilt.js';
import { initTerminal } from './fx-terminal.js';
import { createSky } from './fx-sky.js';
import { createOrb } from './fx-orb.js';

const SWARM_COLORS = {
	dark: ['#7aa7ff', '#e9c46a'],
	light: ['#2a5bd7', '#a87822'],
};
const themeToggles = document.querySelectorAll('.theme-toggle');
const modeToggles = document.querySelectorAll('.pf-mode');
let swarm = null;
const sky = createSky(document.querySelector('.pf-sky'));
const orb = createOrb(document.querySelector('[data-orb]'));

function syncAmbient() {
	const active = document.body.dataset.theme === 'portfolio';
	const dark = document.body.dataset.mode !== 'light';
	if (active && dark) sky.start();
	else sky.stop();
	if (active) orb.start();
	else orb.stop();
}

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

function startSwarm() {
	if (swarm || !window.CursorSwarm) return;
	swarm = new window.CursorSwarm({
		root: '.portfolio-view',
		cursors: 2,
		colors: SWARM_COLORS[document.body.dataset.mode || 'dark'],
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
	syncAmbient();
}

function setMode(mode) {
	document.body.dataset.mode = mode;
	const isLight = mode === 'light';
	modeToggles.forEach((toggle) => {
		toggle.textContent = isLight ? 'Dark mode' : 'Light mode';
		toggle.setAttribute('aria-pressed', String(isLight));
	});
	saveMode(mode);
	if (swarm) swarm.setPalette(SWARM_COLORS[mode]);
	orb.recolor();
	syncAmbient();
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

initCounters();
initFilters();
initTimeline();
initTilt();
initTerminal();
setMode(savedMode());
