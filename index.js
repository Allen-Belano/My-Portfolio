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
import { createSmoothScroll } from './fx-smooth.js';
import { initHud } from './fx-hud.js';
import { initJump } from './fx-jump.js';
import { initCursor } from './fx-cursor.js';
import { initDecode } from './fx-decode.js';
import { initReveal } from './fx-reveal.js';

const themeToggles = document.querySelectorAll('.theme-toggle');
const modeToggles = document.querySelectorAll('.pf-mode');
const smooth = createSmoothScroll();
const hud = initHud();
const sky = createSky(document.querySelector('.pf-sky'));
const orb = createOrb(document.querySelector('[data-orb]'));
const peek = initPeek(() => {
	setTheme('portfolio');
	window.scrollTo(0, 0);
});

// The starfield is dropped on phones, where it costs the most for the least effect.
const wide = window.matchMedia('(min-width: 860px)');
wide.addEventListener('change', () => syncAmbient());

function syncAmbient() {
	const active = document.body.dataset.theme === 'portfolio';
	const dark = document.body.dataset.mode !== 'light';
	if (active && dark && wide.matches) sky.start();
	else sky.stop();
	if (active) orb.start();
	else orb.stop();
	// Smooth scrolling is for the portfolio view only; the resume keeps native scrolling.
	if (active) smooth.start();
	else smooth.stop();
	if (active) hud.start();
	else hud.stop();
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

function setTheme(theme) {
	document.body.dataset.theme = theme;
	const isPortfolio = theme === 'portfolio';
	themeToggles.forEach((toggle) => {
		toggle.textContent = isPortfolio ? 'Plain resume' : 'Portfolio design';
		toggle.setAttribute('aria-label', isPortfolio ? 'Switch to plain resume' : 'Switch to portfolio design');
		toggle.setAttribute('aria-pressed', String(isPortfolio));
	});
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
initReveal();
initJump(smooth);
initCursor();
initDecode();
setMode(savedMode());
if (location.hash === '#portfolio') setTheme('portfolio');
else peek.setActive(true);
window.addEventListener('hashchange', () => {
	if (location.hash === '#portfolio') setTheme('portfolio');
});
