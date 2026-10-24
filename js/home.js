/* S4 Split screen — landing page right column, rendered from window.CCEL.
   Lean by design (v5): identity, news, open position, the six pinned papers, the Korean intro, contact.
   No counts or totals here; research lives on research.html, people on members.html. */
(function () {
  'use strict';
  var S = window.S4, C = S.C, esc = S.esc, rich = S.rich;
  var $ = function (id) { return document.getElementById(id); };
  S.initHeader();
  S.initFooter();

  var lab = C.lab || {}, W = C.welcome || {}, cur = C.curation || {};
  var prof = C.professor || {}, ct = C.contact || {};

  /* ---- identity ---- */
  $('affil').textContent = lab.affiliation || '';
  $('lab-name').textContent = lab.name || '';
  $('tagline').textContent = W.tagline || '';

  /* ---- news ---- */
  $('news-list').innerHTML = (W.news || []).map(function (n) {
    return '<li>' + (n.date ? '<time>' + esc(n.date) + '</time>' : '') + '<span>' + rich(n.text) + '</span></li>';
  }).join('');

  /* ---- open position (Korean notice) ---- */
  $('opening-ko').textContent = W.opening_ko || '';
  var mail = ct.email || prof.email;
  $('opening-mail').innerHTML = 'Enquiries: ' + esc(prof.name ? 'Prof. ' + prof.name : '') +
    (mail ? ', <a href="mailto:' + esc(mail) + '">' + esc(mail) + '</a>' : '') + '.';

  /* ---- selected publications: the professor's pins, compact (title, one journal line, DOI) ---- */
  $('selected').innerHTML = (cur.selected_pins || []).map(function (x) {
    var p = S.byNo.get(x.no);
    if (!p) return '';
    var area = S.areaByNumeral[x.area || p.area];
    var link = S.doiUrl(p);
    var title = link ? '<a href="' + esc(link) + '" target="_blank" rel="noopener">' + rich(p.title) + '</a>' : rich(p.title);
    var src = '<span class="src">' + S.source(p) + '</span>' +
      (p.doi ? '<span class="sep" aria-hidden="true"> · </span><a class="doi" href="https://doi.org/' + esc(p.doi) + '" target="_blank" rel="noopener">doi:' + esc(p.doi) + '</a>' : '');
    return '<li class="pin">' +
      (area ? '<p class="cite-meta"><a class="area-tag" href="research.html#area-' + esc(area.numeral) + '" title="Research area ' + esc(area.numeral) + ': ' + esc(area.title) + '">Area ' + esc(area.numeral) + '</a>' +
        '<span class="area-name">' + esc(area.title) + '</span></p>' : '') +
      '<h3 class="cite-title">' + title + '</h3>' +
      '<p class="cite-src">' + src + '</p></li>';
  }).join('');

  /* ---- about (Korean intro, as on the current Welcome page) ---- */
  $('about-ko').textContent = W.about_ko || '';

  /* ---- contact ---- */
  var rows = [['Address', ct.address], ['Email', ct.email ? '<a href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + '</a>' : null],
    ['Professor office', ct.professor_office], ['Laboratory', ct.laboratory], ['Student office', ct.student_office]];
  $('contact-list').innerHTML = rows.filter(function (r) { return r[1]; }).map(function (r) {
    return '<div><dt>' + r[0] + '</dt><dd>' + (r[0] === 'Email' ? r[1] : esc(r[1])) + '</dd></div>';
  }).join('');

  S.settleHash();
})();
