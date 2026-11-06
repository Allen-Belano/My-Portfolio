const HELP = 'Commands: about, skills, projects, contact, help, clear, exit';
const RESPONSES = {
	about: 'Allen Joshua O. Belano. Full-stack developer based in Rizal, Philippines.',
	skills: 'React, Next.js, Node.js, Express, PostgreSQL, Firebase, Supabase, Flutter, Python, Java.',
	projects: 'VeriFi-PH (Top 5, CodeKada Hackathon 2026) and SA/AN Commuter Guide (in development).',
	contact: 'belanoallen@gmail.com | +63 950 175 3538 | linkedin.com/in/allen-belano',
};

export function initTerminal() {
	const panel = document.createElement('div');
	panel.className = 'pf-term';
	panel.hidden = true;
	panel.innerHTML = `
		<div class="pf-term-bar"><span>allen@portfolio ~</span><button type="button" class="pf-term-close" aria-label="Close terminal">&times;</button></div>
		<div class="pf-term-log" aria-live="polite"></div>
		<form class="pf-term-form"><span aria-hidden="true">&gt;</span><input type="text" aria-label="Terminal command" autocomplete="off" spellcheck="false" /></form>`;
	document.body.append(panel);

	const log = panel.querySelector('.pf-term-log');
	const input = panel.querySelector('input');
	const write = (text) => {
		const line = document.createElement('p');
		line.textContent = text;
		log.append(line);
		log.scrollTop = log.scrollHeight;
	};
	const open = () => {
		panel.hidden = false;
		if (!log.children.length) write(HELP);
		input.focus();
	};
	const close = () => {
		panel.hidden = true;
	};

	document.addEventListener('keydown', (event) => {
		if (document.body.dataset.theme !== 'portfolio') return;
		const typing = event.target.closest?.('input, textarea, select, [contenteditable]');
		if (event.key === '/' && !typing && panel.hidden) {
			event.preventDefault();
			open();
		}
		if (event.key === 'Escape' && !panel.hidden) close();
	});
	panel.querySelector('.pf-term-close').addEventListener('click', close);
	panel.querySelector('form').addEventListener('submit', (event) => {
		event.preventDefault();
		const command = input.value.trim().toLowerCase();
		input.value = '';
		write(`> ${command}`);
		if (command === 'clear') log.textContent = '';
		else if (command === 'exit') close();
		else if (command === '' || command === 'help') write(HELP);
		else write(RESPONSES[command] || `command not found: ${command}. Try help.`);
	});
}
