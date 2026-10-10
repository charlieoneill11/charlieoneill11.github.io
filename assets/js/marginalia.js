// Small things at the edges of the page: a painted initial, boats between sections, an end mark,
// washes behind footnotes, the reader's pencil, foxing on old essays, a moth at night, the shelf and
// a few pieces of paper ephemera. Each one looks for the page it belongs on and does nothing elsewhere.
(() => {
    'use strict';

    if (!window.Paint) return;
    const { TAU, dpr, darkQuery, DAY, palette, mulberry32, gaussian, seedOf, shape, ellipse, wash, rim, brush, sprite, blit, fit,
        paintBoat, paintBloom, paintMothWing, drawMoth, paintFern } = window.Paint;

    const stillQuery = matchMedia('(prefers-reduced-motion: reduce)');
    const hoverQuery = matchMedia('(hover: hover) and (pointer: fine)');
    const SVG = 'http://www.w3.org/2000/svg';
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    const repaints = [];
    const repaintAll = () => repaints.forEach((f) => f());
    const onRepaint = (f) => { repaints.push(f); f(); };
    let resizeTimer = null, lastWidth = innerWidth;
    addEventListener('resize', () => {
        if (innerWidth === lastWidth) return;
        lastWidth = innerWidth;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(repaintAll, 150);
    });
    darkQuery.addEventListener('change', repaintAll);

    const storage = () => { try { return window.localStorage; } catch { return null; } };

    // Text nodes of an element in reading order, skipping footnote numbers and margin notes.
    function textNodes(el) {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
            acceptNode: (n) => (n.parentElement.closest('sup, .sidenote, .hedera') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
        });
        const out = [];
        while (walker.nextNode()) out.push(walker.currentNode);
        return out;
    }

    function rangeOf(nodes, start, end) {
        const at = (pos) => {
            let acc = 0;
            for (const n of nodes) {
                if (pos <= acc + n.data.length) return [n, pos - acc];
                acc += n.data.length;
            }
            const last = nodes[nodes.length - 1];
            return [last, last.data.length];
        };
        const r = document.createRange();
        r.setStart(...at(start));
        r.setEnd(...at(end));
        return r;
    }

    // One box per line of a range, merging the fragments that links and italics split it into.
    function lineBoxes(range) {
        const lines = [];
        for (const r of range.getClientRects()) {
            if (r.width < 1) continue;
            const line = lines.find((l) => Math.abs(l.bottom - r.bottom) < 4);
            if (line) {
                line.left = Math.min(line.left, r.left);
                line.right = Math.max(line.right, r.right);
                line.top = Math.min(line.top, r.top);
            } else {
                lines.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
            }
        }
        return lines;
    }

    function sentencesOf(text) {
        const spans = [];
        const push = (a, seg) => {
            const lead = seg.length - seg.trimStart().length;
            const b = a + seg.trimEnd().length;
            if (b > a + lead) spans.push([a + lead, b]);
        };
        if (window.Intl && Intl.Segmenter) {
            for (const s of new Intl.Segmenter('en', { granularity: 'sentence' }).segment(text)) push(s.index, s.segment);
        } else {
            const re = /[^.!?]+(?:[.!?]+["”’)]*)?\s*/g;
            let m;
            while ((m = re.exec(text))) push(m.index, m[0]);
        }
        return spans;
    }

    // A wash over a set of line boxes, for highlights. `boxes` are relative to the canvas.
    function washLines(ctx, boxes, p, rand) {
        ctx.globalCompositeOperation = p.op;
        boxes.forEach(({ x, y, w, h }) => {
            const pts = shape([[x, y + 2], [x + w * 0.5, y], [x + w, y + 1], [x + w + 2, y + h * 0.5], [x + w, y + h], [x + w * 0.5, y + h + 1], [x, y + h - 1], [x - 2, y + h * 0.5]], rand);
            wash(ctx, pts, { color: p.pale, layers: 12, alpha: 0.08, baseVar: 0.025, layerVar: 0.02, texture: 0.6 }, rand);
            wash(ctx, pts, { color: p.bay, layers: 4, alpha: 0.05, baseVar: 0.04, layerVar: 0.03 }, rand);
        });
    }

    // ---- Essays ----------------------------------------------------------------------------

    function smallCapAcronyms(content) {
        const skip = 'code, pre, kbd, script, style, svg, math, mjx-container, sup, h1, h2, h3, .caps';
        const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
            acceptNode: (n) => (n.parentElement.closest(skip) || !/[A-Z][A-Z0-9]/.test(n.data) || /\$|\\\(|\\\[/.test(n.data)
                ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
        });
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        const re = /\b([A-Z][A-Z0-9]+)(?=s?\b)/g;
        nodes.forEach((node) => {
            const text = node.data;
            const frag = document.createDocumentFragment();
            let last = 0, m;
            re.lastIndex = 0;
            while ((m = re.exec(text))) {
                if (m.index > last) frag.append(text.slice(last, m.index));
                const span = document.createElement('span');
                span.className = 'caps';
                span.textContent = m[1];
                frag.append(span);
                last = m.index + m[1].length;
            }
            if (!last) return;
            frag.append(text.slice(last));
            node.replaceWith(frag);
        });
    }

    // The first paragraph of prose takes a rubricated initial on a small wash of blue.
    function initial(content) {
        const first = [...content.children].find((el) => !el.matches('aside, hr, .dinkus, figure, script') && el.textContent.trim());
        if (!first || first.tagName !== 'P' || !/^[“"‘']?[A-Za-z]/.test(first.textContent.trim())) return;
        first.classList.add('opening');
        const canvas = document.createElement('canvas');
        canvas.className = 'initial-wash';
        canvas.setAttribute('aria-hidden', 'true');
        content.append(canvas);
        onRepaint(() => {
            canvas.style.left = `${first.offsetLeft - 30}px`;
            canvas.style.top = `${first.offsetTop - 18}px`;
            const { ctx, w, h } = fit(canvas);
            const p = palette();
            const rand = mulberry32(seedOf(location.pathname));
            ctx.globalCompositeOperation = p.op;
            wash(ctx, ellipse(w * 0.46, h * 0.5, w * 0.34, h * 0.33, 9, rand), { color: p.pale, layers: 22, alpha: 0.06, baseVar: 0.12, layerVar: 0.07, texture: 0.6 }, rand);
            wash(ctx, ellipse(w * 0.43, h * 0.53, w * 0.19, h * 0.18, 8, rand), { color: p.bay, layers: 10, alpha: 0.05, baseVar: 0.1, layerVar: 0.06, texture: 0.5 }, rand);
            rim(ctx, ellipse(w * 0.46, h * 0.5, w * 0.31, h * 0.3, 9, rand), { color: p.bay, width: 0.7, alpha: 0.18, variance: 0.08, closed: true }, rand);
        });
    }

    // Section breaks become one of the homepage boats, painted small.
    function boatsBetweenSections(content) {
        content.querySelectorAll(':scope > hr').forEach((hr, i) => {
            const div = document.createElement('div');
            div.className = 'dinkus';
            div.setAttribute('role', 'separator');
            const canvas = document.createElement('canvas');
            canvas.setAttribute('aria-hidden', 'true');
            div.append(canvas);
            hr.replaceWith(div);
            onRepaint(() => {
                const { ctx, w, h } = fit(canvas);
                const p = palette();
                const seed = seedOf(location.pathname) + i * 7;
                blit(ctx, paintBloom(26, p, seed), w / 2, h - 14);
                blit(ctx, paintBoat(26, p, seed, false), w / 2, h - 14, i % 2 ? -1 : 1, 1);
            });
        });
    }

    // A hedera after the last word, so the last paragraph knows it is the last.
    function endMark(content) {
        const blocks = [...content.children].filter((el) => !el.matches('.footnotes, aside, script, style, figure, hr, .dinkus, canvas, svg'));
        let target = blocks[blocks.length - 1];
        while (target && target.matches('ul, ol, blockquote') && target.lastElementChild) target = target.lastElementChild;
        if (!target || !target.matches('p, li') || !target.textContent.trim()) return;
        const mark = document.createElement('span');
        mark.className = 'hedera';
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = '❧';
        target.append(mark);
    }

    // Point at a footnote and the phrase it belongs to is washed in pale blue.
    function footnoteWashes(content) {
        const refs = [...content.querySelectorAll('sup[id^="fnref"]')];
        if (!refs.length) return;
        const canvas = document.createElement('canvas');
        canvas.className = 'note-wash';
        canvas.setAttribute('aria-hidden', 'true');
        content.append(canvas);
        let active = null;

        function phrase(sup) {
            const block = sup.parentElement.closest('p, li, blockquote, td') || sup.parentElement;
            const nodes = textNodes(block).filter((n) => n.compareDocumentPosition(sup) & Node.DOCUMENT_POSITION_FOLLOWING);
            if (!nodes.length) return null;
            const text = nodes.map((n) => n.data).join('');
            let end = text.length;
            while (end > 0 && /\s/.test(text[end - 1])) end--;
            let start = 0;
            const re = /[.!?…]["”’)\]]*\s+/g;
            let m;
            while ((m = re.exec(text)) && m.index + m[0].length < end - 1) start = m.index + m[0].length;
            return rangeOf(nodes, start, end);
        }

        function show(sup) {
            if (active === sup) return;
            active = sup;
            const range = phrase(sup);
            if (!range) return;
            const lines = lineBoxes(range);
            if (!lines.length) return;
            const base = content.getBoundingClientRect();
            const left = Math.min(...lines.map((l) => l.left)) - base.left - 8, top = Math.min(...lines.map((l) => l.top)) - base.top - 6;
            const right = Math.max(...lines.map((l) => l.right)) - base.left + 8, bottom = Math.max(...lines.map((l) => l.bottom)) - base.top + 6;
            Object.assign(canvas.style, { left: `${left}px`, top: `${top}px`, width: `${right - left}px`, height: `${bottom - top}px` });
            const { ctx } = fit(canvas);
            washLines(ctx, lines.map((l) => ({ x: l.left - base.left - left - 3, y: l.top - base.top - top + (l.bottom - l.top) * 0.1, w: l.right - l.left + 6, h: (l.bottom - l.top) * 0.84 })), palette(), mulberry32((Math.random() * 1e9) | 0));
            canvas.classList.add('on');
            sup.nextElementSibling?.classList.contains('sidenote') && sup.nextElementSibling.classList.add('on');
        }

        function hide() {
            active = null;
            canvas.classList.remove('on');
            content.querySelectorAll('.sidenote.on').forEach((n) => n.classList.remove('on'));
        }

        refs.forEach((sup) => {
            const link = sup.querySelector('a');
            const note = sup.nextElementSibling?.classList.contains('sidenote') ? sup.nextElementSibling : null;
            [link, note].filter(Boolean).forEach((el) => {
                el.addEventListener('pointerenter', () => show(sup));
                el.addEventListener('pointerleave', hide);
            });
            link?.addEventListener('focus', () => show(sup));
            link?.addEventListener('blur', hide);
        });
        repaints.push(() => { if (active) { const sup = active; active = null; show(sup); } });
    }

    // Press and hold a sentence to underline it in pencil. A fully underlined paragraph earns a tick
    // in the margin. The marks live only in this reader's browser.
    function readersPencil(content) {
        if (!hoverQuery.matches) return;
        const paras = [...content.querySelectorAll(':scope > p, :scope > blockquote > p')]
            .filter((p) => p.textContent.trim().length > 30 && !p.querySelector('img, mjx-container, canvas'));
        if (!paras.length) return;
        const key = `pencil:${location.pathname}`;
        let marks = {};
        try { marks = JSON.parse(storage()?.getItem(key)) || {}; } catch { marks = {}; }
        const save = () => {
            try {
                const s = storage();
                if (Object.keys(marks).length) s?.setItem(key, JSON.stringify(marks));
                else s?.removeItem(key);
            } catch {}
            syncControls();
        };

        const layer = document.createElementNS(SVG, 'svg');
        layer.setAttribute('class', 'pencil-layer');
        layer.setAttribute('aria-hidden', 'true');
        content.append(layer);

        const models = new Map();
        const model = (p) => {
            if (!models.has(p)) {
                const nodes = textNodes(p);
                const text = nodes.map((n) => n.data).join('');
                models.set(p, { nodes, text, sentences: sentencesOf(text) });
            }
            return models.get(p);
        };

        function path(d, animate) {
            const el = document.createElementNS(SVG, 'path');
            el.setAttribute('d', d);
            el.setAttribute('pathLength', '1');
            el.setAttribute('class', 'pencil-line');
            layer.append(el);
            if (animate && !stillQuery.matches) requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('drawn')));
            else el.classList.add('drawn');
        }

        function underline(p, i, animate) {
            const m = model(p);
            const [s, e] = m.sentences[i] || [];
            if (s == null) return;
            const base = content.getBoundingClientRect();
            const rand = mulberry32(paras.indexOf(p) * 131 + i * 17 + 3);
            lineBoxes(rangeOf(m.nodes, s, e)).forEach((l) => {
                const x0 = l.left - base.left - 1, x1 = l.right - base.left + 1, y = l.bottom - base.top - 3;
                let d = `M${x0.toFixed(1)} ${(y + gaussian(rand) * 0.4).toFixed(1)}`;
                for (let x = x0 + 16; x < x1 - 4; x += 16) d += ` L${x.toFixed(1)} ${(y + gaussian(rand) * 0.45 - ((x - x0) / (x1 - x0)) * 0.9).toFixed(1)}`;
                d += ` L${x1.toFixed(1)} ${(y - 1.1 + gaussian(rand) * 0.3).toFixed(1)}`;
                path(d, animate);
            });
        }

        function tick(p, animate) {
            const base = content.getBoundingClientRect(), r = p.getBoundingClientRect();
            const x = -26, y = r.top - base.top + 15;
            path(`M${x} ${y} L${x + 5} ${y + 7} L${x + 16} ${y - 9}`, animate);
        }

        function complete(p) {
            const list = marks[paras.indexOf(p)] || [];
            return list.length && list.length === model(p).sentences.length;
        }

        function redraw() {
            layer.replaceChildren();
            models.clear();
            paras.forEach((p, idx) => {
                (marks[idx] || []).forEach((i) => underline(p, i, false));
                if (complete(p)) tick(p, false);
            });
        }

        function caretAt(x, y) {
            if (document.caretPositionFromPoint) {
                const c = document.caretPositionFromPoint(x, y);
                return c && [c.offsetNode, c.offset];
            }
            if (document.caretRangeFromPoint) {
                const r = document.caretRangeFromPoint(x, y);
                return r && [r.startContainer, r.startOffset];
            }
            return null;
        }

        function toggleAt(p, x, y) {
            const caret = caretAt(x, y);
            if (!caret) return;
            const m = model(p);
            let pos = 0;
            for (const n of m.nodes) {
                if (n === caret[0]) { pos += caret[1]; break; }
                pos += n.data.length;
            }
            const i = m.sentences.findIndex(([s, e]) => pos >= s && pos <= e);
            if (i < 0) return;
            const hit = lineBoxes(rangeOf(m.nodes, ...m.sentences[i])).some((l) => x >= l.left - 4 && x <= l.right + 4 && y >= l.top - 4 && y <= l.bottom + 4);
            if (!hit) return;
            const idx = paras.indexOf(p);
            const list = new Set(marks[idx] || []);
            if (list.has(i)) {
                list.delete(i);
                if (list.size) marks[idx] = [...list];
                else delete marks[idx];
                save();
                redraw();
                return;
            }
            list.add(i);
            marks[idx] = [...list].sort((a, b) => a - b);
            save();
            underline(p, i, true);
            if (complete(p)) setTimeout(() => tick(p, true), 600);
        }

        let hold = null;
        const cancel = () => { if (hold) clearTimeout(hold.timer); hold = null; };
        content.addEventListener('pointerdown', (e) => {
            if (e.pointerType !== 'mouse' || e.button !== 0) return;
            if (e.target.closest('a, sup, .sidenote, button, code, img, .caps')) return;
            const p = e.target.closest('p');
            if (!p || !paras.includes(p)) return;
            const x = e.clientX, y = e.clientY;
            hold = { x, y, timer: setTimeout(() => { hold = null; toggleAt(p, x, y); }, 450) };
        });
        addEventListener('pointermove', (e) => { if (hold && Math.hypot(e.clientX - hold.x, e.clientY - hold.y) > 4) cancel(); });
        addEventListener('pointerup', cancel);
        addEventListener('pointercancel', cancel);

        // A quiet note at the foot of the essay, with a way to rub the marks out.
        const end = document.querySelector('.post-end');
        let controls = null;
        function syncControls() { if (controls) controls.rub.hidden = !Object.keys(marks).length; }
        if (end) {
            const note = document.createElement('span');
            note.className = 'pencil-note';
            note.innerHTML = '<span>Press and hold a sentence to underline it.</span> <button type="button">Rub out</button>';
            end.append(note);
            controls = { rub: note.querySelector('button') };
            controls.rub.addEventListener('click', () => {
                layer.querySelectorAll('path').forEach((el) => el.classList.add('gone'));
                marks = {};
                save();
                setTimeout(redraw, stillQuery.matches ? 0 : 600);
            });
            syncControls();
        }

        onRepaint(redraw);
        document.fonts?.ready.then(redraw);
    }

    // Old essays pick up foxing, the rust-coloured freckles of old paper, once they are past two.
    // The paper's warming itself is set from --age in the post layout, before first paint.
    function foxing(article) {
        const time = article.querySelector('.post-meta time');
        if (!time) return;
        const years = (Date.now() - Date.parse(time.getAttribute('datetime'))) / (365.25 * 864e5);
        const count = Math.floor(clamp(years - 1.6, 0, 3) * 12);
        if (!count) return;
        const layer = document.createElement('div');
        layer.className = 'foxing';
        layer.setAttribute('aria-hidden', 'true');
        document.body.append(layer);
        onRepaint(() => {
            layer.replaceChildren();
            if (darkQuery.matches) return;
            const height = document.documentElement.scrollHeight;
            layer.style.height = `${height}px`;
            const rand = mulberry32(seedOf(location.pathname) ^ 0x5f3759df);
            for (let i = 0; i < count; i++) {
                const size = 1 + rand() ** 2 * 4.5;
                const s = sprite(size * 5, size * 5, size * 2.5, size * 2.5);
                s.ctx.globalCompositeOperation = 'multiply';
                wash(s.ctx, ellipse(0, 0, size, size * (0.8 + rand() * 0.4), 7, rand), { color: '#b07c48', layers: 4, alpha: 0.18, baseVar: 0.2, layerVar: 0.1 }, rand);
                s.ctx.fillStyle = 'rgba(120, 70, 30, 0.25)';
                s.ctx.beginPath();
                s.ctx.arc(0, 0, size * 0.35, 0, TAU);
                s.ctx.fill();
                s.canvas.style.width = `${s.w}px`;
                s.canvas.style.height = `${s.h}px`;
                s.canvas.style.left = `${(0.02 + rand() * 0.96) * 100}%`;
                s.canvas.style.top = `${Math.round((0.03 + rand() * 0.94) * height)}px`;
                layer.append(s.canvas);
            }
        });
    }

    // ---- Every page ------------------------------------------------------------------------

    // At night, rest on a link and it warms like a lamp. After a moment a moth comes to it.
    function mothToTheLamp() {
        if (!hoverQuery.matches) return;
        const S = 13;
        const COLS = ['#d8cdb8', '#c4b8a1', '#9c907c', '#6e6457'];
        let canvas = null, wing = null, running = false, last = null, lit = null, dwell = null, orbit = 0;
        const moth = { x: 0, y: 0, vx: 0, vy: 0, ang: 0, alive: false, target: null, exit: null };

        function ensureCanvas() {
            if (canvas) return;
            canvas = document.createElement('canvas');
            canvas.className = 'moth';
            canvas.setAttribute('aria-hidden', 'true');
            document.body.append(canvas);
            fit(canvas);
            wing = paintMothWing(S, COLS, 77);
            addEventListener('resize', () => fit(canvas));
        }

        function light(a) {
            if (lit === a) return;
            if (lit) lit.classList.remove('lit');
            lit = a && darkQuery.matches ? a : null;
            if (!lit) {
                moth.target = null;
                if (moth.alive) moth.exit = { x: moth.x < innerWidth / 2 ? -80 : innerWidth + 80, y: moth.y - 160 };
                return;
            }
            lit.classList.add('lit');
            if (stillQuery.matches) return;
            setTimeout(() => {
                if (lit !== a) return;
                ensureCanvas();
                if (!moth.alive) {
                    const r = a.getBoundingClientRect();
                    const fromLeft = r.left + r.width / 2 < innerWidth / 2;
                    Object.assign(moth, { x: fromLeft ? -30 : innerWidth + 30, y: r.top - 60 + Math.random() * 120, vx: 0, vy: 0, alive: true });
                }
                moth.target = a;
                moth.exit = null;
                if (!running) { running = true; last = null; requestAnimationFrame(frame); }
            }, 700);
        }

        function frame(now) {
            const dt = last == null ? 0 : Math.min(0.05, (now - last) / 1000);
            last = now;
            const ctx = canvas.getContext('2d');
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, innerWidth, innerHeight);
            let gx, gy;
            if (moth.target && moth.target.isConnected) {
                const r = moth.target.getBoundingClientRect();
                orbit += dt * 2.4;
                gx = r.left + r.width / 2 + Math.cos(orbit) * Math.max(22, r.width * 0.55) + Math.sin(now / 137) * 5;
                gy = r.top + r.height / 2 - 4 + Math.sin(orbit * 1.3) * 16 + Math.cos(now / 164) * 4;
            } else {
                const exit = moth.exit || { x: innerWidth + 80, y: -80 };
                gx = exit.x;
                gy = exit.y;
            }
            moth.vx += ((gx - moth.x) * 9 - moth.vx * 4.2) * dt;
            moth.vy += ((gy - moth.y) * 9 - moth.vy * 4.2) * dt;
            moth.x += moth.vx * dt;
            moth.y += moth.vy * dt;
            if (Math.hypot(moth.vx, moth.vy) > 4) {
                const d = Math.atan2(moth.vy, moth.vx) + Math.PI / 2 - moth.ang;
                moth.ang += Math.atan2(Math.sin(d), Math.cos(d)) * clamp(dt * 8);
            }
            const gone = !moth.target && (moth.x < -60 || moth.x > innerWidth + 60 || moth.y < -60);
            if (gone) {
                moth.alive = false;
                running = false;
                return;
            }
            drawMoth(ctx, wing, moth.x, moth.y, moth.ang, 0.25 + 0.75 * Math.abs(Math.sin(now / 38)), S, '#6e6457');
            requestAnimationFrame(frame);
        }

        document.addEventListener('pointerover', (e) => {
            if (e.pointerType !== 'mouse') return;
            const a = e.target.closest?.('a[href]');
            if (!a || a === lit) return;
            clearTimeout(dwell);
            dwell = setTimeout(() => light(a), 500);
        });
        document.addEventListener('pointerout', (e) => {
            const a = e.target.closest?.('a[href]');
            if (!a || a.contains(e.relatedTarget)) return;
            clearTimeout(dwell);
            if (lit === a) light(null);
        });
        darkQuery.addEventListener('change', () => light(null));
    }

    // ---- Particular pages ------------------------------------------------------------------

    // The reading list as spines on a shelf, thick books thick. Page counts come from _data/books.yml.
    function shelf(content) {
        const host = document.querySelector('.shelf');
        if (!host) return;
        let known = [];
        try { known = JSON.parse(document.getElementById('book-data').textContent) || []; } catch {}
        const lookup = (title) => known.find((b) => b.title.toLowerCase() === title.toLowerCase()) || {};
        const COLOURS = ['#6f7d5c', '#7c2f28', '#a9844a', '#4a5a6e', '#2f3a48', '#76698a', '#5e4a3c', '#3d5b58', '#8a5a44', '#58607a'];
        const books = [...content.querySelectorAll(':scope > ul > li')].map((li) => {
            const a = li.querySelector('a');
            if (!a) return null;
            const title = a.textContent.trim();
            const after = (a.nextSibling && a.nextSibling.textContent) || '';
            const author = (/^\s*by\s+([^.]+)/.exec(after) || [])[1] || '';
            const info = lookup(title);
            const h = seedOf(title);
            return {
                title, url: a.href, surname: author.trim().split(/\s+/).pop() || '', mum: Boolean(info.mum),
                w: clamp(Math.round(12 + (info.pages || 320) / 20), 14, 64), h: 150 + (h % 46), colour: COLOURS[h % COLOURS.length],
            };
        }).filter(Boolean);
        if (!books.length) return;

        const year = Number(host.dataset.year);
        const spines = books.map((b, i) => {
            const a = document.createElement('a');
            a.className = 'spine';
            a.href = b.url;
            a.style.width = `${b.w}px`;
            a.style.height = `${b.h}px`;
            a.setAttribute('aria-label', `${b.title}${b.surname ? ` by ${b.surname}` : ''}`);
            a.innerHTML = `<canvas aria-hidden="true"></canvas><span class="spine-text"><span></span><span class="by"></span></span>${b.mum ? '<span class="mum" title="Mum recommended it">m</span>' : ''}`;
            a.querySelector('.spine-text span').textContent = b.title;
            a.querySelector('.by').textContent = b.surname;
            a.dataset.i = i;
            return a;
        });

        function arrange() {
            host.replaceChildren();
            const width = host.clientWidth - 40;
            let row = null, used = Infinity;
            spines.forEach((s) => {
                s.classList.remove('lean');
                const w = books[s.dataset.i].w + 3;
                if (used + w > width) {
                    row = document.createElement('div');
                    row.className = 'shelf-row';
                    host.append(row);
                    used = 0;
                }
                row.append(s);
                used += w;
            });
            const lastRow = host.lastElementChild;
            if (lastRow.children.length > 2 && used + 30 < width) lastRow.lastElementChild.classList.add('lean');
            if (year === new Date().getFullYear() && used + 220 < width) {
                const room = document.createElement('p');
                room.className = 'shelf-room';
                room.textContent = `Room for the rest of ${year}.`;
                lastRow.append(room);
            }
            spines.forEach((s) => {
                const b = books[s.dataset.i];
                const { ctx, w, h } = fit(s.querySelector('canvas'));
                const rand = mulberry32(seedOf(b.title));
                ctx.fillStyle = '#efe9dc';
                ctx.fillRect(0, 0, w, h);
                ctx.globalCompositeOperation = 'multiply';
                wash(ctx, shape([[-2, -2], [w + 2, -2], [w + 2, h + 2], [-2, h + 2]], rand), { color: b.colour, layers: 14, alpha: 0.2, baseVar: 0.003, layerVar: 0.004, texture: 0.5 }, rand);
                wash(ctx, shape([[-2, -2], [w * 0.35, -2], [w * 0.3, h + 2], [-2, h + 2]], rand), { color: '#000000', layers: 4, alpha: 0.05, baseVar: 0.01, layerVar: 0.01 }, rand);
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = 'rgba(232, 205, 140, 0.75)';
                ctx.lineWidth = 0.8;
                [10, 13, h - 10, h - 13].forEach((y) => { ctx.beginPath(); ctx.moveTo(3, y); ctx.lineTo(w - 3, y); ctx.stroke(); });
            });
        }
        onRepaint(arrange);
    }

    function bookplate() {
        const canvas = document.querySelector('.bookplate canvas');
        if (!canvas) return;
        onRepaint(() => {
            const { ctx, w, h } = fit(canvas);
            const rand = mulberry32(19);
            ctx.globalCompositeOperation = 'multiply';
            wash(ctx, ellipse(w / 2, h / 2, w * 0.44, h * 0.42, 10, rand), { color: DAY.pale, layers: 14, alpha: 0.07, baseVar: 0.06, layerVar: 0.04, texture: 0.6 }, rand);
            rim(ctx, ellipse(w / 2, h / 2, w * 0.46, h * 0.44, 12, rand), { color: '#3b3a37', width: 0.7, alpha: 0.7, variance: 0.004, depth: 2, closed: true, solid: true }, rand);
            paintFern(ctx, w * 0.24, h * 0.86, h * 0.62, 0.35, DAY, mulberry32(4));
            paintFern(ctx, w * 0.76, h * 0.86, h * 0.62, -0.35, DAY, mulberry32(5));
            blit(ctx, paintBloom(24, DAY, 2), w / 2, h * 0.68);
            blit(ctx, paintBoat(24, DAY, 2, false), w / 2, h * 0.68);
        });
    }

    const today = new Date();
    const day = today.getDate(), month = today.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(), year = today.getFullYear();

    // Email as an envelope: a painted stamp, postmarked with the day you visit.
    function envelope() {
        const env = document.querySelector('.envelope');
        if (!env) return;
        const mark = env.querySelector('.postmark');
        mark.innerHTML = `
            <defs><path id="pm-ring" d="M42 42 m-33 0 a33 33 0 1 1 66 0 a33 33 0 1 1 -66 0"/></defs>
            <g filter="url(#stamp-ink)" fill="none" stroke="currentColor">
                <circle cx="42" cy="42" r="38" stroke-width="1.3"/>
                <circle cx="42" cy="42" r="25" stroke-width="0.9"/>
                ${[0, 1, 2, 3, 4].map((i) => `<path d="M86 ${24 + i * 9} q8 -5 16 0 t16 0 t16 0 t16 0" stroke-width="1.2"/>`).join('')}
                <text fill="currentColor" stroke="none" font-size="7.5" letter-spacing="1.6"><textPath href="#pm-ring">CHARLESPONEILL.COM ✦ POSTED ✦</textPath></text>
                <text x="42" y="41" fill="currentColor" stroke="none" font-size="11" text-anchor="middle">${day} ${month}</text>
                <text x="42" y="52" fill="currentColor" stroke="none" font-size="9" text-anchor="middle">${year}</text>
            </g>`;
        const canvas = env.querySelector('.stamp canvas');
        onRepaint(() => {
            const { ctx, w, h } = fit(canvas);
            const rand = mulberry32(12);
            ctx.fillStyle = '#f7f4ec';
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'multiply';
            wash(ctx, shape([[-4, -4], [w + 4, -4], [w + 4, h * 0.6], [-4, h * 0.62]], rand), { color: '#d4b8a0', layers: 10, alpha: 0.12, baseVar: 0.03, layerVar: 0.03, texture: 0.5 }, rand);
            wash(ctx, shape([[-4, h * 0.64], [w + 4, h * 0.62], [w + 4, h + 4], [-4, h + 4]], rand), { color: DAY.pale, layers: 14, alpha: 0.1, baseVar: 0.03, layerVar: 0.02, texture: 0.6 }, rand);
            blit(ctx, paintBloom(30, DAY, 8), w * 0.52, h * 0.72);
            blit(ctx, paintBoat(30, DAY, 8, true), w * 0.52, h * 0.72);
        });
    }

    function loanCard() {
        const stamp = document.querySelector('.datestamp');
        if (stamp) stamp.textContent = `${day} ${month} ${year}`;
    }

    // ---- Start ------------------------------------------------------------------------------

    function init() {
        const content = document.querySelector('.post-content');
        if (content) {
            smallCapAcronyms(content);
            boatsBetweenSections(content);
            endMark(content);
            initial(content);
            footnoteWashes(content);
            readersPencil(content);
            shelf(content);
        }
        const article = document.querySelector('article.post');
        if (article) foxing(article);
        bookplate();
        envelope();
        loanCard();
        mothToTheLamp();
        document.fonts?.ready.then(repaintAll);
        addEventListener('load', repaintAll);
    }

    if (document.readyState === 'complete') init();
    else document.addEventListener('DOMContentLoaded', init);
})();
