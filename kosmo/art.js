// Kosmo Gaea's drawing. The body, helmet, tail and empanada are Allen's design (kosmo-mascot.html),
// unchanged. Added on top: eye variants, brows, extra mouths, a tear, emote marks and the portal,
// so his face can show every mood. Local units: feet at y = 77, head to the left (negative x).

export const NS = 'http://www.w3.org/2000/svg';
const INK = '#1F2A55';

const legDefs = [
	[24, 48, '#DCE2EA'],
	[42, 46, '#DCE2EA'],
	[-24, 48, '#E8ECF2'],
	[-4, 50, '#E8ECF2'],
];
const legIds = [2, 3, 0, 1];
const legs = legDefs
	.map(
		([x, y, fill], i) =>
			`<g id="kl${legIds[i]}"><path d="M${x} ${y} L${x} 64 L${x + 16} 64 L${x + 16} ${y} Z" fill="${fill}"/>` +
			`<rect x="${x - 1}" y="60" width="18" height="5" rx="2" fill="#FF8A3D" stroke-width="2"/>` +
			`<path d="M${x - 3} 65 L${x + 19} 65 Q${x + 21} 76 ${x + 16} 77 L${x} 77 Q${x - 5} 76 ${x - 3} 65 Z" fill="#6B7A8C"/></g>`,
	)
	.join('');

export const empanada =
	'<path d="M-22 8 Q-23 -17 0 -17 Q23 -17 22 8 Q0 11 -22 8 Z" fill="#E9742A" stroke="#7A3210" stroke-width="2.2" stroke-linejoin="round"/>' +
	'<path d="M-18 4 Q-19 -13 0 -13 Q19 -13 18 4" fill="none" stroke="#F6B25E" stroke-width="2" stroke-dasharray="1.5 3.5" stroke-linecap="round"/>' +
	'<ellipse cx="-7" cy="-6" rx="4" ry="2.5" fill="#F4A04E"/><ellipse cx="6" cy="-2" rx="3" ry="2" fill="#F4A04E"/>' +
	'<circle cx="10" cy="-9" r="1.6" fill="#F8C27A"/><circle cx="-12" cy="2" r="1.4" fill="#F8C27A"/><circle cx="0" cy="-11" r="1.2" fill="#C9541A"/>';

// A spiral for a dizzy eye, centred on (cx, cy).
const spiral = (cx, cy) =>
	`M${cx} ${cy} m0 -1.5 a1.5 1.5 0 1 1 -1.5 1.5 a3 3 0 1 1 3 3 a4.5 4.5 0 1 1 -4.5 -4.5 a6 6 0 1 1 6 6`;

const face =
	// Eyes: whites, then the pupils in their own group so they can look around.
	'<g id="k-eyes"><ellipse cx="-36" cy="-14" rx="11" ry="13" fill="#fff"/><ellipse cx="-8" cy="-14" rx="11" ry="13" fill="#fff"/>' +
	'<g id="k-pupils"><ellipse cx="-34" cy="-11" rx="8" ry="10" fill="#2E2A6E" stroke="none"/><ellipse cx="-6" cy="-11" rx="8" ry="10" fill="#2E2A6E" stroke="none"/>' +
	'<circle cx="-31" cy="-16" r="3" fill="#fff" stroke="none"/><circle cx="-3" cy="-16" r="3" fill="#fff" stroke="none"/></g></g>' +
	`<g id="k-eyes-happy" style="display:none" fill="none" stroke="${INK}" stroke-width="3.4"><path d="M-46 -11 Q-36 -24 -26 -11"/><path d="M-18 -11 Q-8 -24 2 -11"/></g>` +
	`<g id="k-eyes-shut" style="display:none" fill="none" stroke="${INK}" stroke-width="3.2"><path d="M-46 -14 Q-36 -8 -26 -14"/><path d="M-18 -14 Q-8 -8 2 -14"/></g>` +
	`<g id="k-eyes-dizzy" style="display:none"><ellipse cx="-36" cy="-14" rx="11" ry="13" fill="#fff"/><ellipse cx="-8" cy="-14" rx="11" ry="13" fill="#fff"/>` +
	`<path d="${spiral(-36, -14)}" fill="none" stroke="#2E2A6E" stroke-width="2.2"/><path d="${spiral(-8, -14)}" fill="none" stroke="#2E2A6E" stroke-width="2.2"/></g>` +
	`<g id="k-brows" style="display:none" fill="none" stroke="${INK}" stroke-width="3.4"><path id="k-brow-l" d="M-45 -33 L-27 -33"/><path id="k-brow-r" d="M-17 -33 L1 -33"/></g>` +
	'<path d="M-38 4 Q-38 22 -22 22 Q-6 22 -6 4 Q-14 0 -22 0 Q-30 0 -38 4 Z" fill="#FBF8F3"/>' +
	`<ellipse cx="-22" cy="4" rx="6.5" ry="4.5" fill="${INK}"/><circle cx="-24" cy="2.5" r="1.5" fill="#fff" stroke="none"/>` +
	// Mouths: Allen's closed smile and open mouth, plus a frown, a flat line, a wobble and a grin.
	'<g id="k-mc"><path d="M-29 11 Q-22 15 -15 11" fill="none" stroke-width="2.2"/><path d="M-27 13 Q-27 24 -22 24 Q-17 24 -17 13 Z" fill="#FF7FA3" stroke-width="2.2"/></g>' +
	'<g id="k-mo" style="display:none"><ellipse cx="-22" cy="15" rx="7.5" ry="7" fill="#3A1A28" stroke-width="2.2"/><path d="M-27 18 Q-22 14 -17 18 Q-17 21 -22 21 Q-27 21 -27 18 Z" fill="#FF7FA3" stroke="none"/></g>' +
	'<path id="k-mfrown" style="display:none" d="M-29 17 Q-22 10 -15 17" fill="none" stroke-width="2.4"/>' +
	'<path id="k-mflat" style="display:none" d="M-28 14 L-16 14" fill="none" stroke-width="2.4"/>' +
	'<path id="k-mwavy" style="display:none" d="M-31 14 Q-28 10 -25 14 T-19 14 T-13 14" fill="none" stroke-width="2.2"/>' +
	'<g id="k-mgrin" style="display:none"><path d="M-31 10 Q-22 26 -13 10 Z" fill="#3A1A28" stroke-width="2.2"/><path d="M-26 17 Q-22 14 -18 17 Q-19 20 -22 20 Q-25 20 -26 17 Z" fill="#FF7FA3" stroke="none"/></g>' +
	'<g id="k-blush" opacity="0.7"><ellipse cx="-50" cy="6" rx="5" ry="3" fill="#FF9FB8" stroke="none"/><ellipse cx="6" cy="6" rx="5" ry="3" fill="#FF9FB8" stroke="none"/></g>' +
	'<path id="k-tear" style="display:none" d="M-46 -2 Q-50 6 -46 9 Q-42 6 -46 -2 Z" fill="#7DE3F0" stroke-width="1.6"/>';

export const kosmo =
	'<g id="k-kosmo" class="k-hit">' +
	// A generous invisible hit area, so he is easy to grab.
	'<rect x="-86" y="-100" width="160" height="182" fill="transparent" stroke="none"/>' +
	`<g id="k-bob" stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">` +
	'<rect x="12" y="-16" width="40" height="32" rx="6" fill="#C7D0DB"/><rect x="18" y="-11" width="12" height="8" rx="2" fill="#7DE3F0" stroke-width="2"/><circle cx="42" cy="-7" r="3" fill="#FF8A3D" stroke-width="2"/>' +
	legs +
	'<path d="M-26 34 Q-30 14 -6 12 Q18 6 40 12 Q66 16 64 38 Q66 62 40 62 L-4 62 Q-30 62 -26 34 Z" fill="#E8ECF2"/>' +
	'<path d="M8 12 Q6 36 10 62 M40 12 Q44 36 40 62" fill="none" stroke="#9FB0C2" stroke-width="1.6"/>' +
	'<path d="M-27 46 Q20 52 64 46 L64 53 Q20 59 -26 53 Z" fill="#FF8A3D" stroke-width="2.2"/>' +
	'<rect x="26" y="44" width="12" height="13" rx="2" fill="#B0805A" stroke-width="2"/><path d="M26 48 L38 48" fill="none" stroke-width="1.6"/><rect x="11" y="49" width="7" height="6" rx="1" fill="#FFD84D" stroke-width="1.8"/>' +
	'<rect x="-6" y="24" width="22" height="15" rx="3" fill="#3A4A5E"/><circle cx="0" cy="29" r="2" fill="#FF6B6B" stroke="none"/><circle cx="6" cy="29" r="2" fill="#9BE36C" stroke="none"/><circle cx="12" cy="29" r="2" fill="#FFD84D" stroke="none"/><rect x="-2" y="33" width="14" height="3" rx="1" fill="#7DE3F0" stroke="none"/>' +
	'<circle cx="50" cy="28" r="9" fill="#2E2A6E"/><circle cx="48" cy="30" r="4.5" fill="#FF8A3D" stroke-width="1.6"/><path d="M42 31 Q50 25 58 29" fill="none" stroke="#FFD84D" stroke-width="1.6"/>' +
	'<path d="M62 22 Q68 28 62 34" fill="#C7D0DB" stroke-width="2.4"/>' +
	'<g id="k-ears"><path d="M-48 -38 Q-66 -66 -56 -78 Q-46 -82 -40 -70 Q-36 -58 -36 -46" fill="#C98A4B"/><path d="M-8 -46 Q-8 -58 -4 -70 Q2 -82 12 -78 Q22 -66 4 -38" fill="#C98A4B"/>' +
	'<path d="M-54 -72 Q-50 -62 -48 -50 M2 -72 Q0 -62 -2 -50" fill="none" stroke="#F1E4D0" stroke-width="2"/></g>' +
	'<ellipse cx="-22" cy="22" rx="30" ry="8" fill="#9FB0C2"/>' +
	'<path d="M-62 -10 Q-64 -52 -22 -52 Q20 -52 18 -10 Q20 28 -22 28 Q-64 28 -62 -10 Z" fill="#FBF8F3"/>' +
	'<path d="M-60 -20 Q-58 -46 -34 -48 Q-26 -40 -26 -26 Q-26 -6 -38 0 Q-52 4 -62 -6 Z" fill="#C98A4B" stroke="none"/><path d="M16 -20 Q14 -46 -10 -48 Q-18 -40 -18 -26 Q-18 -6 -6 0 Q8 4 16 -6 Z" fill="#C98A4B" stroke="none"/>' +
	'<path d="M-62 -10 Q-64 -52 -22 -52 Q20 -52 18 -10 Q20 28 -22 28 Q-64 28 -62 -10 Z" fill="none"/>' +
	'<path d="M-26 -52 Q-30 -62 -22 -66 Q-14 -62 -18 -52" fill="#FBF8F3"/><path d="M-27 -60 L-22 -56 L-17 -60 L-19 -54 L-25 -54 Z" fill="#FFD84D" stroke-width="1.6"/>' +
	face +
	'<path d="M-50 32 A30 8 0 0 0 6 32" fill="none" stroke="#FF8A3D" stroke-width="4"/>' +
	'<path d="M-22 40 L-22 46" fill="none" stroke-width="1.6"/><path d="M-27 46 L-17 46 L-17 53 Q-22 57 -27 53 Z" fill="#FFD84D" stroke-width="1.8"/>' +
	'<path d="M-78.7 -6 A58 58 0 0 0 34.7 -6" fill="none"/><path d="M-80 -6 L-77 -6 M33 -6 L36 -6" fill="none" stroke="#FF8A3D" stroke-width="4"/>' +
	'<g id="k-lid"><path d="M-78.7 -6 A58 58 0 1 1 34.7 -6 Z" fill="#DFF6FF" fill-opacity="0.14" stroke="none"/><path d="M-78.7 -6 A58 58 0 1 1 34.7 -6" fill="none"/><path d="M-62 -46 Q-52 -66 -32 -72" fill="none" stroke="#BFD3E6" stroke-width="3.5"/><path d="M-22 -76 L-22 -86" fill="none"/><circle cx="-22" cy="-90" r="4.5" fill="#FF6B6B"/><circle cx="34.7" cy="-6" r="3" fill="#C7D0DB" stroke-width="2"/></g>' +
	'</g></g>';

// Marks that float above his head. They are drawn unmirrored, outside his flipped body.
const emotes =
	'<g id="k-emote">' +
	'<g id="k-e-vein" style="display:none" fill="none" stroke="#E5484D" stroke-width="3" stroke-linecap="round"><path d="M-9 -3 Q-4 -4 -3 -9 M3 -9 Q4 -4 9 -3 M9 3 Q4 4 3 9 M-3 9 Q-4 4 -9 3"/></g>' +
	`<g id="k-e-sweat" style="display:none"><path d="M0 -10 Q-7 2 0 6 Q7 2 0 -10 Z" fill="#7DE3F0" stroke="${INK}" stroke-width="1.8"/></g>` +
	`<g id="k-e-zzz" style="display:none" fill="${INK}"><text x="-6" y="4" style="font:700 15px system-ui,sans-serif">z</text><text x="4" y="-8" style="font:700 11px system-ui,sans-serif">z</text></g>` +
	`<g id="k-e-bang" style="display:none"><text x="0" y="6" text-anchor="middle" fill="#E5484D" style="font:800 22px system-ui,sans-serif">!</text></g>` +
	`<g id="k-e-q" style="display:none"><text x="0" y="6" text-anchor="middle" fill="${INK}" style="font:800 20px system-ui,sans-serif">?</text></g>` +
	`<g id="k-e-note" style="display:none" fill="${INK}"><path d="M-2 6 L-2 -10 L8 -12 L8 3" fill="none" stroke="${INK}" stroke-width="2"/><ellipse cx="-5" cy="6" rx="4" ry="3"/><ellipse cx="5" cy="3" rx="4" ry="3"/></g>` +
	'<g id="k-e-stars" style="display:none" fill="#FFD84D" stroke="#1F2A55" stroke-width="1.4"></g>' +
	'</g>';

export const portal =
	'<g id="k-portal" style="display:none">' +
	'<ellipse rx="50" ry="66" fill="url(#kosmo-portal-g)" stroke="#6CCFD6" stroke-width="3"/>' +
	'<ellipse id="k-portal-r1" rx="40" ry="54" fill="none" stroke="#B9A7FF" stroke-width="2.5" stroke-dasharray="14 10"/>' +
	'<ellipse id="k-portal-r2" rx="26" ry="36" fill="none" stroke="#7DE3F0" stroke-width="2" stroke-dasharray="6 9"/>' +
	'<circle r="5" fill="#E9FBFF"/>' +
	'</g>';

export const stageSvg =
	`<svg id="k-svg" xmlns="${NS}">` +
	'<defs><radialGradient id="kosmo-portal-g"><stop offset="0" stop-color="#E9FBFF"/><stop offset="0.35" stop-color="#6C5CE7"/><stop offset="1" stop-color="#1F2A55"/></radialGradient>' +
	'<g id="k-bite-defs"></g></defs>' +
	portal +
	'<ellipse id="k-shadow" rx="56" ry="6" fill="#000" opacity="0.13"/>' +
	'<g id="k-foods"></g>' +
	kosmo +
	`<path id="k-t1" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>` +
	'<path id="k-t2" fill="none" stroke="#6CCFD6" stroke-width="7" stroke-linecap="round"/>' +
	'<path id="k-t3" fill="none" stroke="#3BA9B8" stroke-width="7" stroke-dasharray="3 11"/>' +
	`<g id="k-tip"><g id="k-p1"><path d="M3 0 Q11 -5 18 -1" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/></g>` +
	`<g id="k-p2"><path d="M3 0 Q11 5 18 1" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/></g>` +
	`<circle r="7.5" fill="#6CCFD6" stroke="${INK}" stroke-width="2.6"/><circle r="3" fill="#E9FBFF"/></g>` +
	'<g id="k-held-food"></g>' +
	'<g id="k-fx"></g>' +
	emotes +
	`<g id="k-bub" opacity="0"><rect id="k-bub-r" y="-28" height="26" rx="13" fill="#fff" stroke="${INK}" stroke-width="2"/>` +
	`<path id="k-bub-tl" d="M-6 -3 L0 7 L6 -3" fill="#fff" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>` +
	`<text id="k-bub-t" x="0" y="-10.5" text-anchor="middle" fill="${INK}" style="font:600 13px system-ui,-apple-system,Segoe UI,Roboto,sans-serif"></text></g>` +
	'</svg>';
