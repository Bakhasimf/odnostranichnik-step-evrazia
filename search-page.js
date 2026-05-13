(function () {
  "use strict";

  var data = window.SITE_DATA;
  var form = document.getElementById("searchPageForm");
  var input = document.getElementById("searchInput");
  var out = document.getElementById("searchResults");
  if (!data || !form || !input || !out) return;

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function norm(s) {
    return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function run(q) {
    q = norm(q);
    if (q.length < 2) {
      out.innerHTML = "<p class=\"detail-muted\">Введите не менее двух символов.</p>";
      return;
    }
    var hits = [];

    data.news.forEach(function (n) {
      var blob = norm(n.title + " " + n.excerpt + " " + n.category);
      if (blob.indexOf(q) !== -1)
        hits.push({
          kind: "news",
          title: n.title,
          href: "detail.html?kind=news&id=" + encodeURIComponent(n.id),
          line: n.dateRu + " · " + n.category,
        });
    });
    data.events.forEach(function (e) {
      var blob = norm(e.title + " " + e.excerpt + " " + (e.tags || []).join(" "));
      if (blob.indexOf(q) !== -1)
        hits.push({
          kind: "event",
          title: e.title,
          href: "detail.html?kind=event&id=" + encodeURIComponent(e.id),
          line: e.years,
        });
    });
    data.publications.forEach(function (p) {
      var blob = norm(p.title + " " + p.excerpt + " " + p.type + " " + (p.typeLabel || ""));
      if (blob.indexOf(q) !== -1)
        hits.push({
          kind: "pub",
          title: p.title,
          href: "detail.html?kind=publication&id=" + encodeURIComponent(p.id),
          line: (p.typeLabel || p.type),
        });
    });
    data.partners.forEach(function (p) {
      var blob = norm(p.title + " " + p.excerpt + " " + p.org + " " + p.country);
      if (blob.indexOf(q) !== -1)
        hits.push({
          kind: "partner",
          title: p.title,
          href: "detail.html?kind=partner&id=" + encodeURIComponent(p.id),
          line: p.org,
        });
    });

    Object.keys(data.sections).forEach(function (sid) {
      var s = data.sections[sid];
      var blob = norm(s.title + " " + s.summary);
      if (blob.indexOf(q) !== -1)
        hits.push({
          kind: "section",
          title: s.title,
          href: "detail.html?kind=section&id=" + encodeURIComponent(sid),
          line: "Раздел программы",
        });
    });

    if (!hits.length) {
      out.innerHTML =
        "<p class=\"detail-muted search-results-empty\" role=\"status\">Информация не найдена.</p>";
      return;
    }
    out.innerHTML =
      "<p class=\"detail-muted\">Найдено: " +
      hits.length +
      "</p><ul class=\"search-hit-list\">" +
      hits
        .map(function (h) {
          return (
            "<li><a href=\"" +
            esc(h.href) +
            '"><strong>' +
            esc(h.title) +
            "</strong><span>" +
            esc(h.line) +
            "</span></a></li>"
          );
        })
        .join("") +
      "</ul>";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    run(input.value);
    var u = new URL(window.location.href);
    u.searchParams.set("q", input.value);
    history.replaceState(null, "", u);
  });

  var qp = new URLSearchParams(window.location.search).get("q");
  if (qp) {
    input.value = qp;
    run(qp);
  }
})();
