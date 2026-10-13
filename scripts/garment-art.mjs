// Generates the placeholder product artwork used by the seed data.
// Run: node scripts/garment-art.mjs  (writes SVGs to public/products and public/brand)
// Replace these with real photography from the admin dashboard at any time.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "products");
const BRAND = join(process.cwd(), "public", "brand");
mkdirSync(OUT, { recursive: true });
mkdirSync(BRAND, { recursive: true });

// ---------- colour helpers ----------
const hex = (h) => h.replace("#", "").match(/.{2}/g).map((x) => parseInt(x, 16));
const toHex = (rgb) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));
const lum = (h) => {
  const [r, g, b] = hex(h);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};
function palette(base) {
  const darkBase = lum(base) < 0.25;
  return {
    base,
    light: darkBase ? mix(base, "#ffffff", 0.14) : mix(base, "#ffffff", 0.22),
    dark: darkBase ? mix(base, "#ffffff", 0.08) : mix(base, "#000000", 0.16),
    darker: darkBase ? mix(base, "#000000", 0.45) : mix(base, "#000000", 0.32),
    seam: darkBase ? mix(base, "#ffffff", 0.22) : mix(base, "#000000", 0.28),
  };
}

const mirror = (inner) => `<g transform="translate(600 0) scale(-1 1)">${inner}</g>`;
const shade = (d) => `<path d="${d}" fill="url(#sh)"/>`;
const piece = (d, c) => `<path d="${d}" fill="${c}"/>${shade(d)}`;
const seam = (d, c, w = 2.5, o = 0.55) =>
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${o}"/>`;
const ribs = (x1, x2, y1, y2, step, c) => {
  let s = "";
  for (let x = x1 + step; x < x2; x += step) s += `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${c}" stroke-width="1.5" opacity=".35"/>`;
  return s;
};
const hanger = `<path d="M300 196 L300 168 C300 150 320 148 320 130 C320 114 302 110 294 122" fill="none" stroke="#2b2b2b" stroke-width="5" stroke-linecap="round"/>`;

// ---------- garments (600 x 750 canvas) ----------
const G = {
  hoodie(c) {
    const sleeve = "M192 252 C160 262 140 300 132 360 L114 566 L172 572 L190 392 Z";
    const body = "M192 250 C214 234 240 224 258 222 L342 222 C360 224 386 234 408 250 L412 400 L410 600 L190 600 L188 400 Z";
    return {
      ground: 650,
      svg: `
      ${piece("M238 232 C222 176 252 128 300 126 C348 128 378 176 362 232 Z", c.base)}
      ${piece(sleeve, c.base)}${mirror(piece(sleeve, c.base))}
      <path d="M114 562 L172 568 L169 608 L112 602 Z" fill="${c.dark}"/>${mirror(`<path d="M114 562 L172 568 L169 608 L112 602 Z" fill="${c.dark}"/>`)}
      ${piece(body, c.base)}
      <path d="M190 596 L410 596 L410 638 Q300 646 190 638 Z" fill="${c.dark}"/>${ribs(190, 410, 600, 640, 9, c.darker)}
      <path d="M258 226 C256 186 276 160 300 160 C324 160 344 186 342 226 C328 240 272 240 258 226 Z" fill="${c.darker}"/>
      ${seam("M250 230 C246 184 270 150 300 150 C330 150 354 184 350 230", c.seam, 5, 0.45)}
      ${seam("M192 252 L190 392", c.seam)}${seam("M408 252 L410 392", c.seam)}
      ${seam("M132 360 C150 380 160 420 156 470", c.seam, 2, 0.25)}${seam("M468 360 C450 380 440 420 444 470", c.seam, 2, 0.25)}
      <path d="M226 470 L374 470 L392 566 L208 566 Z" fill="#000" opacity=".05"/>
      ${seam("M226 470 L374 470 L392 566 L208 566 Z", c.seam, 2.5, 0.6)}
      ${seam("M284 236 C283 270 281 300 280 332", c.light, 5, 0.95)}${seam("M316 236 C317 270 319 300 320 332", c.light, 5, 0.95)}
      <rect x="276" y="330" width="8" height="18" rx="3" fill="${c.darker}"/><rect x="316" y="330" width="8" height="18" rx="3" fill="${c.darker}"/>`,
    };
  },
  tee(c) {
    const sleeve = "M206 222 C176 236 150 262 126 302 L170 346 C184 332 194 320 202 308 Z";
    const body = "M206 222 C228 212 252 206 266 204 C276 226 324 226 334 204 C348 206 372 212 394 222 L404 620 Q300 630 196 620 Z";
    return {
      ground: 640,
      svg: `
      ${piece(sleeve, c.base)}${mirror(piece(sleeve, c.base))}
      ${piece(body, c.base)}
      <path d="M266 204 C276 226 324 226 334 204 L344 207 C332 240 268 240 256 207 Z" fill="${c.dark}"/>
      ${seam("M134 294 L177 338", c.seam, 2.5, 0.5)}${mirror(seam("M134 294 L177 338", c.seam, 2.5, 0.5))}
      ${seam("M198 604 Q300 614 402 604", c.seam, 2.5, 0.5)}
      ${seam("M206 222 L202 308", c.seam, 2, 0.35)}${seam("M394 222 L398 308", c.seam, 2, 0.35)}
      ${seam("M240 330 C250 420 246 520 236 600", c.seam, 2, 0.15)}${seam("M362 330 C352 420 356 520 366 600", c.seam, 2, 0.15)}`,
    };
  },
  crewneck(c) {
    const sleeve = "M196 242 C162 252 142 292 134 352 L116 566 L174 572 L192 392 Z";
    const body = "M196 240 C222 226 252 218 266 216 C276 238 324 238 334 216 C348 218 378 226 404 240 L410 400 L408 600 L192 600 L190 400 Z";
    return {
      ground: 650,
      svg: `
      ${piece(sleeve, c.base)}${mirror(piece(sleeve, c.base))}
      <path d="M116 562 L174 568 L171 608 L114 602 Z" fill="${c.dark}"/>${mirror(`<path d="M116 562 L174 568 L171 608 L114 602 Z" fill="${c.dark}"/>`)}
      ${piece(body, c.base)}
      <path d="M266 216 C276 238 324 238 334 216 L346 220 C334 256 266 256 254 220 Z" fill="${c.dark}"/>
      <path d="M192 596 L408 596 L408 638 Q300 646 192 638 Z" fill="${c.dark}"/>${ribs(192, 408, 600, 640, 9, c.darker)}
      ${seam("M196 242 L192 392", c.seam)}${seam("M404 242 L408 392", c.seam)}
      ${seam("M290 258 L300 276 L310 258", c.seam, 2, 0.35)}
      ${seam("M134 352 C150 380 160 420 156 470", c.seam, 2, 0.22)}${seam("M466 352 C450 380 440 420 444 470", c.seam, 2, 0.22)}`,
    };
  },
  shirt(c) {
    const sleeve = "M202 216 C172 226 156 262 148 322 L128 578 L182 584 L196 402 Z";
    const body = "M202 214 C228 204 252 198 270 196 L330 196 C348 198 372 204 398 214 L406 420 L404 630 C380 642 340 628 300 642 C260 628 220 642 196 630 L194 420 Z";
    const btns = [254, 314, 374, 434, 494, 554].map((y) => `<circle cx="300" cy="${y}" r="5" fill="${c.darker}" opacity=".8"/>`).join("");
    return {
      ground: 660,
      svg: `${hanger}
      ${piece(sleeve, c.base)}${mirror(piece(sleeve, c.base))}
      <path d="M128 574 L182 580 L179 618 L126 612 Z" fill="${c.dark}"/>${mirror(`<path d="M128 574 L182 580 L179 618 L126 612 Z" fill="${c.dark}"/>`)}
      ${piece(body, c.base)}
      <path d="M268 190 C282 182 318 182 332 190 L332 202 L268 202 Z" fill="${c.dark}"/>
      <path d="M270 196 L300 216 L278 254 L250 206 Z" fill="${c.light}"/>${seam("M270 196 L300 216 L278 254 L250 206 Z", c.seam, 2, 0.5)}
      ${mirror(`<path d="M270 196 L300 216 L278 254 L250 206 Z" fill="${c.light}"/>${seam("M270 196 L300 216 L278 254 L250 206 Z", c.seam, 2, 0.5)}`)}
      ${seam("M292 222 L292 640", c.seam, 2, 0.45)}${seam("M308 222 L308 640", c.seam, 2, 0.45)}${btns}
      ${seam("M226 292 L274 292 L274 346 L250 354 L226 346 Z", c.seam, 2, 0.55)}
      ${seam("M202 236 Q300 250 398 236", c.seam, 2, 0.3)}
      ${seam("M202 216 L196 402", c.seam, 2, 0.4)}${seam("M398 216 L404 402", c.seam, 2, 0.4)}`,
    };
  },
  jacket(c) {
    const sleeve = "M198 232 C166 242 148 282 140 342 L122 570 L180 576 L194 400 Z";
    const body = "M198 230 C224 218 250 210 268 208 L332 208 C350 210 376 218 402 230 L410 420 L410 600 L190 600 L190 420 Z";
    const btns = [300, 360, 420, 480, 540].map((y) => `<circle cx="314" cy="${y}" r="6" fill="${c.darker}"/>`).join("");
    const flap = "M222 304 L280 304 L280 334 L251 346 L222 334 Z";
    return {
      ground: 650,
      svg: `
      ${piece(sleeve, c.base)}${mirror(piece(sleeve, c.base))}
      <path d="M122 566 L180 572 L177 612 L120 606 Z" fill="${c.dark}"/>${mirror(`<path d="M122 566 L180 572 L177 612 L120 606 Z" fill="${c.dark}"/>`)}
      ${piece(body, c.base)}
      <path d="M190 556 L410 556 L410 604 L190 604 Z" fill="${c.dark}"/>
      ${seam("M190 556 L410 556", c.seam, 2.5, 0.6)}${seam("M196 566 L404 566", c.seam, 1.5, 0.4)}${seam("M196 594 L404 594", c.seam, 1.5, 0.4)}
      ${seam("M198 290 Q300 300 402 290", c.seam, 2.5, 0.5)}
      ${seam("M240 350 L234 556", c.seam, 2, 0.5)}${seam("M360 350 L366 556", c.seam, 2, 0.5)}
      ${seam("M306 238 L306 604", c.seam, 2.5, 0.6)}${btns}
      <path d="${flap}" fill="${c.dark}"/>${seam(flap, c.seam, 2, 0.6)}<circle cx="251" cy="330" r="5" fill="${c.darker}"/>
      ${mirror(`<path d="${flap}" fill="${c.dark}"/>${seam(flap, c.seam, 2, 0.6)}<circle cx="251" cy="330" r="5" fill="${c.darker}"/>`)}
      <path d="M268 208 L300 238 L262 304 L228 226 Z" fill="${c.light}"/>${seam("M268 208 L300 238 L262 304 L228 226 Z", c.seam, 2, 0.5)}
      ${mirror(`<path d="M268 208 L300 238 L262 304 L228 226 Z" fill="${c.light}"/>${seam("M268 208 L300 238 L262 304 L228 226 Z", c.seam, 2, 0.5)}`)}
      ${seam("M140 342 C156 380 164 420 160 470", c.seam, 2, 0.22)}${seam("M460 342 C444 380 436 420 440 470", c.seam, 2, 0.22)}`,
    };
  },
  coat(c) {
    const sleeve = "M200 212 C170 224 152 262 146 322 L126 600 L184 606 L194 400 Z";
    const body = "M200 210 C226 200 252 194 268 192 L332 192 C348 194 374 200 400 210 L414 420 L432 702 Q300 712 168 702 L186 420 Z";
    const btns = [[264, 392], [336, 392], [264, 520], [336, 520], [264, 620], [336, 620]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${c.darker}"/>`).join("");
    return {
      ground: 712,
      svg: `${hanger}
      ${piece(sleeve, c.base)}${mirror(piece(sleeve, c.base))}
      <path d="M130 548 L188 554 L186 572 L128 566 Z" fill="${c.dark}"/>${mirror(`<path d="M130 548 L188 554 L186 572 L128 566 Z" fill="${c.dark}"/>`)}
      ${piece(body, c.base)}
      ${seam("M300 228 L398 214 L404 302 L328 304", c.seam, 2, 0.4)}
      ${seam("M352 360 L366 704", c.seam, 2.5, 0.55)}
      <path d="M186 432 L414 432 L416 466 L184 466 Z" fill="${c.dark}"/>
      <rect x="276" y="426" width="48" height="46" rx="5" fill="none" stroke="${c.darker}" stroke-width="5"/>
      ${btns}
      <path d="M268 192 L236 214 L252 266 L300 362 L300 224 Z" fill="${c.light}"/>${seam("M268 192 L236 214 L252 266 L300 362", c.seam, 2, 0.5)}
      ${mirror(`<path d="M268 192 L236 214 L252 266 L300 362 L300 224 Z" fill="${c.light}"/>${seam("M268 192 L236 214 L252 266 L300 362", c.seam, 2, 0.5)}`)}
      ${seam("M228 520 L250 560", c.seam, 2.5, 0.5)}${mirror(seam("M228 520 L250 560", c.seam, 2.5, 0.5))}
      ${seam("M146 322 C162 380 170 440 166 500", c.seam, 2, 0.22)}${seam("M454 322 C438 380 430 440 434 500", c.seam, 2, 0.22)}`,
    };
  },
  trousers(c) {
    const legs = "M198 176 L402 176 L420 690 L314 690 L300 312 L286 690 L180 690 Z";
    return {
      ground: 700,
      svg: `
      ${piece(legs, c.base)}
      <path d="M198 140 L402 140 L404 178 L196 178 Z" fill="${c.dark}"/>
      ${[226, 270, 330, 374].map((x) => `<rect x="${x - 4}" y="136" width="8" height="30" rx="2" fill="${c.dark}" stroke="${c.seam}" stroke-opacity=".4"/>`).join("")}
      <circle cx="300" cy="158" r="5" fill="${c.darker}"/>
      ${seam("M300 178 C300 230 298 262 290 284", c.seam, 2.5, 0.6)}
      ${seam("M212 182 C222 222 232 238 248 244", c.seam, 2.5, 0.55)}${mirror(seam("M212 182 C222 222 232 238 248 244", c.seam, 2.5, 0.55))}
      ${seam("M244 200 L234 688", c.light, 2.5, 0.6)}${seam("M356 200 L366 688", c.light, 2.5, 0.6)}
      ${seam("M260 180 L262 224", c.seam, 2, 0.35)}${seam("M340 180 L338 224", c.seam, 2, 0.35)}`,
    };
  },
  dress(c) {
    const d = "M252 222 C276 234 324 234 348 222 L360 330 C362 360 356 382 352 402 C400 520 430 620 446 692 Q300 714 154 692 C170 620 200 520 248 402 C244 382 238 360 240 330 Z";
    return {
      ground: 712,
      svg: `
      ${seam("M262 150 L256 226", c.dark, 4, 1)}${seam("M338 150 L344 226", c.dark, 4, 1)}
      <path d="M262 150 C268 140 332 140 338 150" fill="none" stroke="#2b2b2b" stroke-width="5"/>
      ${hanger.replace("M300 196 L300 168", "M300 144 L300 128").replace("C300 150 320 148 320 130 C320 114 302 110 294 122", "C300 116 314 112 314 100 C314 88 302 86 296 94")}
      ${piece(d, c.base)}
      ${seam("M248 402 Q300 414 352 402", c.seam, 2.5, 0.55)}
      ${seam("M252 222 C276 234 324 234 348 222", c.seam, 3, 0.5)}
      ${seam("M276 412 C266 500 246 600 226 700", c.light, 3, 0.55)}${seam("M324 412 C336 500 360 600 382 700", c.dark, 3, 0.5)}
      ${seam("M300 414 C300 520 302 600 304 706", c.dark, 2, 0.3)}
      ${seam("M262 300 C280 316 320 316 338 300", c.seam, 2, 0.25)}`,
    };
  },
  cardigan(c) {
    const sleeve = "M196 242 C162 252 142 292 134 352 L116 566 L174 572 L192 392 Z";
    const body = "M196 240 C222 226 250 218 266 216 L300 352 L334 216 C350 218 378 226 404 240 L410 400 L408 600 L192 600 L190 400 Z";
    const btns = [382, 432, 482, 532, 582].map((y) => `<circle cx="300" cy="${y}" r="6" fill="${c.darker}"/>`).join("");
    return {
      ground: 650,
      svg: `
      <path d="M262 214 L338 214 L300 360 Z" fill="#1d1d1d"/>
      ${piece(sleeve, c.base)}${mirror(piece(sleeve, c.base))}
      <path d="M116 562 L174 568 L171 608 L114 602 Z" fill="${c.dark}"/>${mirror(`<path d="M116 562 L174 568 L171 608 L114 602 Z" fill="${c.dark}"/>`)}
      ${piece(body, c.base)}
      <path d="M192 596 L408 596 L408 638 Q300 646 192 638 Z" fill="${c.dark}"/>${ribs(192, 408, 600, 640, 9, c.darker)}
      <path d="M258 214 L300 356 L342 214 L330 214 L300 324 L270 214 Z" fill="${c.dark}"/>
      <path d="M294 352 L306 352 L306 640 L294 640 Z" fill="${c.dark}"/>
      ${seam("M300 352 L300 640", c.seam, 1.5, 0.5)}${btns}
      ${seam("M222 480 L272 480 L272 540 L222 540 Z", c.seam, 2, 0.5)}${mirror(seam("M222 480 L272 480 L272 540 L222 540 Z", c.seam, 2, 0.5))}
      ${seam("M196 242 L192 392", c.seam)}${seam("M404 242 L408 392", c.seam)}
      ${seam("M134 352 C150 380 160 420 156 470", c.seam, 2, 0.22)}${seam("M466 352 C450 380 440 420 444 470", c.seam, 2, 0.22)}`,
    };
  },
  cap(c) {
    return {
      ground: 530,
      svg: `<g transform="translate(300 400) scale(1.35) translate(-322 -380)">
      ${piece("M150 450 C146 340 214 276 300 274 C386 274 438 336 446 430 L446 452 Q300 468 150 450 Z", c.base)}
      ${seam("M300 276 C266 318 248 384 246 456", c.seam, 2.5, 0.45)}${seam("M300 276 C342 316 372 376 384 454", c.seam, 2.5, 0.45)}
      ${seam("M300 276 C232 300 186 360 172 452", c.seam, 2, 0.3)}
      <ellipse cx="300" cy="276" rx="12" ry="6" fill="${c.dark}"/>
      ${[[214, 340], [356, 330]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${c.darker}" opacity=".55"/>`).join("")}
      <rect x="302" y="372" width="74" height="24" rx="3" fill="${c.light}" transform="rotate(-6 339 384)"/>
      <text x="339" y="389" text-anchor="middle" transform="rotate(-6 339 384)" font-family="Helvetica, Arial, sans-serif" font-size="10" font-weight="700" letter-spacing="1.5" fill="${c.darker}">CLASSICCC</text>
      ${piece("M404 440 C456 428 520 438 560 466 C552 484 506 490 446 480 L398 470 Z", c.dark)}
      ${seam("M414 452 C466 446 516 454 548 472", c.seam, 2, 0.4)}
      <path d="M150 450 Q300 468 446 452 L446 462 Q300 480 150 462 Z" fill="${c.darker}" opacity=".7"/>
      </g>`,
    };
  },
  sneaker(c) {
    const upper = "M126 470 L122 404 C122 376 136 358 162 352 C192 370 236 374 266 354 L290 334 C304 328 316 332 320 344 C352 382 402 400 452 410 C490 418 508 440 508 470 Z";
    return {
      ground: 520,
      svg: `<g transform="translate(-12 6)">
      ${piece(upper, c.base)}
      ${piece("M108 468 L512 468 C514 492 500 510 470 512 L160 512 C126 512 108 496 108 468 Z", "#F5F3EE")}
      ${seam("M110 486 L512 486", "#9a968d", 2, 0.6)}
      ${seam("M420 404 C462 414 492 432 502 456", c.seam, 2.5, 0.5)}
      ${seam("M162 352 C176 400 190 440 196 468", c.seam, 2.5, 0.45)}
      <path d="M200 446 C270 420 360 420 440 452 L436 462 C360 434 272 434 206 458 Z" fill="${c.light}"/>
      ${[0, 1, 2, 3].map((i) => seam(`M${282 + i * 20} ${356 + i * 11} L${312 + i * 20} ${350 + i * 11}`, c.darker, 4, 0.8)).join("")}
      ${seam("M168 358 C196 372 236 376 264 360", c.darker, 4, 0.6)}
      <path d="M122 404 C122 376 136 358 162 352 L170 380 C150 384 140 396 140 410 L140 470 L126 470 Z" fill="${c.dark}"/>
      </g>`,
    };
  },
  tote(c) {
    return {
      ground: 660,
      svg: `
      ${seam("M232 312 C232 176 368 176 368 312", c.darker, 14, 1)}
      ${piece("M178 304 L422 304 L444 644 L156 644 Z", c.base)}
      <path d="M178 304 L422 304 L424 338 L176 338 Z" fill="${c.dark}"/>
      ${seam("M262 312 C262 214 338 214 338 312", c.dark, 14, 1)}
      ${seam("M168 476 L432 476", c.seam, 1.5, 0.2)}
      <text x="300" y="500" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="27" font-weight="700" letter-spacing="7" fill="${c.darker}">CLASSICCC</text>
      <text x="300" y="530" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="11" letter-spacing="5" fill="${c.darker}" opacity=".8">MOVE IN SILENCE</text>`,
    };
  },
};

// ---------- composition ----------
function svgDoc(kind, color, bg, { viewBox = "0 0 600 750" } = {}) {
  const c = palette(color);
  const g = G[kind](c);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid slice">
<defs>
<radialGradient id="bg" cx="50%" cy="38%" r="80%"><stop offset="0" stop-color="${mix(bg, "#ffffff", 0.35)}"/><stop offset="1" stop-color="${bg}"/></radialGradient>
<linearGradient id="sh" x1="0" x2="1" y1="0" y2="0.2"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".42" stop-color="#fff" stop-opacity=".06"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
</defs>
<rect x="-600" y="-750" width="1800" height="2250" fill="url(#bg)"/>
<ellipse cx="300" cy="${g.ground}" rx="200" ry="20" fill="#000" opacity=".16" filter="url(#blur)"/>
<g>${g.svg}</g>
</svg>`;
}

const BG = { stone: "#E4E1DA", ivory: "#F3EFDF", mist: "#DCDDD8", sand: "#E9DFD0", clay: "#E7D3C3" };

// slug, kind, colours [{key, hex}], backgrounds
export const ART = [
  ["classic-fleece-pullover-hoodie", "hoodie", [["sage", "#B7BDAA"], ["black", "#1E1E1E"]]],
  ["heavyweight-boxy-tee", "tee", [["black", "#1C1C1C"], ["white", "#F2F0EA"]]],
  ["essential-crewneck-sweatshirt", "crewneck", [["oat", "#E3DACA"], ["charcoal", "#3A3A3A"]]],
  ["oxford-button-down-shirt", "shirt", [["sky", "#C6D3E0"], ["white", "#F4F2EC"]]],
  ["suede-trucker-jacket", "jacket", [["tan", "#9C5D31"]]],
  ["pleated-wide-leg-trousers", "trousers", [["charcoal", "#3B3A38"], ["stone", "#B9B0A2"]]],
  ["knit-fairway-cardigan", "cardigan", [["ecru", "#EEEAE0"]]],
  ["signature-trench-coat", "coat", [["slate", "#6C6862"], ["camel", "#B08657"]]],
  ["satin-slip-midi-dress", "dress", [["champagne", "#D6C1A2"], ["black", "#202020"]]],
  ["relaxed-poplin-shirt", "shirt", [["white", "#F5F3EE"]]],
  ["cropped-crewneck", "crewneck", [["clay", "#D49F82"]]],
  ["wrap-trench-coat", "coat", [["camel", "#B48A5A"]]],
  ["tailored-wide-leg-trousers", "trousers", [["cream", "#E8E0CF"]]],
  ["kids-everyday-hoodie", "hoodie", [["black", "#222222"], ["clay", "#D49F82"]]],
  ["kids-classic-tee", "tee", [["terracotta", "#C8734B"]]],
  ["kids-crewneck-sweatshirt", "crewneck", [["sky", "#BFD0DF"]]],
  ["six-panel-cap", "cap", [["black", "#1E1E1E"], ["sand", "#CDBFA6"]]],
  ["canvas-tote-bag", "tote", [["natural", "#E6DCC6"]]],
  ["leather-court-sneaker", "sneaker", [["white", "#ECE9E2"], ["black", "#232323"]]],
];

const bgFor = (i) => [BG.stone, BG.mist, BG.sand][i % 3];

ART.forEach(([slug, kind, colours], i) => {
  for (const [key, colour] of colours) {
    const main = bgFor(i);
    writeFileSync(join(OUT, `${slug}-${key}-1.svg`), svgDoc(kind, colour, main));
    const detail = kind === "trousers" ? "150 110 300 375" : kind === "sneaker" || kind === "cap" ? "130 220 340 425" : "150 150 300 375";
    writeFileSync(join(OUT, `${slug}-${key}-2.svg`), svgDoc(kind, colour, main, { viewBox: detail }));
    writeFileSync(join(OUT, `${slug}-${key}-3.svg`), svgDoc(kind, colour, BG.ivory));
  }
});

// ---------- brand imagery ----------
writeFileSync(join(BRAND, "hero-coat.svg"), (() => {
  const c = palette("#5E5A55");
  const g = G.coat(c);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="80 90 440 640">
<defs><linearGradient id="sh" x1="0" x2="1" y1="0" y2="0.2"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".42" stop-color="#fff" stop-opacity=".07"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient>
<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter></defs>
<ellipse cx="300" cy="716" rx="170" ry="12" fill="#000" opacity=".22" filter="url(#blur)"/>
${g.svg}</svg>`;
})());

const tiles = [
  ["category-men.svg", "jacket", "#2A2928", BG.sand],
  ["category-women.svg", "dress", "#D6C1A2", "#CFC8BC"],
  ["category-kids.svg", "crewneck", "#F1EEE6", "#CBC3B6"],
  ["new-season.svg", "shirt", "#1F1F1F", "#BDBBB6"],
  ["about-1.svg", "cardigan", "#EEEAE0", BG.sand],
  ["about-2.svg", "coat", "#6C6862", BG.mist],
];
for (const [file, kind, colour, bg] of tiles) writeFileSync(join(BRAND, file), svgDoc(kind, colour, bg));

console.log("Artwork written to public/products and public/brand");
