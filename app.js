/* Shared code for every page: loads the JSON files, draws the header, footer
   and bottom menu, switches English / Telugu, and builds the WhatsApp and call links.
   Nothing is stored on any server. */
(function () {
  'use strict';

  var App = window.App = {
    cfg: {},
    prod: { unit: 'cases', brands: [], products: [] },
    vids: [],
    dict: {},
    lang: 'en',
    page: '',
    rerender: null,
    qs: new URLSearchParams(location.search)
  };

  function store(k, v) {
    try {
      if (v === undefined) return sessionStorage.getItem(k);
      sessionStorage.setItem(k, v);
    } catch (e) { /* storage blocked: the choice just lasts until the next page */ }
    return null;
  }

  (function initLang() {
    var q = App.qs.get('lang');
    if (q === 'te' || q === 'en') App.lang = q;
    else App.lang = store('lang') === 'te' ? 'te' : 'en';
  })();

  var SPRITE = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><symbol id="wa" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path></symbol></defs></svg>';

  var CALL_SVG = '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"></path></svg>';

  var ICONS = {
    home: '<svg viewBox="0 0 24 24"><path d="M4 11 L12 4 L20 11 V20 H4 Z"></path></svg>',
    videos: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"></rect><path d="M10 9 L15 12 L10 15 Z"></path></svg>',
    planner: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10 H21"></path><path d="M8 3 V7"></path><path d="M16 3 V7"></path></svg>'
  };

  var NAV = [
    { id: 'home', href: 'index.html' },
    { id: 'videos', href: 'videos.html' },
    { id: 'planner', href: 'planner.html' }
  ];

  App.el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  /* Customer text: remove control characters and angle brackets, keep Telugu and English. */
  App.clean = function (s) {
    return String(s || '').replace(/[\u0000-\u001f<>]/g, '').slice(0, 80);
  };

  /* Translate one key. {name} style placeholders are filled from vars. */
  App.t = function (key, vars) {
    var d = App.dict, s = d[App.lang] && d[App.lang][key];
    if (s == null) s = d.en && d.en[key];
    if (s == null) s = key;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  };

  /* A config value can be plain text or { "en": "...", "te": "..." }. */
  App.pick = function (v) {
    if (v && typeof v === 'object') return v[App.lang] || v.en || '';
    return v == null ? '' : String(v);
  };

  function get(obj, path) {
    var v = path.split('.').reduce(function (o, k) { return o && o[k] != null ? o[k] : ''; }, obj);
    return App.pick(v);
  }

  App.numberIsSet = function () {
    var raw = String(App.cfg.whatsappNumber || '');
    var d = raw.replace(/\D/g, '');
    return d.length >= 10 && !/x/i.test(raw);
  };

  App.waBase = function () {
    if (App.numberIsSet()) return 'https://wa.me/' + String(App.cfg.whatsappNumber).replace(/\D/g, '') + '?text=';
    return 'https://wa.me/?text=';
  };

  App.callHref = function () {
    var d = String(App.cfg.callNumber || '').replace(/\D/g, '');
    if (!d && App.numberIsSet()) d = String(App.cfg.whatsappNumber).replace(/\D/g, '');
    if (d.length < 10) return '';
    if (d.length === 10) d = '91' + d;
    return 'tel:+' + d;
  };

  App.updateCall = function () {
    var h = App.callHref();
    document.querySelectorAll('.call-link').forEach(function (a) {
      if (h) { a.href = h; a.classList.remove('off'); } else { a.removeAttribute('href'); a.classList.add('off'); }
    });
  };

  App.updateGeneric = function () {
    var link = App.waBase() + encodeURIComponent("Hello, I'd like to place an order.");
    document.querySelectorAll('.wa-link').forEach(function (a) { a.href = link; });
  };

  App.waIcon = function () {
    var ns = 'http://www.w3.org/2000/svg';
    var s = document.createElementNS(ns, 'svg');
    s.setAttribute('class', 'ico-wa');
    var u = document.createElementNS(ns, 'use');
    u.setAttribute('href', '#wa');
    s.appendChild(u);
    return s;
  };

  App.bottleSVG = function (h, label) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', Math.round(h * 0.4));
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', '0 0 40 100');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    var cap = document.createElementNS(ns, 'rect');
    cap.setAttribute('x', 14); cap.setAttribute('y', 2); cap.setAttribute('width', 12); cap.setAttribute('height', 8); cap.setAttribute('rx', 2);
    cap.style.fill = 'var(--primary-dark)';
    var body = document.createElementNS(ns, 'path');
    body.setAttribute('d', 'M15 10 H25 V18 C25 22 34 24 34 34 V88 a8 8 0 0 1 -8 8 H14 a8 8 0 0 1 -8 -8 V34 C6 24 15 22 15 18 Z');
    body.setAttribute('fill', '#FFFFFF');
    body.setAttribute('stroke-width', 2);
    body.style.stroke = 'var(--primary)';
    var lab = document.createElementNS(ns, 'rect');
    lab.setAttribute('x', 6); lab.setAttribute('y', 48); lab.setAttribute('width', 28); lab.setAttribute('height', 24);
    lab.style.fill = /^#[0-9a-fA-F]{3,8}$/.test(label || '') ? label : 'var(--primary)';
    svg.appendChild(cap); svg.appendChild(body); svg.appendChild(lab);
    return svg;
  };

  App.cupSVG = function (h, label) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', Math.round(h * 0.7));
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', '0 0 70 100');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    var lid = document.createElementNS(ns, 'rect');
    lid.setAttribute('x', 4); lid.setAttribute('y', 8); lid.setAttribute('width', 62); lid.setAttribute('height', 10); lid.setAttribute('rx', 4);
    lid.style.fill = 'var(--primary-dark)';
    var cup = document.createElementNS(ns, 'path');
    cup.setAttribute('d', 'M9 18 H61 L55 90 a6 6 0 0 1 -6 5 H21 a6 6 0 0 1 -6 -5 Z');
    cup.setAttribute('fill', '#FFFFFF');
    cup.setAttribute('stroke-width', 2);
    cup.style.stroke = 'var(--primary)';
    var band = document.createElementNS(ns, 'path');
    band.setAttribute('d', 'M12 40 H58 L56 66 H14 Z');
    band.style.fill = /^#[0-9a-fA-F]{3,8}$/.test(label || '') ? label : 'var(--primary)';
    svg.appendChild(lid); svg.appendChild(cup); svg.appendChild(band);
    return svg;
  };

  App.ytId = function (url) {
    var m = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/);
    return m ? m[1] : '';
  };

  App.showError = function (msg) {
    var e = document.getElementById('err');
    if (!e) return;
    e.style.display = 'block';
    e.textContent = msg;
  };

  function chrome(page) {
    document.body.insertAdjacentHTML('afterbegin', SPRITE);
    var top = document.getElementById('chrome-top');
    if (top) {
      var nav = NAV.map(function (n) {
        return '<a class="nav-i' + (n.id === page ? ' on' : '') + '" href="' + n.href + '"' + (n.id === page ? ' aria-current="page"' : '') + '>' + ICONS[n.id] + '<span data-i18n="nav.' + n.id + '"></span></a>';
      }).join('');
      top.innerHTML =
        '<header class="top"><div class="wrap top-in">' +
        '<a class="brand" href="index.html"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 C12 3 5 10.5 5 15 a7 7 0 0 0 14 0 C19 10.5 12 3 12 3 Z"></path><path d="M9 15 a3 3 0 0 0 3 3"></path></svg>' +
        '<div><div class="brand-name" data-cfg="businessName"></div><div class="brand-tag" data-cfg="tagline"></div></div></a>' +
        '<div class="lang-sw" role="group" data-i18n-aria="aria.lang"><button type="button" data-l="en">EN</button><button type="button" data-l="te">తెలుగు</button></div>' +
        '<a class="call-icon call-link" href="#" data-i18n-aria="aria.call">' + CALL_SVG + '</a>' +
        '<a class="wa-icon wa-link" href="#" target="_blank" rel="noopener" data-i18n-aria="aria.wa"><svg class="ico-wa" style="width:24px;height:24px"><use href="#wa"></use></svg></a>' +
        '<nav class="nav" aria-label="Main">' + nav + '</nav>' +
        '</div></header>';
      top.querySelectorAll('.lang-sw button').forEach(function (b) {
        b.addEventListener('click', function () { App.setLang(b.getAttribute('data-l')); });
      });
    }
    var foot = document.getElementById('foot');
    if (foot) {
      foot.insertAdjacentHTML('beforebegin',
        '<section class="wrap"><div class="contact-card">' +
        '<h3 data-i18n="contact.h"></h3><p data-cfg="priceNote"></p>' +
        '<div class="contact-btns">' +
        '<a class="btn-wa wa-link" href="#" target="_blank" rel="noopener"><svg class="ico-wa"><use href="#wa"></use></svg><span data-i18n="contact.wa"></span></a>' +
        '<a class="btn-call call-link" href="#">' + CALL_SVG + '<span data-i18n="contact.call"></span></a>' +
        '</div></div></section>');
      foot.innerHTML =
        '<footer><div class="wrap">' +
        '<div class="f-name" data-cfg="businessName"></div>' +
        '<div class="f-dim"><span data-cfg="authorisedText"></span> · <span data-cfg="region"></span></div>' +
        '<div class="f-dim"><span data-i18n="f.call"></span> <a class="call-link" data-cfg="phoneDisplay"></a> · <span data-i18n="f.hours"></span> <span data-cfg="orderHours"></span></div>' +
        '<div class="f-dim"><span data-i18n="f.addr"></span> <span data-cfg="address"></span> · <span data-i18n="f.fssai"></span> <span data-cfg="fssai"></span></div>' +
        '<div class="f-dim"><a href="privacy.html" data-i18n="f.privacy"></a></div>' +
        '<div class="legal" data-i18n="f.legal"></div>' +
        '</div></footer>';
    }
  }

  /* Fill every data-i18n, data-i18n-ph and data-i18n-aria element for the current language. */
  App.applyI18n = function () {
    document.documentElement.setAttribute('lang', App.lang === 'te' ? 'te' : 'en');
    document.querySelectorAll('[data-i18n]').forEach(function (n) { n.textContent = App.t(n.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (n) { n.setAttribute('placeholder', App.t(n.getAttribute('data-i18n-ph'))); });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (n) { n.setAttribute('aria-label', App.t(n.getAttribute('data-i18n-aria'))); });
    document.querySelectorAll('.lang-sw button').forEach(function (b) {
      var on = b.getAttribute('data-l') === App.lang;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  };

  /* Config text, banner, title, links. Runs on load and whenever the language changes. */
  App.refresh = function () {
    var cfg = App.cfg;
    document.documentElement.setAttribute('data-theme', cfg.theme === 'royal' ? 'royal' : 'teal');
    App.applyI18n();
    document.querySelectorAll('[data-cfg]').forEach(function (n) {
      n.textContent = get(cfg, n.getAttribute('data-cfg'));
      if (n.hasAttribute('data-hide-empty')) n.classList.toggle('hidden', !n.textContent);
    });
    var pageTitle = App.t('page.' + App.page);
    document.title = pageTitle + ' | ' + (cfg.businessName || 'Water Supply') + (App.pick(cfg.region) ? ' | ' + App.pick(cfg.region) : '');
    var b = document.getElementById('banner');
    if (b) {
      var msgs = [];
      if (cfg.draftMode) msgs.push(App.t('banner.draft'));
      if (cfg.draftMode && !App.numberIsSet()) msgs.push(App.t('banner.nonumber'));
      if (cfg.notice) msgs.push(App.pick(cfg.notice));
      b.textContent = msgs.join('  ·  ');
      b.classList.toggle('hidden', !msgs.length);
    }
    App.updateGeneric();
    App.updateCall();
  };

  App.setLang = function (l) {
    App.lang = l === 'te' ? 'te' : 'en';
    store('lang', App.lang);
    App.refresh();
    if (typeof App.rerender === 'function') App.rerender();
  };

  function fetchJSON(path, optional) {
    return fetch(path, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(path + ' ' + r.status);
      return r.json();
    }).catch(function (e) { if (optional) return null; throw e; });
  }

  /* Call App.start('home' | 'videos' | 'planner' | 'privacy', function () { ...page code... }) */
  App.start = function (page, init) {
    App.page = page;
    chrome(page);
    App.applyI18n();
    Promise.all([
      fetchJSON('config.json'),
      fetchJSON('products.json', true),
      fetchJSON('videos.json', true),
      fetchJSON('lang.json', true)
    ]).then(function (res) {
      App.cfg = res[0] || {};
      App.prod = res[1] || App.prod;
      App.vids = (res[2] && res[2].videos) || [];
      App.dict = res[3] || {};
      App.refresh();
      init();
    }).catch(function () {
      App.showError('Could not load config.json. If you opened this file directly from your computer, the browser blocks it. Publish the folder on GitHub Pages, or run "python3 -m http.server" in the folder and open http://localhost:8000.');
    });
  };
})();
