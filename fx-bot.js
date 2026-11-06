const KNOWLEDGE = [
	{
		keys: ['stack', 'tech', 'language', 'framework', 'tools', 'tool', 'use'],
		answer: 'My core stack is React and Next.js on the frontend, Node.js and Express on the backend, and PostgreSQL, Firebase or Supabase for data. I also work with Flutter, Tailwind CSS, and AI APIs such as OpenAI and Cloudflare Workers AI.',
	},
	{
		keys: ['work', 'job', 'experience', 'company', 'viva', 'devkada', 'aws', 'intern', 'career'],
		answer: 'I am a Full Stack Developer at DevKada, a non-profit, where I lead frontend work on its website. Before that I was a Software Engineer and IT Support Intern at Viva International, where I built an employee Training System used by 4,000 to 5,000 people and a ticketing system handling 500+ tickets a day.',
	},
	{
		keys: ['project', 'verifi', 'commuter', 'built', 'portfolio', 'app', 'show'],
		answer: 'VeriFi-PH is a social post verification tool with AI credibility scoring. It placed Top 5 of 105 projects at the CodeKada Hackathon 2026. I am also building the SA/AN Commuter Guide, a community route finder with transit alerts.',
	},
	{
		keys: ['educat', 'school', 'university', 'study', 'degree', 'gwa', 'grade', 'rtu', 'college'],
		answer: 'I am studying BS Information Technology at Rizal Technological University, 2023 to 2027. My current GWA is 1.34, in the Magna Cum Laude range.',
	},
	{
		keys: ['contact', 'email', 'reach', 'phone', 'call', 'linkedin', 'hire', 'message'],
		answer: 'Email me at belanoallen@gmail.com, call +63 950 175 3538, or message me on LinkedIn at linkedin.com/in/allen-belano.',
	},
	{
		keys: ['available', 'availab', 'open to', 'freelance', 'opportunit', 'looking'],
		answer: 'I am open to talking about roles and projects. Email me the details and I will reply personally.',
	},
	{
		keys: ['who', 'about', 'yourself', 'introduce', 'you do'],
		answer: 'I am Allen, a full-stack developer from Rizal, Philippines. I build and test systems, and I care about interfaces that are reliable as well as pleasant to use.',
	},
	{
		keys: ['hi', 'hello', 'hey'],
		answer: 'Hi! Ask me about my work, projects, stack, or how to reach me.',
	},
];

const FALLBACK = "I don't have an answer for that yet. Email me at belanoallen@gmail.com and I'll get back to you.";
const GREETING = "Hi, I'm Allen's automated assistant. I answer from his portfolio, in his voice. Ask about my work, projects, stack or how to reach me.";

function answerFor(question) {
	const text = question.toLowerCase();
	let best = null;
	let bestScore = 0;
	for (const entry of KNOWLEDGE) {
		const score = entry.keys.reduce((total, key) => total + (text.includes(key) ? 1 : 0), 0);
		if (score > bestScore) {
			best = entry;
			bestScore = score;
		}
	}
	return best ? best.answer : FALLBACK;
}

export function initBot() {
	const root = document.querySelector('[data-bot]');
	if (!root) return;
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const probe = root.querySelector('.pf-probe');
	const panel = root.querySelector('.pf-bot-panel');
	const log = root.querySelector('.pf-bot-log');
	const form = root.querySelector('.pf-bot-form');
	const input = form.querySelector('input');
	const pupil = root.querySelector('.pf-pupil');
	const closeButton = root.querySelector('.pf-bot-close');
	let busy = false;

	const addMessage = (text, who) => {
		const line = document.createElement('p');
		line.className = `pf-msg pf-msg-${who}`;
		line.textContent = text;
		log.append(line);
		log.scrollTop = log.scrollHeight;
		return line;
	};

	const wiggle = () => {
		if (reduceMotion) return;
		root.classList.remove('is-wiggle');
		void root.offsetWidth;
		root.classList.add('is-wiggle');
	};

	const setOpen = (open) => {
		panel.hidden = !open;
		root.classList.toggle('is-open', open);
		probe.setAttribute('aria-expanded', String(open));
		probe.setAttribute('aria-label', open ? 'Close the assistant' : 'Open the assistant');
		wiggle();
		if (open) {
			if (!log.children.length) addMessage(GREETING, 'bot');
			input.focus();
		}
	};

	const ask = (question) => {
		if (busy) return;
		busy = true;
		addMessage(question, 'user');
		root.classList.add('is-thinking');
		const typing = addMessage('...', 'bot');
		typing.classList.add('pf-msg-typing');
		window.setTimeout(() => {
			typing.remove();
			addMessage(answerFor(question), 'bot');
			root.classList.remove('is-thinking');
			busy = false;
		}, reduceMotion ? 0 : 650 + Math.random() * 450);
	};

	probe.addEventListener('click', () => setOpen(panel.hidden));
	closeButton.addEventListener('click', () => {
		setOpen(false);
		probe.focus();
	});
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && !panel.hidden) {
			setOpen(false);
			probe.focus();
		}
	});
	root.querySelectorAll('[data-q]').forEach((chip) => {
		chip.addEventListener('click', () => ask(chip.dataset.q));
	});
	form.addEventListener('submit', (event) => {
		event.preventDefault();
		const question = input.value.trim();
		if (!question) return;
		input.value = '';
		ask(question);
	});

	/* The probe's eye follows the pointer, within its own small range. */
	window.addEventListener('pointermove', (event) => {
		if (reduceMotion || !pupil) return;
		const rect = probe.getBoundingClientRect();
		const dx = event.clientX - (rect.left + rect.width / 2);
		const dy = event.clientY - (rect.top + rect.height / 2);
		const distance = Math.hypot(dx, dy) || 1;
		const reach = (Math.min(distance, 320) / 320) * 3.2;
		pupil.setAttribute('transform', `translate(${((dx / distance) * reach).toFixed(2)} ${((dy / distance) * reach).toFixed(2)})`);
	}, { passive: true });

	const blink = () => {
		root.classList.add('is-blink');
		window.setTimeout(() => root.classList.remove('is-blink'), 150);
		window.setTimeout(blink, 2600 + Math.random() * 3200);
	};
	if (!reduceMotion) window.setTimeout(blink, 1400);
}
