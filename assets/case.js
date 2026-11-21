/* Case study pages: the figures in the hero count up once, and a soft glow follows the pointer
   over a Keuze card (as on the project cards of index.html). */
(function () {
  /* --- live figures: /assets/stats.json is refreshed daily by .github/workflows/stats.yml.
     Without it (offline, file missing) the figures written in the page stay. They are written
     again in the page's language whenever the language changes (the event comes from pages.js);
     window.caseLive.apply(lang) does the same by hand. --- */
  var WORDS = {
    nl: ['nul', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien',
      'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien', 'twintig'],
    en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
  };
  var MONTHS = { januari: 'January', februari: 'February', maart: 'March', april: 'April', mei: 'May', juni: 'June',
    juli: 'July', augustus: 'August', september: 'September', oktober: 'October', november: 'November', december: 'December' };
  var langNow = function () { return document.documentElement.lang === 'en' ? 'en' : 'nl'; };
  var locale = function () { return langNow() === 'en' ? 'en-US' : 'nl-NL'; };
  var counting = false, data = null;
  var apply = function (lang) {
    lang = lang === 'en' ? 'en' : (lang === 'nl' ? 'nl' : langNow());
    var loc = lang === 'en' ? 'en-US' : 'nl-NL';
    var get = function (key) { return data ? key.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, data) : null; };
    document.querySelectorAll('[data-stat]').forEach(function (el) {
      var v = get(el.dataset.stat);
      if (el.classList.contains('count')) {
        if (v != null && v !== '') el.dataset.to = String(v);
        if (counting) return;   // the count-up writes it
        var dec = Number(el.dataset.dec || 0), n = Number(el.dataset.to);
        if (!isNaN(n)) el.textContent = n.toLocaleString(loc, { minimumFractionDigits: dec, maximumFractionDigits: dec });
        return;
      }
      if (v == null || v === '') return;
      v = String(v);
      if (lang === 'en') v = v.replace(/^([a-z]+)\b/, function (m) { return MONTHS[m] || m; });
      el.textContent = v;
    });
    document.querySelectorAll('[data-stat-word]').forEach(function (el) {
      var v = get(el.dataset.statWord);
      if (typeof v !== 'number') return;
      var w = WORDS[lang][v] || String(v);
      el.textContent = el.hasAttribute('data-cap') ? w.charAt(0).toUpperCase() + w.slice(1) : w;
    });
    // plain figures without a live value follow the language too (1,2 / 1.2; 1.073 / 1,073)
    document.querySelectorAll('.b-facts .count:not([data-stat])').forEach(function (el) {
      if (counting) return;
      var dec = Number(el.dataset.dec || 0), n = Number(el.dataset.to);
      if (!isNaN(n)) el.textContent = n.toLocaleString(loc, { minimumFractionDigits: dec, maximumFractionDigits: dec });
    });
  };
  window.caseLive = { apply: apply };
  document.addEventListener('portfolio:lang', function (e) { apply(e.detail); });
  var stats = document.querySelector('[data-stat],[data-stat-word]') ? fetch('/assets/stats.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (s) { data = s; apply(); })
    .catch(function () { apply(); }) : Promise.resolve(apply());

  /* --- figures count up once they come into view (as the intro figures on index.html) --- */
  stats.then(function () {
    var host = document.querySelector('.b-facts');
    if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      if (!entries.some(function (e) { return e.isIntersecting; })) return;
      io.disconnect();
      counting = true;
      setTimeout(function () { counting = false; apply(); }, 1600);   // the count-up is done: write the final figures in the current language
      host.querySelectorAll('.count').forEach(function (el) {
        var to = Number(el.dataset.to), dec = Number(el.dataset.dec || 0);
        if (!to) return;
        var fmt = function (n) { return n.toLocaleString(locale(), { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
        // keep the final width, so nothing beside it moves while counting
        el.style.display = 'inline-block'; el.style.minWidth = el.offsetWidth + 'px'; el.style.textAlign = 'right';
        var t0 = performance.now(), dur = 1500;
        var step = function (now) {
          var k = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - k, 3);
          el.textContent = fmt(Math.round(to * eased * Math.pow(10, dec)) / Math.pow(10, dec));
          if (k < 1) requestAnimationFrame(step);
          else { el.style.display = ''; el.style.minWidth = ''; el.style.textAlign = ''; }
        };
        el.textContent = fmt(0);
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    io.observe(host);
  });

  /* --- Skylanders: listings as dots flowing through a narrowing stream. At each of the five gates
         a share drops out; a few ordinary dots reach the narrow end, and every ~3 s one chosen dot
         passes every gate, turns amber from gate 03 and makes the end dot pulse (the push
         notification). One canvas, devicePixelRatio-aware; the loop only runs while the stream is
         on screen and the tab is visible; reduced motion draws one still frame. --- */
  (function () {
    var host = document.querySelector('.pstream');
    var canvas = host && host.querySelector('.ps-canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var vertical = window.matchMedia('(max-width:700px)');
    var GATES = 5, N = 110;
    var W = 0, H = 0, E = 0, L = 0, dpr = 1, col = {};
    // where an ordinary dot leaves: at gate 1…5, or not at all (it reaches the end): 34/24/16/10/6/10 %
    var DROP = [0.34, 0.24, 0.16, 0.10, 0.06, 0.10];
    var readColours = function () {
      var cs = getComputedStyle(host);
      var g = function (v, f) { return (cs.getPropertyValue(v) || f).trim(); };
      col = { ink: g('--ps-dot', '#473b2d'), tint: g('--ps-tint', 'rgba(0,0,0,.05)'), edge: g('--ps-edge', '#a8966e'), gate: g('--ps-gate', '#55493a'), amber: g('--amber', '#733c07') };
    };
    // geometry: position along the stream (0..L) → centre and half-width
    var half = function (s) { var t = Math.min(1, Math.max(0, s / L)); var hmax = (vertical.matches ? W : H) / 2 - 8, hmin = 7; return hmin + (hmax - hmin) * 0.5 * (1 + Math.cos(Math.PI * t)); };
    var gateAt = function (k) { return (k + 0.5) / GATES * E; };   // gates follow the text columns (full width)
    var toXY = function (s, r) { var h = half(s) * r; return vertical.matches ? [W / 2 + h, s] : [s, H / 2 + h]; };
    var rnd = Math.random;
    var seeded = function (seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; };
    var pickGate = function (r) { var acc = 0; for (var k = 0; k < DROP.length; k++) { acc += DROP[k]; if (r < acc) return k; } return GATES; };
    var exitAt = function (g) { return g < GATES ? gateAt(g) : L; };   // gate GATES = the narrow end
    var parts = [];
    // the chosen dot (at most one in flight) and the pulse at the end it starts when it arrives
    var chosen = null, nextChosen = 0.8, pulse = -1, arrivals = 0, clock = 0;
    var parseRGB = function (c) { ctx.fillStyle = '#000'; ctx.fillStyle = c; var v = ctx.fillStyle;
      if (v[0] === '#') return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)];
      var m = v.match(/[\d.]+/g); return m ? [+m[0], +m[1], +m[2]] : [0, 0, 0]; };
    var mix = function (a, b, t) { return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * t); }).join(',') + ')'; };
    var spawn = function (p, anywhere) {
      p.gate = pickGate(rnd());
      p.s = anywhere ? rnd() * exitAt(p.gate) : -rnd() * 40;
      p.r = (rnd() * 2 - 1) * 0.82;
      p.v = 42 + rnd() * 34;            // px per second along the stream
      p.size = 1.6 + rnd() * 1.1;
      p.out = 0; p.vo = 0; p.a = 1;
      return p;
    };
    var resize = function () {
      var r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height); E = vertical.matches ? H : W; L = E - 40;   // room past the end dot for the whole pulse ring (6 + 30px)
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    var ribbon = function () {
      var steps = 60, i, s, p;
      ctx.beginPath();
      for (i = 0; i <= steps; i++) { s = i / steps * L; p = toXY(s, -1); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
      for (i = steps; i >= 0; i--) { s = i / steps * L; p = toXY(s, 1); ctx.lineTo(p[0], p[1]); }
      ctx.closePath();
      ctx.fillStyle = col.tint; ctx.fill();
      ctx.lineWidth = 1; ctx.strokeStyle = col.edge; ctx.stroke();
    };
    var gates = function () {
      ctx.strokeStyle = col.gate; ctx.lineWidth = 1.25;
      for (var k = 0; k < GATES; k++) {
        var s = gateAt(k), h = half(s) + 10, a = toXY(s, 0);
        ctx.beginPath();
        if (vertical.matches) { ctx.moveTo(a[0] - h, s); ctx.lineTo(a[0] + h, s); ctx.moveTo(a[0] - h, s - 4); ctx.lineTo(a[0] - h, s + 4); ctx.moveTo(a[0] + h, s - 4); ctx.lineTo(a[0] + h, s + 4); }
        else { ctx.moveTo(s, a[1] - h); ctx.lineTo(s, a[1] + h); ctx.moveTo(s - 4, a[1] - h); ctx.lineTo(s + 4, a[1] - h); ctx.moveTo(s - 4, a[1] + h); ctx.lineTo(s + 4, a[1] + h); }
        ctx.stroke();
      }
    };
    var endDot = function () {
      var p = toXY(L, 0), k = pulse >= 0 ? Math.min(1, pulse / 0.9) : 1;   // k: 0 → 1 over the pulse
      var glow = pulse >= 0 ? 0.35 + 0.5 * (1 - k) : 0.35;
      var g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 22);
      g.addColorStop(0, col.amber); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = glow; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], 22, 0, Math.PI * 2); ctx.fill();
      if (pulse >= 0 && k < 1) {   // the notification: a ring that grows and fades
        ctx.globalAlpha = 0.7 * (1 - k); ctx.strokeStyle = col.amber; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(p[0], p[1], 6 + 30 * k, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.fillStyle = col.amber; ctx.beginPath(); ctx.arc(p[0], p[1], 5.5, 0, Math.PI * 2); ctx.fill();
    };
    var drawChosen = function (s) {
      var t = Math.max(0, Math.min(1, (s - gateAt(2)) / (L - gateAt(2))));   // turns amber from gate 03 on
      var xy = toXY(s, 0);
      ctx.globalAlpha = 1; ctx.fillStyle = mix(parseRGB(col.ink), parseRGB(col.amber), t);
      ctx.beginPath(); ctx.arc(xy[0], xy[1], 2.6 + 1.2 * t, 0, Math.PI * 2); ctx.fill();
    };
    var dot = function (x, y, size, a) { ctx.globalAlpha = a; ctx.fillStyle = col.ink; ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill(); };
    var frame = function (dt) {
      ctx.clearRect(0, 0, W, H);
      ribbon(); gates();
      clock += dt;
      parts.forEach(function (p) {
        if (!p.out) {
          p.s += p.v * dt;
          if (p.gate === GATES && p.s >= L) { spawn(p, false); return; }   // reached the end: it merges into the end dot
          if (p.gate < GATES && p.s >= gateAt(p.gate)) { p.out = 1; p.vo = (p.r >= 0 ? 1 : -1) * (14 + rnd() * 18); }   // leaves at its gate, sideways out of the stream
        } else {
          p.s += p.v * 0.35 * dt; p.r += p.vo * dt / Math.max(8, half(p.s)); p.a -= dt * 1.2;
          if (p.a <= 0) spawn(p, false);
        }
        var xy = toXY(p.s, p.r);
        if (p.s >= 0) dot(xy[0], xy[1], p.size, Math.max(0, Math.min(1, p.a)) * 0.7);
      });
      ctx.globalAlpha = 1;
      // the chosen dot: one at a time, a new one some 2.5–3.5 s after the last has left
      if (!chosen && clock >= nextChosen) chosen = { s: 0, v: L / 5.5 };
      if (chosen) {
        chosen.s += chosen.v * dt;
        if (chosen.s >= L) { chosen = null; pulse = 0; arrivals++; nextChosen = clock + 2.5 + rnd(); canvas.dataset.arrivals = String(arrivals); }
        else drawChosen(chosen.s);
      }
      if (pulse >= 0) { pulse += dt; if (pulse > 0.9) pulse = -1; }
      endDot();
      canvas.__ps = { parts: parts, chosen: chosen, pulse: pulse, arrivals: arrivals, gateAt: gateAt, L: L };   // read by the tests only
    };
    var still = function () {
      // a still frame: fewer dots after every gate, the amber dot at the end
      var r = seeded(7), counts = [44, 26, 14, 7, 3];
      ctx.clearRect(0, 0, W, H); ribbon(); gates();
      for (var k = 0; k < GATES; k++) {
        var from = k ? gateAt(k - 1) + 6 : 4, to = gateAt(k) - 6;
        for (var i = 0; i < counts[k]; i++) { var xy = toXY(from + r() * (to - from), (r() * 2 - 1) * 0.8); dot(xy[0], xy[1], 1.6 + r() * 1.1, .7); }
      }
      ctx.globalAlpha = 1; pulse = -1; endDot();
      drawChosen(L - 30);   // the chosen listing, just before it becomes the notification
    };
    var running = false, visible = false, last = 0;
    var loop = function (now) {
      if (!running) return;
      var dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
      frame(dt);
      requestAnimationFrame(loop);
    };
    var start = function () { if (calm) { still(); return; } if (running || !visible || document.hidden) return; running = true; last = performance.now(); requestAnimationFrame(loop); };
    var stop = function () { running = false; };
    var setup = function () {
      resize(); readColours();
      if (!parts.length) for (var i = 0; i < N; i++) parts.push(spawn({}, true));
      if (calm || !running) still();
    };
    setup();
    if ('ResizeObserver' in window) new ResizeObserver(function () { resize(); if (calm || !running) still(); }).observe(canvas);
    new MutationObserver(function () { readColours(); if (calm || !running) still(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    vertical.addEventListener('change', setup);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; visible ? start() : stop(); }).observe(canvas);
    else { visible = true; start(); }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  })();

  /* --- a soft glow follows the pointer over a Keuze card (as on index.html's project cards) --- */
  (function () {
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    document.querySelectorAll('.b-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  })();
})();
