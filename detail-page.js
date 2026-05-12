(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var kind = params.get("kind") || "";
  var id = params.get("id") || "";
  var root = document.getElementById("detailRoot");
  var data = window.SITE_DATA;
  if (!root || !data) return;

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function missing() {
    root.innerHTML =
      '<p class="detail-muted">Материал не найден. <a href="index.html">На главную</a></p>';
  }

  function back(label) {
    label = label || "Назад";
    return '<p class="detail-back"><a href="index.html" class="btn btn-ghost btn-small">' + esc(label) + "</a></p>";
  }

  if (kind === "news") {
    var n = data.news.find(function (x) {
      return x.id === id;
    });
    if (!n) return missing();
    root.innerHTML =
      back("← Новости") +
      '<article class="detail-article"><p class="detail-meta">' +
      esc(n.category) +
      " · " +
      esc(n.dateRu) +
      '</p><h1 class="detail-title">' +
      esc(n.title) +
      "</h1><p class=\"detail-lead\">" +
      esc(n.excerpt) +
      "</p>" +
      (n.body || "") +
      "</article>";
    document.title = n.title + " — программа «Степная Евразия»";
    return;
  }

  if (kind === "event") {
    var e = data.events.find(function (x) {
      return x.id === id;
    });
    if (!e) return missing();
    var sec = data.sections[e.sectionId];
    var secTitle = sec ? sec.title : e.sectionId;
    var tags = (e.tags || [])
      .map(function (t) {
        return "<li>" + esc(t) + "</li>";
      })
      .join("");
    root.innerHTML =
      back("← Направления") +
      '<article class="detail-article"><p class="detail-meta">' +
      esc(e.years) +
      ' · <a href="' +
      esc(siteSectionHref(e.sectionId)) +
      '">' +
      esc(siteTrunc(secTitle, 40)) +
      "</a></p><h1 class=\"detail-title\">" +
      esc(e.title) +
      "</h1><p class=\"detail-lead\">" +
      esc(e.excerpt) +
      "</p>" +
      (e.body || "") +
      (tags ? '<ul class="tags" style="margin-top:28px">' + tags + "</ul>" : "") +
      "</article>";
    document.title = e.title + " — мероприятие программы";
    return;
  }

  if (kind === "section") {
    var s = data.sections[id];
    if (!s) return missing();
    var evs = data.events.filter(function (x) {
      return x.sectionId === id;
    });
    var list = evs
      .map(function (ev) {
        return (
          '<li><a href="' +
          esc(siteEventHref(ev.id)) +
          '"><strong>' +
          esc(ev.title) +
          "</strong><span>" +
          esc(ev.years) +
          "</span></a></li>"
        );
      })
      .join("");
    root.innerHTML =
      back("← Главная") +
      '<article class="detail-article"><h1 class="detail-title">' +
      esc(s.title) +
      '</h1><p class="detail-lead">' +
      esc(s.summary) +
      '</p><h2 class="detail-h2">Мероприятия раздела</h2><ul class="detail-list">' +
      list +
      "</ul></article>";
    document.title = s.title + " — раздел программы";
    return;
  }

  if (kind === "publication") {
    var p = data.publications.find(function (x) {
      return x.id === id;
    });
    if (!p) return missing();
    var ev2 = siteFindEvent(p.eventId);
    var sec2 = ev2 ? data.sections[ev2.sectionId] : null;
    var pubMeta =
      esc(p.type) +
      (ev2
        ? ' · мероприятие: <a href="' +
          esc(siteEventHref(ev2.id)) +
          '">' +
          esc(siteTrunc(ev2.title, 50)) +
          "</a>"
        : "");
    var vid =
      p.type === "Видео"
        ? '<div class="video-thumb detail-video-thumb" data-pattern="' +
          esc(p.pattern || "p1") +
          '"><span class="video-caption">' +
          esc(p.caption || "Видео") +
          '</span></div><p class="detail-muted"><a href="#" class="btn btn-small">Смотреть (демо)</a></p>'
        : "";
    root.innerHTML =
      back("← Публикации") +
      '<article class="detail-article"><p class="detail-meta">' +
      pubMeta +
      "</p><h1 class=\"detail-title\">" +
      esc(p.title) +
      "</h1>" +
      vid +
      "<p class=\"detail-lead\">" +
      esc(p.excerpt) +
      "</p>" +
      (p.body || "") +
      (sec2
        ? '<p class="detail-muted">Раздел: <a href="' +
          esc(siteSectionHref(sec2.id)) +
          '">' +
          esc(sec2.title) +
          "</a></p>"
        : "") +
      "</article>";
    document.title = p.title + " — публикация";
    return;
  }

  if (kind === "partner") {
    var pr = data.partners.find(function (x) {
      return x.id === id;
    });
    if (!pr) return missing();
    var logoBlock = pr.logo
      ? '<div class="partner-logo-lg"><img src="' +
        esc(pr.logo) +
        '" alt="' +
        esc(pr.org) +
        '" decoding="async" /></div>'
      : '<div class="partner-logo-lg">' + esc(pr.initials) + "</div>";
    root.innerHTML =
      back("← Партнёры") +
      '<article class="detail-article"><div class="detail-partner-head" style="display:flex;gap:20px;align-items:center;margin-bottom:20px">' +
      logoBlock +
      '<div><p class="detail-meta">' +
      esc(pr.org) +
      " · " +
      esc(pr.country) +
      "</p><p class=\"detail-meta\">" +
      esc(pr.dateRu) +
      '</p></div></div><h1 class="detail-title">' +
      esc(pr.title) +
      "</h1><p class=\"detail-lead\">" +
      esc(pr.excerpt) +
      "</p>" +
      (pr.body || "") +
      "</article>";
    document.title = pr.org + " — сотрудничество";
    return;
  }

  missing();
})();
