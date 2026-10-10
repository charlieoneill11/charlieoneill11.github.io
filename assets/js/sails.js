// Watercolour sloops that sail the home page margins. Each boat sits on a bloom of bay-blue water and
// leaves a wake that dries back into the paper. Everything is painted procedurally on canvas.
(() => {
    'use strict';

    const root = document.documentElement;
    const container = document.querySelector('.container');
    const harbour = document.querySelector('.harbour');
    if (!container || !harbour || !window.Paint) return;

    // Same breakpoint as margin notes: below it there are no margins to sail in.
    const wideQuery = matchMedia('(min-width: 1180px)');
    const stillQuery = matchMedia('(prefers-reduced-motion: reduce)');

    const BASE_SPEED = 3.6; // px/s for a 60px hull: a minute or two to cross a margin
    const TACK_TIME = 5;
    const WAKE_LIFE = 60;
    const ARRIVED = 'sails-arrived';

    const session = () => { try { return window.sessionStorage; } catch { return null; } };

    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const smooth = (t) => t * t * (3 - 2 * t);
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const sea = document.createElement('div');
    sea.id = 'sea';
    sea.setAttribute('aria-hidden', 'true');
    document.body.append(sea);

    const { dpr, darkQuery, palette, mulberry32, gaussian, ellipse, wash, sprite, paintBoat, paintBloom } = window.Paint;

    // One dab of wake; each boat lays these behind it as it sails.
    function paintStamp(L, pal, seed) {
        const rand = mulberry32(seed);
        const s = sprite(0.6 * L, 0.22 * L, 0.3 * L, 0.11 * L);
        wash(s.ctx, ellipse(0, 0, 0.2 * L, 0.045 * L, 8, rand), { color: pal.pale, layers: 14, alpha: 0.09, baseVar: 0.1, layerVar: 0.07, texture: 0.6 }, rand);
        return s;
    }

    // ---- Boats ---------------------------------------------------------------

    // Lanes sit beside landmarks in the column, alternating sides down the page. On narrow screens
    // the first two boats share the strip above the portrait instead, the second one further off,
    // both starting on the same tack so they don't open the page stacked on top of each other.
    const FLEET = [
        { seed: 3, scale: 1.0, dir: -1, u: 0.72, lane: { side: 'right', anchor: '.about', at: 0.62 }, strip: { at: 0.86, scale: 0.92, u: 0.75, dir: -1 } },
        { seed: 17, scale: 0.86, dir: 1, u: 0.3, accent: true, lane: { side: 'left', anchor: '.about-text', at: 0.62 }, strip: { at: 0.64, scale: 0.66, u: 0.2, dir: -1 } },
        { seed: 29, scale: 0.94, dir: 1, u: 0.55, lane: { side: 'right', anchor: '.home-sections .section:first-child', at: 0.6 } },
        { seed: 41, scale: 0.8, dir: -1, u: 0.4, lane: { side: 'left', anchor: '.home-sections .section:last-child', at: 0.55 } },
    ];

    class Boat {
        constructor(def, index) {
            this.def = def;
            this.index = index;
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            sea.append(this.canvas);
            const r = mulberry32(def.seed * 13);
            this.rand = r;
            this.phase = r() * Math.PI * 2;
            this.drift = r() * Math.PI * 2;
            this.pace = 0.85 + r() * 0.3;
            this.reset();
        }

        reset() {
            const start = !wideQuery.matches && this.def.strip ? this.def.strip : this.def;
            this.u = start.u;
            this.dir = start.dir;
            this.facing = this.dir;
            this.tack = null;
            this.t = 0;
            this.wake = [];
            this.travelled = 0;
            this.stampCount = 0;
            if (this.lane) this.place();
        }

        remove() { this.canvas.remove(); }

        layout(lane, L) {
            const before = this.lane && { x: this.x, y: this.y };
            this.lane = lane;
            Object.assign(this.canvas.style, {
                left: `${lane.left}px`, top: `${lane.top}px`, width: `${lane.width}px`, height: `${lane.height}px`,
            });
            this.canvas.width = Math.round(lane.width * dpr);
            this.canvas.height = Math.round(lane.height * dpr);
            if (L !== this.L) {
                this.L = L;
                this.paint();
            }
            this.place();
            if (before) {
                const dx = this.x - before.x, dy = this.y - before.y;
                this.wake.forEach((w) => { w.x += dx; w.y += dy; });
            }
        }

        paint() {
            const pal = palette();
            this.boat = paintBoat(this.L, pal, this.def.seed, this.def.accent);
            this.bloom = paintBloom(this.L, pal, this.def.seed);
            this.stamps = [0, 1, 2, 3, 4].map((i) => paintStamp(this.L, pal, this.def.seed * 31 + i));
        }

        get span() { return Math.max(1, this.lane.xMax - this.lane.xMin); }

        place() {
            this.x = this.lane.xMin + this.u * (this.lane.xMax - this.lane.xMin);
            this.y = this.lane.yc + this.lane.band * Math.sin(this.t * 0.09 + this.drift);
        }

        // Sails to the end of its lane, then comes about: slowing into the wind, turning, picking up again.
        update(dt, go) {
            let v = BASE_SPEED * (this.L / 60) * this.pace * go;
            if (this.tack) {
                this.tack += dt / TACK_TIME;
                const p = Math.min(1, this.tack);
                this.facing = this.dir * Math.cos(Math.PI * p);
                v *= 1 - 0.85 * Math.sin(Math.PI * p);
                if (p >= 1) {
                    this.dir = -this.dir;
                    this.facing = this.dir;
                    this.tack = null;
                }
            } else if ((this.dir > 0 && this.u >= 1) || (this.dir < 0 && this.u <= 0)) {
                this.tack = 1e-6;
            }
            const heading = Math.sign(this.facing) || this.dir;
            const dx = heading * v * dt;
            this.u = clamp(this.u + dx / this.span, -0.1, 1.1);
            this.t += dt;
            const oldY = this.y;
            this.place();
            const dy = this.y - oldY;
            this.travelled += Math.hypot(dx, dy);
            if (this.travelled >= 5 * (this.L / 60)) {
                this.travelled = 0;
                const r = this.rand;
                this.wake.push({
                    x: this.x - heading * 0.4 * this.L,
                    y: this.y + 0.03 * this.L + gaussian(r) * 0.6,
                    ang: Math.atan2(dy, Math.abs(dx) || 1) * heading,
                    born: this.t,
                    k: 0.7 + r() * 0.6,
                    s: 0.85 + r() * 0.3,
                    i: this.stampCount++ % 5,
                });
            }
            while (this.wake.length && this.t - this.wake[0].born > WAKE_LIFE) this.wake.shift();
        }

        draw(a) {
            const { ctx, lane } = this;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, lane.width, lane.height);
            ctx.globalCompositeOperation = palette().op;

            // Wet paint is darker; the wake dries lighter, spreads, then sinks back into the paper.
            for (const w of this.wake) {
                const f = (this.t - w.born) / WAKE_LIFE;
                if (f >= 1) continue;
                const alpha = (0.6 + 0.4 * Math.exp(-f * 25)) * Math.pow(1 - f, 1.5) * w.k * 0.16 * a.bloomIn;
                if (alpha < 0.004) continue;
                const spr = this.stamps[w.i];
                ctx.globalAlpha = Math.min(1, alpha);
                ctx.save();
                ctx.translate(w.x, w.y);
                ctx.rotate(w.ang);
                ctx.scale(w.s * (1 + 0.5 * f), w.s * (1 + 1.6 * Math.sqrt(f)));
                ctx.drawImage(spr.canvas, -spr.ax, -spr.ay, spr.w, spr.h);
                ctx.restore();
            }

            const bob = 0.9 * Math.sin(this.t * 1.2 + this.phase);
            const pitch = 0.018 * Math.sin(this.t * 1.2 + this.phase + 0.9);

            const b = this.bloom;
            ctx.globalAlpha = Math.min(1, 0.8 * a.wet) * a.bloomIn;
            ctx.save();
            ctx.translate(this.x, this.y + bob * 0.3);
            ctx.scale(a.scale, a.scale);
            ctx.drawImage(b.canvas, -b.ax, -b.ay, b.w, b.h);
            ctx.restore();

            if (a.boatIn <= 0) return;
            const s = this.boat;
            const flip = Math.sign(this.facing) * Math.max(0.04, Math.abs(this.facing));
            ctx.globalAlpha = a.boatIn;
            ctx.save();
            ctx.translate(this.x, this.y + bob + (1 - a.boatIn) * 3);
            ctx.rotate(pitch);
            ctx.scale(flip, 1);
            ctx.drawImage(s.canvas, -s.ax, -s.ay, s.w, s.h);
            ctx.restore();
            ctx.globalAlpha = 1;
        }

        visible() {
            const top = this.lane.top - scrollY;
            return top < innerHeight && top + this.lane.height > 0;
        }
    }

    // ---- Layout --------------------------------------------------------------

    let boats = [];

    // A lane's canvas in document coordinates, plus the range the boat's centre may travel within it.
    function makeLane(x0, x1, yc, L, band, vw) {
        const left = Math.max(0, x0 - 0.35 * L), right = Math.min(vw, x1 + 0.35 * L);
        const top = yc - 1.48 * L - band, bottom = yc + 0.42 * L + band;
        const xMin = x0 + L - left;
        return {
            left, top, width: right - left, height: bottom - top,
            xMin, xMax: Math.max(xMin, x1 - L - left), yc: yc - top, band,
        };
    }

    function layout() {
        const strip = !wideQuery.matches;
        const fleet = strip ? FLEET.filter((d) => d.strip) : FLEET;
        while (boats.length > fleet.length) boats.pop().remove();
        while (boats.length < fleet.length) boats.push(new Boat(fleet[boats.length], boats.length));

        const vw = root.clientWidth;
        const col = container.getBoundingClientRect();
        boats.forEach((boat) => {
            const def = boat.def;
            if (strip) {
                const h = harbour.getBoundingClientRect();
                const L = 46 * def.strip.scale;
                boat.layout(makeLane(16, vw - 16, h.top + scrollY + def.strip.at * h.height, L, 3, vw), L);
            } else {
                const a = document.querySelector(def.lane.anchor).getBoundingClientRect();
                const L = 60 * def.scale;
                const gap = 36, reach = 440;
                const [x0, x1] = def.lane.side === 'left'
                    ? [Math.max(16, col.left - gap - reach), col.left - gap]
                    : [col.right + gap, Math.min(vw - 16, col.right + gap + reach)];
                boat.layout(makeLane(x0, x1, a.top + scrollY + def.lane.at * a.height, L, 16, vw), L);
            }
        });
        drawAll(true);
    }

    // ---- Motion --------------------------------------------------------------

    let arrival = null;
    let clock = 0;
    let last = null;
    let running = false;

    const SETTLED = { bloomIn: 1, scale: 1, wet: 1, boatIn: 1, go: 1 };

    // First visit each session: the water blooms spread as if just dropped on wet paper, darken
    // and dry, then each boat appears and slowly gets under way.
    function arrivalState(boat) {
        if (arrival == null) return SETTLED;
        const t = clock - arrival - boat.index * 0.45;
        return {
            bloomIn: clamp(t / 0.35),
            scale: 0.18 + 0.82 * easeOut(clamp(t / 1.5)),
            wet: 1 + 0.28 * (1 - smooth(clamp((t - 0.6) / 2.6))),
            boatIn: smooth(clamp((t - 0.9) / 0.9)),
            go: smooth(clamp((t - 1.6) / 3)),
        };
    }

    function step(dt) {
        clock += dt;
        boats.forEach((b) => b.update(dt, arrivalState(b).go));
        if (arrival != null && clock - arrival - boats.length * 0.45 > 6) arrival = null;
    }

    function drawAll(force) {
        boats.forEach((b) => { if (force || b.visible()) b.draw(arrivalState(b)); });
    }

    function frame(now) {
        if (!running) return;
        requestAnimationFrame(frame);
        const dt = last == null ? 0 : Math.min(0.1, (now - last) / 1000);
        last = now;
        step(dt);
        drawAll(false);
    }

    // Sail for a while out of sight, so boats appear mid-voyage with a wake already behind them.
    function prewarm(seconds) {
        for (let t = 0; t < seconds; t += 0.1) step(0.1);
    }

    function start() {
        boats.forEach((b) => b.reset());
        clock = 0;
        arrival = null;
        if (stillQuery.matches) {
            running = false;
            prewarm(24);
            drawAll(true);
            return;
        }
        let arrived = false;
        try { arrived = session()?.getItem(ARRIVED) === '1'; } catch {}
        if (arrived) {
            prewarm(24);
        } else {
            arrival = 0.3;
            try { session()?.setItem(ARRIVED, '1'); } catch {}
        }
        if (!running) {
            running = true;
            last = null;
            requestAnimationFrame(frame);
        }
    }

    // ---- Wiring --------------------------------------------------------------

    darkQuery.addEventListener('change', () => {
        boats.forEach((b) => b.paint());
        drawAll(true);
    });
    stillQuery.addEventListener('change', start);
    document.addEventListener('visibilitychange', () => { last = null; });

    let layoutTimer = null;
    new ResizeObserver(() => {
        clearTimeout(layoutTimer);
        layoutTimer = setTimeout(layout, 120);
    }).observe(document.body);

    layout();
    start();
    document.fonts?.ready.then(layout);
})();
