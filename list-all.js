(function () {
  "use strict";

  var page = document.body.getAttribute("data-list-page");
  var root = document.getElementById("listRoot");
  var data = window.SITE_DATA;
  if (!root || !data || !page) return;

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  if (page === "news") {
    root.innerHTML = data.news
      .map(function (n) {
        return (
          '<article class="news-card list-row-card"><div class="news-meta"><span class="news-type">' +
          esc(n.category) +
          '</span><time datetime="' +
          esc(n.dateISO) +
          '">' +
          esc(n.dateRu) +
          '</time></div><h3><a href="detail.html?kind=news&id=' +
          encodeURIComponent(n.id) +
          '">' +
          esc(n.title) +
          "</a></h3><p>" +
          esc(n.excerpt) +
          '</p><a class="pub-link" href="detail.html?kind=news&id=' +
          encodeURIComponent(n.id) +
          '">Читать полностью →</a></article>'
        );
      })
      .join("");
    return;
  }

  if (page === "events") {
    root.innerHTML = data.events
      .map(function (e) {
        var sec = data.sections[e.sectionId];
        return (
          '<article class="research-card list-row-card" style="display:block"><p class="research-years">' +
          esc(e.years) +
          '</p><p class="detail-muted" style="margin:0 0 8px"><a href="' +
          esc(siteSectionHref(e.sectionId)) +
          '">' +
          esc(siteTrunc(sec.title, 42)) +
          '</a></p><h3><a href="detail.html?kind=event&id=' +
          encodeURIComponent(e.id) +
          '">' +
          esc(e.title) +
          "</a></h3><p>" +
          esc(e.excerpt) +
          '</p><a class="pub-link" href="detail.html?kind=event&id=' +
          encodeURIComponent(e.id) +
          '">Подробнее →</a></article>'
        );
      })
      .join("");
    return;
  }

  if (page === "publications") {
    root.innerHTML = data.publications
      .map(function (p) {
        var ev = window.siteFindEvent && p.eventId ? window.siteFindEvent(p.eventId) : null;
        var tie = "";
        if (ev) {
          tie =
            '<div class="pub-tie"><span class="pub-tie-label">Мероприятие:</span> <a href="detail.html?kind=event&id=' +
            encodeURIComponent(ev.id) +
            '">' +
            esc(window.siteTrunc(ev.title, 28)) +
            "</a></div>";
        }
        return (
          '<article class="pub-card list-row-card">' +
          '<span class="pub-type">' +
          esc(p.type) +
          "</span>" +
          tie +
          '<h3><a href="detail.html?kind=publication&id=' +
          encodeURIComponent(p.id) +
          '">' +
          esc(p.title) +
          "</a></h3><p>" +
          esc(p.excerpt) +
          '</p><a class="pub-link" href="detail.html?kind=publication&id=' +
          encodeURIComponent(p.id) +
          '">Подробнее →</a></article>'
        );
      })
      .join("");
    return;
  }

  if (page === "partners") {
    root.innerHTML = data.partners
      .map(function (p) {
        var logo =
          '<div class="partner-logo"><img src="' +
          esc(p.logo) +
          '" alt="' +
          esc(p.org) +
          '" decoding="async" loading="lazy" /></div>';
        return (
          '<article class="partner-news-card list-row-card"><div class="partner-card-top">' +
          logo +
          '<div><p class="partner-org">' +
          esc(p.org) +
          " · " +
          esc(p.country) +
          '</p><div class="news-meta"><time datetime="' +
          esc(p.dateISO) +
          '">' +
          esc(p.dateRu) +
          "</time></div></div></div><h3><a href=\"detail.html?kind=partner&id=" +
          encodeURIComponent(p.id) +
          '">' +
          esc(p.title) +
          "</a></h3><p>" +
          esc(p.excerpt) +
          '</p><a class="pub-link" href="detail.html?kind=partner&id=' +
          encodeURIComponent(p.id) +
          '">Подробнее →</a></article>'
        );
      })
      .join("");
  }
})();
