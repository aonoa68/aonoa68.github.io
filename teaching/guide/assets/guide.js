/* 統計の考え方ガイド 共通関数。window.Guide に公開する。primates.js の後に読み込む */
(function () {
    "use strict";
    const P = window.PRIMATES;
    const idx = Object.fromEntries(P.cols.map((c, i) => [c, i]));
    const G = {};
    G.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // ページの言語（<html lang="en"> なら英語表示）
    G.lang = (document.documentElement.lang || "ja").slice(0, 2) === "en" ? "en" : "ja";
    const EN_LABELS = { "体重g": "Body mass", "頭胴長mm": "Head-body length", "新生児体重g": "Neonate body mass", "集団サイズ": "Group size", "妊娠期間日": "Gestation length", "離乳日齢": "Age at weaning", "初産日齢": "Age at first birth", "出産間隔日": "Interbirth interval", "一腹産子数": "Litter size", "最長寿命月": "Maximum longevity", "行動圏km2": "Home range size", "個体群密度": "Population density", "分布域km2": "Geographic range area", "栄養段階": "Trophic level", "生息環境幅": "Habitat breadth", "平均気温C": "Mean temperature of range", "月降水量mm": "Monthly precipitation of range" };
    const EN_UNITS = { "頭": "individuals", "日": "days", "か月": "months", "頭/km²": "per km²", "℃": "°C" };
    const EN_FAMILY = { "オナガザル科": "Cercopithecidae", "オマキザル科": "Cebidae", "サキ科": "Pitheciidae", "クモザル科": "Atelidae", "キツネザル科": "Lemuridae", "コビトキツネザル科": "Cheirogaleidae", "ガラゴ科": "Galagidae", "テナガザル科": "Hylobatidae", "ヨザル科": "Aotidae", "ロリス科": "Lorisidae", "インドリ科": "Indriidae", "ヒト科": "Hominidae", "イタチキツネザル科": "Lepilemuridae", "メガネザル科": "Tarsiidae", "アイアイ科": "Daubentoniidae" };
    G.css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    /* ---- データ ---- */
    G.rows = P.rows;
    G.label = key => G.lang === "en" ? (EN_LABELS[key] || key) : (P.labels[key] || key);
    G.unit = key => { const u = P.units[key] || ""; return G.lang === "en" ? (EN_UNITS[u] ?? u) : u; };
    G.get = (row, key) => row[idx[key]];
    // key の値が揃う行を {v:[値...], row} で返す。log=true のキーは正の値だけ残して log10 を取る
    G.select = (keys, logKeys = []) => P.rows.filter(r => keys.every(k => {
        const v = r[idx[k]]; return v !== null && v !== undefined && (!logKeys.includes(k) || v > 0);
    })).map(r => ({ row: r, v: keys.map(k => logKeys.includes(k) ? Math.log10(r[idx[k]]) : r[idx[k]]) }));
    G.family = row => row[idx["科"]];                       // データ上の値（和名）。比較や絞り込みにはこちらを使う
    G.familyLabel = name => G.lang === "en" ? (EN_FAMILY[name] || name) : name;  // 表示用
    G.species = row => row[idx["学名"]];

    /* ---- 統計 ---- */
    G.sum = a => a.reduce((s, x) => s + x, 0);
    G.mean = a => G.sum(a) / a.length;
    G.median = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
    G.quantile = (a, q) => { const s = [...a].sort((x, y) => x - y); const p = (s.length - 1) * q, lo = Math.floor(p), hi = Math.ceil(p); return s[lo] + (s[hi] - s[lo]) * (p - lo); };
    G.sd = (a, sample = true) => { const m = G.mean(a); return Math.sqrt(G.sum(a.map(x => (x - m) ** 2)) / (a.length - (sample ? 1 : 0))); };
    G.corr = (x, y) => { const mx = G.mean(x), my = G.mean(y); let sxy = 0, sx = 0, sy = 0; for (let i = 0; i < x.length; i++) { const dx = x[i] - mx, dy = y[i] - my; sxy += dx * dy; sx += dx * dx; sy += dy * dy; } return sxy / Math.sqrt(sx * sy); };
    G.linreg = (x, y) => { const mx = G.mean(x), my = G.mean(y); let sxy = 0, sx = 0; for (let i = 0; i < x.length; i++) { sxy += (x[i] - mx) * (y[i] - my); sx += (x[i] - mx) ** 2; } const slope = sxy / sx; return { slope, intercept: my - slope * mx }; };
    // 再現できる乱数（mulberry32）。seed を省くと Math.random
    G.rng = seed => { if (seed === undefined) return Math.random; let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
    G.shuffle = (a, rnd = Math.random) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    G.normalPdf = (x, mu, s) => Math.exp(-((x - mu) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
    // t分布の 97.5% 点（自由度 df）。df=1〜30 は正確な値の表（scipy.stats.t.ppf で作成）、31以上は Hill (1970) の展開式（誤差 0.001 未満）
    const T975 = [12.7062,4.3027,3.1824,2.7764,2.5706,2.4469,2.3646,2.3060,2.2622,2.2281,2.2010,2.1788,2.1604,2.1448,2.1314,2.1199,2.1098,2.1009,2.0930,2.0860,2.0796,2.0739,2.0687,2.0639,2.0595,2.0555,2.0518,2.0484,2.0452,2.0423];
    G.t975 = df => { if (df >= 1 && df <= 30 && Number.isInteger(df)) return T975[df - 1]; const z = 1.959964; const g1 = (z ** 3 + z) / 4, g2 = (5 * z ** 5 + 16 * z ** 3 + 3 * z) / 96, g3 = (3 * z ** 7 + 19 * z ** 5 + 17 * z ** 3 - 15 * z) / 384; return z + g1 / df + g2 / df ** 2 + g3 / df ** 3; };

    /* ---- 表示 ---- */
    G.fmt = (v, d = 0) => Number(v).toLocaleString(G.lang === "en" ? "en-US" : "ja-JP", { minimumFractionDigits: d, maximumFractionDigits: d });
    G.g = v => G.fmt(Math.round(v)) + " g";
    // 大きな数の短い表記。日本語は「1.5万」、英語は「15k」
    G.man = v => G.lang === "en" ? (Math.abs(v) >= 1000 ? G.fmt(v / 1000, v % 1000 ? 1 : 0) + "k" : G.fmt(v)) : (Math.abs(v) >= 10000 ? G.fmt(v / 10000, v % 10000 ? 1 : 0) + "万" : G.fmt(v));
    // 10^k の値を読みやすく（log軸の目盛り用）
    G.pow10Label = k => { const v = 10 ** k; return v >= 10000 ? G.man(v) : v >= 1 ? G.fmt(v) : String(+v.toPrecision(1)); };

    /* ---- canvas ---- */
    G.setup = canvas => {
        const dpr = window.devicePixelRatio || 1, w = canvas.clientWidth, h = canvas.clientHeight;
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        const ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
        ctx.font = '12px "DM Sans","Hiragino Kaku Gothic ProN",sans-serif'; ctx.lineWidth = 1;
        return { ctx, w, h };
    };
    /* 軸と格子を描き、座標変換 {x, y} を返す。
       o = { L,R,T,B, xmin,xmax,ymin,ymax, xticks:[値], yticks:[値], xfmt, yfmt, xlabel, ylabel } */
    G.axes = (ctx, w, h, o) => {
        const L = o.L ?? 44, R = o.R ?? 14, T = o.T ?? 30, B = o.B ?? 34, pw = w - L - R, ph = h - T - B;
        const x = v => L + (v - o.xmin) / (o.xmax - o.xmin) * pw, y = v => T + ph - (v - o.ymin) / (o.ymax - o.ymin) * ph;
        ctx.strokeStyle = G.css("--line"); ctx.fillStyle = G.css("--faint");
        ctx.textAlign = "right"; ctx.textBaseline = "middle";
        (o.yticks || []).forEach(v => { ctx.beginPath(); ctx.moveTo(L, y(v)); ctx.lineTo(L + pw, y(v)); ctx.stroke(); ctx.fillText((o.yfmt || G.fmt)(v), L - 6, y(v)); });
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        (o.xticks || []).forEach(v => { if (o.xgrid) { ctx.beginPath(); ctx.moveTo(x(v), T); ctx.lineTo(x(v), T + ph); ctx.stroke(); } ctx.fillText((o.xfmt || G.fmt)(v), x(v), T + ph + 8); });
        ctx.strokeStyle = G.css("--faint"); ctx.beginPath(); ctx.moveTo(L, T + ph + 0.5); ctx.lineTo(L + pw, T + ph + 0.5); ctx.stroke();
        if (o.ylabel) { ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(o.ylabel, 4, 4); }
        if (o.xlabel) { ctx.textAlign = "right"; ctx.textBaseline = "top"; ctx.fillText(o.xlabel, L + pw, 4); }
        return { x, y, L, T, pw, ph };
    };
    G.niceStep = (range, maxTicks = 6) => { const raw = range / maxTicks, p = 10 ** Math.floor(Math.log10(raw)); return [1, 2, 2.5, 5, 10].map(m => m * p).find(s => s >= raw); };
    G.ticks = (min, max, maxTicks = 6) => { const s = G.niceStep(max - min, maxTicks), out = []; for (let v = Math.ceil(min / s) * s; v <= max + 1e-9; v += s) out.push(+v.toFixed(10)); return out; };
    G.logTicks = (min, max) => { const out = []; for (let k = Math.ceil(min); k <= Math.floor(max); k++) out.push(k); return out; };
    // 右上に凡例を並べる。items = [{color, label, kind:"line"|"box"|"dot"}]
    G.legend = (ctx, w, items, y = 10) => {
        let lx = w - 14; ctx.textBaseline = "middle"; ctx.textAlign = "right";
        items.forEach(it => {
            ctx.fillStyle = it.color; ctx.fillText(it.label, lx, y); const tw = ctx.measureText(it.label).width;
            ctx.strokeStyle = it.color; ctx.lineWidth = 2;
            if (it.kind === "box") ctx.fillRect(lx - tw - 18, y - 5, 10, 10);
            else if (it.kind === "dot") { ctx.beginPath(); ctx.arc(lx - tw - 12, y, 4, 0, Math.PI * 2); ctx.fill(); }
            else { ctx.beginPath(); ctx.moveTo(lx - tw - 22, y); ctx.lineTo(lx - tw - 6, y); ctx.stroke(); }
            ctx.lineWidth = 1; lx -= tw + 40;
        });
    };
    // リサイズとフォント読み込み完了で描き直す
    G.onRedraw = fn => {
        let t; window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(fn, 120); });
        (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(fn);
        fn();
    };
    window.Guide = G;
})();
