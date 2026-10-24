/* S4 Split screen — People page: professor, current members by group, alumni. All from window.CCEL. */
(function () {
  'use strict';
  var S = window.S4, C = S.C, esc = S.esc, asset = S.asset;
  var $ = function (id) { return document.getElementById(id); };
  S.initHeader();
  S.initFooter();

  var slug = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var members = C.members || [], alumni = C.alumni || [];
  var nMembers = S.allPeople(members).length, nAlumni = S.allPeople(alumni).length;
  $('people-lede').textContent = nMembers + ' current members and ' + nAlumni + ' alumni.';
  $('subnav').innerHTML = ['<a href="#professor">Professor</a>'].concat(members.map(function (g) {
    return '<a href="#' + slug(g.group) + '">' + esc(g.group) + '</a>';
  })).concat(['<a href="#alumni">Alumni</a>']).join('');

  function typeTag(t) {
    return t ? '<span class="type t-' + esc(t) + '">' + (t === 'experimental' ? 'Experimental' : 'Computational') + '</span>' : '';
  }
  function photo(m, nm, cls) {
    return m.photo ? '<img class="' + cls + '" src="' + esc(asset(m.photo)) + '" alt="' + esc(nm) + '" loading="lazy" decoding="async">'
      : '<span class="' + cls + ' ph" aria-hidden="true"></span>';
  }

  /* ---- professor ---- */
  var P = C.professor || {}, ct = C.contact || {};
  var edu = ((P.sections || {}).Education || []).filter(function (l) { return l !== 'Education'; });
  var eduItems = [];
  edu.forEach(function (l) {
    var t = l.replace(/^\s*✔\s*/, '').replace(/\s+,/g, ',').trim();
    if (/^Advisor:/i.test(t) && eduItems.length) eduItems[eduItems.length - 1] += '<span class="adv">' + esc(t) + '</span>';
    else eduItems.push(esc(t));
  });
  var pl = P.links || {};
  $('professor').innerHTML =
    (P.photo ? '<img class="prof-photo" src="' + esc(asset(P.photo)) + '" alt="' + esc(P.name) + '" width="200" height="257">' : '') +
    '<div class="prof-body"><p class="label">Principal investigator</p><h2 id="h-prof">' + esc(P.name) + '</h2>' +
    '<p class="prof-title">' + esc(P.title || '') + '</p>' +
    (P.roles || []).map(function (r) { return '<p class="prof-role">' + esc(r) + '</p>'; }).join('') +
    '<dl class="prof-contact">' +
      (P.email ? '<div><dt>Email</dt><dd><a href="mailto:' + esc(P.email) + '">' + esc(P.email) + '</a></dd></div>' : '') +
      (ct.professor_office ? '<div><dt>Office</dt><dd>' + esc(ct.professor_office) + '</dd></div>' : '') +
    '</dl>' +
    '<p class="prof-links">' +
      (pl.google_scholar ? '<a href="' + esc(S.secure(pl.google_scholar)) + '" target="_blank" rel="noopener">Google Scholar</a>' : '') +
      (pl.cv ? '<a href="' + esc(asset(pl.cv)) + '" target="_blank" rel="noopener">Curriculum vitae (PDF)</a>' : '') +
    '</p>' +
    (eduItems.length ? '<h3>Education</h3><ul class="edu">' + eduItems.map(function (e) { return '<li>' + e + '</li>'; }).join('') + '</ul>' : '') +
    '</div>';

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

  /* ---- alumni ---- */
  $('alumni-groups').innerHTML = alumni.map(function (g) {
    var ppl = g.people || [];
    return '<div class="alum-grp" id="alumni-' + slug(g.group) + '"><h3>' + esc(g.group) + ' <span class="count">' + ppl.length + '</span></h3>' +
      '<ul class="alums">' + ppl.map(function (m) {
        var nm = S.splitName(m.name);
        var pos = m.current_position && !/^n\/?a$/i.test(m.current_position) ? m.current_position : '';
        return '<li class="alum" data-type="' + esc(m.type || '') + '">' + photo(m, nm.name, 'alum-photo') +
          '<div><p class="alum-name">' + esc(nm.name) + '</p>' + (nm.note ? '<p class="note">' + esc(nm.note) + '</p>' : '') +
          (pos ? '<p class="now"><span class="sr">Current position: </span>' + esc(pos) + '</p>' : '') +
          ((m.degrees || [])[0] ? '<p class="deg1">' + esc(m.degrees[0]) + '</p>' : '') +
          '<p class="meta">' + typeTag(m.type) + '</p>' + S.linkIcons(m) + '</div></li>';
      }).join('') + '</ul></div>';
  }).join('');

  /* ---- filter: computational / experimental ---- */
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

  S.settleHash();
})();
