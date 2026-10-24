/* S4 Split screen — landing page right column, rendered from window.CCEL. */
(function () {
  'use strict';
  var S = window.S4, C = S.C, esc = S.esc, rich = S.rich, asset = S.asset;
  var $ = function (id) { return document.getElementById(id); };
  S.initHeader();
  S.initFooter();
  S.setDefer(true);

  var lab = C.lab || {}, R = C.research || {}, W = C.welcome || {}, cur = C.curation || {};
  var pubs = C.publications || [];
  var published = pubs.filter(function (p) { return p.status === 'published'; });

  /* ---- overview ---- */
  $('affil').textContent = lab.affiliation || '';
  $('lab-name').textContent = lab.name || '';
  $('identity').textContent = R.headline || '';
  $('tagline').textContent = W.tagline || '';
  var years = published.map(function (p) { return p.year; }).filter(Boolean);
  var members = S.allPeople(C.members).length, alumni = S.allPeople(C.alumni).length;
  var facts = [
    [published.length, 'published papers' + (years.length ? ', ' + Math.min.apply(null, years) + '–' + Math.max.apply(null, years) : '')],
    [(R.areas || []).length, 'research areas'],
    [members, 'current members'],
    [alumni, 'alumni']
  ];
  $('facts').innerHTML = facts.map(function (f) { return '<div><dt>' + esc(f[1]) + '</dt><dd>' + esc(f[0]) + '</dd></div>'; }).join('');
  $('area-index').innerHTML = (R.areas || []).map(function (a) {
    return '<li><a href="#area-' + esc(a.numeral) + '"><span class="num">' + esc(a.numeral) + '</span><span class="t">' + esc(a.title) + '</span></a></li>';
  }).join('');

  /* ---- research ---- */
  $('research-intro').innerHTML = (R.intro || []).map(function (t) { return '<p>' + rich(t) + '</p>'; }).join('');
  if (R.image) {
    $('research-loop').innerHTML = '<img ' + S.srcAttr(asset(R.image)) + ' alt="Research approach of ' + esc(lab.short || '') + ': artificial intelligence, computational materials design and experimental validation" decoding="async">';
  }
  var curated = new Set();
  (cur.selected_pins || []).forEach(function (x) { curated.add(x.no); });
  (cur.recent_highlights || []).forEach(function (n) { curated.add(n); });
  $('areas').innerHTML = (R.areas || []).map(function (a) {
    // the data repeats "I. Title" at the start of each summary; the heading already says it
    var sum = String(a.summary || '').replace(new RegExp('^\\s*' + a.numeral + '\\.\\s*' + a.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*'), '');
    var inArea = published.filter(function (p) { return p.area === a.numeral; });
    // latest lab-led papers of this area that are not already shown in Selected / Recent Highlights
    var latest = inArea.filter(function (p) { return p.lab_led && !curated.has(p.no); }).slice(0, 2);
    return '<article class="area" id="area-' + esc(a.numeral) + '">' +
      '<div class="area-head"><img ' + S.srcAttr(asset(a.image)) + ' alt="' + esc(a.title) + ' — research figure" decoding="async" width="168" height="168">' +
      '<div><p class="area-num">Area ' + esc(a.numeral) + '</p><h3>' + esc(a.title) + '</h3>' +
      '<p class="kw"><span class="sr">Keywords: </span>' + (a.keywords || []).map(esc).join('<span aria-hidden="true"> · </span>') + '</p></div></div>' +
      '<p class="area-sum">' + rich(sum) + '</p>' +
      (latest.length ? '<div class="area-papers"><p class="label">Latest lab-led papers</p>' + latest.map(function (p) { return S.citation(p, { headingTag: 'h4' }); }).join('') + '</div>' : '') +
      '<p class="area-more"><a href="publications.html?area=' + encodeURIComponent(a.numeral) + '&amp;status=published">All ' + inArea.length + ' published papers in Area ' + esc(a.numeral) + '</a></p>' +
      '</article>';
  }).join('');

  /* ---- selected publications (pinned by the professor, in pin order) ---- */
  var prof = C.professor || {};
  $('selected-lede').textContent = 'Chosen by ' + (prof.name ? 'Prof. ' + prof.name : 'the PI') + ' and labelled by research area.';
  $('selected').innerHTML = (cur.selected_pins || []).map(function (x) {
    var p = S.byNo.get(x.no);
    return p ? S.citation(p, { areaLabel: x.area || true, cover: true }) : '';
  }).join('');

  /* ---- recent highlights (filled by the maintenance rule) ---- */
  $('recent').innerHTML = (cur.recent_highlights || []).map(function (n) {
    var p = S.byNo.get(n);
    return p ? S.citation(p, { areaLabel: true, cover: true }) : '';
  }).join('');
  if (cur.rules) $('rules').querySelector('p').textContent = cur.rules + (cur.updated_at ? ' (Updated ' + cur.updated_at + '.)' : '');
  else $('rules').hidden = true;

  /* ---- people preview ---- */
  var ct = C.contact || {};
  $('pi').innerHTML =
    (prof.photo ? '<img ' + S.srcAttr(asset(prof.photo)) + ' alt="' + esc(prof.name) + '" decoding="async" width="120" height="154">' : '') +
    '<div><p class="label">Principal investigator</p><h3>' + esc(prof.name) + '</h3>' +
    '<p class="pi-title">' + esc(prof.title || '') + '</p>' +
    (prof.roles || []).map(function (r) { return '<p class="pi-role">' + esc(r) + '</p>'; }).join('') +
    (prof.email ? '<p class="pi-mail"><a href="mailto:' + esc(prof.email) + '">' + esc(prof.email) + '</a></p>' : '') +
    S.linkIcons({ name: prof.name, links: { scholar: (prof.links || {}).google_scholar, cv: (prof.links || {}).cv } }) +
    '</div>';
  $('roster').innerHTML = (C.members || []).map(function (g) {
    var ppl = g.people || [];
    return '<div class="roster-group"><h3>' + esc(g.group) + ' <span class="count">' + ppl.length + '</span></h3><ul class="roster">' +
      ppl.map(function (m) {
        var nm = S.splitName(m.name);
        return '<li>' + (m.photo ? '<img ' + S.srcAttr(asset(m.photo)) + ' alt="' + esc(nm.name) + '" decoding="async" width="44" height="44">' : '<span class="ph" aria-hidden="true"></span>') +
          '<span class="who"><span class="nm">' + esc(nm.name) + '</span>' +
          '<span class="sub">' + (m.type ? '<span class="type t-' + esc(m.type) + '">' + esc(m.type === 'experimental' ? 'Experimental' : 'Computational') + '</span>' : '') +
          (m.research_area ? '<span class="ra">' + esc(m.research_area) + '</span>' : '') + '</span>' +
          S.linkIcons(m) + '</span></li>';
      }).join('') + '</ul></div>';
  }).join('');

  /* ---- news ---- */
  $('news-list').innerHTML = (W.news || []).map(function (n) {
    return '<li>' + (n.date ? '<time>' + esc(n.date) + '</time>' : '') + '<span>' + rich(n.text) + '</span></li>';
  }).join('');

  /* ---- join ---- */
  var mail = ct.email || prof.email;
  $('join-lede').innerHTML = 'The current recruitment notice is posted in Korean. Enquiries: ' +
    esc(prof.name ? 'Prof. ' + prof.name : '') + (mail ? ', <a href="mailto:' + esc(mail) + '">' + esc(mail) + '</a>' : '') + '.';
  $('opening-ko').textContent = W.opening_ko || '';
  $('about-ko').textContent = W.about_ko || '';

  /* ---- contact ---- */
  var rows = [['Address', ct.address], ['Email', ct.email ? '<a href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + '</a>' : null],
    ['Professor office', ct.professor_office], ['Laboratory', ct.laboratory], ['Student office', ct.student_office]];
  $('contact-list').innerHTML = rows.filter(function (r) { return r[1]; }).map(function (r) {
    return '<div><dt>' + r[0] + '</dt><dd>' + (r[0] === 'Email' ? r[1] : esc(r[1])) + '</dd></div>';
  }).join('');
  if (ct.group_photo) {
    $('group-photo').innerHTML = '<img ' + S.srcAttr(asset(ct.group_photo)) + ' alt="Group photo of ' + esc(lab.name || 'the lab') + '" decoding="async"><figcaption>Group photo</figcaption>';
  }

  S.lazy();
  S.settleHash();
})();
