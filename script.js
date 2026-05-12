(function () {
  "use strict";

  var header = document.getElementById("siteHeader");
  var heroEl = document.getElementById("hero");
  var scrollTopBtn = document.getElementById("scrollTopBtn");

  var onScroll = function () {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
    if (scrollTopBtn && heroEl) {
      var afterHero = heroEl.offsetTop + heroEl.offsetHeight;
      scrollTopBtn.classList.toggle("is-visible", window.scrollY > afterHero - 80);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var burger = document.getElementById("burger");
  var nav = document.querySelector(".nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(isOpen));
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll("#navList a");
  var setActive = function (id) {
    navLinks.forEach(function (link) {
      var match = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", match);
    });
  };
  var spy = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
  );
  sections.forEach(function (s) {
    spy.observe(s);
  });

  var reveals = document.querySelectorAll(".reveal");
  var revealObs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -60px 0px", threshold: 0.08 }
  );
  reveals.forEach(function (el) {
    revealObs.observe(el);
  });

  var tabs = document.querySelectorAll(".tab");
  var panels = document.querySelectorAll(".tab-panel");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = tab.dataset.tab;
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      panels.forEach(function (p) {
        p.classList.toggle("is-active", p.dataset.panel === target);
      });
    });
  });

  function initCarousels() {
    document.querySelectorAll("[data-carousel]").forEach(function (shell) {
      var viewport = shell.querySelector(".carousel-viewport");
      var prev = shell.querySelector("[data-carousel-prev]");
      var next = shell.querySelector("[data-carousel-next]");
      if (!viewport || !prev || !next) return;
      var step = function () {
        return Math.min(viewport.clientWidth * 0.92, 720);
      };
      prev.addEventListener("click", function () {
        viewport.scrollBy({ left: -step(), behavior: "smooth" });
      });
      next.addEventListener("click", function () {
        viewport.scrollBy({ left: step(), behavior: "smooth" });
      });
    });
  }
  initCarousels();

  var newsFilterBtns = document.querySelectorAll(".news-filters .filter");
  var newsFilterItems = document.querySelectorAll(".news-filter-target");
  newsFilterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var val = btn.getAttribute("data-news-filter");
      newsFilterBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });
      newsFilterItems.forEach(function (item) {
        var ok = val === "all" || item.getAttribute("data-news-type") === val;
        item.classList.toggle("is-hidden", !ok);
      });
    });
  });

  var filters = document.querySelectorAll(".pub-filters .filter");
  var pubTextBox = document.getElementById("pubSectionText");
  var pubVidBox = document.getElementById("pubSectionVideo");
  var pubCards = document.querySelectorAll("#pubGrid .pub-card");

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filters.forEach(function (b) {
        b.classList.remove("is-active");
      });
      btn.classList.add("is-active");
      var val = btn.getAttribute("data-filter");

      if (val === "all") {
        if (pubTextBox) pubTextBox.style.display = "";
        if (pubVidBox) pubVidBox.style.display = "";
        pubCards.forEach(function (card) {
          card.classList.remove("is-hidden");
        });
        return;
      }

      if (val === "Видео") {
        if (pubTextBox) pubTextBox.style.display = "none";
        if (pubVidBox) pubVidBox.style.display = "";
        return;
      }

      if (pubTextBox) pubTextBox.style.display = "";
      if (pubVidBox) pubVidBox.style.display = "none";
      pubCards.forEach(function (card) {
        var match = card.getAttribute("data-type") === val;
        card.classList.toggle("is-hidden", !match);
      });
    });
  });
})();
