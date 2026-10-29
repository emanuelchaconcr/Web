/* emanuelchacon.cr — interactions */
(function () {
  const root = document.documentElement;
  root.classList.remove("no-js");

  // Navbar: border on scroll + mobile menu
  const navbar = document.querySelector(".navbar");
  const toggle = document.querySelector(".menu-toggle");
  const onScroll = () => navbar && navbar.classList.toggle("scrolled", window.scrollY > 4);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const closeMenu = () => {
    root.classList.remove("menu-open");
    toggle && toggle.setAttribute("aria-expanded", "false");
  };
  toggle && toggle.addEventListener("click", () => {
    const open = root.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".nav-links a").forEach(a => a.addEventListener("click", closeMenu));
  window.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });
  window.addEventListener("resize", () => { if (window.innerWidth > 834) closeMenu(); });

  // Reveal on scroll
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(el => io.observe(el));
  } else {
    items.forEach(el => el.classList.add("visible"));
  }

  // Count-up stats
  const counters = document.querySelectorAll("[data-count]");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (counters.length && "IntersectionObserver" in window && !reduce) {
    const co = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, end = +el.dataset.count, suffix = el.dataset.suffix || "";
        const t0 = performance.now(), dur = 1200;
        const step = t => {
          const p = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => co.observe(el));
  }

  // Gallery arrows
  document.querySelectorAll("[data-gallery]").forEach(nav => {
    const g = document.getElementById(nav.dataset.gallery);
    if (!g) return;
    nav.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      g.scrollBy({ left: (b.dataset.dir === "prev" ? -1 : 1) * 320, behavior: "smooth" });
    }));
  });

  // Year + clock
  document.querySelectorAll("#year,[data-year]").forEach(el => el.textContent = new Date().getFullYear());
  const clock = document.getElementById("clock");
  if (clock) {
    const tick = () => clock.textContent = new Date().toLocaleString("es-CR");
    tick(); setInterval(tick, 1000);
  }
})();
