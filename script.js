(function () {
  "use strict";

  /* ---------- Sticky header shadow ---------- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const burger = document.getElementById("burger");
  const nav = document.querySelector(".nav");
  burger.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(isOpen));
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll("#navList a");
  const setActive = (id) => {
    navLinks.forEach((link) => {
      const match = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", match);
    });
  };
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -60px 0px", threshold: 0.08 }
  );
  reveals.forEach((el) => revealObs.observe(el));

  /* ---------- Tabs (Directions) ---------- */
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      panels.forEach((p) => {
        p.classList.toggle("is-active", p.dataset.panel === target);
      });
    });
  });

  /* ---------- Publications filter ---------- */
  const filters = document.querySelectorAll(".filter");
  const pubCards = document.querySelectorAll("#pubGrid .pub-card");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const val = btn.dataset.filter;
      pubCards.forEach((card) => {
        const match = val === "all" || card.dataset.type === val;
        card.classList.toggle("is-hidden", !match);
      });
    });
  });

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name || !email || !message) {
      status.textContent = "Пожалуйста, заполните все поля формы.";
      status.classList.add("is-error");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      status.textContent = "Проверьте правильность адреса электронной почты.";
      status.classList.add("is-error");
      return;
    }

    status.classList.remove("is-error");
    status.textContent = "Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами.";
    form.reset();
  });

  /* ---------- Year in footer (future-proof) ---------- */
  // (оставлено на случай замены статической подписи)
})();
