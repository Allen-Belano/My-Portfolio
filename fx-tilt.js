export function initTilt() {
	if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	document.querySelectorAll('.pf-card').forEach((card) => {
		card.addEventListener('pointermove', (event) => {
			const rect = card.getBoundingClientRect();
			const x = (event.clientX - rect.left) / rect.width - 0.5;
			const y = (event.clientY - rect.top) / rect.height - 0.5;
			card.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg)`;
		});
		card.addEventListener('pointerleave', () => {
			card.style.transform = '';
		});
	});
}
