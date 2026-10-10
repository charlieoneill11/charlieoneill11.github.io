// Figure for "Trying to actually define continual learning": the two native memories of one model,
// drawn in ink and wash. Llama 3.1 70B in bf16: 80 layers, 8 KV heads (grouped-query attention),
// head dimension 128, 2 bytes per value, 70.55B parameters.
(() => {
    'use strict';

    const canvas = document.getElementById('kv-cache-figure');
    if (!canvas || !window.Paint) return;
    const { darkQuery, palette, mulberry32, shape, wash, brush, pencil, fit } = window.Paint;

    const BYTES_PER_TOKEN = 2 * 80 * 8 * 128 * 2;
    const WEIGHTS_GB = (70.55e9 * 2) / 1e9;
    const CROSSOVER = (WEIGHTS_GB * 1e9) / BYTES_PER_TOKEN;
    const NATIVE_CONTEXT = 131072;
    const MAX_TOKENS = 1e6, MAX_GB = 350;
    const cacheGB = (tokens) => (tokens * BYTES_PER_TOKEN) / 1e9;

    function paint() {
        const { ctx, w, h } = fit(canvas);
        const p = palette();
        const style = getComputedStyle(document.documentElement);
        const ink = style.getPropertyValue('--text').trim();
        const muted = style.getPropertyValue('--muted').trim();
        const rubric = style.getPropertyValue('--rubric').trim();
        const serif = getComputedStyle(canvas).fontFamily;
        const narrow = w < 520;
        const rand = mulberry32(431);

        const pad = { l: narrow ? 40 : 52, r: narrow ? 14 : 24, t: 38, b: 46 };
        const X = (tokens) => pad.l + (tokens / MAX_TOKENS) * (w - pad.l - pad.r);
        const Y = (gb) => pad.t + (1 - gb / MAX_GB) * (h - pad.t - pad.b);
        const smallCaps = (text, x, y, align) => {
            ctx.font = `${narrow ? 10 : 11}px ${serif}`;
            if ('letterSpacing' in ctx) ctx.letterSpacing = '1.6px';
            ctx.textAlign = align;
            ctx.fillText(text, x, y);
            if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
        };

        ctx.save();
        ctx.strokeStyle = muted;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 0.6;
        ctx.setLineDash([2, 4]);
        [100, 200, 300].forEach((gb) => { ctx.beginPath(); ctx.moveTo(pad.l, Y(gb)); ctx.lineTo(w - pad.r, Y(gb)); ctx.stroke(); });
        ctx.restore();

        // The weights: a fixed body of memory, washed in slate up to its size.
        ctx.globalCompositeOperation = p.op;
        wash(ctx, shape([[X(0), Y(0)], [X(0), Y(WEIGHTS_GB)], [X(MAX_TOKENS / 2), Y(WEIGHTS_GB) - 1], [X(MAX_TOKENS), Y(WEIGHTS_GB)], [X(MAX_TOKENS), Y(0)]], rand),
            { color: p.pale, layers: 14, alpha: 0.045, baseVar: 0.004, layerVar: 0.006, texture: 0.7 }, rand);
        // The cache: grows by the same amount with every token, washed beneath its line.
        wash(ctx, shape([[X(0), Y(0)], [X(MAX_TOKENS), Y(cacheGB(MAX_TOKENS))], [X(MAX_TOKENS), Y(0)]], rand),
            { color: p.bay, layers: 10, alpha: 0.035, baseVar: 0.004, layerVar: 0.006, texture: 0.7 }, rand);
        ctx.globalCompositeOperation = 'source-over';

        brush(ctx, pad.l, Y(0), w - pad.r + 4, Y(0) + 0.4, 1.2, 0.8, ink, 0.8, rand);
        brush(ctx, pad.l, Y(0), pad.l - 0.4, pad.t - 8, 1.2, 0.8, ink, 0.8, rand);
        brush(ctx, X(0), Y(WEIGHTS_GB), X(MAX_TOKENS), Y(WEIGHTS_GB) + 0.3, 1.1, 1.1, ink, 0.55, rand);

        ctx.save();
        ctx.strokeStyle = ink;
        ctx.lineCap = 'round';
        [[1.6, 0.9, 0], [0.6, 0.45, 0.5]].forEach(([lw, a, off]) => {
            ctx.lineWidth = lw;
            ctx.globalAlpha = a;
            ctx.beginPath();
            for (let i = 0; i <= 40; i++) {
                const t = (i / 40) * MAX_TOKENS;
                const x = X(t), y = Y(cacheGB(t)) + off + Math.sin(i * 1.7) * 0.25;
                if (i) ctx.lineTo(x, y);
                else ctx.moveTo(x, y);
            }
            ctx.stroke();
        });
        ctx.restore();

        ctx.fillStyle = muted;
        ctx.font = `${narrow ? 12 : 14}px ${serif}`;
        ctx.textAlign = 'center';
        [[0, '0'], [250000, '250K'], [500000, '500K'], [750000, '750K'], [1000000, '1M']].forEach(([t, label]) => ctx.fillText(label, X(t), Y(0) + 19));
        ctx.textAlign = 'right';
        [0, 100, 200, 300].forEach((gb) => ctx.fillText(String(gb), pad.l - 9, Y(gb) + 4));
        smallCaps('TOKENS OF CONTEXT', w - pad.r, Y(0) + 38, 'right');
        smallCaps('GB', pad.l - 9, pad.t - 16, 'right');

        ctx.fillStyle = ink;
        ctx.font = `italic ${narrow ? 14 : 16}px ${serif}`;
        ctx.textAlign = 'left';
        ctx.fillText('Two memories in one model', pad.l + 12, pad.t - 14);

        ctx.font = `italic ${narrow ? 12 : 14}px ${serif}`;
        ctx.fillStyle = ink;
        ctx.fillText(`Weights, ${Math.round(WEIGHTS_GB)} GB`, X(narrow ? 0.62e6 : 0.7e6), Y(WEIGHTS_GB / 2) + 5);
        ctx.textAlign = 'right';
        ctx.fillText(`KV cache, ${Math.round(cacheGB(MAX_TOKENS))} GB at 1M`, X(MAX_TOKENS) - 4, Y(cacheGB(MAX_TOKENS)) - 10);

        // Pencilled notes where something happens: the native window, and the crossing.
        const nx = X(NATIVE_CONTEXT), ny = Y(cacheGB(NATIVE_CONTEXT));
        ctx.fillStyle = muted;
        ctx.textAlign = 'left';
        ctx.font = `italic ${narrow ? 11 : 13}px ${serif}`;
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.arc(nx, ny, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = muted;
        ctx.fillText(`128K window: ${Math.round(cacheGB(NATIVE_CONTEXT))} GB`, nx + 34, ny + 5);
        pencil(ctx, [[nx + 5, ny + 1], [nx + 18, ny + 1.5], [nx + 30, ny + 1]], muted, 0.9, rand);

        const cx = X(CROSSOVER), cy = Y(WEIGHTS_GB);
        ctx.fillStyle = rubric;
        ctx.beginPath();
        ctx.arc(cx, cy, 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = muted;
        ctx.textAlign = 'left';
        const crossLabelY = cy - (narrow ? 64 : 78);
        ctx.fillText('the cache outgrows the model', cx - 52, crossLabelY);
        ctx.fillText(`at ${Math.round(CROSSOVER / 1000)}K tokens`, cx - 52, crossLabelY + (narrow ? 14 : 16));
        pencil(ctx, Array.from({ length: 9 }, (_, i) => {
            const t = i / 8;
            return [cx - 22 + t * 18, crossLabelY + 24 + t * (cy - crossLabelY - 30) - Math.sin(t * Math.PI) * 6];
        }), muted, 0.9, rand);
    }

    paint();
    darkQuery.addEventListener('change', paint);
    let timer = null, lastWidth = innerWidth;
    addEventListener('resize', () => {
        if (innerWidth === lastWidth) return;
        lastWidth = innerWidth;
        clearTimeout(timer);
        timer = setTimeout(paint, 150);
    });
    document.fonts?.ready.then(paint);
})();
