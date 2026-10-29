/* =========================================================
   emanuelchacon.cr — Herramientas TI · librería común
   Todo se ejecuta localmente en el navegador.
   ========================================================= */
(function () {
  "use strict";
  const T = (window.T = {});

  T.$ = (s, r = document) => r.querySelector(s);
  T.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  T.esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  T.val = id => (document.getElementById(id) || {}).value || "";
  T.num = (n, d = 2) => Number(n).toLocaleString("es-CR", { maximumFractionDigits: d });

  T.store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* noop */ } }
  };

  /* ---------- Copiar / descargar ---------- */
  T.copyText = async text => {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (_) { /* noop */ }
      ta.remove(); return ok;
    }
  };
  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-copy]");
    if (!b) return;
    let text = b.dataset.copy;
    if (!text) {
      const host = b.closest(".code, .kv-row, [data-copy-scope]");
      const src = host && (host.querySelector("code") || host.querySelector("[data-copy-value]"));
      text = src ? src.innerText : "";
    } else if (text.charAt(0) === "#") {
      const el = document.querySelector(text); text = el ? (el.value != null && el.tagName !== "DIV" ? el.value : el.innerText) : "";
    }
    const ok = await T.copyText(text);
    const old = b.dataset.label || b.textContent;
    b.dataset.label = old;
    b.textContent = ok ? "Copiado ✓" : "No se pudo copiar";
    b.classList.add("done");
    clearTimeout(b._t);
    b._t = setTimeout(() => { b.textContent = old; b.classList.remove("done"); }, 1600);
  });
  T.download = (name, text, type = "text/plain") => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: type + ";charset=utf-8" }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  /* ---------- Bloques de salida ---------- */
  T.code = (text, label, lang) => `<div class="code">${label ? `<span class="code-label">${T.esc(label)}</span>` : ""}<button type="button" class="copy" data-copy>Copiar</button><pre${lang ? ` data-lang="${lang}"` : ""}><code>${T.esc(text)}</code></pre></div>`;
  T.kv = rows => `<div class="kv">${rows.filter(Boolean).map(r => {
    const [k, v, o = {}] = r;
    return `<div class="kv-row${o.hl ? " hl" : ""}"><span class="k">${T.esc(k)}</span><span class="v${o.mono === false ? "" : " mono"}" data-copy-value>${o.html ? v : T.esc(v)}</span>${o.copy === false ? "" : `<button type="button" class="copy mini" data-copy aria-label="Copiar ${T.esc(k)}">Copiar</button>`}</div>`;
  }).join("")}</div>`;
  T.table = (head, rows, o = {}) => `<div class="table-wrap"><table class="data${o.cls ? " " + o.cls : ""}"><thead><tr>${head.map(h => `<th>${T.esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr${r._cls ? ` class="${r._cls}"` : ""}>${(r.cells || r).map(c => `<td>${c && c.html != null ? c.html : T.esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  T.alert = (type, msg) => `<div class="alert ${type}" role="status">${msg}</div>`;
  T.card = (title, body, extra = "") => `<section class="out-card">${title ? `<div class="out-head"><h2>${T.esc(title)}</h2>${extra}</div>` : ""}${body}</section>`;
  T.show = (id, html) => { const el = document.getElementById(id); el.innerHTML = html; el.classList.add("ready"); return el; };

  /* ---------- Pestañas (segmented control) ---------- */
  T.tabs = (root, onChange) => {
    const btns = T.$$("[data-tab]", root);
    const set = (id, silent) => {
      btns.forEach(b => { const on = b.dataset.tab === id; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
      T.$$("[data-panel]", root.closest(".tool-page") || document).forEach(p => p.hidden = p.dataset.panel !== id);
      if (!silent && onChange) onChange(id);
    };
    btns.forEach(b => { b.type = "button"; b.setAttribute("role", "tab"); b.addEventListener("click", () => set(b.dataset.tab)); });
    set((btns.find(b => b.classList.contains("on")) || btns[0]).dataset.tab, true);
    return set;
  };

  /* Ejecuta fn al presionar Enter dentro de inputs del contenedor */
  T.onEnter = (root, fn) => root.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.matches("input")) { e.preventDefault(); fn(); } });

  /* ---------- IPv4 ---------- */
  const R = (a, b, c, d, p) => [(((a << 24) >>> 0) + (b << 16) + (c << 8) + d) >>> 0, p];
  const RANGES = [
    [R(0, 0, 0, 0, 8), "Red actual (no enrutable)"], [R(10, 0, 0, 0, 8), "Privada (RFC 1918)"],
    [R(100, 64, 0, 0, 10), "CGNAT compartida (RFC 6598)"], [R(127, 0, 0, 0, 8), "Loopback"],
    [R(169, 254, 0, 0, 16), "Link-local / APIPA"], [R(172, 16, 0, 0, 12), "Privada (RFC 1918)"],
    [R(192, 0, 0, 0, 24), "Asignación IETF"], [R(192, 0, 2, 0, 24), "Documentación (TEST-NET-1)"],
    [R(192, 168, 0, 0, 16), "Privada (RFC 1918)"], [R(198, 18, 0, 0, 15), "Benchmarking (RFC 2544)"],
    [R(198, 51, 100, 0, 24), "Documentación (TEST-NET-2)"], [R(203, 0, 113, 0, 24), "Documentación (TEST-NET-3)"],
    [R(224, 0, 0, 0, 4), "Multicast"], [R(255, 255, 255, 255, 32), "Broadcast limitado"], [R(240, 0, 0, 0, 4), "Reservada (Clase E)"]
  ];
  T.ip = {
    parse(s) {
      const m = String(s).trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
      if (!m) return null;
      const p = m.slice(1).map(Number);
      if (p.some(x => x > 255)) return null;
      return (((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3]) >>> 0;
    },
    str: n => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join("."),
    mask: p => (p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0),
    prefixOf(m) { const inv = (~m) >>> 0; if ((((inv + 1) & inv) >>> 0) !== 0) return null; let p = 0; for (let i = 31; i >= 0 && ((m >>> i) & 1); i--) p++; return p; },
    bin: n => [24, 16, 8, 0].map(s => ((n >>> s) & 255).toString(2).padStart(8, "0")).join("."),
    hex: n => "0x" + n.toString(16).toUpperCase().padStart(8, "0"),
    cls(n) { const a = n >>> 24; return a < 128 ? "A" : a < 192 ? "B" : a < 224 ? "C" : a < 240 ? "D (multicast)" : "E (reservada)"; },
    inNet: (n, net, p) => ((n & T.ip.mask(p)) >>> 0) === ((net & T.ip.mask(p)) >>> 0),
    type(n) { for (const [[net, p], name] of RANGES) if (T.ip.inNet(n, net, p)) return name; return "Pública (enrutable en Internet)"; },
    /* Acepta "10.0.0.1/24", "10.0.0.1 255.255.255.0" o IP + prefijo aparte */
    parseCidr(s, fallbackPrefix) {
      s = String(s).trim();
      let ip = s, p = fallbackPrefix;
      const slash = s.split("/");
      if (slash.length === 2) { ip = slash[0]; p = slash[1].trim(); }
      else { const sp = s.split(/\s+/); if (sp.length === 2) { ip = sp[0]; p = sp[1]; } }
      const n = T.ip.parse(ip); if (n == null) return { error: "La dirección IPv4 no es válida." };
      if (typeof p === "string" && p.includes(".")) {
        const m = T.ip.parse(p); if (m == null) return { error: "La máscara no es válida." };
        const pp = T.ip.prefixOf(m); if (pp == null) return { error: "La máscara no es contigua (ej. 255.255.0.255 no es válida)." };
        p = pp;
      }
      p = Number(p);
      if (!Number.isInteger(p) || p < 0 || p > 32) return { error: "El prefijo debe estar entre /0 y /32." };
      return { ip: n, prefix: p };
    },
    info(n, p) {
      const mask = T.ip.mask(p), net = (n & mask) >>> 0, bc = (net | (~mask >>> 0)) >>> 0, total = 2 ** (32 - p);
      const usable = p === 32 ? 1 : p === 31 ? 2 : total - 2;
      return { ip: n, prefix: p, mask, wildcard: (~mask) >>> 0, net, bc, total, usable,
        first: p >= 31 ? net : net + 1, last: p >= 31 ? bc : bc - 1 };
    },
    /* Rango arbitrario → lista mínima de CIDR */
    rangeToCidrs(a, b) {
      const out = [];
      while (a <= b) {
        let p = 32;
        while (p > 0) {
          const np = p - 1, m = T.ip.mask(np);
          if (((a & m) >>> 0) !== a) break;
          if (a + 2 ** (32 - np) - 1 > b) break;
          p = np;
        }
        out.push([a, p]);
        a = a + 2 ** (32 - p);
        if (a > 0xffffffff) break;
      }
      return out;
    }
  };

  /* ---------- Checklist guiado ---------- */
  const sub = (s, vars) => String(s == null ? "" : s).replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (m, k) => (vars && vars[k]) ? vars[k] : (vars && k in vars ? `<${k}>` : m));

  T.checklist = (el, o) => {
    const key = "ec-cl:" + o.key;
    const state = T.store.get(key, { done: {}, notes: "" });
    const steps = o.steps;
    const vars = o.vars || {};
    const html = `
      <div class="cl-head">
        <div>
          ${o.eyebrow ? `<span class="cl-eyebrow">${T.esc(o.eyebrow)}</span>` : ""}
          <h2>${T.esc(o.title)}</h2>
          ${o.summary ? `<p>${T.esc(sub(o.summary, vars))}</p>` : ""}
        </div>
        <div class="cl-actions">
          <button type="button" class="pill" data-act="copy">Copiar</button>
          <button type="button" class="pill" data-act="md">Descargar .md</button>
          <button type="button" class="pill" data-act="print">Imprimir</button>
          <button type="button" class="pill ghost" data-act="reset">Reiniciar</button>
        </div>
      </div>
      ${o.before ? `<div class="cl-before">${o.before}</div>` : ""}
      <div class="progress" aria-hidden="true"><span></span></div>
      <p class="progress-label" aria-live="polite"></p>
      <ol class="steps">
        ${steps.map((s, i) => `
        <li class="step${state.done[i] ? " done" : ""}" data-i="${i}">
          <label class="check"><input type="checkbox" ${state.done[i] ? "checked" : ""} aria-label="Marcar paso ${i + 1} como completado"><span></span></label>
          <div class="step-body">
            <h3><span class="n">${i + 1}</span>${T.esc(sub(s.t, vars))}${s.tag ? `<em class="tag ${s.tag}">${({ crit: "Crítico", warn: "Precaución", info: "Info", gui: "GUI" })[s.tag] || T.esc(s.tag)}</em>` : ""}</h3>
            ${s.d ? `<p class="why">${T.esc(sub(s.d, vars))}</p>` : ""}
            ${s.c ? T.code(sub(s.c, vars), s.where || o.where) : ""}
            ${s.e ? `<p class="expect"><b>Qué revisar:</b> ${T.esc(sub(s.e, vars))}</p>` : ""}
            ${s.w ? `<p class="warn"><b>Atención:</b> ${T.esc(sub(s.w, vars))}</p>` : ""}
          </div>
        </li>`).join("")}
      </ol>
      <div class="cl-notes">
        <label for="cl-notes-${T.esc(o.key)}">Notas del caso</label>
        <textarea id="cl-notes-${T.esc(o.key)}" placeholder="Hallazgos, número de ticket, cambios realizados…">${T.esc(state.notes || "")}</textarea>
      </div>`;
    el.innerHTML = html;

    const bar = T.$(".progress span", el), lab = T.$(".progress-label", el);
    const upd = () => {
      const n = Object.values(state.done).filter(Boolean).length;
      bar.style.width = (steps.length ? (n / steps.length) * 100 : 0) + "%";
      lab.textContent = n === steps.length ? `Checklist completado · ${n} de ${steps.length} pasos` : `${n} de ${steps.length} pasos completados`;
      el.classList.toggle("complete", n === steps.length);
    };
    upd();
    el.onchange = e => {
      if (e.target.matches(".check input")) {
        const li = e.target.closest(".step"), i = li.dataset.i;
        state.done[i] = e.target.checked; li.classList.toggle("done", e.target.checked);
        T.store.set(key, state); upd();
      }
    };
    el.oninput = e => { if (e.target.matches("textarea")) { state.notes = e.target.value; T.store.set(key, state); } };

    const asText = md => {
      const date = new Date().toLocaleString("es-CR");
      let t = md ? `# ${o.title}\n\n` : `${o.title}\n${"=".repeat(o.title.length)}\n\n`;
      if (o.eyebrow) t += `${o.eyebrow}\n`;
      t += `Generado: ${date} · emanuelchacon.cr/herramientas\n`;
      Object.entries(vars).forEach(([k, v]) => { if (v) t += `${k}: ${v}\n`; });
      t += "\n";
      steps.forEach((s, i) => {
        const mark = state.done[i] ? "[x]" : "[ ]";
        t += md ? `## ${mark} ${i + 1}. ${sub(s.t, vars)}\n\n` : `${mark} ${i + 1}. ${sub(s.t, vars)}\n`;
        if (s.d) t += `${sub(s.d, vars)}\n${md ? "\n" : ""}`;
        if (s.c) t += md ? "```\n" + sub(s.c, vars) + "\n```\n\n" : sub(s.c, vars).split("\n").map(l => "    " + l).join("\n") + "\n";
        if (s.e) t += `Qué revisar: ${sub(s.e, vars)}\n${md ? "\n" : ""}`;
        if (s.w) t += `Atención: ${sub(s.w, vars)}\n${md ? "\n" : ""}`;
        t += "\n";
      });
      if (state.notes) t += (md ? "## Notas\n\n" : "Notas:\n") + state.notes + "\n";
      return t;
    };
    T.$(".cl-actions", el).onclick = async e => {
      const b = e.target.closest("[data-act]"); if (!b) return;
      const a = b.dataset.act;
      if (a === "copy") { const ok = await T.copyText(asText(false)); const t = b.textContent; b.textContent = ok ? "Copiado ✓" : "Error"; setTimeout(() => b.textContent = t, 1500); }
      if (a === "md") T.download((o.file || o.key).replace(/[^a-z0-9-]+/gi, "-").toLowerCase() + ".md", asText(true), "text/markdown");
      if (a === "print") window.print();
      if (a === "reset") { state.done = {}; state.notes = ""; T.store.del(key); T.checklist(el, o); }
    };
  };

  /* ---------- Troubleshooter: componente → escenario → checklist ---------- */
  T.troubleshooter = (root, cfg) => {
    const data = cfg.data;
    root.innerHTML = `
      <div class="toolbox">
        <span class="field-label">1. Componente</span>
        <div class="chips" role="tablist" data-role="comp">${data.map(c => `<button type="button" role="tab" class="chip" data-id="${c.id}">${c.icon ? `<span class="chip-ic">${c.icon}</span>` : ""}${T.esc(c.name)}</button>`).join("")}</div>
        <span class="field-label">2. Problema o tarea</span>
        <div class="chips small" data-role="scen"></div>
        <p class="scen-desc" data-role="desc"></p>
        ${cfg.fields && cfg.fields.length ? `<span class="field-label">3. Datos del entorno <small>(opcional, se insertan en los comandos)</small></span>
        <div class="grid3 fields">${cfg.fields.map(f => `<div><label for="f-${f.id}">${T.esc(f.label)}</label><input id="f-${f.id}" data-var="${f.id}" placeholder="${T.esc(f.ph || "")}" autocomplete="off" spellcheck="false"></div>`).join("")}</div>` : ""}
      </div>
      <div class="checklist" data-role="cl"></div>`;
    const compBox = T.$('[data-role="comp"]', root), scenBox = T.$('[data-role="scen"]', root), desc = T.$('[data-role="desc"]', root), cl = T.$('[data-role="cl"]', root);
    const saved = T.store.get("ec-ts-vars:" + cfg.key, {});
    T.$$("[data-var]", root).forEach(i => { if (saved[i.dataset.var]) i.value = saved[i.dataset.var]; });
    let comp, scen;
    const vars = () => { const v = {}; T.$$("[data-var]", root).forEach(i => v[i.dataset.var] = i.value.trim()); return v; };
    const render = () => {
      const c = data.find(x => x.id === comp), s = c.scenarios.find(x => x.id === scen);
      T.$$(".chip", compBox).forEach(b => b.classList.toggle("on", b.dataset.id === comp));
      T.$$(".chip", scenBox).forEach(b => b.classList.toggle("on", b.dataset.id === scen));
      desc.textContent = s.desc || "";
      T.checklist(cl, { key: `${cfg.key}:${comp}:${scen}`, title: s.name, eyebrow: `${c.name} · ${s.steps.length} pasos`, summary: s.summary, steps: s.steps, vars: vars(), where: s.where || c.where, file: `${cfg.key}-${comp}-${scen}` });
      try { history.replaceState(null, "", `#${comp}/${scen}`); } catch (e) { /* noop */ }
    };
    const setComp = (id, sid) => {
      comp = id; const c = data.find(x => x.id === id);
      scenBox.innerHTML = c.scenarios.map(s => `<button type="button" class="chip" data-id="${s.id}">${T.esc(s.name)}</button>`).join("");
      scen = (sid && c.scenarios.some(s => s.id === sid)) ? sid : c.scenarios[0].id;
      render();
    };
    compBox.onclick = e => { const b = e.target.closest(".chip"); if (b) setComp(b.dataset.id); };
    scenBox.onclick = e => { const b = e.target.closest(".chip"); if (b) { scen = b.dataset.id; render(); } };
    let tmr;
    root.addEventListener("input", e => {
      if (!e.target.matches("[data-var]")) return;
      T.store.set("ec-ts-vars:" + cfg.key, vars());
      clearTimeout(tmr); tmr = setTimeout(render, 250);
    });
    const [h1, h2] = (location.hash || "").slice(1).split("/");
    setComp(data.some(c => c.id === h1) ? h1 : data[0].id, h2);
  };
})();
