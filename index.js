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
	['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'].forEach((direction) => {
		const resizeHandle = document.createElement('span');
		resizeHandle.className = `xp-resize-handle resize-${direction}`;
		resizeHandle.dataset.resizeDirection = direction;
		resizeHandle.setAttribute('aria-hidden', 'true');
		appWindow.append(resizeHandle);
	});

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

	appWindow.querySelectorAll('.xp-resize-handle').forEach((resizeHandle) => resizeHandle.addEventListener('pointerdown', (event) => {
		if (appWindow.classList.contains('is-maximized')) return;
		event.preventDefault();
		focusWindow(appWindow);
		const direction = resizeHandle.dataset.resizeDirection;
		const startX = event.clientX;
		const startY = event.clientY;
		const startLeft = appWindow.offsetLeft;
		const startTop = appWindow.offsetTop;
		const startWidth = appWindow.offsetWidth;
		const startHeight = appWindow.offsetHeight;
		const minWidth = window.innerWidth <= 720 ? 260 : 330;
		const minHeight = 150;
		const moveWindowSize = (moveEvent) => {
			const deltaX = moveEvent.clientX - startX;
			const deltaY = moveEvent.clientY - startY;
			const changesLeft = direction.includes('w');
			const changesTop = direction.includes('n');
			let nextLeft = startLeft;
			let nextTop = startTop;
			let nextWidth = startWidth;
			let nextHeight = startHeight;
			if (direction.includes('e')) nextWidth = Math.min(xpDesktop.clientWidth - startLeft - 10, startWidth + deltaX);
			if (changesLeft) {
				nextLeft = Math.max(0, Math.min(startLeft + startWidth - minWidth, startLeft + deltaX));
				nextWidth = startWidth + startLeft - nextLeft;
			}
			if (direction.includes('s')) nextHeight = Math.min(xpDesktop.clientHeight - startTop - 48, startHeight + deltaY);
			if (changesTop) {
				nextTop = Math.max(0, Math.min(startTop + startHeight - minHeight, startTop + deltaY));
				nextHeight = startHeight + startTop - nextTop;
			}
			appWindow.style.left = `${nextLeft}px`;
			appWindow.style.top = `${nextTop}px`;
			appWindow.style.width = `${Math.max(minWidth, nextWidth)}px`;
			appWindow.style.height = `${Math.max(minHeight, nextHeight)}px`;
		};
		const stopResizing = () => {
			appWindow.classList.remove('is-resizing');
			document.removeEventListener('pointermove', moveWindowSize);
			document.removeEventListener('pointerup', stopResizing);
		};
		appWindow.classList.add('is-resizing');
		document.addEventListener('pointermove', moveWindowSize);
		document.addEventListener('pointerup', stopResizing);
	}));
});

document.querySelectorAll('[data-task-window]').forEach((taskButton) => {
	taskButton.addEventListener('click', () => {
		const appWindow = document.getElementById(taskButton.dataset.taskWindow);
		if (!appWindow) return;
		if (appWindow.classList.contains('is-minimized')) showWindow(taskButton.dataset.taskWindow);
		else appWindow.classList.toggle('is-minimized');
	});
});

const chatForm = document.querySelector('.chat-form');
const chatInput = document.querySelector('#chat-input');
const chatMessages = document.querySelector('.chat-messages');
const chatPrompts = document.querySelectorAll('.chat-prompts button');

function getChatReply(message) {
	const question = message.toLowerCase();
	if (question.includes('skill') || question.includes('tech') || question.includes('stack')) {
		return 'Allen works across React, Next.js, Node.js, Express, PostgreSQL, Firebase, Supabase, Tailwind CSS, and Flutter. He also brings experience in testing, debugging, and UI/UX design.';
	}
	if (question.includes('project') || question.includes('work')) {
		return 'His featured projects include VeriFi-PH, an AI-assisted credibility checker that placed Top 5 at the CodeKada Hackathon, and SA/AN Commuter Guide, a route finder with the Navvia AI assistant.';
	}
	if (question.includes('experience') || question.includes('job') || question.includes('intern')) {
		return 'Allen is a Full Stack Developer at DevKada and previously worked as a Software Engineer and IT Support Intern at Viva International, supporting systems used by 4,000-5,000 employees and 500+ daily tickets.';
	}
	if (question.includes('contact') || question.includes('email') || question.includes('hire')) {
		return 'You can reach Allen at belanoallen@gmail.com or connect with him on LinkedIn at linkedin.com/in/allen-belano.';
	}
	return 'I can tell you about Allen\'s skills, projects, experience, or how to contact him. Try one of those topics.';
}

function addChatMessage(message, sender) {
	const messageElement = document.createElement('p');
	messageElement.className = `chat-message chat-message-${sender}`;
	messageElement.textContent = message;
	chatMessages.append(messageElement);
	chatMessages.scrollTop = chatMessages.scrollHeight;
	return messageElement;
}

function sendChatMessage(message) {
	const cleanMessage = message.trim();
	if (!cleanMessage || chatForm.classList.contains('is-typing')) return;
	addChatMessage(cleanMessage, 'user');
	chatInput.value = '';
	chatForm.classList.add('is-typing');
	chatInput.disabled = true;
	chatForm.querySelector('button').disabled = true;
	const typingMessage = addChatMessage('Allen is typing...', 'typing');
	window.setTimeout(() => {
		typingMessage.remove();
		addChatMessage(getChatReply(cleanMessage), 'bot');
		chatForm.classList.remove('is-typing');
		chatInput.disabled = false;
		chatForm.querySelector('button').disabled = false;
		chatInput.focus();
	}, 450);
}

chatForm.addEventListener('submit', (event) => {
	event.preventDefault();
	sendChatMessage(chatInput.value);
});

chatPrompts.forEach((prompt) => {
	prompt.addEventListener('click', () => sendChatMessage(prompt.textContent));
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
