const ANSWERS = {
	stack: 'Frontend: React, Next.js, Tailwind CSS, Flutter. Backend: Node.js, Express, PostgreSQL, Firebase, Supabase. AI: OpenAI API and Cloudflare Workers AI.',
	work: 'I build and support enterprise systems. At Viva International I developed an employee Training System used by 4,000 to 5,000 people and a Ticketing System handling 500+ tickets a day.',
	projects: 'VeriFi-PH placed Top 5 of 105 projects at the CodeKada Hackathon 2026. SA/AN Commuter Guide is in development: a community route finder with transit alerts.',
	education: 'BS Information Technology at Rizal Technological University, current GWA 1.34 (Magna Cum Laude range).',
	contact: 'Email belanoallen@gmail.com, call +63 950 175 3538, or message me on LinkedIn at linkedin.com/in/allen-belano.',
};

export function initAsk() {
	const root = document.querySelector('[data-ask]');
	if (!root) return;
	const output = root.querySelector('[data-ask-output]');
	const buttons = root.querySelectorAll('button[data-answer]');
	buttons.forEach((button) => {
		button.addEventListener('click', () => {
			output.textContent = ANSWERS[button.dataset.answer];
			buttons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
		});
	});
}
