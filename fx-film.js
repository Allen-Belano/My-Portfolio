import { splitWords } from './fx-reveal.js';
import { decodeLabel } from './fx-decode.js';

// The film runs on desktop with reduced motion off. Everywhere else the page scrolls as written.
export const filmQuery = window.matchMedia('(min-width: 860px) and (prefers-reduced-motion: no-preference)');

const SCROLL_PER_SCENE = 1.3; // screens of scroll each scene gets, the same for every scene
const IRIS = 0.18; // share of a scene spent on the cut out of it
// Groups that slide in during a scene's entrance. Project cards only fade in, since their tilt owns their transform.
const SLIDE = '.pf-stats > div, .pf-skills > div, .pf-edu > div, .pf-certs li, .pf-actions > a, .pf-filters button';

// Plays the portfolio as a film: one fixed stage, each stage a full-screen scene. Scroll scrubs a single
// timeline, one unit per scene: the scene's entrance plays in its first third, it rests, and an iris grows
// out of its heading to cut to the next. Scrolling back plays it all in reverse. Scenes taller than the screen
// are scaled to fit, and only the scene on screen can be reached with Tab (the others are hidden).
// Returns null when the film does not run; otherwise refresh(), positionOf(index) for the jump nav, and current.
export function initFilm({ onScene } = {}) {
	const gsap = window.gsap;
	const ScrollTrigger = window.ScrollTrigger;
	const main = document.querySelector('.pf-main');
	if (!gsap || !ScrollTrigger || !main || !filmQuery.matches) return null;
	gsap.registerPlugin(ScrollTrigger);

	// The highlight numbers join the About scene.
	const about = main.querySelector('#pf-about');
	const stats = main.querySelector('.pf-stats');
	if (about && stats) about.append(stats);

	const scenes = [...main.querySelectorAll(':scope > [data-stage]')];
	if (!scenes.length) return null;
	main.classList.add('is-film');
	scenes.forEach((scene) => scene.classList.add('pf-scene'));
	gsap.set(scenes.slice(1), { autoAlpha: 0 });

	const timeline = gsap.timeline({ defaults: { ease: 'none' } });
	const irises = [];

	// How far the Projects row runs past the scene's content box.
	const overflowOf = (scene, track) => {
		const style = getComputedStyle(scene);
		const visible = scene.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
		return Math.max(0, track.scrollWidth - visible);
	};

	const addEntrance = (scene, at) => {
		const heading = scene.querySelector('h2');
		if (heading) timeline.from(splitWords(heading), { yPercent: 110, duration: 0.16, stagger: 0.03, ease: 'power3.out' }, at + 0.04);

		const talk = scene.querySelector('.pf-talk');
		if (talk) timeline.from(talk, { scale: 0.85, autoAlpha: 0, duration: 0.14, ease: 'power3.out' }, at + 0.06);

		const slides = scene.querySelectorAll(SLIDE);
		if (slides.length) timeline.from(slides, { y: 26, autoAlpha: 0, duration: 0.14, stagger: 0.02, ease: 'power2.out' }, at + 0.1);

		const cards = scene.querySelectorAll('.pf-card');
		if (cards.length) timeline.from(cards, { autoAlpha: 0, duration: 0.12, stagger: 0.04 }, at + 0.1);

		// Experience: the line draws down and each role lights up in turn.
		const line = scene.querySelector('.pf-timeline-line');
		if (line) {
			timeline.fromTo(line, { scaleY: 0 }, { scaleY: 1, duration: 0.5 }, at + 0.08);
			timeline.fromTo(scene.querySelectorAll('.pf-job'), { opacity: 0.25 }, { opacity: 1, duration: 0.08, stagger: 0.16 }, at + 0.1);
		}

		// About: the bio lights up word by word.
		const bio = scene.id === 'pf-about' ? scene.querySelector('p:not(.pf-eyebrow)') : null;
		if (bio) {
			const words = splitWords(bio);
			timeline.fromTo(words, { opacity: 0.18 }, { opacity: 1, duration: 0.04, stagger: 0.45 / words.length }, at + 0.08);
		}

		// Projects: the row of cards slides sideways while the scene rests.
		const track = scene.dataset.pin === 'x' ? scene.querySelector('.pf-projects') : null;
		if (track) timeline.fromTo(track, { x: 0 }, { x: () => -overflowOf(scene, track), duration: 0.5 }, at + 0.25);
	};

	const addNumeral = (scene, at) => {
		const numeral = document.createElement('span');
		numeral.className = 'pf-numeral';
		numeral.setAttribute('aria-hidden', 'true');
		numeral.textContent = scene.dataset.stage.padStart(2, '0');
		scene.append(numeral);
		timeline.fromTo(numeral, { y: 60 }, { y: -60, duration: 1 }, at);
	};

	const addIris = (scene, at) => {
		const iris = document.createElement('i');
		iris.className = 'pf-iris';
		iris.setAttribute('aria-hidden', 'true');
		main.append(iris);
		irises.push({ iris, host: scene.querySelector('h2, h1') || scene });
		timeline.fromTo(iris, { scale: 0, opacity: 1 }, { scale: 1, duration: IRIS, ease: 'power3.in' }, at + 1 - IRIS);
		timeline.set(scene, { autoAlpha: 0 }, at + 1);
		timeline.to(iris, { opacity: 0, duration: 0.12, ease: 'power1.out' }, at + 1);
	};

	scenes.forEach((scene, i) => {
		if (i > 0) {
			timeline.set(scene, { autoAlpha: 1 }, i);
			addEntrance(scene, i);
			addNumeral(scene, i);
		}
		if (i < scenes.length - 1) addIris(scene, i);
	});
	timeline.set({}, {}, scenes.length);

	// A scene taller than the screen is scaled down to fit it.
	const fit = () => {
		for (const scene of scenes) {
			scene.style.transform = '';
			const scale = Math.min(1, scene.clientHeight / scene.scrollHeight);
			if (scale < 1) scene.style.transform = `scale(${scale.toFixed(3)})`;
		}
	};

	// Each iris is centred on its scene's heading and large enough to cover the screen from there.
	const placeIrises = () => {
		const box = main.getBoundingClientRect();
		const radius = Math.hypot(window.innerWidth, window.innerHeight);
		for (const { iris, host } of irises) {
			const rect = host.getBoundingClientRect();
			const x = rect.left + rect.width / 2 - box.left;
			const y = rect.top + rect.height / 2 - box.top;
			Object.assign(iris.style, {
				left: `${x - radius}px`,
				top: `${y - radius}px`,
				width: `${radius * 2}px`,
				height: `${radius * 2}px`,
			});
		}
	};

	const progress = document.querySelector('[data-progress]');
	let current = -1;
	const showScene = (index) => {
		current = index;
		const label = scenes[index].querySelector('.pf-eyebrow[aria-hidden="true"]');
		decodeLabel(label);
		if (progress && label) {
			const [number, name] = (label.dataset.text || label.textContent).trim().split(' / ');
			progress.querySelector('.pf-progress-num').textContent = `${number} /`;
			progress.querySelector('.pf-progress-label').textContent = name;
			progress.hidden = false;
		}
		onScene?.(index);
	};

	const trigger = ScrollTrigger.create({
		trigger: main,
		start: 'top top',
		end: () => `+=${Math.round(scenes.length * window.innerHeight * SCROLL_PER_SCENE)}`,
		pin: true,
		scrub: true,
		animation: timeline,
		invalidateOnRefresh: true,
		onRefresh: () => {
			fit();
			placeIrises();
		},
		onUpdate: (self) => {
			const index = Math.min(scenes.length - 1, Math.floor(self.progress * scenes.length));
			if (index !== current) showScene(index);
		},
	});
	showScene(0);

	window.addEventListener('load', () => ScrollTrigger.refresh());

	return {
		refresh: () => ScrollTrigger.refresh(),
		// The scroll position of a scene's resting frame: the top for the landing, otherwise just past its entrance.
		positionOf: (index) => {
			if (index <= 0) return trigger.start;
			return trigger.start + ((index + 0.55) / scenes.length) * (trigger.end - trigger.start);
		},
		get current() {
			return current;
		},
	};
}
