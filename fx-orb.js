const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r160/three.min.js';
let loading = null;

function loadThree() {
	if (window.THREE) return Promise.resolve(window.THREE);
	if (!loading) {
		loading = new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = THREE_URL;
			script.async = true;
			script.onload = () => resolve(window.THREE);
			script.onerror = () => reject(new Error('three.js did not load'));
			document.head.append(script);
		});
	}
	return loading;
}

function themeColor(name, fallback) {
	return getComputedStyle(document.body).getPropertyValue(name).trim() || fallback;
}

export function createOrb(container) {
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const pointer = { x: 0, y: 0 };
	let THREE = null;
	let renderer = null;
	let scene = null;
	let camera = null;
	let core = null;
	let inner = null;
	let ring = null;
	let raf = 0;
	let running = false;
	let building = null;

	const colorize = () => {
		if (!core) return;
		core.material.color.set(themeColor('--pf-accent', '#7aa7ff'));
		inner.material.color.set(themeColor('--pf-accent-2', '#e9c46a'));
		ring.material.color.set(themeColor('--pf-accent', '#7aa7ff'));
	};

	const resize = () => {
		if (!renderer) return;
		const size = container.clientWidth || 1;
		renderer.setSize(size, size);
	};

	const onPointer = (event) => {
		pointer.x = event.clientX / window.innerWidth - 0.5;
		pointer.y = event.clientY / window.innerHeight - 0.5;
	};

	const frame = () => {
		if (!running) return;
		const group = scene.userData.group;
		group.rotation.y += 0.0014;
		group.rotation.x += (pointer.y * 0.3 - group.rotation.x) * 0.04;
		group.rotation.z += (pointer.x * 0.15 - group.rotation.z) * 0.04;
		renderer.render(scene, camera);
		raf = requestAnimationFrame(frame);
	};

	const build = async () => {
		THREE = await loadThree();
		const size = container.clientWidth || 1;
		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		renderer.setSize(size, size);
		container.append(renderer.domElement);

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
		camera.position.z = 5.4;

		core = new THREE.Mesh(
			new THREE.IcosahedronGeometry(1.25, 2),
			new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.42 }),
		);
		inner = new THREE.Mesh(
			new THREE.IcosahedronGeometry(0.78, 1),
			new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.3 }),
		);

		const count = 520;
		const positions = new Float32Array(count * 3);
		for (let i = 0; i < count; i += 1) {
			const angle = (i / count) * Math.PI * 2;
			const radius = 2.2 + (Math.random() - 0.5) * 0.14;
			positions[i * 3] = Math.cos(angle) * radius;
			positions[i * 3 + 1] = (Math.random() - 0.5) * 0.04;
			positions[i * 3 + 2] = Math.sin(angle) * radius;
		}
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		ring = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.022, transparent: true, opacity: 0.75 }));
		ring.rotation.x = 1.12;

		const group = new THREE.Group();
		group.add(core, inner, ring);
		scene.add(group);
		scene.userData.group = group;
		colorize();
		window.addEventListener('resize', resize);
	};

	return {
		async start() {
			if (running) return;
			running = true;
			if (!building) building = build().catch(() => { container.hidden = true; });
			await building;
			if (!running || !renderer) return;
			window.addEventListener('pointermove', onPointer, { passive: true });
			if (reduceMotion) renderer.render(scene, camera);
			else raf = requestAnimationFrame(frame);
		},
		stop() {
			running = false;
			cancelAnimationFrame(raf);
			window.removeEventListener('pointermove', onPointer);
		},
		recolor: colorize,
	};
}
