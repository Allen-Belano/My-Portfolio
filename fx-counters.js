const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initCounters() {
	const counters = document.querySelectorAll('[data-count]');
	if (!counters.length || reduceMotion || !('IntersectionObserver' in window)) return;

	const run = (el) => {
		const target = Number(el.dataset.count);
		const suffix = el.dataset.suffix || '';
		const start = performance.now();
		const duration = 1600;
		const step = (now) => {
			const t = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - t, 3);
			el.textContent = `${Math.round(target * eased).toLocaleString('en-US')}${suffix}`;
			if (t < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	};

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;
			observer.unobserve(entry.target);
			run(entry.target);
		});
	}, { threshold: 0.6 });
	counters.forEach((el) => observer.observe(el));
}
