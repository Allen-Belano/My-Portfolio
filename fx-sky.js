export function createSky(canvas) {
	const ctx = canvas.getContext('2d');
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	let width = 0;
	let height = 0;
	let stars = [];
	let raf = 0;
	let running = false;

	const seed = () => {
		const count = Math.min(Math.round((width * height) / 7000), 340);
		stars = Array.from({ length: count }, () => ({
			x: Math.random() * width,
			y: Math.random() * height,
			r: Math.random() * 0.9 + 0.3,
			depth: Math.random() * 0.7 + 0.3,
			phase: Math.random() * Math.PI * 2,
		}));
	};

	const draw = (time) => {
		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = '#dfe7f5';
		for (const star of stars) {
			const twinkle = 0.55 + 0.45 * Math.sin(time * 0.0012 + star.phase);
			ctx.globalAlpha = Math.min(1, star.depth * twinkle);
			ctx.beginPath();
			ctx.arc(star.x, star.y, star.r * star.depth + 0.2, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.globalAlpha = 1;
	};

	const resize = () => {
		width = canvas.clientWidth;
		height = canvas.clientHeight;
		canvas.width = Math.round(width * dpr);
		canvas.height = Math.round(height * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		seed();
		draw(0);
	};

	const tick = (time) => {
		if (!running) return;
		for (const star of stars) {
			star.y += star.depth * 0.08;
			if (star.y > height) {
				star.y = 0;
				star.x = Math.random() * width;
			}
		}
		draw(time);
		raf = requestAnimationFrame(tick);
	};

	const onResize = () => {
		if (running) resize();
	};

	return {
		start() {
			if (running) return;
			running = true;
			resize();
			window.addEventListener('resize', onResize);
			if (!reduceMotion) raf = requestAnimationFrame(tick);
		},
		stop() {
			running = false;
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', onResize);
		},
	};
}
