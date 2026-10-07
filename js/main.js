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
  }

  /* ---------- /book?type=audit preselects the audit option ---------- */
  function initRequestType() {
    var select = document.getElementById('request');
    if (select && /[?&]type=audit\b/.test(window.location.search)) select.value = 'Missed-call audit';
  }

  /* ---------- Chat widget (floating button, talks to the Cloudflare Worker in config.chatApiUrl) ----------
   * Limits shown here are for the visitor's benefit only. The Worker enforces them:
   * 3 messages per visitor IP, bot check on every message, one request at a time, daily cap.
   */
  function initChat() {
    if (!config.chatApiUrl) return;
    var MAX = 3;
    var STORE = 'nepsys-chat-remaining';
    var TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    var remaining = MAX;
    try { var saved = parseInt(localStorage.getItem(STORE), 10); if (saved >= 0 && saved <= MAX) remaining = saved; } catch (e) {}

    var chatIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/><path d="M8 11h8M8 14h5"/></svg>';
    var closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

    var launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'chat-launcher';
    launcher.setAttribute('aria-controls', 'chat-panel');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-label', 'Chat with the Nepsys AI assistant');
    launcher.innerHTML = chatIcon;

    var panel = document.createElement('section');
    panel.className = 'chat-panel';
    panel.id = 'chat-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Nepsys AI assistant chat');
    panel.innerHTML =
      '<div class="chat-head"><span class="chat-dot" aria-hidden="true"></span><span>Nepsys AI assistant</span>' +
      '<button type="button" class="chat-close" aria-label="Close chat">' + closeIcon + '</button></div>' +
      '<div class="chat-log" role="log" aria-live="polite" aria-label="Chat messages">' +
      '<p class="msg bot">Hi, I’m Nepsys’s AI assistant, not a person. Ask me how we help businesses stop missing leads.</p></div>' +
      '<form class="chat-form">' +
      '<label class="visually-hidden" for="chat-input">Your message</label>' +
      '<input id="chat-input" name="message" maxlength="500" autocomplete="off" placeholder="Type your question" required>' +
      '<button class="btn btn-primary" type="submit">Send</button></form>' +
      '<div class="chat-foot"><span class="chat-disclaimer">*This demo allows for ' + MAX + ' messages</span>' +
      '<a href="/privacy">Privacy</a></div>' +
      '<div class="chat-turnstile"></div>';

    document.body.appendChild(panel);
    document.body.appendChild(launcher);

    var log = panel.querySelector('.chat-log');
    var form = panel.querySelector('.chat-form');
    var input = form.querySelector('input');
    var send = form.querySelector('button');
    var busy = false, lastSent = 0, statusChecked = false;

    var add = function (cls, text) {
      var p = document.createElement('p');
      p.className = 'msg ' + cls;
      p.textContent = text;
      log.appendChild(p);
      log.scrollTop = log.scrollHeight;
      return p;
    };
    var finish = function () {
      if (panel.querySelector('.chat-done')) return;
      var done = document.createElement('div');
      done.className = 'chat-done';
      done.innerHTML = '<strong>Demo complete</strong><span>Want to see what it could do for your business?</span><a class="btn btn-primary" href="/book">Book a free call</a>';
      log.appendChild(done);
      log.scrollTop = log.scrollHeight;
    };
    var render = function () {
      try { localStorage.setItem(STORE, String(remaining)); } catch (e) {}
      var over = remaining <= 0;
      input.disabled = over || busy;
      send.disabled = over || busy;
      input.placeholder = over ? 'Demo complete' : 'Type your question';
      if (over) finish();
    };

    var post = function (payload) {
      return fetch(config.chatApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) { return { ok: res.ok, data: data }; });
      });
    };

    // Cloudflare Turnstile: an invisible bot check. Each message needs a fresh, single-use token.
    var turnstileReady = null, widgetId = null, token = null, waiters = [];
    var loadTurnstile = function () {
      if (!config.turnstileSiteKey) return Promise.resolve(false);
      if (turnstileReady) return turnstileReady;
      turnstileReady = new Promise(function (resolve) {
        var s = document.createElement('script');
        s.src = TURNSTILE_SRC; s.async = true;
        s.onload = function () {
          widgetId = window.turnstile.render(panel.querySelector('.chat-turnstile'), {
            sitekey: config.turnstileSiteKey,
            appearance: 'interaction-only',
            callback: function (t) { token = t; waiters.splice(0).forEach(function (fn) { fn(t); }); },
            'expired-callback': function () { token = null; window.turnstile.reset(widgetId); },
            // Don't leave a message hanging if the check can't run (e.g. blocked or wrong domain).
            'error-callback': function () { waiters.splice(0).forEach(function (fn) { fn(''); }); }
          });
          resolve(true);
        };
        s.onerror = function () { resolve(false); };
        document.head.appendChild(s);
      });
      return turnstileReady;
    };
    var getToken = function () {
      return loadTurnstile().then(function (ok) {
        if (!ok) return '';
        if (token) { var t = token; token = null; return t; }
        return new Promise(function (resolve) {
          var timer = setTimeout(function () { resolve(''); }, 20000);
          waiters.push(function (t) { clearTimeout(timer); token = null; resolve(t); });
        });
      });
    };

    var setOpen = function (open) {
      panel.hidden = !open;
      launcher.setAttribute('aria-expanded', String(open));
      launcher.innerHTML = open ? closeIcon : chatIcon;
      launcher.setAttribute('aria-label', open ? 'Close chat' : 'Chat with the Nepsys AI assistant');
      if (!open) return;
      loadTurnstile();
      if (!input.disabled) input.focus();
      if (!statusChecked) {
        statusChecked = true;
        post({ action: 'status' }).then(function (r) {
          if (r.ok && typeof r.data.remaining === 'number') { remaining = r.data.remaining; render(); }
        }).catch(function () {});
      }
    };

    launcher.addEventListener('click', function () { setOpen(panel.hidden); });
    panel.querySelector('.chat-close').addEventListener('click', function () { setOpen(false); launcher.focus(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { setOpen(false); launcher.focus(); }
    });
    document.querySelectorAll('[data-open-chat]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); setOpen(true); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      // One message at a time, a short pause between messages, and nothing after the limit.
      if (!text || busy || remaining <= 0 || Date.now() - lastSent < 2000) return;
      lastSent = Date.now();
      busy = true;
      input.value = '';
      add('user', text);
      var pending = add('bot pending', 'Typing…');
      render();

      getToken()
        .then(function (t) { return post({ message: text.slice(0, 500), token: t }); })
        .then(function (r) {
          var d = r.data || {};
          if (typeof d.remaining === 'number') remaining = d.remaining;
          if (d.done && !d.reply) remaining = 0;
          pending.className = 'msg bot' + (r.ok ? '' : ' error');
          pending.textContent = d.reply || d.error || 'Sorry, something went wrong.';
        })
        .catch(function () {
          pending.className = 'msg bot error';
          pending.textContent = 'The chat is unavailable right now. Please call 0432 457 880.';
        })
        .then(function () {
          busy = false;
          if (widgetId !== null) window.turnstile.reset(widgetId);
          render();
          if (!input.disabled) input.focus();
        });
    });

    render();
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
    initChat();
    initYear();
  });
})();
