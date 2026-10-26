/* S4 Split screen — Professor page (v6): the principal investigator only, as on the legacy prof.html.
   Name, title lines, address, email, Google Citation/CV, then Education, Experience and Service from the structured professor fields. No members. */
(function () {
  'use strict';
  var S = window.S4, C = S.C, esc = S.esc, asset = S.asset;
  var $ = function (id) { return document.getElementById(id); };
  S.initHeader();
  S.initFooter();

  var P = C.professor || {}, ct = C.contact || {}, lab = C.lab || {}, pl = P.links || {};
  // content = exactly what the legacy prof.html shows (user rule 2026-10-26): no office/phone, no extra links
  // "Jeong Woo Han, Ph.D." as on the legacy page; the degree comes from professor.education
  var phd = (P.education || []).some(function (e) { return /^Ph\.?\s?D/i.test(e.degree || ''); });
  // "Professor, Department of ..., Seoul National University" -> one line each, roles after the rank
  var parts = String(P.title || '').split(/,\s*/).filter(Boolean);
  var aff = (parts.length ? ['<span class="first">' + esc(parts[0]) + '</span>'] : [])
    .concat((P.roles || []).map(function (r) { return '<span class="first">' + esc(r) + '</span>'; }))
    .concat(parts.slice(1).map(function (x) { return '<span>' + esc(x) + '</span>'; }));
  // the street address without the department/university lines already shown above
  var addr = String(ct.address || '');
  if (lab.affiliation && addr.indexOf(lab.affiliation) === 0) addr = addr.slice(lab.affiliation.length).replace(/^\s*,\s*/, '');
  var row = function (k, v) { return v ? '<div><dt>' + k + '</dt><dd>' + v + '</dd></div>' : ''; };
  var link = function (k, href, label) {
    return '<a href="' + esc(href) + '" target="_blank" rel="noopener"><span class="ico" aria-hidden="true">' + S.ICON[k] + '</span>' + esc(label) + '</a>';
  };

  $('profile').innerHTML =
    (P.photo ? '<img class="prof-photo" src="' + esc(asset(P.photo)) + '" alt="' + esc(P.name) + '" width="220" height="283">' : '') +
    '<div class="prof-body"><h2 id="h-prof">' + esc(P.name) + (phd ? ', Ph.D.' : '') + '</h2>' +
    '<p class="prof-aff">' + aff.join('') + '</p>' +
    '<dl class="prof-contact">' +
      row('Address', esc(addr)) +
      row('Email', P.email ? '<a href="mailto:' + esc(P.email) + '">' + esc(P.email) + '</a>' : '') +
    '</dl>' +
    '<p class="prof-links">' +
      (pl.google_scholar ? link('scholar', S.secure(pl.google_scholar), 'Google Citation') : '') +
      (pl.cv ? link('cv', asset(pl.cv), 'Curriculum Vitae') : '') +
    '</p></div>';

  // Education, Experience and Service from the structured fields (professor.education / experience / service)
  var dash = function (s) { return esc(String(s || '').replace(/\s+-\s+/g, ' – ')); };
  var edu = P.education || [];
  $('edu-list').innerHTML = edu.map(function (e) {
    return '<li class="cv-item"><span class="cv-date">' + esc(e.date || '') + '</span><div>' +
      '<p class="cv-inst">' + esc(e.institution) + (e.location ? '<span class="loc">, ' + esc(e.location) + '</span>' : '') + '</p>' +
      '<p class="cv-deg"><b>' + esc(e.degree) + '</b>' + (e.honors ? ' (' + esc(e.honors) + ')' : '') + (e.field ? ', ' + esc(e.field) : '') + '</p>' +
      (e.thesis ? '<p class="cv-thesis">&ldquo;' + esc(e.thesis) + '&rdquo;</p>' : '') +
      (e.advisor ? '<p class="cv-adv">Advisor: ' + esc(e.advisor) + '</p>' : '') + '</div></li>';
  }).join('');
  if (!edu.length) $('education').hidden = true;

  var exp = P.experience || [];
  $('exp-list').innerHTML = exp.map(function (b) {
    return '<div class="cv-org"><h3>' + esc(b.institution) + (b.location ? '<span class="loc">, ' + esc(b.location) + '</span>' : '') + '</h3>' +
      '<ul class="cv-roles">' + (b.roles || []).map(function (r) {
        return '<li><span><span class="role">' + esc(r.title) + '</span>' + (r.unit ? ', ' + esc(r.unit) : '') + '</span>' +
          '<span class="when">' + dash(r.period) + '</span></li>';
      }).join('') + '</ul></div>';
  }).join('');
  if (!exp.length) $('experience').hidden = true;

  var svc = P.service || [];
  $('svc-list').innerHTML = svc.map(function (s) {
    return '<li><span><span class="role">' + esc(s.title) + '</span>' + (s.organization ? ', ' + esc(s.organization) : '') + '</span>' +
      '<span class="when">' + dash(s.period) + '</span></li>';
  }).join('');
  if (!svc.length) $('service').hidden = true;

  S.settleHash();
})();
