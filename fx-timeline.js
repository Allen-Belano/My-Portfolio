export function initTimeline() {
	document.querySelectorAll('.pf-job').forEach((job, index) => {
		const meta = job.querySelector('.pf-job-meta');
		const details = job.querySelector('.pf-bullets');
		if (!meta || !details) return;

		const id = `pf-job-details-${index}`;
		details.id = id;
		const startOpen = index === 0;
		if (!startOpen) job.classList.add('is-collapsed');

		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'pf-job-toggle';
		button.setAttribute('aria-controls', id);
		button.setAttribute('aria-expanded', String(startOpen));
		button.textContent = startOpen ? 'Hide details' : 'Show details';
		button.addEventListener('click', () => {
			const collapsed = job.classList.toggle('is-collapsed');
			button.setAttribute('aria-expanded', String(!collapsed));
			button.textContent = collapsed ? 'Show details' : 'Hide details';
		});
		meta.append(button);
	});
}
