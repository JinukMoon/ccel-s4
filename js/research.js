/* S4 Split screen — Research page: the five areas with figure, summary, keywords and key papers.
   Moved from the landing page in v5. Every fact from window.CCEL. */
(function () {
  'use strict';
  var S = window.S4, C = S.C, esc = S.esc, rich = S.rich, asset = S.asset;
  var $ = function (id) { return document.getElementById(id); };
  S.initHeader();
  S.initFooter();

  var lab = C.lab || {}, R = C.research || {};
  var published = (C.publications || []).filter(function (p) { return p.status === 'published'; });

  $('r-headline').textContent = R.headline || '';
  $('research-intro').innerHTML = (R.intro || []).map(function (t) { return '<p>' + rich(t) + '</p>'; }).join('');
  if (R.image) {
    $('research-loop').innerHTML = '<img src="' + esc(asset(R.image)) + '" alt="Research approach of ' + esc(lab.short || '') + ': artificial intelligence, computational materials design and experimental validation" decoding="async">';
  }
  $('area-index').innerHTML = (R.areas || []).map(function (a) {
    return '<li><a href="#area-' + esc(a.numeral) + '"><span class="num">' + esc(a.numeral) + '</span><span class="t">' + esc(a.title) + '</span></a></li>';
  }).join('');

  $('areas').innerHTML = (R.areas || []).map(function (a) {
    // the data repeats "I. Title" at the start of each summary; the heading already says it
    var sum = String(a.summary || '').replace(new RegExp('^\\s*' + a.numeral + '\\.\\s*' + a.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*'), '');
    var inArea = published.filter(function (p) { return p.area === a.numeral; });
    // the two newest published lab-led papers of this area (data order = newest first; no ranking of our own)
    var latest = inArea.filter(function (p) { return p.lab_led; }).slice(0, 2);
    return '<article class="area" id="area-' + esc(a.numeral) + '">' +
      '<div class="area-head"><img src="' + esc(asset(a.image)) + '" loading="lazy" alt="' + esc(a.title) + ' — research figure" decoding="async" width="200" height="200">' +
      '<div><p class="area-num">Area ' + esc(a.numeral) + '</p><h2>' + esc(a.title) + '</h2>' +
      '<p class="kw"><span class="sr">Keywords: </span>' + (a.keywords || []).map(esc).join('<span aria-hidden="true"> · </span>') + '</p></div></div>' +
      '<p class="area-sum">' + rich(sum) + '</p>' +
      (latest.length ? '<div class="area-papers"><p class="label">Latest lab-led papers</p>' + latest.map(function (p) { return S.citation(p, { headingTag: 'h3' }); }).join('') + '</div>' : '') +
      '<p class="area-more"><a href="publications.html?area=' + encodeURIComponent(a.numeral) + '&amp;status=published">All published papers in Area ' + esc(a.numeral) + '</a></p>' +
      '</article>';
  }).join('');

  S.settleHash();
})();
