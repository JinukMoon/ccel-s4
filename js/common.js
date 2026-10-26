/* S4 Split screen — shared helpers for all three pages.
   Every fact comes from window.CCEL (_shared/content.js). Nothing here knows a paper, a person or a count. */
(function () {
  'use strict';
  var C = window.CCEL || {};
  var SHARED = '_shared/';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // data titles/authors carry only <sub>/<sup>; escape everything else
  function rich(html) { return esc(html).replace(/&lt;(\/?)(sub|sup)&gt;/gi, '<$1$2>'); }
  function plain(html) { return String(html || '').replace(/<[^>]+>/g, ''); }
  function asset(p) { return p ? SHARED + p : ''; }
  // legacy links may be insecure; the site is HTTPS-only, so upgrade the scheme
  function secure(u) {
    if (!u) return '';
    u = String(u).trim();
    if (/^\/\//.test(u)) return 'https:' + u;
    return u.replace(/^http:(?=\/\/)/i, 'https:');
  }
  function doiUrl(p) { return p.doi ? 'https://doi.org/' + p.doi : secure(p.url); }

  // images: native lazy loading by default; the landing page defers them until they are ~300px from the
  // viewport (Chrome's native threshold would fetch the research figures on first visit, next to the frames)
  var deferImages = false;
  function setDefer(v) { deferImages = !!v; }
  function srcAttr(u) { return deferImages ? 'data-src="' + esc(u) + '"' : 'src="' + esc(u) + '" loading="lazy"'; }
  function lazy(root) {
    var imgs = [].slice.call((root || document).querySelectorAll('img[data-src]'));
    var show = function (i) { i.src = i.getAttribute('data-src'); i.removeAttribute('data-src'); };
    if (!('IntersectionObserver' in window)) { imgs.forEach(show); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '300px 0px' });
    imgs.forEach(function (i) { io.observe(i); });
  }

  /* ---------- people ---------- */
  // "Miyeon Kim (Chief of Lab)" -> {name:"Miyeon Kim", note:"Chief of Lab"}
  function splitName(n) {
    var m = String(n || '').match(/^(.*?)\s*\((.*)\)\s*$/);
    return m ? { name: m[1], note: m[2] } : { name: String(n || ''), note: '' };
  }
  var ICON = {
    github: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>',
    linkedin: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M13.6 0H2.4A2.4 2.4 0 0 0 0 2.4v11.2A2.4 2.4 0 0 0 2.4 16h11.2a2.4 2.4 0 0 0 2.4-2.4V2.4A2.4 2.4 0 0 0 13.6 0zM4.9 13.3H2.6V6h2.3v7.3zM3.75 5a1.33 1.33 0 1 1 0-2.67 1.33 1.33 0 0 1 0 2.67zm9.6 8.3h-2.3V9.75c0-.85-.02-1.94-1.18-1.94-1.18 0-1.36.92-1.36 1.88v3.61H6.2V6h2.2v1h.03c.31-.58 1.06-1.2 2.18-1.2 2.33 0 2.76 1.53 2.76 3.53v3.97z"/></svg>',
    cv: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" d="M3.5 1.2h6l3 3v10.6h-9z M9.5 1.2v3h3"/><path stroke="currentColor" stroke-width="1.2" d="M5.5 7.5h5M5.5 9.8h5M5.5 12.1h3.2"/></svg>',
    scholar: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 1.5 0 6l8 4.5 6.4-3.6V11H16V6zM3.2 9.1v2.6C3.2 13.4 5.35 14.8 8 14.8s4.8-1.4 4.8-3.1V9.1L8 11.8z"/></svg>',
    homepage: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="6.6"/><path d="M1.4 8h13.2M8 1.4c2 1.9 2.9 4.1 2.9 6.6S10 12.7 8 14.6M8 1.4C6 3.3 5.1 5.5 5.1 8S6 12.7 8 14.6"/></g></svg>'
  };
  var LINK_LABEL = { github: 'GitHub', linkedin: 'LinkedIn', cv: 'CV', scholar: 'Google Scholar', homepage: 'Homepage' };
  // render only links that are set; a null link renders nothing
  function linkIcons(person, extra) {
    var links = Object.assign({}, person.links || {}, extra || {});
    var who = splitName(person.name).name;
    var out = ['github', 'linkedin', 'cv', 'scholar', 'homepage'].filter(function (k) { return links[k]; }).map(function (k) {
      var href = /^https?:|^\/\//i.test(links[k]) ? secure(links[k]) : asset(links[k]);
      var label = who + ' — ' + LINK_LABEL[k];
      return '<a class="ico" href="' + esc(href) + '" target="_blank" rel="noopener" aria-label="' + esc(label) + '" title="' + esc(label) + '">' + ICON[k] + '</a>';
    });
    return out.length ? '<span class="icons">' + out.join('') + '</span>' : '';
  }
  function allPeople(list) {
    var o = [];
    (list || []).forEach(function (g) { (g.people || []).forEach(function (p) { o.push(p); }); });
    return o;
  }

  /* ---------- publications ---------- */
  var areaByNumeral = {};
  ((C.research && C.research.areas) || []).forEach(function (a) { areaByNumeral[a.numeral] = a; });
  var byNo = new Map((C.publications || []).map(function (p) { return [p.no, p]; }));

  // covers attach to a paper only when DOI or URL match (never by index)
  function normUrl(u) {
    return String(u || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/[#?].*$/, '').replace(/\/+$/, '');
  }
  function doiIn(s) { var m = String(s || '').match(/10\.\d{4,9}\/[^\s?#"]+/i); return m ? m[0].toLowerCase().replace(/[.\/]+$/, '') : ''; }
  function lastSeg(u) { var n = normUrl(u); return n.slice(n.lastIndexOf('/') + 1); }
  var coverIndex = { doi: {}, url: {}, seg: {} };
  (C.cover_publications || []).forEach(function (c) {
    var d = (c.doi || '').toLowerCase() || doiIn(c.url);
    if (d) coverIndex.doi[d] = coverIndex.doi[d] || c;
    if (c.url) {
      coverIndex.url[normUrl(c.url)] = coverIndex.url[normUrl(c.url)] || c;
      var s = lastSeg(c.url); if (s.length >= 8) coverIndex.seg[s] = coverIndex.seg[s] || c;
    }
  });
  function coverFor(p, frontOnly) {
    var d = (p.doi || '').toLowerCase(), c = null;
    if (d) c = coverIndex.doi[d] || coverIndex.seg[d.slice(d.indexOf('/') + 1)] || null;
    if (!c && p.url) c = coverIndex.url[normUrl(p.url)] || null;
    if (!c && p.pii) c = coverIndex.seg[String(p.pii).toLowerCase()] || null;
    if (c && frontOnly && c.kind !== 'front') return null;
    return c;
  }
  function paperForCover(c) {
    var list = C.publications || [];
    for (var i = 0; i < list.length; i++) { if (coverFor(list[i]) === c) return list[i]; }
    return null;
  }

  // "Authors, Journal 11 (2026) 996–1008. (IF=70.1)" -> "Journal 11 (2026) 996–1008."
  function source(p) {
    var tail = String(p.citation_tail || ''), a = plain(p.authors);
    var rest = tail.indexOf(a) === 0 ? tail.slice(a.length) : (p.journal && tail.lastIndexOf(p.journal) >= 0 ? tail.slice(tail.lastIndexOf(p.journal)) : '');
    rest = rest.replace(/^\s*,\s*/, '').replace(/\s*\(IF\s*=\s*[\d.]+\)\s*\.?\s*$/i, '').trim();
    if (!rest) rest = (p.journal || '') + (p.year ? ' (' + p.year + ')' : '');
    var h = esc(rest);
    if (p.journal && rest.indexOf(p.journal) === 0) h = '<span class="jn">' + esc(p.journal) + '</span>' + esc(rest.slice(p.journal.length));
    return h;
  }
  function boldMembers(p) {
    var h = rich(p.authors);
    (p.ccel_authors || []).forEach(function (n) {
      var e = esc(n); if (!e) return;
      h = h.split(e).join('<b>' + e + '</b>');
    });
    return h;
  }
  function ifText(p) {
    if (p.impact_factor == null) return '';
    var prov = p.if_provisional === true;
    return '<span class="if' + (prov ? ' prov' : '') + '"' + (prov ? ' title="Provisional: the JCR value for the publication year is not yet released"' : '') + '>IF ' +
      esc(p.impact_factor) + (prov ? '<span class="prov-mark">provisional</span>' : '') + '</span>';
  }
  var STATUS_LABEL = { published: 'Published', 'in press': 'In press', accepted: 'Accepted', 'in revision': 'In revision', submitted: 'Submitted' };

  /* opts: {areaLabel: true|"I".., areaShort, cover (thumbnail), coverBadge, number, headingTag} */
  function citation(p, opts) {
    opts = opts || {};
    var link = doiUrl(p), cov = opts.cover ? coverFor(p, true) : null;
    var area = opts.areaLabel ? areaByNumeral[opts.areaLabel === true ? p.area : opts.areaLabel] : null;
    var tag = opts.headingTag || 'h3';
    var meta = [];
    if (area) meta.push('<span class="area-tag" title="' + esc(area.title) + '">Area ' + esc(area.numeral) + '</span>' +
      (opts.areaShort ? '' : '<span class="area-name">' + esc(area.title) + '</span>'));
    var t = rich(p.title);
    var html = '<article class="cite' + (cov ? ' has-cover' : '') + '">';
    if (cov) {
      html += '<a class="cover" href="' + esc(link || secure(cov.url)) + '" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">' +
        '<img ' + srcAttr(asset(cov.image)) + ' alt="" decoding="async" width="72" height="96"></a>';
    }
    html += '<div class="cite-body">';
    if (meta.length) html += '<p class="cite-meta">' + meta.join('') + '</p>';
    html += '<' + tag + ' class="cite-title">' + (opts.number ? '<span class="no">' + esc(p.no) + '</span>' : '') +
      (link ? '<a href="' + esc(link) + '" target="_blank" rel="noopener">' + t + '</a>' : t) + '</' + tag + '>';
    html += '<p class="cite-authors">' + boldMembers(p) + '</p>';
    var src = [source(p)];
    if (p.status && p.status !== 'published' && !/submitted|revision|press|accepted/i.test(plain(source(p)))) src.push('<span class="status">' + esc(STATUS_LABEL[p.status] || p.status) + '</span>');
    var ift = ifText(p); if (ift) src.push(ift);
    if (p.doi) src.push('<a class="doi" href="https://doi.org/' + esc(p.doi) + '" target="_blank" rel="noopener">doi:' + esc(p.doi) + '</a>');
    html += '<p class="cite-src">' + src.join('<span class="sep" aria-hidden="true"> · </span>') + '</p>';
    var badge = opts.coverBadge && coverFor(p) ? '<a class="badge" href="#covers" data-cover-tab>Journal cover</a>' : '';
    if (p.highlight || badge) html += '<p class="cite-note' + (p.highlight ? '' : ' no-dot') + '">' + (p.highlight ? esc(p.highlight) : '') + badge + '</p>';
    html += '</div></article>';
    return html;
  }

  /* ---------- header ---------- */
  function initHeader() {
    var lab = C.lab || {};
    document.querySelectorAll('img[data-logo]').forEach(function (img) {
      if (lab.logo) img.src = asset(lab.logo);
      if (lab.name) img.alt = (lab.short ? lab.short + ' — ' : '') + lab.name;
    });
    var head = document.querySelector('.site-head');
    var btn = document.querySelector('.menu-btn');
    var nav = document.getElementById('site-nav');
    if (btn && nav) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(open));
        head.classList.toggle('menu-open', open);
      });
      nav.addEventListener('click', function (e) {
        if (e.target.closest('a')) { btn.setAttribute('aria-expanded', 'false'); head.classList.remove('menu-open'); }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && head.classList.contains('menu-open')) { btn.setAttribute('aria-expanded', 'false'); head.classList.remove('menu-open'); btn.focus(); }
      });
    }
    var compact = function () { head && head.classList.toggle('is-compact', window.scrollY > 8); };
    compact();
    window.addEventListener('scroll', compact, { passive: true });
  }

  function initFooter() {
    var f = document.getElementById('foot-info');
    if (!f) return;
    var lab = C.lab || {}, ct = C.contact || {};
    f.innerHTML = '<p class="foot-name">' + esc(lab.name) + '</p>' +
      '<p>' + esc(ct.address || lab.affiliation) + '</p>' +
      (ct.email ? '<p><a href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + '</a></p>' : '') +
      ((C.curation && C.curation.updated_at) ? '<p class="foot-small">Publication curation last updated ' + esc(C.curation.updated_at) + '</p>' : '');
  }

  // anchors: content is rendered after load, so re-apply the hash once it exists (unless the visitor already scrolled)
  function settleHash() {
    if (!location.hash) return;
    var touched = false;
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, function () { touched = true; }, { once: true, passive: true }); });
    var go = function () {
      if (touched) return;
      var el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' });
    };
    go();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    window.addEventListener('load', go);
    setTimeout(go, 600);
  }

  window.S4 = {
    C: C, esc: esc, rich: rich, plain: plain, asset: asset, secure: secure, doiUrl: doiUrl,
    splitName: splitName, linkIcons: linkIcons, allPeople: allPeople, ICON: ICON,
    areaByNumeral: areaByNumeral, byNo: byNo, coverFor: coverFor, paperForCover: paperForCover,
    citation: citation, source: source, STATUS_LABEL: STATUS_LABEL, setDefer: setDefer, srcAttr: srcAttr, lazy: lazy,
    initHeader: initHeader, initFooter: initFooter, settleHash: settleHash
  };
})();
