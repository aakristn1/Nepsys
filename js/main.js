/**
 * Nepsys Technologies — site behaviour.
 * No dependencies. Everything degrades to a readable static page without JS
 * or when the visitor prefers reduced motion.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) root.classList.add('js-motion');

  var config = window.NEPSYS_CONFIG || {};

  /* ---------- Header + mobile menu ---------- */
  function initHeader() {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.getElementById('mobile-nav');
    if (!header) return;

    var setSolid = function () {
      header.classList.toggle('is-solid', window.scrollY > 24 || !header.hasAttribute('data-transparent'));
    };
    setSolid();
    window.addEventListener('scroll', setSolid, { passive: true });

    if (!toggle || !mobileNav) return;
    var setOpen = function (open) {
      root.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      mobileNav.toggleAttribute('inert', !open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    setOpen(false);
    toggle.addEventListener('click', function () {
      setOpen(!root.classList.contains('menu-open'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('menu-open')) { setOpen(false); toggle.focus(); }
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Scroll-driven effects (one rAF loop for all of them) ---------- */
  var scrollers = [];
  function onScrollFrame(fn) { scrollers.push(fn); }
  function startScrollLoop() {
    if (!scrollers.length) return;
    var ticking = false;
    var run = function () { ticking = false; scrollers.forEach(function (fn) { fn(); }); };
    var request = function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    run();
  }
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

  // Hero mark drifts and fades as you scroll away from it.
  function initHeroParallax() {
    var mark = document.querySelector('.hero-mark');
    if (!mark || reduceMotion) return;
    onScrollFrame(function () {
      var y = window.scrollY, h = window.innerHeight;
      if (y > h * 1.2) return;
      var p = clamp(y / h, 0, 1);
      mark.style.transform = 'translate3d(0,' + (y * 0.35) + 'px,0) rotate(' + (p * 8) + 'deg) scale(' + (1 - p * 0.15) + ')';
      mark.style.opacity = String(1 - p * 0.8);
    });
  }

  // Words light up one by one as the statement passes through the viewport.
  function initStatement() {
    var el = document.querySelector('[data-scrub-words]');
    if (!el || reduceMotion) return;
    var words = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      var isHl = node.nodeType === 1;
      var text = node.textContent;
      var frag = document.createDocumentFragment();
      text.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var span = document.createElement('span');
        span.className = 'w' + (isHl ? ' hl' : '');
        span.textContent = part;
        words.push(span);
        frag.appendChild(span);
      });
      el.replaceChild(frag, node);
    });
    onScrollFrame(function () {
      var r = el.getBoundingClientRect(), vh = window.innerHeight;
      var p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
      var lit = Math.round(p * words.length);
      words.forEach(function (w, i) { w.classList.toggle('on', i < lit); });
    });
  }

  // Pinned automation pipeline: vertical scroll drives the track sideways,
  // the wire fills, and each stage switches on as the packet reaches it.
  function initPipeline() {
    var section = document.querySelector('.pipeline');
    if (!section || reduceMotion) return;
    var track = section.querySelector('.track');
    var fill = section.querySelector('.wire-fill');
    var stages = Array.prototype.slice.call(section.querySelectorAll('.stage'));
    var count = section.querySelector('.hud-count strong');
    var bar = section.querySelector('.hud-bar i');
    var wire = section.querySelector('.wire');
    var distance = 0, nodeX = [], wireStart = 0;

    var measure = function () {
      track.style.transform = 'none';
      distance = Math.max(0, track.scrollWidth - window.innerWidth);
      // Scroll length: the sideways distance plus a beat at each end.
      section.style.height = (distance + window.innerHeight * 1.6) + 'px';
      var trackLeft = track.getBoundingClientRect().left;
      nodeX = stages.map(function (s) { return s.getBoundingClientRect().left - trackLeft + 28; });
      wireStart = nodeX[0];
      wire.style.left = fill.style.left = wireStart + 'px';
      wire.style.right = 'auto';
      wire.style.width = (nodeX[nodeX.length - 1] - wireStart) + 'px';
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);

    onScrollFrame(function () {
      var r = section.getBoundingClientRect();
      var total = section.offsetHeight - window.innerHeight;
      var p = clamp(-r.top / total, 0, 1);
      var x = p * distance;
      track.style.transform = 'translate3d(' + (-x) + 'px,0,0)';
      // The packet sits ~40% across the screen, so stages light up just before centre.
      var packet = x + window.innerWidth * (window.innerWidth < 760 ? 0.5 : 0.42);
      var last = nodeX[nodeX.length - 1];
      var head = p >= 0.995 ? last : Math.min(packet, last);
      fill.style.width = Math.max(0, head - wireStart) + 'px';
      var active = 0;
      stages.forEach(function (s, i) {
        var on = head >= nodeX[i] - 2;
        s.classList.toggle('is-on', on);
        if (on) active = i + 1;
      });
      if (count) count.textContent = String(active).padStart(2, '0');
      if (bar) bar.style.transform = 'scaleX(' + p + ')';
    });
  }

  /* ---------- GHL embeds from js/config.js ---------- */
  function loadScriptOnce(src, attrs) {
    if (document.querySelector('script[src="' + src + '"]')) return;
    var s = document.createElement('script');
    s.src = src; s.async = true;
    Object.keys(attrs || {}).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    document.body.appendChild(s);
  }

  function initEmbeds() {
    var embedUsed = false;
    var makeFrame = function (slot, url, title) {
      var frame = document.createElement('iframe');
      frame.src = url;
      frame.title = title;
      frame.loading = 'lazy';
      frame.id = url.split('/').pop() + '_embed'; // GHL's form_embed.js resizes frames by id
      frame.style.width = '100%';
      frame.setAttribute('scrolling', 'no');
      slot.innerHTML = '';
      slot.appendChild(frame);
      slot.hidden = false;
      embedUsed = true;
    };

    // Elements marked data-when="x" show only when x is configured; "no-x" only when it isn't.
    var setWhen = function (name, on) {
      document.querySelectorAll('[data-when="' + name + '"]').forEach(function (el) { el.hidden = !on; });
      document.querySelectorAll('[data-when="no-' + name + '"]').forEach(function (el) { el.hidden = on; });
    };

    document.querySelectorAll('[data-embed="calendar"]').forEach(function (slot) {
      if (config.calendarEmbedUrl) makeFrame(slot, config.calendarEmbedUrl, 'Book a 15-minute call with Nepsys Technologies');
    });
    document.querySelectorAll('[data-embed="form"]').forEach(function (slot) {
      if (config.formEmbedUrl) makeFrame(slot, config.formEmbedUrl, 'Request a callback from Nepsys Technologies');
    });
    setWhen('calendar', !!config.calendarEmbedUrl);
    setWhen('form', !!config.formEmbedUrl);
    if (embedUsed) loadScriptOnce('https://link.msgsndr.com/js/form_embed.js');

    if (config.chatWidgetId) {
      loadScriptOnce('https://widgets.leadconnectorhq.com/loader.js', {
        'data-resources-url': 'https://widgets.leadconnectorhq.com/chat-widget/loader.js',
        'data-widget-id': config.chatWidgetId
      });
    }
    setWhen('demo-chat', !!config.chatWidgetId);
    document.querySelectorAll('[data-demo-chat]').forEach(function (el) { el.hidden = !config.chatWidgetId; });

    var demo = config.demoPhone || {};
    var hasDemo = !!(demo.display && demo.tel);
    setWhen('demo-phone', hasDemo);
    document.querySelectorAll('[data-demo-phone]').forEach(function (el) {
      if (!hasDemo) return;
      var link = el.querySelector('a');
      link.href = 'tel:' + demo.tel;
      link.textContent = demo.display;
      el.hidden = false;
    });
  }

  /* ---------- /book?type=audit preselects the audit option ---------- */
  function initRequestType() {
    var select = document.getElementById('request');
    if (select && /[?&]type=audit\b/.test(window.location.search)) select.value = 'Missed-call audit';
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initReveal();
    initHeroParallax();
    initStatement();
    initPipeline();
    startScrollLoop();
    initEmbeds();
    initRequestType();
    initYear();
  });
})();
