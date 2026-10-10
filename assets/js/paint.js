// Watercolour primitives shared by the boats, the figures and the marginalia. Everything is painted
// procedurally on canvas: many faint, slightly different copies of a shape give soft edges and a
// denser core, the way layered washes do on paper.
(() => {
    'use strict';

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const darkQuery = matchMedia('(prefers-color-scheme: dark)');
    const TAU = Math.PI * 2;

    // Pigment multiplies into the paper by day; at night paint is moonlight screened over dark paper.
    const DAY = {
        op: 'multiply', pale: '#a3bccb', bay: '#6f8fa6', deep: '#44607a', under: '#3b4553',
        ink: '#2a2926', graphite: '#6b6963', rubric: '#a33a2c', fern: '#7f8c62', fernDark: '#5d6a46',
        sail: '#8593a1', main: [0.62, 0.1], jib: [0.8, 0.38], sailRim: '#5d6977',
        hull: '#2b3440', spar: '#353b44', cabin: '#a9b1ba', sheer: null,
        moth: ['#a99d8a', '#8f8472', '#6c6152', '#4f463b'],
    };
    const NIGHT = {
        op: 'screen', pale: '#1f3456', bay: '#2c4874', deep: '#3a5a8d', under: '#7d93b4',
        ink: '#cfd3da', graphite: '#8f97a3', rubric: '#c0614f', fern: '#34452f', fernDark: '#4d6646',
        sail: '#cdd7e3', main: [0.22, 0.75], jib: [0.16, 0.48], sailRim: '#b4c3d6',
        hull: '#3a4456', spar: '#8a97aa', cabin: '#4d5869', sheer: '#a9b9cd',
        moth: ['#5a554c', '#4a463f', '#6b6457', '#7f776a'],
    };
    const palette = () => (darkQuery.matches ? NIGHT : DAY);

    function mulberry32(seed) {
        return () => {
            seed = (seed + 0x6d2b79f5) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function gaussian(rand) {
        let u = 0, v = 0;
        while (!u) u = rand();
        while (!v) v = rand();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
    }

    // A stable seed from a string, so a page paints the same way on every visit.
    function seedOf(text) {
        let h = 2166136261;
        for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
        return h >>> 0;
    }

    const shape = (pts, rand) => pts.map(([x, y]) => ({ x, y, v: 0.6 + rand() * 0.8 }));

    const ellipse = (cx, cy, rx, ry, n, rand) => shape(Array.from({ length: n }, (_, i) => {
        const a = (i / n) * TAU;
        return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
    }), rand);

    // Tyler Hobbs' recursive midpoint deformation: each edge gains a jittered midpoint, scaled by its length.
    function deform(points, depth, variance, rand) {
        let p = points;
        for (let d = 0; d < depth; d++) {
            const next = [];
            for (let i = 0; i < p.length; i++) {
                const a = p[i], b = p[(i + 1) % p.length];
                const v = (a.v + b.v) / 2;
                const sd = Math.hypot(b.x - a.x, b.y - a.y) * variance * v;
                next.push(a, { x: (a.x + b.x) / 2 + gaussian(rand) * sd, y: (a.y + b.y) / 2 + gaussian(rand) * sd, v: v * (0.85 + rand() * 0.3) });
            }
            p = next;
        }
        return p;
    }

    function trace(ctx, p) {
        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
        ctx.closePath();
    }

    // Many faint, differently deformed copies of one shape: soft bleeding edges and a denser core.
    // `texture` masks each layer with random discs so pigment pools unevenly, like granulation.
    function wash(ctx, pts, o, rand) {
        const base = deform(pts, 2, o.baseVar, rand);
        const xs = base.map((p) => p.x), ys = base.map((p) => p.y);
        const box = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
        // Granulation stays small on big washes: pigment pools in patches, not in a few huge discs.
        const minSide = Math.max(2, Math.min(box.w, box.h, 48));
        const discs = o.texture ? Math.min(90, Math.max(5, Math.ceil(o.texture * 2.2 * box.w * box.h / (Math.PI * (0.55 * minSide) ** 2)))) : 0;
        ctx.save();
        ctx.fillStyle = o.color;
        ctx.globalAlpha = o.alpha;
        for (let i = 0; i < o.layers; i++) {
            const layer = deform(base, o.depth ?? 3, o.layerVar, rand);
            if (discs) {
                ctx.save();
                ctx.beginPath();
                for (let c = 0; c < discs; c++) {
                    const x = box.x + rand() * box.w, y = box.y + rand() * box.h, r = minSide * (0.3 + rand() * 0.5);
                    ctx.moveTo(x + r, y);
                    ctx.arc(x, y, r, 0, TAU);
                }
                ctx.clip();
            }
            trace(ctx, layer);
            ctx.fill();
            if (discs) ctx.restore();
        }
        ctx.restore();
    }

    // The darker line a wash leaves where it dried, broken into runs unless `solid`.
    function rim(ctx, pts, o, rand) {
        const p = deform(pts, o.depth ?? 3, o.variance, rand);
        const n = o.closed ? p.length : p.length - 1;
        ctx.save();
        ctx.strokeStyle = o.color;
        ctx.lineWidth = o.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        let on = o.solid || rand() > 0.3, open = false;
        const flush = () => { if (open) ctx.stroke(); open = false; };
        for (let i = 0; i < n; i++) {
            if (!o.solid && rand() < 0.1) on = !on;
            if (!on) { flush(); continue; }
            const a = p[i], b = p[(i + 1) % p.length];
            if (!open) {
                ctx.globalAlpha = o.alpha * (o.solid ? 1 : 0.6 + rand() * 0.6);
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                open = true;
            }
            ctx.lineTo(b.x, b.y);
        }
        flush();
        ctx.restore();
    }

    // A single tapered brushstroke with a slight hand wobble.
    function brush(ctx, x0, y0, x1, y1, w0, w1, color, alpha, rand) {
        const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len, ny = dx / len;
        const left = [], right = [];
        let wobble = 0;
        for (let i = 0; i <= 14; i++) {
            const t = i / 14;
            wobble += gaussian(rand) * 0.12;
            const w = ((w0 + (w1 - w0) * t) * (0.85 + rand() * 0.3)) / 2;
            const cx = x0 + dx * t + nx * wobble, cy = y0 + dy * t + ny * wobble;
            left.push([cx + nx * w, cy + ny * w]);
            right.unshift([cx - nx * w, cy - ny * w]);
        }
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        [...left, ...right].forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // A graphite line: thin, a little broken, never quite straight.
    function pencil(ctx, pts, color, alpha, rand) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let pass = 0; pass < 2; pass++) {
            ctx.globalAlpha = alpha * (pass ? 0.45 : 0.8);
            ctx.lineWidth = pass ? 0.5 : 0.9;
            ctx.setLineDash(pass ? [] : [5 + rand() * 6, 1 + rand() * 1.5]);
            ctx.beginPath();
            pts.forEach(([x, y], i) => {
                const jx = x + gaussian(rand) * 0.25, jy = y + gaussian(rand) * 0.25 + pass * 0.4;
                if (i) ctx.lineTo(jx, jy);
                else ctx.moveTo(jx, jy);
            });
            ctx.stroke();
        }
        ctx.restore();
    }

    // An offscreen canvas whose origin sits at (ax, ay), drawn back with blit().
    function sprite(w, h, ax, ay) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.ceil(w * dpr));
        canvas.height = Math.max(1, Math.ceil(h * dpr));
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, ax * dpr, ay * dpr);
        return { canvas, ctx, w, h, ax, ay };
    }

    function blit(ctx, s, x, y, sx = 1, sy = sx) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(sx, sy);
        ctx.drawImage(s.canvas, -s.ax, -s.ay, s.w, s.h);
        ctx.restore();
    }

    // Size a canvas's backing store to its CSS box and return a context in CSS pixels.
    function fit(canvas) {
        const w = Math.max(1, Math.round(canvas.clientWidth)), h = Math.max(1, Math.round(canvas.clientHeight));
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { ctx, w, h };
    }

    // Sails are left as bare paper: one wash, then a gradient lifts it off the lit side.
    function sail(target, pts, from, to, ramp, p, rand) {
        const tmp = sprite(target.w, target.h, target.ax, target.ay);
        wash(tmp.ctx, pts, { color: p.sail, layers: 12, alpha: 0.24, baseVar: 0.012, layerVar: 0.008 }, rand);
        const g = tmp.ctx.createLinearGradient(from[0], from[1], to[0], to[1]);
        g.addColorStop(0, `rgba(0,0,0,${ramp[0]})`);
        g.addColorStop(1, `rgba(0,0,0,${ramp[1]})`);
        tmp.ctx.globalCompositeOperation = 'destination-in';
        tmp.ctx.fillStyle = g;
        tmp.ctx.fillRect(-target.ax, -target.ay, target.w, target.h);
        const c = target.ctx;
        c.save();
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.globalCompositeOperation = p.op;
        c.drawImage(tmp.canvas, 0, 0);
        c.restore();
        rim(c, shape([pts[0], pts[1], pts[2]], rand), { color: p.sailRim, width: 0.7, alpha: 0.3, variance: 0.01 }, rand);
    }

    // A small sloop facing right, in units of hull length L. The accent boat wears the one red.
    function paintBoat(L, p, seed, accent) {
        const rand = mulberry32(seed);
        const s = sprite(1.3 * L, 1.56 * L, 0.62 * L, 1.44 * L);
        const g = s.ctx;
        g.globalCompositeOperation = p.op;
        const P = (x, y) => [x * L, y * L];
        const mast = 0.08, rake = 0.035;
        const w = Math.max(0.6, L / 60);

        const head = P(mast - rake * 0.97, -1.3), tack = P(mast - 0.004, -0.18), clew = P(mast - 0.52, -0.165);
        const roach = P((mast - rake + mast - 0.52) / 2 - 0.07, -0.73), luff = P(mast - rake / 2, -0.74);
        sail(s, [head, roach, clew, tack, luff], luff, roach, p.main, p, rand);

        const jHead = P(mast - rake * 0.8, -1.12), jTack = P(0.49, -0.14), jClew = P(mast - 0.11, -0.21);
        const jLeech = P((mast - rake * 0.8 + mast - 0.11) / 2 + 0.035, -0.66);
        sail(s, [jHead, jLeech, jClew, jTack], jLeech, P(0.3, -0.62), p.jib, p, rand);

        brush(g, mast * L, -0.1 * L, (mast - rake) * L, -1.34 * L, 1.5 * w, 0.8 * w, p.spar, 0.85, rand);
        brush(g, mast * L, -0.17 * L, clew[0] - 0.02 * L, clew[1] + 0.006 * L, 1.2 * w, 0.8 * w, p.spar, 0.7, rand);
        brush(g, (mast - rake * 0.9) * L, -1.2 * L, 0.5 * L, -0.14 * L, 0.45 * w, 0.4 * w, p.spar, 0.22, rand);

        wash(g, shape([P(-0.2, -0.095), P(-0.17, -0.145), P(0.03, -0.145), P(0.06, -0.095)], rand),
            { color: p.cabin, layers: 6, alpha: 0.22, baseVar: 0.02, layerVar: 0.015 }, rand);

        const hull = shape([
            P(-0.45, -0.105), P(-0.25, -0.088), P(0.05, -0.09), P(0.3, -0.105), P(0.52, -0.135),
            P(0.46, -0.06), P(0.4, -0.005), P(0.15, 0.022), P(-0.15, 0.025), P(-0.38, 0.015), P(-0.44, -0.02),
        ], rand);
        wash(g, hull, { color: accent ? p.rubric : p.hull, layers: 9, alpha: 0.2, baseVar: 0.012, layerVar: 0.01 }, rand);
        brush(g, 0.4 * L, 0.004 * L, -0.4 * L, 0.016 * L, 1.6 * w, 1.0 * w, p.under, 0.45, rand);
        if (p.sheer) brush(g, -0.45 * L, -0.105 * L, 0.52 * L, -0.135 * L, 0.6 * w, 0.9 * w, p.sheer, 0.5, rand);
        return s;
    }

    // The patch of water a boat sits in: a pale outer bloom, a deeper core, a shadow under the hull.
    function paintBloom(L, p, seed) {
        const rand = mulberry32(seed * 7 + 1);
        const s = sprite(2.4 * L, 0.66 * L, 1.2 * L, 0.27 * L);
        const g = s.ctx;
        g.globalCompositeOperation = p.op;
        wash(g, ellipse(-0.04 * L, 0.035 * L, 0.95 * L, 0.19 * L, 10, rand), { color: p.pale, layers: 34, alpha: 0.045, baseVar: 0.09, layerVar: 0.07, texture: 0.55 }, rand);
        wash(g, ellipse(-0.02 * L, 0.03 * L, 0.6 * L, 0.09 * L, 10, rand), { color: p.bay, layers: 22, alpha: 0.05, baseVar: 0.08, layerVar: 0.06, texture: 0.5 }, rand);
        wash(g, ellipse(0, 0.018 * L, 0.42 * L, 0.03 * L, 8, rand), { color: p.deep, layers: 12, alpha: 0.08, baseVar: 0.05, layerVar: 0.05 }, rand);
        for (let i = 0; i < 4; i++) {
            const x = (rand() - 0.5) * 1.2 * L, y = (0.05 + rand() * 0.09) * L, w = (0.06 + rand() * 0.1) * L;
            brush(g, x - w, y, x + w, y + (rand() - 0.5) * 0.01 * L, 1.0, 0.5, i ? p.bay : p.under, 0.3, rand);
        }
        rim(g, ellipse(-0.04 * L, 0.035 * L, 0.87 * L, 0.16 * L, 10, rand), { color: p.bay, width: 0.8, alpha: 0.12, variance: 0.06, closed: true }, rand);
        return s;
    }

    // One side of a moth: forewing and hindwing, rooted at the origin and spreading to +x.
    function paintMothWing(S, cols, seed) {
        const rand = mulberry32(seed);
        const s = sprite(1.2 * S, 1.75 * S, 0.06 * S, 1.05 * S);
        const g = s.ctx;
        const P = (x, y) => [x * S, y * S];
        const hind = shape([P(0, 0.02), P(0.55, 0.04), P(0.7, 0.32), P(0.42, 0.62), P(0.06, 0.4)], rand);
        wash(g, hind, { color: cols[1], layers: 7, alpha: 0.24, baseVar: 0.04, layerVar: 0.03 }, rand);
        const fore = shape([P(0, -0.08), P(0.42, -0.95), P(0.95, -0.82), P(1.05, -0.45), P(0.62, -0.05), P(0.08, 0.12)], rand);
        wash(g, fore, { color: cols[0], layers: 8, alpha: 0.26, baseVar: 0.035, layerVar: 0.025, texture: 0.6 }, rand);
        wash(g, ellipse(0.6 * S, -0.55 * S, 0.11 * S, 0.08 * S, 7, rand), { color: cols[2], layers: 5, alpha: 0.32, baseVar: 0.05, layerVar: 0.04 }, rand);
        rim(g, fore, { color: cols[3], width: 0.6, alpha: 0.35, variance: 0.02, closed: true }, rand);
        return s;
    }

    function drawMoth(ctx, wing, x, y, ang, open, S, body) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        for (const side of [1, -1]) blit(ctx, wing, 0, 0, side * open, 1);
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.ellipse(0, 0.06 * S, 0.09 * S, 0.44 * S, 0, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = body;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, -0.36 * S);
        ctx.quadraticCurveTo(0.12 * S, -0.7 * S, 0.32 * S, -0.84 * S);
        ctx.moveTo(0, -0.36 * S);
        ctx.quadraticCurveTo(-0.12 * S, -0.7 * S, -0.32 * S, -0.84 * S);
        ctx.stroke();
        ctx.restore();
    }

    // A pressed fern: alternate leaflets along a gently bowed stem. An angle of 0 points up.
    function paintFern(ctx, x, y, len, ang, p, rand) {
        const dir = [Math.sin(ang), -Math.cos(ang)], nrm = [Math.cos(ang), Math.sin(ang)];
        const at = (t) => {
            const bend = Math.sin(t * Math.PI) * len * 0.08;
            return [x + dir[0] * len * t + nrm[0] * bend, y + dir[1] * len * t + nrm[1] * bend];
        };
        let side = 1;
        for (let t = 0.1; t < 0.97; t += 0.055, side = -side) {
            const [px, py] = at(t);
            const size = len * 0.2 * Math.pow(1 - t, 0.8) + len * 0.025;
            const a = ang + side * (1.05 - t * 0.3);
            const cx = px + Math.sin(a) * size * 0.55, cy = py - Math.cos(a) * size * 0.55;
            const th = a - Math.PI / 2, c = Math.cos(th), sn = Math.sin(th);
            const leaf = ellipse(0, 0, size * 0.5, size * 0.17, 8, rand).map((q) => ({ ...q, x: cx + q.x * c - q.y * sn, y: cy + q.x * sn + q.y * c }));
            wash(ctx, leaf, { color: rand() > 0.3 ? p.fern : p.fernDark, layers: 5, alpha: 0.22, baseVar: 0.06, layerVar: 0.04 }, rand);
        }
        for (let i = 0; i < 8; i++) {
            const [ax, ay] = at(i / 8), [bx, by] = at((i + 1) / 8);
            brush(ctx, ax, ay, bx, by, 1.3 - i * 0.12, 1.2 - i * 0.12, p.fernDark, 0.55, rand);
        }
    }

    window.Paint = {
        TAU, dpr, darkQuery, DAY, NIGHT, palette, mulberry32, gaussian, seedOf, shape, ellipse, deform, trace,
        wash, rim, brush, pencil, sprite, blit, fit, paintBoat, paintBloom, paintMothWing, drawMoth, paintFern,
    };
})();
