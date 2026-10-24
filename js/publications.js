/* S4 Split screen — Publications page: full list (search + filters, grouped by year), Selected, Covers.
   Order is the data order (newest `no` first). Within a year, published papers come first and
   in-press / in-revision / submitted entries follow under their own sub-headings. */
(function () {
  'use strict';
  var S = window.S4, C = S.C, esc = S.esc, rich = S.rich, asset = S.asset;
  var $ = function (id) { return document.getElementById(id); };
  S.initHeader();
  S.initFooter();

  var pubs = C.publications || [], counts = C.publication_counts || {}, cur = C.curation || {};
  var STATUS_ORDER = ['published', 'in press', 'accepted', 'in revision', 'submitted'];
  var rank = function (s) { var i = STATUS_ORDER.indexOf(s); return i < 0 ? STATUS_ORDER.length : i; };
  var nPub = pubs.filter(function (p) { return p.status === 'published'; }).length;
  var nOther = pubs.length - nPub;
  $('pub-lede').textContent = nPub + ' published papers' + (nOther ? ', plus ' + nOther + ' in press, in revision or submitted' : '') +
    '. Newest first; CCEL members in bold.';

  /* ---- filters ---- */
  var years = Object.keys(counts).map(Number);
  pubs.forEach(function (p) { if (p.year && years.indexOf(p.year) < 0) years.push(p.year); });
  years.sort(function (a, b) { return b - a; });
  $('f-year').insertAdjacentHTML('beforeend', years.map(function (y) { return '<option>' + y + '</option>'; }).join(''));
  var statuses = STATUS_ORDER.filter(function (s) { return pubs.some(function (p) { return p.status === s; }); });
  $('f-status').insertAdjacentHTML('beforeend', statuses.map(function (s) { return '<option value="' + esc(s) + '">' + esc(S.STATUS_LABEL[s] || s) + '</option>'; }).join(''));
  $('f-area').insertAdjacentHTML('beforeend', ((C.research || {}).areas || []).map(function (a) {
    return '<option value="' + esc(a.numeral) + '">' + esc(a.numeral + '. ' + a.title) + '</option>';
  }).join('') + '<option value="none">Not assigned</option>');

  /* ---- list, built once ---- */
  var entries = [];  // {p, hay}
  var html = years.map(function (y) {
    var inYear = pubs.filter(function (p) { return p.year === y; });
    if (!inYear.length) return '';
    var groups = {};
    inYear.forEach(function (p) { (groups[p.status] = groups[p.status] || []).push(p); });
    var order = Object.keys(groups).sort(function (a, b) { return rank(a) - rank(b); });
    var total = counts[y] != null ? counts[y] : inYear.length;
    return '<section class="yr" data-year="' + y + '" aria-labelledby="y-' + y + '"><h2 class="yr-h" id="y-' + y + '">' + y +
      ' <span class="count" data-total="' + total + '">' + total + ' entries</span></h2>' +
      order.map(function (st) {
        var sub = order.length > 1 || st !== 'published';
        return '<div class="st" data-status="' + esc(st) + '">' + (sub ? '<h3 class="st-h">' + esc(S.STATUS_LABEL[st] || st) + '</h3>' : '') +
          '<ol class="pubs">' + groups[st].map(function (p) {
            var i = entries.length;
            entries.push({ p: p, hay: (S.plain(p.title) + ' ' + S.plain(p.authors) + ' ' + (p.journal || '') + ' ' + (p.citation_tail || '')).toLowerCase() });
            return '<li class="pub" data-i="' + i + '">' + S.citation(p, { number: true, areaLabel: !!p.area, areaShort: true, coverBadge: true }) + '</li>';
          }).join('') + '</ol></div>';
      }).join('') + '</section>';
  }).join('');
  $('list').innerHTML = html;
  var items = [].slice.call(document.querySelectorAll('#list .pub'));
  var yearSecs = [].slice.call(document.querySelectorAll('#list .yr'));
  var stDivs = [].slice.call(document.querySelectorAll('#list .st'));

  var params = new URLSearchParams(location.search);
  if (params.get('area')) $('f-area').value = params.get('area');
  if (params.get('year')) $('f-year').value = params.get('year');
  if (params.get('status')) $('f-status').value = params.get('status');
  if (params.get('q')) $('q').value = params.get('q');

  function apply() {
    var q = $('q').value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    var y = $('f-year').value, st = $('f-status').value, ar = $('f-area').value, led = $('f-led').checked;
    var shown = 0;
    items.forEach(function (li) {
      var e = entries[+li.getAttribute('data-i')], p = e.p;
      var ok = (!y || String(p.year) === y) && (!st || p.status === st) &&
        (!ar || (ar === 'none' ? !p.area : p.area === ar)) && (!led || p.lab_led) &&
        q.every(function (w) { return e.hay.indexOf(w) >= 0; });
      li.hidden = !ok; if (ok) shown++;
    });
    stDivs.forEach(function (d) { d.hidden = !d.querySelector('.pub:not([hidden])'); });
    var filtered = q.length || y || st || ar || led;
    yearSecs.forEach(function (s) {
      var n = s.querySelectorAll('.pub:not([hidden])').length, c = s.querySelector('.count');
      s.hidden = !n;
      c.textContent = (filtered ? n + ' of ' : '') + c.getAttribute('data-total') + ' entries';
    });
    $('count').textContent = filtered ? shown + ' of ' + pubs.length + ' entries match.' : pubs.length + ' entries.';
  }
  var timer;
  $('q').addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(apply, 120); });
  ['f-year', 'f-status', 'f-area', 'f-led'].forEach(function (id) { $(id).addEventListener('change', apply); });
  apply();

  /* ---- selected + recent highlights (curation, used as given) ---- */
  var prof = C.professor || {};
  $('sel-lede').textContent = 'Chosen by ' + (prof.name ? 'Prof. ' + prof.name : 'the PI') + ' and labelled by research area.';
  $('sel-list').innerHTML = (cur.selected_pins || []).map(function (x) {
    var p = S.byNo.get(x.no); return p ? S.citation(p, { areaLabel: x.area || true, cover: true }) : '';
  }).join('');
  $('hl-list').innerHTML = (cur.recent_highlights || []).map(function (n) {
    var p = S.byNo.get(n); return p ? S.citation(p, { areaLabel: true, cover: true }) : '';
  }).join('');
  if (cur.rules) $('rules').querySelector('p').textContent = cur.rules + (cur.updated_at ? ' (Updated ' + cur.updated_at + '.)' : '');
  else $('rules').hidden = true;

  // legacy 2018-2022 highlights with abstracts; rendered on first open so their images load only then
  var earlier = C.selected_publications || [];
  if (!earlier.length) $('earlier').hidden = true;
  $('earlier').querySelector('summary').textContent = 'Earlier highlights (' + earlier.length + ', with abstracts)';
  $('earlier').addEventListener('toggle', function () {
    var box = $('earlier-list');
    if (!this.open || box.childElementCount) return;
    box.innerHTML = earlier.map(function (s) {
      var link = s.doi ? 'https://doi.org/' + s.doi : S.secure(s.url);
      return '<article class="cite early">' +
        (s.image ? '<img class="toc" src="' + esc(asset(s.image)) + '" alt="" loading="lazy" decoding="async">' : '') +
        '<div class="cite-body"><h3 class="cite-title">' + (link ? '<a href="' + esc(link) + '" target="_blank" rel="noopener">' + rich(s.title) + '</a>' : rich(s.title)) + '</h3>' +
        '<p class="cite-authors">' + rich(String(s.authors_citation || '').replace(/\s*\(IF\s*=\s*[\d.]+\)\s*\.?\s*$/i, '')) + '</p>' +
        (s.impact_factor != null ? '<p class="cite-src"><span class="if">IF ' + esc(s.impact_factor) + '</span></p>' : '') +
        (s.highlight ? '<p class="cite-note">' + esc(s.highlight) + '</p>' : '') +
        (s.abstract ? '<details class="abs"><summary>Abstract</summary><p>' + rich(s.abstract) + '</p></details>' : '') +
        '</div></article>';
    }).join('');
  });

  /* ---- covers (all, including back/inside cover pages), rendered when the tab first opens ---- */
  var covers = C.cover_publications || [];
  var nFront = covers.filter(function (c) { return c.kind === 'front'; }).length;
  $('cov-lede').textContent = covers.length + ' journal covers and cover pages featuring the lab’s work' +
    (covers.length - nFront ? ' (' + (covers.length - nFront) + ' are back or inside cover pages)' : '') + '.';
  // front covers first, then back / inside cover pages (mostly printed text) in their own group; data order within each
  function renderCovers() {
    var grid = $('cover-grid');
    if (grid.childElementCount) return;
    var fronts = covers.filter(function (c) { return c.kind === 'front'; });
    var backs = covers.filter(function (c) { return c.kind !== 'front'; });
    grid.innerHTML = coverItems(fronts);
    if (backs.length) grid.insertAdjacentHTML('afterend', '<h3 class="cv-h">Back and inside cover pages</h3><ul class="cover-grid">' + coverItems(backs) + '</ul>');
  }
  function coverItems(list) {
    return list.map(function (c) {
      var p = S.paperForCover(c), link = p ? S.doiUrl(p) : S.secure(c.url);
      var cap = p ? '<span class="cv-j">' + esc(p.journal || '') + '</span> <span class="cv-y">' + esc(p.year || '') + '</span>' : '';
      var title = p ? S.plain(p.title) : 'Journal cover';
      return '<li class="cv' + (c.kind !== 'front' ? ' cv-back' : '') + '"><a href="' + esc(link) + '" target="_blank" rel="noopener">' +
        '<img src="' + esc(asset(c.image)) + '" alt="' + esc((c.kind === 'front' ? 'Journal cover: ' : 'Cover page: ') + title) + '" loading="lazy" decoding="async"></a>' +
        '<p class="cv-cap">' + cap + '</p>' +
        (p ? '<p class="cv-title">' + rich(p.title) + '</p>' : '') + '</li>';
    }).join('');
  }

  /* ---- tabs ---- */
  var tabs = [].slice.call(document.querySelectorAll('[role=tab]'));
  function show(id, focus) {
    if (['all', 'selected', 'covers'].indexOf(id) < 0) id = 'all';
    tabs.forEach(function (t) {
      var on = t.getAttribute('aria-controls') === id;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      $(t.getAttribute('aria-controls')).hidden = !on;
      if (on && focus) t.focus();
    });
    if (id === 'covers') renderCovers();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      var id = t.getAttribute('aria-controls');
      history.replaceState(null, '', '#' + id);
      show(id);
    });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = tabs[(i + d + tabs.length) % tabs.length];
      history.replaceState(null, '', '#' + n.getAttribute('aria-controls'));
      show(n.getAttribute('aria-controls'), true);
    });
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-cover-tab]');
    if (!a) return;
    e.preventDefault();
    history.replaceState(null, '', '#covers');
    show('covers');
    document.querySelector('.tabs').scrollIntoView({ block: 'start' });
  });
  show(location.hash.slice(1));
  window.addEventListener('hashchange', function () { show(location.hash.slice(1)); });
})();
