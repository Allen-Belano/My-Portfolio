import { initCounters } from './fx-counters.js';
import { initFilters } from './fx-filters.js';
import { initTimeline } from './fx-timeline.js';
import { initTilt } from './fx-tilt.js';
import { initTerminal } from './fx-terminal.js';
import { createSky } from './fx-sky.js';
import { createOrb } from './fx-orb.js';
import { initBot } from './fx-bot.js';
import { initPeek } from './fx-peek.js';
import { playIntro } from './fx-intro.js';
import { initHeroName } from './fx-hero.js';
import { initStages } from './fx-stages.js';
import { initTrajectory } from './fx-trajectory.js';
import { initRocket } from './fx-rocket.js';

// Global switch for CursorSwarm: set to false to turn it off on every stage.
const SWARM_ENABLED = true;
// Only text inside stages marked data-swarm is built; pinned stages are left alone.
const SWARM_TARGETS = '[data-swarm] :is(h1, h2, h3, p, li, a, strong, span, dt, dd)';
const SWARM_COLORS = {
	dark: ['#7aa7ff', '#e9c46a'],
	light: ['#2a5bd7', '#a87822'],
};
const themeToggles = document.querySelectorAll('.theme-toggle');
const modeToggles = document.querySelectorAll('.pf-mode');
let swarm = null;
const sky = createSky(document.querySelector('.pf-sky'));
const orb = createOrb(document.querySelector('[data-orb]'));
const peek = initPeek(() => {
	setTheme('portfolio');
	window.scrollTo(0, 0);
});

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
	if (!SWARM_ENABLED || swarm || !window.CursorSwarm) return;
	swarm = new window.CursorSwarm({
		root: '.portfolio-view',
		targets: SWARM_TARGETS,
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
	peek.setActive(!isPortfolio);
	syncHash(isPortfolio);
	if (isPortfolio) {
		playIntro();
		stages?.refresh();
	}
}

// Keeps #portfolio in the URL while the portfolio view is open, so the view can be shared as a direct link.
function syncHash(isPortfolio) {
	const onHash = location.hash === '#portfolio';
	if (isPortfolio && !onHash) history.replaceState(null, '', '#portfolio');
	if (!isPortfolio && onHash) history.replaceState(null, '', location.pathname + location.search);
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
initBot();
initRocket();
initHeroName();
const stages = initStages();
// After the stage pinning, which wraps the stage content that holds the timeline.
initTrajectory();
setMode(savedMode());
if (location.hash === '#portfolio') setTheme('portfolio');
else peek.setActive(true);
window.addEventListener('hashchange', () => {
	if (location.hash === '#portfolio') setTheme('portfolio');
});
