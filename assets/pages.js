/* Shared script for the case study and article pages. The bar, its menus, the command palette
   (⌘K / Ctrl+K), the theme switch (with Option/Alt + T), the language switch, the cursor, the footer
   wordmark and clock follow index.html's code. Theme: the same 'theme' key, light unless 'dark'.
   Language: the same 'lang' key as index.html; the page is Dutch in its HTML, English is applied here
   from the shared labels below and the page's own strings (<script id="i18nPage">). */
(function () {
  var html = document.documentElement;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var FAV = {
    light: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f5eedd'/><rect x='6' y='6' width='88' height='88' fill='none' stroke='%23b66a15' stroke-width='1.5'/><text x='10' y='72' font-family='Georgia,serif' font-size='56' font-weight='bold' fill='%231a1510'>B</text><text x='47' y='67' font-family='Georgia,serif' font-size='18' font-style='italic' fill='%23b66a15'>v</text><text x='55' y='72' font-family='Georgia,serif' font-size='56' font-weight='bold' fill='%231a1510'>Z</text></svg>",
    dark: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230d0b08'/><rect x='6' y='6' width='88' height='88' fill='none' stroke='%23E8962A' stroke-width='1.5'/><text x='10' y='72' font-family='Georgia,serif' font-size='56' font-weight='bold' fill='%23E8E0D0'>B</text><text x='47' y='67' font-family='Georgia,serif' font-size='18' font-style='italic' fill='%23E8962A'>v</text><text x='55' y='72' font-family='Georgia,serif' font-size='56' font-weight='bold' fill='%23E8E0D0'>Z</text></svg>"
  };
  var current = function () { return html.classList.contains('light') ? 'light' : 'dark'; };
  var overlay = function (who) { document.dispatchEvent(new CustomEvent('portfolio:overlay', { detail: who })); };   // only one menu open at a time
  var onPhone = function () { return window.matchMedia('(max-width:600px)').matches; };


  /* --- language: Dutch in the HTML, English applied from the shared labels and the page's own
         strings. The choice is stored under 'lang', as on index.html. --- */
  var SHARED = {
    en: {
      'skip': 'Skip to content', 'nav-about': 'About', 'nav-work': 'Work', 'footer-articles': 'Articles',
      'ui-search': 'Search', 'ui-language': 'Language', 'ui-theme': 'Theme', 'ui-dark': 'Dark', 'ui-light': 'Light',
      'cp-placeholder': 'Type a command…', 'cp-hint-nav': 'navigate', 'cp-hint-sel': 'select', 'cp-hint-esc': 'close',
      'copy-confirm': 'Email address copied',
      'case-choices': 'Decisions', 'case-problem': 'Problem', 'case-approach': 'Approach', 'case-result': 'Result',
      'case-steps': 'How it works', 'article': 'Article',
      // the contact block at the foot of every page (index.html's own strings)
      "sec-4": "04 / Contact",
      "contact-label": "Correspondence",
      "contact-kicker": "Let's <em>talk.</em><span class=\"hand\"></span>",
      "contact-response-k": "Response",
      "contact-response-v": "Within <em>two working days.</em>",
      "contact-response-note": "Monday to Friday, 09:00–18:00 CET. Slower on weekends — I read, but rarely respond.",
      "contact-elsewhere-k": "Elsewhere",
      "contact-elsewhere-v": "Also on <em>GitHub and LinkedIn.</em>",
      "contact-cv": "Download CV ↓",
      "contact-based-k": "Based",
      "contact-based-v": "Zwolle, NL — <em>on site or hybrid.</em>",
      "contact-based-note": "Open to roles in and around Zwolle. Timezone: CET.",
      "contact-site-k": "On this site",
      "contact-site-v": "Work and <em>articles.</em>",
      'cp-nav-home': 'Go to Home', 'cp-nav-about': 'Go to About', 'cp-nav-work': 'Go to Work', 'cp-nav-expertise': 'Go to Expertise',
      'cp-nav-contact': 'Go to Contact', 'cp-werk': 'Work — all case studies', 'cp-articles': 'Go to Articles', 'cp-article': 'How sooth decides whether a test is flaky or broken',
      'cp-email': 'Copy email', 'cp-cv': 'Download CV', 'cp-theme': 'Switch theme', 'cp-lang': 'Naar het Nederlands'
    },
    nl: {
      'cp-nav-home': 'Ga naar Home', 'cp-nav-about': 'Ga naar Over', 'cp-nav-work': 'Ga naar Werk', 'cp-nav-expertise': 'Ga naar Expertise',
      'cp-nav-contact': 'Ga naar Contact', 'cp-werk': 'Werk — alle case studies', 'cp-articles': 'Ga naar Artikelen', 'cp-article': 'Hoe sooth bepaalt of een test flaky is of kapot',
      'cp-email': 'E-mail kopiëren', 'cp-cv': 'CV downloaden', 'cp-theme': 'Thema wisselen', 'cp-lang': 'Switch to English'
    }
  };
  var PAGE = { en: {} };
  try { var pd = document.getElementById('i18nPage'); if (pd) PAGE = JSON.parse(pd.textContent); } catch (e) {}
  var originals = [];
  document.querySelectorAll('[data-i18n]').forEach(function (el) { originals.push([el, el.innerHTML]); });
  var phOriginals = [];
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) { phOriginals.push([el, el.placeholder]); });
  var lang = 'nl';
  var t = function (key) { return (SHARED[lang] && SHARED[lang][key]) || (PAGE[lang] && PAGE[lang][key]) || SHARED.nl[key] || key; };
  var applyLang = function (l) {
    lang = l === 'en' ? 'en' : 'nl';
    store.set('lang', lang);
    html.lang = lang;
    var dict = lang === 'en' ? Object.assign({}, SHARED.en, PAGE.en || {}) : null;
    originals.forEach(function (pair) {
      var el = pair[0], k = el.dataset.i18n;
      var v = dict && dict[k] !== undefined ? dict[k] : pair[1];
      if (el.innerHTML !== v) el.innerHTML = v;
    });
    phOriginals.forEach(function (pair) {
      var k = pair[0].dataset.i18nPlaceholder;
      pair[0].placeholder = dict && dict[k] !== undefined ? dict[k] : pair[1];
    });
    var nl = document.getElementById('sdNl'), en = document.getElementById('sdEn');
    if (nl && en) {
      nl.classList.toggle('active', lang === 'nl'); en.classList.toggle('active', lang === 'en');
      nl.setAttribute('aria-pressed', String(lang === 'nl')); en.setAttribute('aria-pressed', String(lang === 'en'));
      nl.parentElement.dataset.side = lang === 'en' ? 'right' : 'left';
    }
    document.dispatchEvent(new CustomEvent('portfolio:lang', { detail: lang }));
    document.querySelectorAll('iframe').forEach(function (f) {   // the embedded demos switch their captions too
      try { if (f.src && f.contentWindow) f.contentWindow.postMessage({ type: 'portfolio-lang', lang: lang }, '*'); } catch (e) {}
    });   // case.js puts the live figures back in
  };
  window.siteLang = { apply: applyLang, current: function () { return lang; }, t: t };
  document.querySelectorAll('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { applyLang(b.dataset.lang); }); });
  applyLang(store.get('lang') === 'en' ? 'en' : 'nl');

  /* --- the e-mail in the footer: the mailto link opens the mail client, and the address is copied (as on index.html) --- */
  (function () {
    var link = document.getElementById('emailLink');
    if (!link) return;
    link.addEventListener('click', function () {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText('bram@vanzwolle.net').then(function () {
        var c = document.getElementById('copyConfirm');
        if (!c) return;
        c.classList.add('visible');
        setTimeout(function () { c.classList.remove('visible'); }, 2000);
      }).catch(function () {});
    });
  })();

  /* --- command palette (⌘K / Ctrl+K, or /), as on index.html --- */
  (function () {
    var root = document.getElementById('cpRoot'), input = document.getElementById('cpInput'), list = document.getElementById('cpList');
    if (!root || !input || !list) return;
    var go = function (url) { location.href = url; };
    var copyEmail = function () {
      if (navigator.clipboard) navigator.clipboard.writeText('bram@vanzwolle.net').catch(function () {});
      var c = document.getElementById('copyConfirm');
      if (c) { c.classList.add('visible'); setTimeout(function () { c.classList.remove('visible'); }, 2000); }
    };
    var mod = /Mac|iPhone|iPod|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘' : 'Ctrl';
    var cmds = function () {
      return [
        { id: 'home', ico: '→', label: t('cp-nav-home'), desc: mod + ' 0', run: function () { go('/'); } },
        { id: 'about', ico: '→', label: t('cp-nav-about'), desc: mod + ' 1', run: function () { go('/#about'); } },
        { id: 'work', ico: '→', label: t('cp-nav-work'), desc: mod + ' 2', run: function () { go('/#work'); } },
        { id: 'expertise', ico: '→', label: t('cp-nav-expertise'), desc: mod + ' 3', run: function () { go('/#expertise'); } },
        { id: 'contact', ico: '→', label: t('cp-nav-contact'), desc: mod + ' 4', run: function () { var c = document.getElementById('contact'); if (c) c.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); else go('/#contact'); } },
        { id: 'werk', ico: '→', label: t('cp-werk'), desc: '/werk/', run: function () { go('/werk/'); } },
        { id: 'sooth', ico: '→', label: 'sooth — case study', desc: '/sooth/', run: function () { go('/sooth/'); } },
        { id: 'smart-home-hub', ico: '→', label: 'Smart Home Hub — case study', desc: '/smart-home-hub/', run: function () { go('/smart-home-hub/'); } },
        { id: 'skylanders-tracker', ico: '→', label: 'Skylanders Tracker — case study', desc: '/skylanders-tracker/', run: function () { go('/skylanders-tracker/'); } },
        { id: 'articles', ico: '→', label: t('cp-articles'), desc: '/artikelen/', run: function () { go('/artikelen/'); } },
        { id: 'article', ico: '→', label: t('cp-article'), desc: '/artikelen/flaky-tests-bewijzen/', run: function () { go('/artikelen/flaky-tests-bewijzen/'); } },
        { id: 'email', ico: '✎', label: t('cp-email'), desc: 'bram@vanzwolle.net', run: copyEmail },
        { id: 'github', ico: '↗', label: 'Open GitHub', desc: 'github.com', run: function () { window.open('https://github.com/Bramvzw', '_blank', 'noopener'); } },
        { id: 'linkedin', ico: '↗', label: 'Open LinkedIn', desc: 'linkedin.com', run: function () { window.open('https://www.linkedin.com/in/bram-van-zwolle', '_blank', 'noopener'); } },
        { id: 'cv', ico: '↓', label: t('cp-cv'), desc: 'pdf', run: function () { var a = document.createElement('a'); a.href = '/assets/cv-bram-van-zwolle.pdf'; a.download = 'CV Bram van Zwolle.pdf'; document.body.appendChild(a); a.click(); a.remove(); } },
        { id: 'theme', ico: '◐', label: t('cp-theme'), desc: (mod === '⌘' ? '⌥' : 'Alt ') + 'T', run: function () { if (window.siteTheme) window.siteTheme.toggle(); } },
        { id: 'lang', ico: '⇄', label: t('cp-lang'), desc: lang === 'en' ? 'NL' : 'EN', run: function () { applyLang(lang === 'en' ? 'nl' : 'en'); } }
      ];
    };
    var filtered = [], active = 0, lastFocus = null;
    var render = function () {
      list.innerHTML = '';
      filtered.forEach(function (c, i) {
        var li = document.createElement('li');
        li.setAttribute('role', 'option'); li.dataset.id = c.id;
        li.setAttribute('aria-selected', String(i === active));
        if (i === active) li.classList.add('active');
        li.innerHTML = '<span class="cp-ico"></span><span class="cp-label"></span><span class="cp-desc"></span>';
        li.children[0].textContent = c.ico; li.children[1].textContent = c.label; li.children[2].textContent = c.desc;
        li.addEventListener('mouseenter', function () { active = i; list.querySelectorAll('li').forEach(function (el, j) { el.classList.toggle('active', j === i); }); });
        li.addEventListener('mousedown', function (e) { e.preventDefault(); });
        li.addEventListener('click', function () { close(); c.run(); });
        list.appendChild(li);
      });
      var a = list.querySelector('li.active'); if (a) a.scrollIntoView({ block: 'nearest' });
    };
    var filter = function (q) {
      var all = cmds(); q = q.trim().toLowerCase();
      filtered = q ? all.filter(function (c) { return (c.label + ' ' + c.id + ' ' + c.desc).toLowerCase().indexOf(q) !== -1; }) : all;
      active = 0; render();
    };
    var isOpen = function () { return root.classList.contains('open'); };
    var open = function () {
      overlay('palette');   // open menus in the bar make way
      lastFocus = document.activeElement;
      root.classList.add('open'); root.setAttribute('aria-hidden', 'false');
      input.value = ''; filter('');
      setTimeout(function () { input.focus(); }, 40);
    };
    var close = function () {
      if (!isOpen()) return;
      root.classList.remove('open'); root.setAttribute('aria-hidden', 'true');
      input.blur();
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    };
    window.addEventListener('keydown', function (e) {
      var m = e.metaKey || e.ctrlKey, tag = (e.target && e.target.tagName) || '';
      if (m && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); isOpen() ? close() : open(); return; }
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !isOpen()) { e.preventDefault(); open(); return; }
      if (m && !e.shiftKey && !e.altKey && ['0', '1', '2', '3', '4'].indexOf(e.key) !== -1) {
        e.preventDefault(); if (e.key === '4' && document.getElementById('contact')) { document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }); return; } go(['/', '/#about', '/#work', '/#expertise', '/#contact'][Number(e.key)]); return;
      }
      if (!isOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'Tab') { e.preventDefault(); input.focus(); }   // focus stays in the palette
      else if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % filtered.length; render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + filtered.length) % filtered.length; render(); }
      else if (e.key === 'Enter') { e.preventDefault(); var c = filtered[active]; close(); if (c) c.run(); }
    });
    input.addEventListener('input', function () { filter(input.value); });
    root.querySelector('[data-cp-close]').addEventListener('click', close);
    document.addEventListener('portfolio:overlay', function (e) { if (e.detail !== 'palette') close(); });
    var trig = document.getElementById('cpTrigger'); if (trig) trig.addEventListener('click', function (e) { e.stopPropagation(); open(); });
    var kbd = document.getElementById('cpTriggerKbd'); if (kbd) kbd.textContent = mod + 'K';
  })();

  /* --- settings menu: the theme switch --- */
  (function () {
    var wrap = document.getElementById('settingsWrap');
    var btn = document.getElementById('settingsBtn');
    var drop = document.getElementById('settingsDropdown');
    var dark = document.getElementById('sdDark'), light = document.getElementById('sdLight');
    if (!wrap || !btn || !drop) return;
    var setThemeActive = function (t) {
      var right = t === 'light';
      dark.classList.toggle('active', !right); light.classList.toggle('active', right);
      dark.setAttribute('aria-pressed', String(!right)); light.setAttribute('aria-pressed', String(right));
      dark.parentElement.dataset.side = right ? 'right' : 'left';   // the thumb slides to this side
    };
    var paint = function (t) {
      var fav = document.getElementById('favicon'); if (fav) fav.href = FAV[t];
      var tc = document.getElementById('themeColor'); if (tc) tc.setAttribute('content', t === 'light' ? '#ebe2cc' : '#0d0b09');
      setThemeActive(t);
    };
    paint(current());
    var applyTheme = function (t) {
      html.classList.add('theme-switching');
      html.classList.toggle('light', t === 'light');
      store.set('theme', t);
      paint(t);
      document.querySelectorAll('iframe[data-src]').forEach(function (f) {
        try { if (f.src && f.contentWindow) f.contentWindow.postMessage({ type: 'portfolio-theme', theme: t }, '*'); } catch (e) {}
      });
      void document.body.offsetWidth;
      html.classList.remove('theme-switching');
    };
    // As on index.html: the new theme grows as a circle from the control that asked for it. The
    // theme a running switch is heading for counts as the current one, so two presses in one
    // frame do not both read the old class.
    var heading = null;
    var themeNow = function () { return heading || current(); };
    var switchTheme = function (t, from) {
      if (t === themeNow()) return;
      var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!document.startViewTransition || calm) { applyTheme(t); return; }
      heading = t;
      var r = from ? from.getBoundingClientRect() : null;
      var seen = r && r.width > 0;
      var x = seen ? r.left + r.width / 2 : innerWidth / 2, y = seen ? r.top + r.height / 2 : 0;
      var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      var vt;
      try { vt = document.startViewTransition(function () { applyTheme(t); if (heading === t) heading = null; }); }
      catch (e) { heading = null; applyTheme(t); return; }
      vt.finished.catch(function () {}).then(function () { if (heading === t) heading = null; });
      vt.ready.then(function () {
        html.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 700, easing: 'cubic-bezier(.3,.7,.2,1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(function () {});
    };
    window.siteTheme = { toggle: function (from) { switchTheme(themeNow() === 'light' ? 'dark' : 'light', from || btn); } };
    dark.addEventListener('click', function () { switchTheme('dark', dark); });
    light.addEventListener('click', function () { switchTheme('light', light); });
    // Unlisted shortcut, as on index.html: Option/Alt + T switches the theme (matched on the key's
    // place, e.code, because Option+T types "†" on a Mac).
    window.addEventListener('keydown', function (e) {
      if (e.code !== 'KeyT' || !e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || e.repeat) return;
      var el = e.target;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      e.preventDefault();
      switchTheme(themeNow() === 'light' ? 'dark' : 'light', btn);
    });

    var openedAt = 0;
    var isOpen = function () { return drop.classList.contains('open'); };
    // On a phone the menu is exactly as wide as the bar it hangs from.
    var fit = function () { var bar = btn.closest('.topbar'); drop.style.width = bar && onPhone() ? bar.getBoundingClientRect().width + 'px' : ''; };
    var setOpen = function (open) {
      if (open === isOpen()) return;
      if (open) fit();
      if (!open && drop.contains(document.activeElement)) btn.focus({ preventScroll: true });
      drop.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) { openedAt = window.scrollY; overlay('settings'); }
    };
    window.addEventListener('resize', function () { if (isOpen()) fit(); }, { passive: true });
    btn.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!isOpen()); });
    document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !isOpen()) return;
      if (document.getElementById('cpRoot') && document.getElementById('cpRoot').classList.contains('open')) return;   // Escape is for the palette then
      setOpen(false);
    });
    document.addEventListener('portfolio:overlay', function (e) { if (e.detail !== 'settings') setOpen(false); });
    window.addEventListener('scroll', function () { if (isOpen() && Math.abs(window.scrollY - openedAt) > 8) setOpen(false); }, { passive: true });
  })();

  /* --- the menu under the name (on a phone: the whole bar opens it) --- */
  (function () {
    var mark = document.querySelector('.topbar .mark');
    var tip = document.getElementById('brandTip');
    if (!mark || !tip) return;
    var open = false, locked = false, hideTimer = null;
    var position = function () {
      var bar = (mark.closest('.topbar') || mark).getBoundingClientRect();
      var name = mark.getBoundingClientRect();
      var left = bar.left, top = bar.bottom + 10;
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
      tip.style.width = onPhone() ? bar.width + 'px' : '';
      tip.style.setProperty('--bridge-h', Math.max(0, Math.floor(top - name.bottom)) + 'px');
      tip.style.setProperty('--bridge-x', Math.max(0, name.left - left) + 'px');
      tip.style.setProperty('--bridge-w', name.width + 'px');
    };
    var show = function () {
      clearTimeout(hideTimer); position();
      if (!open) overlay('brand');
      open = true; tip.classList.add('visible'); tip.setAttribute('aria-hidden', 'false');
    };
    var hide = function () {
      if (tip.contains(document.activeElement)) document.activeElement.blur();
      open = false; locked = false; tip.classList.remove('visible'); tip.setAttribute('aria-hidden', 'true');
    };
    // On these pages a click on the name goes home; with a mouse, hovering it shows the menu. On a phone, where the whole bar is the name,
    // does it open the menu, whose first row is that same way home.
    var toggle = function () { if (open) { hide(); mark.focus({ preventScroll: true }); } else { show(); locked = true; } };
    var syncRole = function () {
      if (onPhone()) { mark.setAttribute('aria-expanded', String(open)); mark.setAttribute('aria-controls', 'brandTip'); mark.setAttribute('aria-haspopup', 'menu'); }
      else { mark.removeAttribute('aria-expanded'); mark.removeAttribute('aria-controls'); mark.removeAttribute('aria-haspopup'); if (open) hide(); }
    };
    var obs = new MutationObserver(function () { if (onPhone()) mark.setAttribute('aria-expanded', String(open)); });
    obs.observe(tip, { attributes: true, attributeFilter: ['class'] });
    syncRole();
    mark.addEventListener('click', function (e) {
      if (!onPhone()) return;   // a plain link home
      e.preventDefault(); e.stopPropagation(); toggle();
    });
    // With a mouse, hovering the name shows the contact menu (as on the home page); a click still goes home.
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    var enter = function () { if (onPhone() || !canHover.matches) return; show(); };
    var leave = function () {
      if (onPhone() || locked) return;
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () { if (!mark.matches(':hover') && !tip.matches(':hover')) hide(); }, 180);
    };
    mark.addEventListener('mouseenter', enter); tip.addEventListener('mouseenter', enter);
    mark.addEventListener('mouseleave', leave); tip.addEventListener('mouseleave', leave);
    mark.addEventListener('focus', function () { if (!onPhone() && canHover.matches) show(); });
    tip.addEventListener('focusout', function (e) { if (!onPhone() && !tip.contains(e.relatedTarget) && e.relatedTarget !== mark) hide(); });
    document.addEventListener('click', function (e) { if (open && !tip.contains(e.target) && !mark.contains(e.target)) hide(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) { hide(); mark.focus({ preventScroll: true }); } });
    window.addEventListener('resize', function () { syncRole(); if (open) position(); }, { passive: true });
    document.addEventListener('portfolio:overlay', function (e) { if (e.detail !== 'brand' && open) hide(); });
  })();

  /* --- the menu button between 601 and 720px --- */
  (function () {
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('mobileNav');
    if (!toggle || !nav) return;
    var open = function () { toggle.setAttribute('aria-expanded', 'true'); nav.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
    var close = function () { toggle.setAttribute('aria-expanded', 'false'); nav.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
    toggle.addEventListener('click', function () { toggle.getAttribute('aria-expanded') === 'true' ? close() : open(); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  })();

  /* --- Zwolle time in the footer --- */
  (function () {
    var clock = document.getElementById('utcClock');
    if (!clock) return;
    var tick = function () {
      var fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZoneName: 'shortOffset' });
      var parts = fmt.formatToParts(new Date());
      var get = function (t) { var p = parts.find(function (x) { return x.type === t; }); return p ? p.value : ''; };
      var tz = (get('timeZoneName') || 'GMT').replace('GMT', 'UTC');
      clock.innerHTML = tz + ' · <span class="ctime">' + get('hour') + ':' + get('minute') + ':' + get('second') + '</span>';
    };
    tick();
    setInterval(tick, 1000);
  })();

  /* --- custom cursor, as on index.html --- */
  (function () {
    if (window.matchMedia('(hover:none)').matches) return;
    var dot = document.getElementById('cdot');
    var ring = document.getElementById('cring');
    if (!dot || !ring) return;
    var x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, tx = x, ty = y;
    // Frames only run while the ring is still catching up with the pointer; a resting mouse costs nothing.
    var moving = false;
    var loop = function () {
      x += (tx - x) * 0.9; y += (ty - y) * 0.9;
      rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18;
      dot.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)';
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      if (Math.abs(tx - rx) + Math.abs(ty - ry) < 0.05) { moving = false; return; }
      requestAnimationFrame(loop);
    };
    var kick = function () { if (!moving) { moving = true; requestAnimationFrame(loop); } };
    window.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; kick(); });
    kick();
    var hovSel = 'a,[data-hoverable],button,.project';
    document.addEventListener('mouseover', function (e) { if (e.target.closest(hovSel)) { dot.classList.add('hov'); ring.classList.add('hov'); } });
    document.addEventListener('mouseout', function (e) { if (e.target.closest(hovSel)) { dot.classList.remove('hov'); ring.classList.remove('hov'); } });
    document.addEventListener('mouseleave', function () { dot.style.opacity = 0; ring.style.opacity = 0; });
    document.addEventListener('mouseenter', function () { dot.style.opacity = 1; ring.style.opacity = 1; });
    // Pointer movement inside the demo never reaches this page, and the demo draws its own cursor.
    document.querySelectorAll('iframe[data-src]').forEach(function (frame) {
      frame.addEventListener('mouseenter', function () { dot.style.opacity = 0; ring.style.opacity = 0; });
      frame.addEventListener('mouseleave', function () { dot.style.opacity = 1; ring.style.opacity = 1; });
    });
  })();

  /* --- cursor trail (only on fast movement), as on index.html --- */
  (function () {
    var layer = document.getElementById('cursorTrail');
    if (!layer || matchMedia('(hover: none)').matches) return;
    var glyphs = ['{', '}', ';', '=>', '//', '()', '[]', '&&', '?.'];
    var lastX = 0, lastY = 0, lastT = 0;
    window.addEventListener('mousemove', function (e) {
      var now = performance.now();
      var dist = Math.hypot(e.clientX - lastX, e.clientY - lastY), dt = now - lastT;
      var speed = dt > 0 ? dist / dt : 0;
      lastX = e.clientX; lastY = e.clientY; lastT = now;
      if (speed < 1.3 || Math.random() > 0.25) return;
      var g = document.createElement('span');
      g.className = 'ct-glyph';
      g.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      g.style.left = (e.clientX + (Math.random() - 0.5) * 18) + 'px';
      g.style.top = (e.clientY + (Math.random() - 0.5) * 18) + 'px';
      g.style.fontSize = (10 + Math.random() * 5) + 'px';
      layer.appendChild(g);
      var drift = 26 + Math.random() * 30, rot = (Math.random() - 0.5) * 22;
      g.animate(
        [{ transform: 'translate(0,0) rotate(0deg)', opacity: 0.7 },
         { transform: 'translate(' + ((Math.random() - 0.5) * 24) + 'px, ' + drift + 'px) rotate(' + rot + 'deg)', opacity: 0 }],
        { duration: 900 + Math.random() * 400, easing: 'cubic-bezier(.2,.6,.2,1)' }
      ).onfinish = function () { g.remove(); };
    }, { passive: true });
  })();

  /* --- wordmarks (the footer name on the subpages, the e-mail on index.html): the ink lines drift a
         little while the wordmark scrolls past, and on a fine pointer a soft light follows the pointer
         through the letters: the lines under it turn brighter and lean a few pixels toward it.
         One rAF loop per wordmark, only while something moves. --- */
  (function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var fine = window.matchMedia('(hover:hover) and (pointer:fine)');
    document.querySelectorAll('svg.wm').forEach(function (svg) {
      var move = svg.querySelector('.wm-move');
      if (!move) return;
      var host = svg.closest('footer, section') || svg;
      var glow = svg.querySelector('.wm-glow'), spot = svg.querySelector('.wm-spot');
      // with a viewBox the drawing is in its units; without one (the e-mail) it is in CSS pixels
      var vb = svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width ? svg.viewBox.baseVal : null;
      var size = function () { if (vb) return [vb.width, vb.height]; var r = svg.getBoundingClientRect(); return [r.width, r.height]; };
      var W = size()[0], H = size()[1];
      var scrollX = 0, scrollY = 0, visible = false;
      var tx = W / 2, ty = H / 2, cx = tx, cy = ty;      // pointer target and eased position (SVG units)
      var dx = 0, dy = 0, tdx = 0, tdy = 0;            // lean of the lines toward the pointer
      var running = false;
      var readScroll = function () {
        var r = host.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight + r.height)));
        scrollX = -48 * p; scrollY = 26 * p;
      };
      var frame = function () {
        cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
        dx += (tdx - dx) * 0.08; dy += (tdy - dy) * 0.08;
        if (glow) { glow.setAttribute('cx', cx.toFixed(1)); glow.setAttribute('cy', cy.toFixed(1)); }
        if (spot) { spot.setAttribute('cx', (cx - scrollX - dx).toFixed(1)); spot.setAttribute('cy', (cy - scrollY - dy).toFixed(1)); }
        move.setAttribute('transform', 'translate(' + (scrollX + dx).toFixed(2) + ' ' + (scrollY + dy).toFixed(2) + ')');
        var still = Math.abs(tx - cx) < 0.3 && Math.abs(ty - cy) < 0.3 && Math.abs(tdx - dx) < 0.02 && Math.abs(tdy - dy) < 0.02;
        if (still) { running = false; return; }
        requestAnimationFrame(frame);
      };
      var kick = function () { if (!running) { running = true; requestAnimationFrame(frame); } };
      window.addEventListener('scroll', function () { if (visible) { readScroll(); kick(); } }, { passive: true });
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) { readScroll(); kick(); } }).observe(svg);
      else { visible = true; readScroll(); kick(); }
      var toSvg = function (e) {
        var r = svg.getBoundingClientRect(); var wh = size(); W = wh[0]; H = wh[1];
        return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H];
      };
      var hoverHost = svg.closest('a') || svg;
      hoverHost.addEventListener('pointerenter', function (e) {
        if (!fine.matches || e.pointerType !== 'mouse') return;
        var p = toSvg(e); cx = tx = p[0]; cy = ty = p[1];
        svg.classList.add('lit'); kick();
      });
      hoverHost.addEventListener('pointermove', function (e) {
        if (!fine.matches || e.pointerType !== 'mouse') return;
        var p = toSvg(e); tx = p[0]; ty = p[1];
        tdx = (tx - W / 2) / (W / 2) * 7; tdy = (ty - H / 2) / (H / 2) * 4;   // at most 7 and 4 units
        kick();
      });
      hoverHost.addEventListener('pointerleave', function () { svg.classList.remove('lit'); tdx = 0; tdy = 0; kick(); });
    });
  })();

  /* --- the demo loads when it comes near, with the current theme in its address --- */
  (function () {
    var frames = document.querySelectorAll('iframe[data-src]');
    var load = function (f) { if (!f.src) f.src = f.dataset.src + '&theme=' + current() + '&lang=' + (document.documentElement.lang === 'en' ? 'en' : 'nl'); };
    if (!('IntersectionObserver' in window)) { frames.forEach(load); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { load(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '600px 0px' });
    frames.forEach(function (f) { io.observe(f); });
  })();
})();

/* Tag notes on hover (as on the home page cards): "~10.200 regels geschreven" and the like.
   The notes are written in English in the markup; NOTE_NL holds their Dutch versions. */
(function () {
  var tags = document.querySelectorAll('.tag[data-lines]');
  if (!tags.length) return;
  var tip = document.getElementById('tagTip');
  if (!tip) { tip = document.createElement('div'); tip.className = 'tag-tip'; tip.id = 'tagTip'; tip.setAttribute('aria-hidden', 'true'); document.body.appendChild(tip); }
  var NOTE_NL = {
    '~38,500 lines written': '~38.500 regels geschreven',
    '~36,500 lines written': '~36.500 regels geschreven',
    '~21,400 lines written': '~21.400 regels geschreven',
    '~10,200 lines written': '~10.200 regels geschreven',
    'the report format every runner speaks': 'het rapportformaat dat elke testrunner spreekt',
    'single source of truth': 'één bron van waarheid',
    'Docker on a Synology NAS': 'Docker op een Synology-NAS'
  };
  var pos = function (e) {
    var r = tip.getBoundingClientRect();
    tip.style.left = Math.min(window.innerWidth - r.width - 10, e.clientX + 14) + 'px';
    tip.style.top = (e.clientY + 18) + 'px';
  };
  tags.forEach(function (tok) {
    tok.addEventListener('mouseenter', function (e) {
      var note = tok.dataset.lines || '';
      tip.textContent = (document.documentElement.lang !== 'en' && NOTE_NL[note]) || note;
      tip.classList.add('visible'); pos(e);
    });
    tok.addEventListener('mousemove', pos);
    tok.addEventListener('mouseleave', function () { tip.classList.remove('visible'); });
  });
})();
