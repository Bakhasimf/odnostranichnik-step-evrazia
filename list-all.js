(function () {
  "use strict";

  var page = document.body.getAttribute("data-list-page");
  var root = document.getElementById("listRoot");
  var data = window.SITE_DATA;
  if (!root || !data || !page) return;

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function siteSectionHref(sectionId) {
    return window.siteSectionHref
      ? window.siteSectionHref(sectionId)
      : "detail.html?kind=section&id=" + encodeURIComponent(sectionId);
  }

  function sortedNewsItems(list) {
    var feat = list.filter(function (n) {
      return n.featured;
    });
    var rest = list.filter(function (n) {
      return !n.featured;
    });
    rest.sort(function (a, b) {
      return String(b.dateISO || "").localeCompare(String(a.dateISO || ""));
    });
    feat.sort(function (a, b) {
      return String(b.dateISO || "").localeCompare(String(a.dateISO || ""));
    });
    return feat.concat(rest);
  }

  var ANNOUNCEMENT_CATEGORIES = {
    "Научный семинар": true,
    "Круглый стол": true,
    Конференция: true,
  };

  function newsSearchHaystack(n) {
    return [n.title, n.excerpt, n.category, n.dateRu, n.dateISO]
      .filter(function (x) {
        return x != null && String(x).length;
      })
      .join(" ")
      .toLowerCase();
  }

  var MONTHS_GEN_RU = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];

  function announcementsFromNews(list) {
    return (list || [])
      .filter(function (n) {
        return ANNOUNCEMENT_CATEGORIES[n.category];
      })
      .sort(function (a, b) {
        return String(a.dateISO || "").localeCompare(String(b.dateISO || ""));
      });
  }

  function announcementDayMonth(iso) {
    var parts = String(iso || "").split("-");
    if (parts.length < 3) {
      return { day: "—", month: "" };
    }
    var d = parseInt(parts[2], 10);
    var m = parseInt(parts[1], 10) - 1;
    return {
      day: String(isNaN(d) ? "—" : d),
      month: MONTHS_GEN_RU[m] || "",
    };
  }

  function renderAnnouncementRowForList(n) {
    var dm = announcementDayMonth(n.dateISO);
    var trunc =
      window.siteTrunc ||
      function (s, lim) {
        s = String(s || "");
        return s.length > lim ? s.slice(0, lim - 1) + "…" : s;
      };
    return (
      '<li class="news-filter-target" data-news-type="' +
      esc(n.category) +
      '" data-news-search="' +
      esc(newsSearchHaystack(n)) +
      '">' +
      '<a class="announcement-row-link" href="detail.html?kind=news&id=' +
      encodeURIComponent(n.id) +
      '">' +
      '<div class="announcement-date announcement-date--news">' +
      "<span>" +
      esc(dm.day) +
      "</span>" +
      "<small>" +
      esc(dm.month) +
      "</small>" +
      "</div>" +
      '<div class="announcement-body">' +
      '<p class="announcement-type">' +
      esc(n.category) +
      "</p>" +
      "<h3>" +
      esc(trunc(n.title, 88)) +
      "</h3><p>" +
      esc(trunc(n.excerpt, 130)) +
      "</p></div></a></li>"
    );
  }

  function renderNewsHero(n) {
    return (
      '<article class="news-card news-hero news-filter-target" data-news-type="' +
      esc(n.category) +
      '" data-news-search="' +
      esc(newsSearchHaystack(n)) +
      '">' +
      '<a class="news-hero-hit" href="detail.html?kind=news&id=' +
      encodeURIComponent(n.id) +
      '">' +
      '<div class="news-hero-bg" aria-hidden="true"></div>' +
      '<div class="news-hero-inner">' +
      '<div class="news-meta news-meta--hero">' +
      '<span class="news-type news-type--hero">' +
      esc(n.category) +
      "</span>" +
      '<time datetime="' +
      esc(n.dateISO) +
      '">' +
      esc(n.dateRu) +
      "</time></div>" +
      '<h3 class="news-hero-title">' +
      esc(n.title) +
      "</h3>" +
      '<p class="news-hero-lead">' +
      esc(n.excerpt) +
      "</p>" +
      "</div></a></article>"
    );
  }

  function renderNewsSecondary(n) {
    return (
      '<article class="news-card news-card--secondary news-filter-target" data-news-type="' +
      esc(n.category) +
      '" data-news-search="' +
      esc(newsSearchHaystack(n)) +
      '">' +
      '<a class="news-card-hit" href="detail.html?kind=news&id=' +
      encodeURIComponent(n.id) +
      '"></a>' +
      '<div class="news-meta news-meta--secondary">' +
      '<span class="news-type news-type--secondary">' +
      esc(n.category) +
      "</span>" +
      '<time datetime="' +
      esc(n.dateISO) +
      '">' +
      esc(n.dateRu) +
      "</time></div>" +
      "<h3>" +
      esc(n.title) +
      "</h3><p>" +
      esc(n.excerpt) +
      "</p></article>"
    );
  }

  function applyNewsListVisibility() {
    var activeBtn = document.querySelector(".page-list-news .news-filters .filter.is-active");
    var cat = activeBtn ? activeBtn.getAttribute("data-news-filter") : "all";
    var qEl = document.getElementById("newsListSearch");
    var q = ((qEl && qEl.value) || "").trim().toLowerCase();
    var items = document.querySelectorAll(".news-filter-target");
    var visibleMain = 0;

    items.forEach(function (item) {
      var inAside = item.closest("#announcementsList");
      var catOk = cat === "all" || item.getAttribute("data-news-type") === cat;
      var hay = item.getAttribute("data-news-search") || "";
      var searchOk = !q || hay.indexOf(q) !== -1;
      var show = catOk && searchOk;
      item.classList.toggle("is-hidden", !show);
      if (show && !inAside) visibleMain++;
    });

    var emptyMsg = document.getElementById("newsSearchNoResults");
    if (emptyMsg) emptyMsg.classList.toggle("is-hidden", visibleMain > 0 || !q.length);
  }

  function bindNewsFilters() {
    var newsFilterBtns = document.querySelectorAll(".news-filters .filter");
    var newsFilterItems = document.querySelectorAll(".news-filter-target");
    if (!newsFilterBtns.length || !newsFilterItems.length) return;
    newsFilterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var val = btn.getAttribute("data-news-filter");
        newsFilterBtns.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-selected", String(active));
        });
        applyNewsListVisibility();
      });
    });
    var searchEl = document.getElementById("newsListSearch");
    if (searchEl) {
      searchEl.addEventListener("input", applyNewsListVisibility);
      searchEl.addEventListener("search", applyNewsListVisibility);
    }
    applyNewsListVisibility();
  }

  function renderEventTags(tags) {
    tags = tags || [];
    return tags
      .map(function (t) {
        return "<li>" + esc(t) + "</li>";
      })
      .join("");
  }

  function eventCardSearchHaystack(e, sectionLabel) {
    sectionLabel = (sectionLabel || "").replace(/\u00a0/g, " ");
    return [e.title, e.excerpt, e.years, (e.tags || []).join(" "), sectionLabel]
      .filter(function (x) {
        return x != null && String(x).length;
      })
      .join(" ")
      .toLowerCase();
  }

  function renderEventCard(e, sectionLabel) {
    var hay = eventCardSearchHaystack(e, sectionLabel);
    return (
      '<a class="research-card research-card--grid event-filter-target" href="detail.html?kind=event&id=' +
      encodeURIComponent(e.id) +
      '" data-event-search="' +
      esc(hay) +
      '">' +
      '<span class="research-years">' +
      esc(e.years) +
      "</span>" +
      "<h3>" +
      esc(e.title) +
      "</h3>" +
      "<p>" +
      esc(e.excerpt) +
      "</p>" +
      '<ul class="tags">' +
      renderEventTags(e.tags) +
      "</ul></a>"
    );
  }

  var EVENT_SECTION_UI = [
    { panel: "t1", tabIdx: "I.", label: "Археология и\u00a0материальная культура" },
    {
      panel: "t2",
      tabIdx: "II.",
      label: "История государственности и\u00a0социально-политические процессы",
    },
    { panel: "t3", tabIdx: "III.", label: "Язык, литература и\u00a0духовная культура" },
    {
      panel: "t4",
      tabIdx: "IV.",
      label: "Энциклопедии и\u00a0научно-справочное наследие",
    },
    { panel: "t5", tabIdx: "V.", label: "Публикации и\u00a0цифровое наследие" },
  ];

  function renderEventsFullPage(events) {
    var showAllDefault = true;

    function renderAllSectionsTab(isActive) {
      return (
        '<button type="button" class="tab tab--all' +
        (isActive ? " is-active" : "") +
        '" role="tab" aria-selected="' +
        (isActive ? "true" : "false") +
        '" data-tab="all">' +
        '<span class="tab-label tab-label--all">Все разделы</span></button>'
      );
    }

    function renderTabButton(s, i) {
      var active = !showAllDefault && i === 0;
      return (
        '<button type="button" class="tab' +
        (active ? " is-active" : "") +
        '" role="tab" aria-selected="' +
        (active ? "true" : "false") +
        '" data-tab="' +
        esc(s.panel) +
        '">' +
        '<span class="tab-index">' +
        esc(s.tabIdx) +
        "</span>" +
        '<span class="tab-label">' +
        esc(s.label) +
        "</span></button>"
      );
    }
    var tabBtns =
      '<div class="tabs-track-row-all">' +
      renderAllSectionsTab(showAllDefault) +
      "</div>" +
      EVENT_SECTION_UI.slice(0, 3)
        .map(function (s, i) {
          return renderTabButton(s, i);
        })
        .join("") +
      '<div class="tabs-track-row2">' +
      EVENT_SECTION_UI.slice(3)
        .map(function (s, i) {
          return renderTabButton(s, i + 3);
        })
        .join("") +
      "</div>";

    var panels = EVENT_SECTION_UI.map(function (s, i) {
      var active = !showAllDefault && i === 0;
      var inSec = events.filter(function (ev) {
        return ev.sectionId === s.panel;
      });
      var grid =
        inSec
          .map(function (ev) {
            return renderEventCard(ev, s.label);
          })
          .join("") ||
        '<p class="detail-muted" style="margin:0">В этом разделе пока нет карточек мероприятий.</p>';
      return (
        '<div class="tab-panel' +
        (active ? " is-active" : "") +
        '" role="tabpanel" data-panel="' +
        esc(s.panel) +
        '">' +
        '<h2 class="events-all-section-heading">' +
        esc(s.label) +
        "</h2>" +
        '<div class="events-all-grid">' +
        grid +
        "</div></div>"
      );
    }).join("");

    return (
      '<div class="tabs reveal events-all-tabs" role="tablist" aria-label="Обзор мероприятий по разделам">' +
      '<div class="tabs-track">' +
      tabBtns +
      "</div></div>" +
      panels
    );
  }

  function bindDirectionsTabs(scope) {
    var tabs = scope.querySelectorAll(".events-all-tabs .tab");
    var panels = scope.querySelectorAll(".tab-panel");
    if (!tabs.length || !panels.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-tab");
        var showAll = target === "all";
        if (showAll) {
          scope.classList.add("events-view-all");
          panels.forEach(function (p) {
            p.classList.remove("is-active");
          });
        } else {
          scope.classList.remove("events-view-all");
          panels.forEach(function (p) {
            p.classList.toggle("is-active", p.getAttribute("data-panel") === target);
          });
        }
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle("is-active", on);
          t.setAttribute("aria-selected", String(on));
        });
        applyEventsListVisibility();
      });
    });
  }

  function applyEventsListVisibility() {
    var qEl = document.getElementById("eventsListSearch");
    var qTrim = ((qEl && qEl.value) || "").trim().toLowerCase();
    var cards = document.querySelectorAll(".page-list-events #listRoot .event-filter-target");
    cards.forEach(function (card) {
      var hay = card.getAttribute("data-event-search") || "";
      var ok = !qTrim || hay.indexOf(qTrim) !== -1;
      card.classList.toggle("is-hidden", !ok);
    });
    var rootEl = document.querySelector(".page-list-events #listRoot");
    var viewAll = rootEl && rootEl.classList.contains("events-view-all");
    var visibleCount = 0;
    if (viewAll) {
      rootEl.querySelectorAll(".event-filter-target").forEach(function (card) {
        if (!card.classList.contains("is-hidden")) visibleCount++;
      });
    } else if (rootEl) {
      var activePanel = rootEl.querySelector(".tab-panel.is-active");
      if (activePanel) {
        activePanel.querySelectorAll(".event-filter-target").forEach(function (card) {
          if (!card.classList.contains("is-hidden")) visibleCount++;
        });
      }
    }
    var eventsEmpty = document.getElementById("eventsSearchNoResults");
    if (eventsEmpty) {
      eventsEmpty.classList.toggle("is-hidden", !(qTrim.length && visibleCount === 0));
    }
  }

  function bindEventsSearch() {
    var searchEl = document.getElementById("eventsListSearch");
    if (!searchEl || !document.getElementById("listRoot") || !document.querySelector(".page-list-events"))
      return;
    searchEl.addEventListener("input", applyEventsListVisibility);
    searchEl.addEventListener("search", applyEventsListVisibility);
    applyEventsListVisibility();
  }

  function publicationDisplayType(p) {
    return p.typeLabel || p.type;
  }

  function publicationSearchHaystack(p, ev, sec) {
    return [
      p.title,
      p.excerpt,
      publicationDisplayType(p),
      p.type || "",
      ev ? ev.title : "",
      sec ? sec.title : "",
    ]
      .filter(function (x) {
        return x != null && String(x).length;
      })
      .join(" ")
      .toLowerCase();
  }

  function renderPublicationTextCard(p) {
    var ev = window.siteFindEvent && p.eventId ? window.siteFindEvent(p.eventId) : null;
    var evTie = "";
    var secTie = "";
    var sec = null;
    if (ev) {
      evTie =
        '<div class="pub-tie"><span class="pub-tie-label">Мероприятие:</span> <a href="detail.html?kind=event&id=' +
        encodeURIComponent(ev.id) +
        '">' +
        esc(window.siteTrunc(ev.title, 28)) +
        "</a></div>";
      sec = data.sections && ev.sectionId ? data.sections[ev.sectionId] : null;
      if (sec) {
        secTie =
          '<div class="pub-tie"><span class="pub-tie-label">Раздел:</span> <a href="' +
          esc(siteSectionHref(sec.id)) +
          '">' +
          esc(window.siteTrunc(sec.title, 42)) +
          "</a></div>";
      }
    }
    var hay = publicationSearchHaystack(p, ev, sec);
    return (
      '<article class="pub-card pub-filter-target" data-type="' +
      esc(p.type) +
      '" data-pub-search="' +
      esc(hay) +
      '">' +
      '<a class="pub-card-hit" href="detail.html?kind=publication&id=' +
      encodeURIComponent(p.id) +
      '"></a>' +
      '<span class="pub-type">' +
      esc(publicationDisplayType(p)) +
      "</span>" +
      evTie +
      secTie +
      "<h3>" +
      esc(p.title) +
      "</h3><p>" +
      esc(p.excerpt) +
      '</p><span class="pub-link">Подробнее →</span></article>'
    );
  }

  function applyPubListVisibility() {
    var activeBtn = document.querySelector(".page-list-pubs .pub-filters .filter.is-active");
    var val = activeBtn ? activeBtn.getAttribute("data-filter") : "all";
    var qEl = document.getElementById("pubListSearch");
    var q = ((qEl && qEl.value) || "").trim().toLowerCase();
    var pubCards = document.querySelectorAll("#pubAllGrid .pub-filter-target");
    var visibleCount = 0;
    pubCards.forEach(function (card) {
      var typeOk = val === "all" || card.getAttribute("data-type") === val;
      var hay = card.getAttribute("data-pub-search") || "";
      var searchOk = !q || hay.indexOf(q) !== -1;
      var show = typeOk && searchOk;
      card.classList.toggle("is-hidden", !show);
      if (show) visibleCount++;
    });
    var pubEmpty = document.getElementById("pubSearchNoResults");
    if (pubEmpty) pubEmpty.classList.toggle("is-hidden", visibleCount > 0 || !q.length);
  }

  function bindPubListFilters() {
    var filters = document.querySelectorAll(".page-list-pubs .pub-filters .filter");
    if (!filters.length) return;

    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filters.forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        applyPubListVisibility();
      });
    });
    var searchEl = document.getElementById("pubListSearch");
    if (searchEl) {
      searchEl.addEventListener("input", applyPubListVisibility);
      searchEl.addEventListener("search", applyPubListVisibility);
    }
    applyPubListVisibility();
  }

  /* ---------- Страницы ---------- */

  if (page === "news") {
    var annListEl = document.getElementById("announcementsList");
    if (annListEl) {
      var annItems = announcementsFromNews(data.news || []);
      annListEl.innerHTML =
        annItems.length > 0
          ? annItems.map(renderAnnouncementRowForList).join("")
          : '<li class="announcements-empty" role="presentation"><p class="detail-muted" style="margin:0;padding:10px 0 4px;font-size:14px">Нет запланированных анонсов в календаре.</p></li>';
    }

    var orderNews = sortedNewsItems(data.news.slice());
    var heroIdx = orderNews.findIndex(function (n) {
      return n.featured;
    });
    var parts = [];
    if (heroIdx !== -1) {
      parts.push(renderNewsHero(orderNews[heroIdx]));
      parts.push('<div class="news-secondary-grid news-all-grid">');
      orderNews.forEach(function (n, idx) {
        if (idx !== heroIdx) parts.push(renderNewsSecondary(n));
      });
      parts.push("</div>");
    } else {
      parts.push('<div class="news-secondary-grid news-all-grid">');
      orderNews.forEach(function (n) {
        parts.push(renderNewsSecondary(n));
      });
      parts.push("</div>");
    }
    root.innerHTML =
      '<div class="news-feed news-all-feed">' +
      parts.join("") +
      "</div>";
    bindNewsFilters();
    return;
  }

  if (page === "events") {
    root.innerHTML = renderEventsFullPage(data.events || []);
    root.classList.add("events-view-all");
    bindDirectionsTabs(root);
    bindEventsSearch();
    return;
  }

  if (page === "publications") {
    var pubs = data.publications || [];
    root.innerHTML =
      '<div class="pub-grid-static" id="pubAllGrid">' +
      pubs.map(renderPublicationTextCard).join("") +
      "</div>";
    bindPubListFilters();
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
