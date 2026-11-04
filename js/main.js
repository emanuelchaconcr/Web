/* emanuelchacon.cr — interactions */
(function () {
  const root = document.documentElement;
  root.classList.remove("no-js");

  // Navbar: border on scroll + mobile menu
  const navbar = document.querySelector(".navbar");
  const toggle = document.querySelector(".menu-toggle");
  const onScroll = () => navbar && navbar.classList.toggle("scrolled", window.scrollY > 24);
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

/* ===== Liquid Glass: interacciones ===== */
(function () {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Reflejo especular que sigue al puntero
  const GLASS = ".tile,.link-card,.btn,.chip,.toolbox";
  document.addEventListener("pointermove", e => {
    const el = e.target.closest && e.target.closest(GLASS);
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
    el.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
    if (fine && !reduce && el.matches("a.tile,.project,.tool-card")) {
      el.style.setProperty("--rx", (((e.clientY - r.top) / r.height - .5) * -5).toFixed(2) + "deg");
      el.style.setProperty("--ry", (((e.clientX - r.left) / r.width - .5) * 6).toFixed(2) + "deg");
    }
  }, { passive: true });
  document.addEventListener("pointerout", e => {
    const el = e.target.closest && e.target.closest("a.tile,.project,.tool-card");
    if (el && !el.contains(e.relatedTarget)) { el.style.removeProperty("--rx"); el.style.removeProperty("--ry"); }
  }, { passive: true });

  // Hero: la ventana se endereza al hacer scroll
  const hv = document.querySelector(".hero-visual .window");
  if (hv && !reduce) {
    let tick = false;
    const upd = () => {
      tick = false;
      const r = hv.getBoundingClientRect(), vh = innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * .9)));
      hv.style.setProperty("--hx", (8 - 8 * p).toFixed(2) + "deg");
      hv.style.setProperty("--hs", (.94 + .06 * p).toFixed(3));
    };
    addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  // Refracción tipo lente en los bordes de la barra (solo navegadores Chromium)
  const nav = document.querySelector(".navbar .nav-inner");
  const chromium = !!(navigator.userAgentData && navigator.userAgentData.brands && navigator.userAgentData.brands.some(b => /Chromium/.test(b.brand)));
  if (nav && chromium && !reduce && window.CSS && CSS.supports("backdrop-filter", "blur(1px)")) {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    svg.innerHTML = '<filter id="lg-lens" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feImage id="lg-map" result="map" preserveAspectRatio="none"/><feDisplacementMap in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>';
    document.body.appendChild(svg);
    const img = svg.querySelector("#lg-map"), disp = svg.querySelector("feDisplacementMap"), flt = svg.querySelector("filter");
    let lastW = 0, lastH = 0;
    const build = () => {
      const w = Math.round(nav.offsetWidth), h = Math.round(nav.offsetHeight);
      if (!w || !h || (w === lastW && h === lastH)) return;
      lastW = w; lastH = h;
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const ctx = c.getContext("2d"), d = ctx.createImageData(w, h), px = d.data;
      const R = h / 2, bezel = Math.min(18, R);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        // distancia al borde de una cápsula y normal hacia adentro
        const cx = Math.min(Math.max(x, R), w - R), cy = R;
        let dx = x - cx, dy = y - cy;
        const dist = Math.hypot(dx, dy), edge = R - dist;
        let ox = 0, oy = 0;
        if (edge < bezel && dist > 0) {
          const t = 1 - Math.max(0, edge) / bezel, k = t * t;
          ox = -dx / dist * k; oy = -dy / dist * k;
        }
        const i = (y * w + x) * 4;
        px[i] = 128 + ox * 127; px[i + 1] = 128 + oy * 127; px[i + 2] = 128; px[i + 3] = 255;
      }
      ctx.putImageData(d, 0, 0);
      img.setAttribute("href", c.toDataURL());
      img.setAttribute("width", w); img.setAttribute("height", h);
      flt.setAttribute("width", w); flt.setAttribute("height", h);
      disp.setAttribute("scale", "22");
    };
    build();
    root.classList.add("lg-refract");
    if ("ResizeObserver" in window) new ResizeObserver(() => requestAnimationFrame(build)).observe(nav);
  }
})();
