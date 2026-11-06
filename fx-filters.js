export function initFilters() {
	const bar = document.querySelector('[data-filter-bar]');
	if (!bar) return;
	const items = document.querySelectorAll('[data-tags]');
	const buttons = bar.querySelectorAll('button[data-filter]');

	const apply = (filter) => {
		buttons.forEach((button) => {
			button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
		});
		items.forEach((item) => {
			const tags = item.dataset.tags.split(' ');
			item.classList.toggle('is-filtered-out', filter !== 'all' && !tags.includes(filter));
		});
	};

	buttons.forEach((button) => {
		button.addEventListener('click', () => apply(button.dataset.filter));
	});
}
