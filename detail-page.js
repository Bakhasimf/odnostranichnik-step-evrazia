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

  function back(label, href) {
    label = label || "Назад";
    href = href || "index.html";
    return (
      '<p class="detail-back"><a href="' +
      esc(href) +
      '" class="btn btn-ghost btn-small">' +
      esc(label) +
      "</a></p>"
    );
  }

  /** Полная ширина по clientWidth (без 100vw), иначе при overflow-x:hidden стрелки обрезаются */
  function layoutNewsGalleryBleed(rootEl) {
    var el = rootEl.querySelector(".detail-gallery.detail-gallery--after-title");
    if (!el) return;
    var resizeT;
    function sync() {
      el.style.width = "";
      el.style.maxWidth = "";
      el.style.marginLeft = "";
      el.style.marginRight = "";
      void el.offsetHeight;
      var w = document.documentElement.clientWidth;
      var left = el.getBoundingClientRect().left;
      el.style.boxSizing = "border-box";
      el.style.width = w + "px";
      el.style.maxWidth = w + "px";
      el.style.marginLeft = -left + "px";
      el.style.marginRight = "0";
    }
    sync();
    window.addEventListener("resize", function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(sync, 100);
    });
  }

  function renderNewsGallery(gallery) {
    if (!gallery || !gallery.length) return "";
    var slides = gallery
      .map(function (g, i) {
        return (
          '<figure class="detail-news-carousel__slide" role="group" aria-roledescription="слайд" aria-label="' +
          esc(String(i + 1) + " из " + String(gallery.length)) +
          '">' +
          '<div class="detail-news-carousel__img-wrap">' +
          '<img src="' +
          esc(g.src) +
          '" alt="' +
          esc(g.alt || "") +
          '" loading="' +
          (i === 0 ? "eager" : "lazy") +
          '" decoding="async" />' +
          "</div>" +
          "</figure>"
        );
      })
      .join("");
    var dots = gallery
      .map(function (_, i) {
        return (
          '<button type="button" class="detail-news-carousel__dot' +
          (i === 0 ? " is-active" : "") +
          '" data-carousel-dot="' +
          i +
          '" role="tab" aria-selected="' +
          (i === 0 ? "true" : "false") +
          '" aria-label="Слайд ' +
          (i + 1) +
          '"></button>'
        );
      })
      .join("");
    var firstCap = gallery[0].caption || "";
    return (
      '<section class="detail-gallery detail-gallery--after-title" aria-label="Иллюстрации к материалу">' +
      '<div class="detail-news-carousel" data-detail-news-carousel tabindex="0">' +
      '<div class="detail-news-carousel__main-row">' +
      '<button type="button" class="detail-news-carousel__arrow detail-news-carousel__arrow--prev" aria-label="Предыдущее фото"></button>' +
      '<div class="detail-news-carousel__viewport">' +
      '<div class="detail-news-carousel__track">' +
      slides +
      "</div></div>" +
      '<button type="button" class="detail-news-carousel__arrow detail-news-carousel__arrow--next" aria-label="Следующее фото"></button>' +
      "</div>" +
      '<p class="detail-news-carousel__caption">' +
      esc(firstCap) +
      "</p>" +
      '<div class="detail-news-carousel__dots" role="tablist" aria-label="Номер слайда">' +
      dots +
      "</div>" +
      "</div></section>"
    );
  }

  function initNewsGallery(rootEl, gallery) {
    var shell = rootEl.querySelector("[data-detail-news-carousel]");
    if (!shell || !gallery.length) return;
    var viewport = shell.querySelector(".detail-news-carousel__viewport");
    var track = shell.querySelector(".detail-news-carousel__track");
    var caption = shell.querySelector(".detail-news-carousel__caption");
    var btnPrev = shell.querySelector(".detail-news-carousel__arrow--prev");
    var btnNext = shell.querySelector(".detail-news-carousel__arrow--next");
    var dots = shell.querySelectorAll("[data-carousel-dot]");
    var slidesEls = shell.querySelectorAll(".detail-news-carousel__slide");
    var idx = 0;
    var n = gallery.length;

    function syncViewportToSlide() {
      if (!viewport) return;
      var slide = slidesEls[idx];
      var wrap = slide && slide.querySelector(".detail-news-carousel__img-wrap");
      if (!wrap) return;
      var img = wrap.querySelector("img");
      var set = function () {
        viewport.style.height = wrap.offsetHeight + "px";
      };
      if (img && !img.complete) {
        img.addEventListener(
          "load",
          function onImg() {
            img.removeEventListener("load", onImg);
            set();
          },
          { once: true }
        );
        return;
      }
      window.requestAnimationFrame(set);
    }

    function go(to) {
      idx = (to + n * 100) % n;
      track.style.transform = "translate3d(-" + idx * (100 / n) + "%,0,0)";
      if (caption) {
        var c = gallery[idx].caption || "";
        caption.textContent = c;
        caption.hidden = !c;
      }
      dots.forEach(function (d, i) {
        var on = i === idx;
        d.classList.toggle("is-active", on);
        d.setAttribute("aria-selected", on ? "true" : "false");
      });
      syncViewportToSlide();
    }

    btnPrev.addEventListener("click", function () {
      go(idx - 1);
    });
    btnNext.addEventListener("click", function () {
      go(idx + 1);
    });
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        go(parseInt(dot.getAttribute("data-carousel-dot"), 10));
      });
    });
    shell.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(idx - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(idx + 1);
      }
    });

    track.style.width = n * 100 + "%";
    slidesEls.forEach(function (el) {
      el.style.width = 100 / n + "%";
    });
    var resizeT;
    window.addEventListener("resize", function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(syncViewportToSlide, 120);
    });
    go(0);
  }

  if (kind === "news") {
    var n = data.news.find(function (x) {
      return x.id === id;
    });
    if (!n) return missing();
    var galleryHtml = renderNewsGallery(n.gallery);
    root.innerHTML =
      back("← Новости", "news-all.html") +
      '<article class="detail-article"><p class="detail-meta">' +
      esc(n.category) +
      " · " +
      esc(n.dateRu) +
      '</p><h1 class="detail-title">' +
      esc(n.title) +
      "</h1>" +
      galleryHtml +
      "<p class=\"detail-lead\">" +
      esc(n.excerpt) +
      "</p>" +
      (n.body || "") +
      "</article>";
    if (n.gallery && n.gallery.length) {
      layoutNewsGalleryBleed(root);
      initNewsGallery(root, n.gallery);
    }
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
      back("← Мероприятия", "events-all.html") +
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
      esc(p.typeLabel || p.type) +
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
      back("← Публикации", "publications-all.html") +
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
      back("← Партнёры", "partners.html") +
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
