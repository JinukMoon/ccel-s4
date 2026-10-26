/* S4 Split screen — Members page: current members by group; alumni behind an Alumni view (v6).
   The professor has his own page (professor.html). All facts from window.CCEL.
   Views: #current (default) and #alumni. A view link pushes a history entry, so the back button and
   the address bar stay in sync; loading members.html#alumni (or #alumni-<group>) opens the alumni view. */
(function () {
  'use strict';
  var S = window.S4, C = S.C, esc = S.esc, asset = S.asset;
  var $ = function (id) { return document.getElementById(id); };
  S.initHeader();
  S.initFooter();

  var slug = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var members = C.members || [], alumni = C.alumni || [];
  var nMembers = S.allPeople(members).length, nAlumni = S.allPeople(alumni).length;
  var P = C.professor || {};
  $('people-lede').innerHTML = esc(nMembers) + ' current members' +
    (P.name ? ', led by <a href="professor.html">Prof. ' + esc(P.name) + '</a>' : '') + '.';
  $('n-current').textContent = nMembers;
  $('n-alumni').textContent = nAlumni;

  $('subnav-current').innerHTML = members.map(function (g) {
    return '<a href="#' + slug(g.group) + '">' + esc(g.group) + '</a>';
  }).join('');
  $('subnav-alumni').innerHTML = alumni.map(function (g) {
    return '<a href="#alumni-' + slug(g.group) + '">' + esc(g.group) + '</a>';
  }).join('');

  function typeTag(t) {
    return t ? '<span class="type t-' + esc(t) + '">' + (t === 'experimental' ? 'Experimental' : 'Computational') + '</span>' : '';
  }
  function photo(m, nm, cls) {
    return m.photo ? '<img class="' + cls + '" src="' + esc(asset(m.photo)) + '" alt="' + esc(nm) + '" loading="lazy" decoding="async">'
      : '<span class="' + cls + ' ph" aria-hidden="true"></span>';
  }

  /* ---- current members ---- */
  $('groups').innerHTML = members.map(function (g) {
    var ppl = g.people || [];
    return '<section class="pg-sec grp" id="' + slug(g.group) + '" aria-labelledby="h-' + slug(g.group) + '">' +
      '<h2 id="h-' + slug(g.group) + '">' + esc(g.group) + ' <span class="count">' + ppl.length + '</span></h2>' +
      '<ul class="cards">' + ppl.map(function (m) {
        var nm = S.splitName(m.name);
        return '<li class="card" data-type="' + esc(m.type || '') + '">' + photo(m, nm.name, 'card-photo') +
          '<div class="card-body"><h3>' + esc(nm.name) + '</h3>' + (nm.note ? '<p class="note">' + esc(nm.note) + '</p>' : '') +
          '<p class="meta">' + typeTag(m.type) + (m.research_area ? '<span class="ra">' + esc(m.research_area) + '</span>' : '') + '</p>' +
          ((m.degrees || []).length ? '<ul class="deg">' + m.degrees.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul>' : '') +
          '<p class="reach">' + (m.email ? '<a href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a>' : '') +
          (m.office ? '<span>' + esc(m.office) + '</span>' : '') + '</p>' +
          S.linkIcons(m) + '</div></li>';
      }).join('') + '</ul></section>';
  }).join('');

  /* ---- alumni (current_position shown as recorded, "N/A" included) ---- */
  $('alumni-groups').innerHTML = alumni.map(function (g) {
    var ppl = g.people || [];
    return '<section class="alum-grp" id="alumni-' + slug(g.group) + '" aria-labelledby="h-al-' + slug(g.group) + '">' +
      '<h3 id="h-al-' + slug(g.group) + '">' + esc(g.group) + ' <span class="count">' + ppl.length + '</span></h3>' +
      '<ul class="alums">' + ppl.map(function (m) {
        var nm = S.splitName(m.name);
        return '<li class="alum" data-type="' + esc(m.type || '') + '">' + photo(m, nm.name, 'alum-photo') +
          '<div><p class="alum-name">' + esc(nm.name) + '</p>' + (nm.note ? '<p class="note">' + esc(nm.note) + '</p>' : '') +
          (m.current_position ? '<p class="now"><span class="sr">Current position: </span>' + esc(m.current_position) + '</p>' : '') +
          ((m.degrees || [])[0] ? '<p class="deg1">' + esc(m.degrees[0]) + '</p>' : '') +
          '<p class="meta">' + typeTag(m.type) + '</p>' + S.linkIcons(m) + '</div></li>';
      }).join('') + '</ul></section>';
  }).join('');

  /* ---- filter: computational / experimental (both views) ---- */
  var btns = [].slice.call(document.querySelectorAll('.filter button'));
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-type');
      btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      document.querySelectorAll('.card, .alum').forEach(function (el) { el.hidden = !!t && el.getAttribute('data-type') !== t; });
      document.querySelectorAll('.grp, .alum-grp').forEach(function (sec) {
        sec.hidden = !sec.querySelector('.card:not([hidden]), .alum:not([hidden])');
      });
    });
  });

  /* ---- views: current members / alumni ---- */
  var VIEW = { current: $('current'), alumni: $('alumni') };
  var SUB = { current: $('subnav-current'), alumni: $('subnav-alumni') };
  var viewBtns = [].slice.call(document.querySelectorAll('.view-btn'));
  // which view an in-page id belongs to; null = not a members id (e.g. #main), left to the browser
  function viewOf(id) {
    if (!id) return 'current';
    var el = document.getElementById(id);
    if (!el) return null;
    if (VIEW.alumni.contains(el)) return 'alumni';
    if (VIEW.current.contains(el)) return 'current';
    return null;
  }
  function show(v) {
    Object.keys(VIEW).forEach(function (k) { VIEW[k].hidden = k !== v; SUB[k].hidden = k !== v; });
    viewBtns.forEach(function (b) {
      if (b.getAttribute('data-view') === v) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  }
  function reveal(id, instant) {
    var el = id && document.getElementById(id);
    if (el) el.scrollIntoView({ block: 'start', behavior: instant ? 'instant' : 'auto' });
  }
  function hashId() { try { return decodeURIComponent(location.hash.slice(1)); } catch (e) { return ''; } }

  // clicks on view links and group jumps: show the view, then go to the target
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var id = decodeURIComponent(a.getAttribute('href').slice(1)), v = viewOf(id);
    if (!v) return;
    e.preventDefault();
    // remember where the visitor was, so Back returns to the same spot
    history.replaceState(Object.assign({}, history.state, { y: window.scrollY }), '');
    if (location.hash !== '#' + id) history.pushState({}, '', '#' + id);
    show(v);
    reveal(id);
  });
  // Back / Forward between views
  var popped = null;
  window.addEventListener('popstate', function (e) {
    var id = hashId(), v = viewOf(id) || 'current';
    popped = location.hash;
    show(v);
    var y = e.state && typeof e.state.y === 'number' ? e.state.y : null;
    requestAnimationFrame(function () {
      if (y != null) window.scrollTo({ top: y, behavior: 'instant' });
      else if (id && viewOf(id)) reveal(id, true);
      else window.scrollTo({ top: 0, behavior: 'instant' });
    });
  });
  // a hash typed into the address bar
  window.addEventListener('hashchange', function () {
    if (popped === location.hash) { popped = null; return; }
    var id = hashId(), v = viewOf(id);
    if (v) { show(v); reveal(id); }
  });

  // first load: members.html#alumni opens the alumni view
  show(viewOf(hashId()) || 'current');
  S.settleHash();
})();
