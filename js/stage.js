/* S4 Split screen — the left panel's hero canvas.
   Desktop (>=960px): the panel is sticky and the frame index follows the progress of the whole page,
   so the clip advances slowly while the visitor reads the right column.
   Under 960px: the panel is a short band above the content; it plays while the band scrolls out of view.
   Native scroll only. Counts, sizes, folders and file names come from _shared/scroll/manifest.json. */
(function () {
  'use strict';
  var stage = document.querySelector('[data-stage]');
  if (!stage) return;
  var BASE = '_shared/scroll/';
  var canvas = stage.querySelector('canvas');
  var poster = stage.querySelector('.stage-poster');
  var bar = stage.querySelector('.cap-bar i');
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var narrow = window.matchMedia('(max-width: 959px)');
  var M = null, seq = null, set = null, frames = [], drawn = -1, dirty = true, pending = false, token = 0, active = false;

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function fileName(i) {
    return M.pattern.replace(/\{index(?::0?(\d+)d)?\}/, function (_, w) {
      var s = String(i + (M.index_base || 0));
      while (w && s.length < +w) s = '0' + s;
      return s;
    });
  }
  function pickSet() {
    var m = window.innerWidth < 768 && seq.mobile;
    var s = m ? seq.mobile : seq;
    return { key: m ? 'mobile' : 'desktop', dir: s.dir, count: s.count, width: s.width, height: s.height };
  }
  // keyframes (every 8th plus the last) first; the gaps (4th, 2nd, the rest) once the visitor scrolls,
  // since without scrolling the frame index stays at 0
  function loadOrder(n) {
    var seen = new Uint8Array(n), out = [], keys = 0;
    [8, 4, 2, 1].forEach(function (step, k) {
      for (var i = 0; i < n; i += step) if (!seen[i]) { seen[i] = 1; out.push(i); }
      if (k === 0) { if (!seen[n - 1]) { seen[n - 1] = 1; out.push(n - 1); } keys = out.length; }
    });
    return { order: out, keys: keys };
  }
  var scrolled = false, pumpNow = function () {};
  function load() {
    var my = ++token, lo = loadOrder(set.count), queue = lo.order, keysLeft = lo.keys, inflight = 0;
    frames = new Array(set.count); drawn = -1; dirty = true;
    function pump() {
      if (my !== token) return;
      while (inflight < 4 && queue.length && (keysLeft > 0 || scrolled)) { keysLeft--; start(queue.shift()); }
    }
    pumpNow = pump;
    function start(i) {
      inflight++;
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () {
        var ready = img.decode ? img.decode().catch(function () {}) : Promise.resolve();
        ready.then(function () {
          inflight--;
          if (my !== token) return;
          frames[i] = img; schedule(); pump();
        });
      };
      img.onerror = function () { inflight--; pump(); };
      img.src = BASE + set.dir + '/' + fileName(i);
    }
    pump();
  }

  function progress() {
    var y = window.scrollY || window.pageYOffset;
    if (narrow.matches) {
      // band: 0 at the top of the page, 1 once the band has scrolled out
      var head = document.querySelector('.site-head');
      var span = stage.offsetTop + stage.offsetHeight - (head ? head.offsetHeight : 0);
      return span > 0 ? clamp(y / span) : 0;
    }
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? clamp(y / max) : 0;
  }
  function nearest(i) {
    if (frames[i]) return i;
    for (var d = 1; d < frames.length; d++) {
      if (frames[i - d]) return i - d;
      if (frames[i + d]) return i + d;
    }
    return -1;
  }
  function fit() {
    var r = stage.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; dirty = true; }
  }
  function draw(img) {
    var cw = canvas.width, ch = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
    var s = Math.max(cw / iw, ch / ih), w = iw * s, h = ih * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }
  function render() {
    pending = false;
    var p = progress();
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (!active) return;
    fit();
    var k = nearest(Math.round(p * (set.count - 1)));
    if (k < 0 || (k === drawn && !dirty)) return;
    draw(frames[k]);
    drawn = k; dirty = false;
    if (!canvas.classList.contains('on')) canvas.classList.add('on');
  }
  function schedule() { if (!pending) { pending = true; window.requestAnimationFrame(render); } }

  function start() {
    if (!M || reduce.matches) return;
    active = true;
    var next = pickSet();
    if (!set || next.key !== set.key) { set = next; load(); }
    schedule();
  }
  function stop() {
    active = false; token++;
    canvas.classList.remove('on');
  }

  window.addEventListener('scroll', function () {
    if (!scrolled) { scrolled = true; pumpNow(); }
    schedule();
  }, { passive: true });
  window.addEventListener('resize', function () {
    if (active && set && pickSet().key !== set.key) { set = pickSet(); load(); }
    dirty = true; schedule();
  });
  var onReduce = function () { if (reduce.matches) stop(); else start(); };
  if (reduce.addEventListener) reduce.addEventListener('change', onReduce); else if (reduce.addListener) reduce.addListener(onReduce);

  // frames never compete with first paint: the manifest is read after the page's own resources have loaded
  function boot() {
    fetch(BASE + 'manifest.json').then(function (r) { return r.json(); }).then(function (m) {
      M = m; seq = m.sequences && m.sequences.hero;
      if (!seq) return;
      // the static <img> already shows the poster; follow the manifest if it ever names another file
      if (seq.poster && poster && poster.getAttribute('src') !== BASE + seq.poster) poster.src = BASE + seq.poster;
      start();
    }).catch(function () { /* poster stays as a still image */ });
  }
  if (document.readyState === 'complete') boot(); else window.addEventListener('load', boot);
  schedule();

  /* caption: name of the section currently read in the right column (solid backing, never over body text) */
  var capNum = stage.querySelector('.cap-num'), capName = stage.querySelector('.cap-name');
  var secs = [].slice.call(document.querySelectorAll('[data-cap]'));
  if (capName && secs.length && 'IntersectionObserver' in window) {
    var total = secs.length;
    var setCap = function (el) {
      var i = secs.indexOf(el);
      capNum.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
      capName.textContent = el.getAttribute('data-cap');
    };
    setCap(secs[0]);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setCap(e.target); });
    }, { rootMargin: '-35% 0px -60% 0px' });
    secs.forEach(function (s) { io.observe(s); });
  }
})();
