/* S4 Split screen — Contact page (v6), as on the legacy contact_us.html: group photo, lab name and the
   contact details from `contact`. No map, no form. */
(function () {
  'use strict';
  var S = window.S4, C = S.C, esc = S.esc, asset = S.asset;
  var $ = function (id) { return document.getElementById(id); };
  S.initHeader();
  S.initFooter();

  var ct = C.contact || {}, lab = C.lab || {};
  if (ct.group_photo) $('contact-photo').innerHTML = '<img src="' + esc(asset(ct.group_photo)) + '" alt="Group photo of the ' + esc(ct.lab_name || lab.name || 'lab') + '" decoding="async" width="6944" height="4496">';
  else $('contact-photo').hidden = true;
  $('h-lab').textContent = ct.lab_name || lab.name || '';
  // keep hyphenated tokens (phone numbers, Gwanak-ro) on one line
  var nb = function (s) { return esc(s).replace(/(\S+-\S+)/g, '<span class="nw">$1</span>'); };
  var rows = [['Address', nb(ct.address)], ['Email', ct.email ? '<a href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + '</a>' : ''],
    ['Professor office', nb(ct.professor_office)], ['Laboratory', nb(ct.laboratory)], ['Student office', nb(ct.student_office)]];
  $('contact-list').innerHTML = rows.filter(function (r) { return r[1]; }).map(function (r) {
    return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>';
  }).join('');
  S.settleHash();
})();
