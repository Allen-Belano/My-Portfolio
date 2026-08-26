const themeToggle = document.querySelector('.theme-toggle');
const xpTransition = document.querySelector('.xp-transition');
const xpSaving = document.querySelector('.xp-saving');
const xpComplete = document.querySelector('.xp-complete');
const xpContinue = document.querySelector('.xp-continue');
const xpCancel = document.querySelector('.xp-cancel');
const xpTitle = document.querySelector('.xp-title');
let isTransitioning = false;
let pendingTheme;

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
	document.body.dataset.theme = pendingTheme;
	const isPortfolio = pendingTheme === 'portfolio';
	themeToggle.textContent = isPortfolio ? 'Plain resume' : 'Portfolio design';
	themeToggle.setAttribute('aria-label', isPortfolio ? 'Switch to plain resume' : 'Switch to portfolio design');
	themeToggle.setAttribute('aria-pressed', String(isPortfolio));
	xpTransition.classList.remove('is-active');
	xpTransition.setAttribute('aria-hidden', 'true');
	isTransitioning = false;
});

xpCancel.addEventListener('click', () => {
	xpTransition.classList.remove('is-active');
	xpTransition.setAttribute('aria-hidden', 'true');
	isTransitioning = false;
});

const startButton = document.querySelector('.xp-start-button');
const startMenu = document.querySelector('.xp-start-menu');
const cursor = document.querySelector('.xp-cursor');

function showWindow(windowId) {
	const appWindow = document.getElementById(windowId);
	if (!appWindow) return;
	appWindow.classList.remove('is-closed', 'is-minimized');
	startMenu.classList.remove('is-open');
	startButton.setAttribute('aria-expanded', 'false');
}

document.querySelectorAll('[data-window]').forEach((launcher) => {
	launcher.addEventListener('click', () => showWindow(launcher.dataset.window));
});

startButton.addEventListener('click', () => {
	const isOpen = startMenu.classList.toggle('is-open');
	startButton.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.xp-app-window').forEach((appWindow) => {
	appWindow.addEventListener('click', (event) => {
		const action = event.target.dataset.action;
		if (action === 'close') appWindow.classList.add('is-closed');
		if (action === 'minimize') appWindow.classList.add('is-minimized');
		if (action === 'maximize') appWindow.classList.toggle('is-maximized');
		if (action === 'power') document.body.dataset.theme = 'plain';
	});
});

document.querySelector('[data-action="power"]').addEventListener('click', () => {
	document.body.dataset.theme = 'plain';
	startMenu.classList.remove('is-open');
	startButton.setAttribute('aria-expanded', 'false');
	themeToggle.textContent = 'Portfolio design';
	themeToggle.setAttribute('aria-label', 'Switch to portfolio design');
	themeToggle.setAttribute('aria-pressed', 'false');
});

document.addEventListener('mousemove', (event) => {
	cursor.style.left = `${event.clientX}px`;
	cursor.style.top = `${event.clientY}px`;
});
