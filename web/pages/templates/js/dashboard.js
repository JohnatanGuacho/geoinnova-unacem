/* ======================================================
   GEOINNOVA Dashboard – dashboard.js
   Lee datos desde /web/others/*.json (según tu estructura)
   Dashboards activos:
   1) Top 3 estándares (semaforo SOLO cards)
   2) Tipos de incidente por tipo de empleado (donuts + tabla)
   3) Serie trimestral por tipo de negocio (línea + totales)
   Extras:
   - Tema dark/light
   - Mostrar módulo solo 2025 (data-visible-only-year="2025")
====================================================== */

/* =====================
   1) CONFIG GLOBAL
===================== */
const FILES = {
  top3: "../others/top3_estandares.json",
  empleado: "../others/accidentes_por_empleado_tipo_por_anio.json",
  trimestral: "../others/incidencias_trimestrales1.json",
  incidentes_tipo: "../others/incidentes_por_tipo.json"
};

const COLORS = {
  rojo: "#EF4444",
  amarillo: "#F59E0B",
  verde: "#22C55E",

  canteras: "#EF4444",
  cemento: "#22C55E",
  hormigon: "#3B82F6",

  incidentes: ["#EF4444", "#F59E0B", "#3B82F6", "#22C55E"]
};

const charts = Object.create(null);
const DATA = Object.create(null);

/* =====================
   2) HELPERS
===================== */
async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error cargando ${path} (HTTP ${res.status})`);
  return res.json();
}

function $(sel) {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Elemento no encontrado: ${sel}`);
  return el;
}

function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function destroyChart(key) {
  if (charts[key]) {
    charts[key].destroy();
    delete charts[key];
  }
}

function getCSSVar(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function safeNumber(v, decimals = 2) {
  const n = Number(v);
  if (Number.isFinite(n)) return n.toFixed(decimals);
  return String(v ?? "");
}

/* =====================
   3) INIT DATA
===================== */
async function initData() {
  const [top3, empleado, trimestral, incidentes_tipo] = await Promise.all([
    loadJSON(FILES.top3),
    loadJSON(FILES.empleado),
    loadJSON(FILES.trimestral),
    loadJSON(FILES.incidentes_tipo)
  ]);

  DATA.top3 = top3;
  DATA.empleado = empleado;
  DATA.trimestral = trimestral;
  DATA.incidentes_tipo = incidentes_tipo;
}

/* =====================
   4) DASHBOARD 1: Top3 (cards)
===================== */
function renderTop3(periodoTop3) {
  const semaforo = document.getElementById("semaforoTop3");
  if (!semaforo) return;

  clearNode(semaforo);

  const dataset = DATA.top3?.data?.[periodoTop3];
  if (!Array.isArray(dataset)) {
    semaforo.innerHTML = `
      <div class="empty-state">
        <div>
          <h4>Sin datos</h4>
          <p>No hay información para el periodo: <b>${periodoTop3}</b>.</p>
        </div>
      </div>`;
    document.getElementById("pillPeriodTop3").textContent = `Periodo: ${periodoTop3}`;
    return;
  }

  const semaforoColors = DATA.top3.metadata.semaforo_por_clasificacion;

  dataset.forEach((item) => {
    const card = document.createElement("div");
    card.className = "semaforo-card";

    const top = document.createElement("div");
    top.className = "semaforo-card__top";

    const title = document.createElement("h4");
    title.className = "semaforo-card__title";
    title.textContent = item.estandar;

    const cls = item.clasificacion_kpi;
    const hex = semaforoColors?.[cls]?.hex || "#94A3B8";

    const badgeClass =
      cls === "Mejorable" ? "badge--red" :
        cls === "Adecuado" ? "badge--yellow" :
          "badge--green";

    const badge = document.createElement("span");
    badge.className = `badge ${badgeClass}`;
    badge.innerHTML = `<span class="badge__dot" style="background:${hex}"></span>${cls}`;

    top.append(title, badge);

    const kpi = document.createElement("div");
    kpi.className = "kpi";
    kpi.innerHTML = `<span class="kpi__pill">KPI ${safeNumber(item.kpi_excelencia, 2)}</span>`;

    card.append(top, kpi);
    semaforo.appendChild(card);
  });

  const pill = document.getElementById("pillPeriodTop3");
  if (pill) pill.textContent = `Periodo: ${periodoTop3}`;
}

/* =====================
   5) DASHBOARD 2: Donuts + tabla
===================== */
function renderDonuts(periodoDonuts = "Todos") {

  destroyChart("empleado");
  destroyChart("contratista");

  const tipos = DATA.empleado?.metadata?.tipos_incidente || [];
  const rows = DATA.empleado?.data?.[periodoDonuts] || [];

  // Totales / UI
  const totalEmpleadoEl = document.getElementById("totalEmpleado");
  const totalContratistaEl = document.getElementById("totalContratista");

  // Table
  const tbody = document.querySelector("#tableIncidentesEmpleado tbody");
  if (tbody) clearNode(tbody);

  // Guard clauses
  if (!Array.isArray(rows) || rows.length === 0) {
    if (tbody) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="6" class="muted">Sin datos para donuts.</td>`;
      tbody.appendChild(tr);
    }
    return;
  }

  // Build charts + table rows
  rows.forEach((row) => {
    const isEmpleado = row.tipo_empleado === "Empleado";
    const canvasId = isEmpleado ? "chartEmpleado" : "chartContratista";
    const totalEl = isEmpleado ? totalEmpleadoEl : totalContratistaEl;

    const canvas = document.getElementById(canvasId);
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const key = isEmpleado ? "empleado" : "contratista";

      charts[key] = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: tipos,
          datasets: [{
            data: tipos.map(t => Number(row[t] ?? 0)),
            backgroundColor: COLORS.incidentes,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "68%",
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: getCSSVar("--chart-tooltip-bg") || "rgba(12,18,28,.92)",
              borderColor: getCSSVar("--chart-tooltip-border") || "rgba(255,255,255,.14)",
              borderWidth: 1,
              titleColor: getCSSVar("--text") || "#fff",
              bodyColor: getCSSVar("--text") || "#fff"
            }
          }
        }
      });
    }

    if (totalEl) totalEl.textContent = `Total: ${row.total}`;

  });
}

/* =====================
   6) DASHBOARD 3: Serie (línea)
===================== */
function renderSerie(periodoSerie) {
  destroyChart("serie");

  const canvas = document.getElementById("chartSerieNegocios");
  if (!canvas) return;

  const data = DATA.trimestral?.data?.[periodoSerie];
  if (!Array.isArray(data)) {
    // limpia totales si no existe
    ["totCanteras", "totCemento", "totHormigon", "totGeneralNegocios"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = "—";
    });
    const pill = document.getElementById("pillPeriodSerie");
    if (pill) pill.textContent = `Periodo: ${periodoSerie}`;
    return;
  }

  const labels = data.map(d => d.periodo);

  const ctx = canvas.getContext("2d");
  charts.serie = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Canteras",
          data: data.map(d => Number(d.Canteras ?? 0)),
          borderColor: COLORS.canteras,
          tension: 0.35,
          pointRadius: 2
        },
        {
          label: "Cemento",
          data: data.map(d => Number(d.Cemento ?? 0)),
          borderColor: COLORS.cemento,
          tension: 0.35,
          pointRadius: 2
        },
        {
          label: "Hormigón",
          data: data.map(d => Number(d.Hormigón ?? 0)),
          borderColor: COLORS.hormigon,
          tension: 0.35,
          pointRadius: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: getCSSVar("--text") || "#fff",
            boxWidth: 10,
            boxHeight: 10
          }
        },
        tooltip: {
          backgroundColor: getCSSVar("--chart-tooltip-bg") || "rgba(12,18,28,.92)",
          borderColor: getCSSVar("--chart-tooltip-border") || "rgba(255,255,255,.14)",
          borderWidth: 1,
          titleColor: getCSSVar("--text") || "#fff",
          bodyColor: getCSSVar("--text") || "#fff"
        }
      },
      scales: {
        x: {
          ticks: { color: getCSSVar("--chart-tick") || "rgba(255,255,255,.7)" },
          grid: { color: getCSSVar("--chart-grid") || "rgba(255,255,255,.08)" }
        },
        y: {
          beginAtZero: true,
          ticks: { color: getCSSVar("--chart-tick") || "rgba(255,255,255,.7)" },
          grid: { color: getCSSVar("--chart-grid") || "rgba(255,255,255,.08)" }
        }
      }
    }
  });

  const totals = DATA.trimestral?.totales?.[periodoSerie];
  if (totals) {
    document.getElementById("totCanteras").textContent = totals.Canteras ?? "—";
    document.getElementById("totCemento").textContent = totals.Cemento ?? "—";
    document.getElementById("totHormigon").textContent = totals["Hormigón"] ?? totals.Hormigón ?? "—";
    document.getElementById("totGeneralNegocios").textContent = totals.total_general ?? "—";
  }

  const pill = document.getElementById("pillPeriodSerie");
  if (pill) pill.textContent = `Periodo: ${periodoSerie}`;
}

/* =====================
   6.5) DASHBOARD 4: Incidentes trimestrales (línea 4 tipos)
===================== */
function renderIncidentesTrimestrales(periodo) {
  destroyChart("incidentes_tipo");

  const canvas = document.getElementById("chartIncidentesTrimestrales");
  if (!canvas) return;

  const data = DATA.incidentes_tipo?.data?.[periodo];
  if (!Array.isArray(data)) return;

  const tipos = DATA.incidentes_tipo?.metadata?.tipos_incidente || [
    "Accidente con perdida de Tiempo",
    "Atención médica sin pérdida de tiempo",
    "Evento serio sin lesión",
    "Primeros Auxilios"
  ];

  // labels: si es "Todos" usa 2023-T1..., si no usa T1..T4
  const labels = data.map(d => d.periodo);

  const ctx = canvas.getContext("2d");

  // colores: reutilizamos COLORS.incidentes
  const palette = COLORS.incidentes;

  const datasets = tipos.map((tipo, i) => ({
    label: tipo,
    data: data.map(d => Number(d[tipo] ?? 0)),
    borderColor: palette[i % palette.length],
    tension: 0.35,
    pointRadius: 2
  }));

  charts.incidentes_tipo = new Chart(ctx, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: getCSSVar("--text") || "#fff",
            boxWidth: 10,
            boxHeight: 10
          }
        },
        tooltip: {
          backgroundColor: getCSSVar("--chart-tooltip-bg") || "rgba(12,18,28,.92)",
          borderColor: getCSSVar("--chart-tooltip-border") || "rgba(255,255,255,.14)",
          borderWidth: 1,
          titleColor: getCSSVar("--text") || "#fff",
          bodyColor: getCSSVar("--text") || "#fff"
        }
      },
      scales: {
        x: {
          ticks: { color: getCSSVar("--chart-tick") || "rgba(255,255,255,.7)" },
          grid: { color: getCSSVar("--chart-grid") || "rgba(255,255,255,.08)" }
        },
        y: {
          beginAtZero: true,
          ticks: { color: getCSSVar("--chart-tick") || "rgba(255,255,255,.7)" },
          grid: { color: getCSSVar("--chart-grid") || "rgba(255,255,255,.08)" }
        }
      }
    }
  });

  const pill = document.getElementById("pillPeriodIncidentes");
  if (pill) pill.textContent = `Periodo: ${periodo}`;

  const t = DATA.incidentes_tipo?.totales?.[periodo];
  if (t) {
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val ?? "—";
    };

    set("totIncidentesPeriodo", t.total_general);
    set("totAccPerdida", t["Accidente con perdida de Tiempo"]);
    set("totAtencionMedica", t["Atención médica sin pérdida de tiempo"]);
    set("totEventoSerio", t["Evento serio sin lesión"]);
  }



}





/* =====================
   7) MODULOS CONDICIONALES
===================== */
function toggleYearModules(selectedYear) {
  // selectedYear: "Global" | "2023" | "2024" | "2025"
  const only2025 = document.getElementById("moduleCapacitaciones2025");
  if (only2025) {
    if (selectedYear === "2025") only2025.classList.add("is-visible");
    else only2025.classList.remove("is-visible");
  }
}

/* =====================
   8) TEMA (dark/light)
===================== */
function applyTheme(nextTheme) {
  // nextTheme: "dark" | "light"
  const isDark = nextTheme === "dark";
  document.body.classList.toggle("theme-dark", isDark);
  document.body.classList.toggle("theme-light", !isDark);
}

function setupThemeButton() {
  const btn = document.getElementById("btnTheme");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const currentlyDark = document.body.classList.contains("theme-dark");
    applyTheme(currentlyDark ? "light" : "dark");

    const selectYear = document.getElementById("selectYear");
    const selected = selectYear?.value || "Global";
    const periodoSerie = selected === "Global" ? "Todos" : selected;

    renderDonuts(periodoSerie);                // ✅ AQUÍ
    renderSerie(periodoSerie);
    renderIncidentesTrimestrales(periodoSerie);
  });


  //btn.addEventListener("click", () => {
  //  const currentlyDark = document.body.classList.contains("theme-dark");
  //  applyTheme(currentlyDark ? "light" : "dark");

    // Re-render charts para que tomen vars nuevas (ticks/grid/tooltip)
    // Donuts: no dependen tanto, pero igual.
    

    // Serie: sí depende de vars para ejes.
  //  const selectYear = document.getElementById("selectYear");
  //  const selected = selectYear?.value || "Global";
  //  const periodoSerie = selected === "Global" ? "Todos" : selected;
  //  renderDonuts();
  //  renderSerie(periodoSerie);
  // renderIncidentesTrimestrales(periodoSerie);
 // });
}

/* =====================
   9) FILTROS / EVENTOS
===================== */
function setupFilters() {
  const selectYear = document.getElementById("selectYear");
  if (!selectYear) return;

  const chipFiltro = document.getElementById("chipFiltro");
  const pillDonuts = document.getElementById("pillPeriodDonuts");

  function applyYear(selected) {
    // selected: "Global" | "2023" | "2024" | "2025"
    const periodoTop3 = selected; // Top3 usa Global/2023/2024/2025
    const periodoSerie = selected === "Global" ? "Todos" : selected; // Serie usa Todos/...

    renderTop3(periodoTop3);
    renderDonuts(periodoSerie);                // ✅ AQUÍ
    renderSerie(periodoSerie);
    renderIncidentesTrimestrales(periodoSerie)

    if (chipFiltro) chipFiltro.textContent = selected === "Global" ? "Todos" : selected;
    if (pillDonuts) pillDonuts.textContent = `Periodo: ${selected === "Global" ? "Todos" : selected}`;

    toggleYearModules(selected);
  }

  selectYear.addEventListener("change", (e) => applyYear(e.target.value));

  // Render inicial según el valor actual del select
  applyYear(selectYear.value || "Global");
}

/* =====================
   10) INIT
===================== */
(async function init() {
  try {
    // Tema inicial basado en la clase del body
    if (!document.body.classList.contains("theme-dark") && !document.body.classList.contains("theme-light")) {
      applyTheme("dark");
    }

    await initData();

    // render fijo (no depende del año)
    renderDonuts();

    // eventos + render según filtro
    setupThemeButton();
    setupFilters();
    setupModeloPredictivo();
  } catch (err) {
    console.error("Error inicializando dashboard:", err);
  }
})();


/* =========================
   MODELO PREDICTIVO (API + UI)
========================= */
const PREDICT_API_URL = "https://34sr4wtn-5050.use.devtunnels.ms/api/predict/latest";

async function fetchPrediction() {
  const res = await fetch(PREDICT_API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo obtener predicción (HTTP ${res.status})`);
  return res.json();
}

function fillList(elId, items) {
  const ul = document.getElementById(elId);
  if (!ul) return;

  ul.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    const li = document.createElement("li");
    li.className = "muted";
    li.textContent = "Sin datos";
    ul.appendChild(li);
    return;
  }

  items.forEach((it) => {
    const li = document.createElement("li");
    const label = String(it.label || "").replace(/^(tipo__|genero__|sitio__|cat__)/, "");
    const pct = (Number(it.p || 0) * 100).toFixed(1);
    li.textContent = `${({
      "": "",
      Masculino: "Contratista",
      Femenino: "Empleado"
    }[label] ?? label)} (${pct}%)`;
    ul.appendChild(li);
  });
}

function setRiskUI(color, nivel, score) {
  const dot = document.getElementById("predDot");
  const nivelEl = document.getElementById("predNivel");
  const scoreEl = document.getElementById("predScore");

  if (dot) {
    dot.classList.remove("dot--green", "dot--yellow", "dot--red");
    dot.classList.add(
      color === "green" ? "dot--green" :
        color === "red" ? "dot--red" :
          "dot--yellow"
    );
  }

  if (nivelEl) nivelEl.textContent = nivel ?? "—";
  if (scoreEl) scoreEl.textContent = Number(score).toFixed(3);
}

async function renderModeloPredictivo() {
  try {
    const data = await fetchPrediction();

    setRiskUI(data.color, data.nivel, data.riesgo);

    fillList("predQue", data.top3?.que);
    fillList("predQuien", data.top3?.quien);
    fillList("predDonde", data.top3?.donde);
    fillList("predComo", data.top3?.como);
  } catch (err) {
    console.error("Modelo predictivo:", err);

    // fallback UI si el API no está corriendo
    setRiskUI("yellow", "Sin conexión", 0);

    fillList("predQue", []);
    fillList("predQuien", []);
    fillList("predDonde", []);
    fillList("predComo", []);
  }
}

function setupModeloPredictivo() {
  const btn = document.getElementById("btnPredict");
  if (btn) btn.addEventListener("click", renderModeloPredictivo);

  // auto-load al iniciar
  renderModeloPredictivo();
}

/* ⚠️ Importante: llamar esto en init() */
