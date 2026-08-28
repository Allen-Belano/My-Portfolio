const themeToggle = document.querySelector('.theme-toggle');
const xpTransition = document.querySelector('.xp-transition');
const xpSaving = document.querySelector('.xp-saving');
const xpComplete = document.querySelector('.xp-complete');
const xpContinue = document.querySelector('.xp-continue');
const xpCancel = document.querySelector('.xp-cancel');
const xpTitle = document.querySelector('.xp-title');
let isTransitioning = false;
let pendingTheme;

function setContextMenuOpen(isOpen) {
	contextMenu.classList.toggle('is-open', isOpen);
	contextMenu.setAttribute('aria-hidden', String(!isOpen));
}

function setTheme(theme) {
	document.body.dataset.theme = theme;
	const isPortfolio = theme === 'portfolio';
	themeToggle.textContent = isPortfolio ? 'Plain resume' : 'Portfolio design';
	themeToggle.setAttribute('aria-label', isPortfolio ? 'Switch to plain resume' : 'Switch to portfolio design');
	themeToggle.setAttribute('aria-pressed', String(isPortfolio));
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
const xpDesktop = document.querySelector('.xp-desktop');
const xpUserLogin = document.querySelector('.xp-user-login');
const xpRestart = document.querySelector('.xp-restart');
const contextMenu = document.querySelector('.xp-context-menu');

xpUserLogin.addEventListener('click', () => {
	xpDesktop.classList.add('is-logged-in');
	document.querySelector('.xp-boot').setAttribute('aria-hidden', 'true');
});

xpRestart.addEventListener('click', () => {
	xpDesktop.classList.remove('is-logged-in');
	document.querySelector('.xp-boot').setAttribute('aria-hidden', 'false');
	setContextMenuOpen(false);
});

function showWindow(windowId) {
	const appWindow = document.getElementById(windowId);
	if (!appWindow) return;
	appWindow.classList.remove('is-closed', 'is-minimized');
	focusWindow(appWindow);
	startMenu.classList.remove('is-open');
	startButton.setAttribute('aria-expanded', 'false');
}

function focusWindow(appWindow) {
	document.querySelectorAll('.xp-app-window').forEach((windowElement) => windowElement.classList.remove('is-focused'));
	appWindow.classList.add('is-focused');
	appWindow.style.zIndex = String(Math.max(...[...document.querySelectorAll('.xp-app-window')].map((windowElement) => Number(windowElement.style.zIndex) || 2)) + 1);
}

document.querySelectorAll('.desktop-icon').forEach((launcher) => {
	launcher.addEventListener('click', () => {
		document.querySelectorAll('.desktop-icon').forEach((icon) => icon.classList.remove('is-selected'));
		launcher.classList.add('is-selected');
	});
	launcher.addEventListener('dblclick', () => showWindow(launcher.dataset.window));
});

document.querySelectorAll('.xp-start-menu [data-window]').forEach((launcher) => {
	launcher.addEventListener('click', () => showWindow(launcher.dataset.window || launcher.dataset.taskWindow));
});

startButton.addEventListener('click', () => {
	const isOpen = startMenu.classList.toggle('is-open');
	startButton.setAttribute('aria-expanded', String(isOpen));
	startMenu.setAttribute('aria-hidden', String(!isOpen));
});

xpDesktop.addEventListener('contextmenu', (event) => {
	if (!xpDesktop.classList.contains('is-logged-in') || event.target.closest('.xp-app-window, .xp-taskbar, .xp-start-menu, .desktop-icon')) return;
	event.preventDefault();
	contextMenu.style.left = `${Math.min(event.clientX, window.innerWidth - 198)}px`;
	contextMenu.style.top = `${Math.min(event.clientY, window.innerHeight - 120)}px`;
	setContextMenuOpen(true);
});

document.querySelectorAll('[data-context-action]').forEach((actionButton) => {
	actionButton.addEventListener('click', () => {
		if (actionButton.dataset.contextAction === 'open-resume') showWindow('resume-window');
		if (actionButton.dataset.contextAction === 'refresh') xpDesktop.classList.add('is-refreshing');
		if (actionButton.dataset.contextAction === 'properties') showWindow('about-window');
		setContextMenuOpen(false);
		window.setTimeout(() => xpDesktop.classList.remove('is-refreshing'), 250);
	});
});

document.querySelectorAll('.xp-app-window').forEach((appWindow) => {
	appWindow.addEventListener('click', (event) => {
		focusWindow(appWindow);
		const action = event.target.dataset.action;
		if (action === 'close') appWindow.classList.add('is-closed');
		if (action === 'minimize') appWindow.classList.add('is-minimized');
		if (action === 'maximize') appWindow.classList.toggle('is-maximized');
		if (action === 'power') document.body.dataset.theme = 'plain';
	});

	const titlebar = appWindow.querySelector('.xp-app-titlebar');
	titlebar.addEventListener('pointerdown', (event) => {
		if (event.target.closest('button') || appWindow.classList.contains('is-maximized')) return;
		focusWindow(appWindow);
		const startX = event.clientX;
		const startY = event.clientY;
		const startLeft = appWindow.offsetLeft;
		const startTop = appWindow.offsetTop;
		const moveWindow = (moveEvent) => {
			appWindow.style.left = `${startLeft + moveEvent.clientX - startX}px`;
			appWindow.style.top = `${startTop + moveEvent.clientY - startY}px`;
		};
		const stopMoving = () => {
			document.removeEventListener('pointermove', moveWindow);
			document.removeEventListener('pointerup', stopMoving);
		};
		document.addEventListener('pointermove', moveWindow);
		document.addEventListener('pointerup', stopMoving);
	});
});

document.querySelectorAll('[data-task-window]').forEach((taskButton) => {
	taskButton.addEventListener('click', () => {
		const appWindow = document.getElementById(taskButton.dataset.taskWindow);
		if (!appWindow) return;
		if (appWindow.classList.contains('is-minimized')) showWindow(taskButton.dataset.taskWindow);
		else appWindow.classList.toggle('is-minimized');
	});
});

document.querySelector('[data-action="power"]').addEventListener('click', () => {
	setTheme('plain');
	startMenu.classList.remove('is-open');
	startButton.setAttribute('aria-expanded', 'false');
	startMenu.setAttribute('aria-hidden', 'true');
});

document.addEventListener('click', (event) => {
	if (!event.target.closest('.xp-context-menu')) setContextMenuOpen(false);
});

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
		setContextMenuOpen(false);
		startMenu.classList.remove('is-open');
		startButton.setAttribute('aria-expanded', 'false');
		startMenu.setAttribute('aria-hidden', 'true');
	}
	if (event.altKey && event.key === 'F4') {
		const focusedWindow = [...document.querySelectorAll('.xp-app-window')].find((windowElement) => windowElement.classList.contains('is-focused'));
		if (focusedWindow) {
			focusedWindow.classList.add('is-closed');
			event.preventDefault();
		}
	}
});

const taskbarClock = document.querySelector('.xp-tray time');
function updateClock() {
	taskbarClock.textContent = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date());
}
updateClock();
window.setInterval(updateClock, 30000);
