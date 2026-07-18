// CableTwin — Jumeau d'atelier (live factory twin view), v2.
// Additive view over the same engine state: no engine change, no new metric.
// All telemetry shown here is deterministic, seeded and labeled "simulée".
// The recompute overlay visualizes the REAL search claim (17,856 -> 10,440,
// canonical and re-provable via `npm run benchmark:exact`) and the REAL plan
// metrics coming from `generateRecoveryPlans`.

const SVG_NS = "http://www.w3.org/2000/svg";
const ISO_COS = 0.866;
const ISO_SIN = 0.5;
const VB = { x: -560, y: -150, w: 1520, h: 900 };

const LINE_LAYOUT = [
  { id: "L1", y: 0, sub: "Câble automobile", flowDur: "1.45s", spinDur: "4.6s" },
  { id: "L2", y: 190, sub: "Ligne flexible", flowDur: "1.65s", spinDur: "5.4s" },
  { id: "L3", y: 380, sub: "Câbles export", flowDur: "1.3s", spinDur: "4.1s" },
];

const MACHINE_DEPTH = 86;

const TELEMETRY_BASE = {
  L1: { speed: 46.0, temp: 188, tension: 235 },
  L2: { speed: 38.0, temp: 192, tension: 240 },
  L3: { speed: 52.0, temp: 185, tension: 228 },
};

// Canonical bounded search space (same figures as the deck, the data room and
// `npm run benchmark:exact`): 17,856 candidate schedules, 10,440 feasible.
const SEARCH_SPACE = { candidates: 17856, feasible: 10440 };

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function iso(x, y, z = 0) {
  return [(x - y) * ISO_COS, (x + y) * ISO_SIN - z];
}

function pointList(points) {
  return points.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
}

function el(name, attrs = {}, parent = null) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, String(value));
  }
  if (parent) parent.append(node);
  return node;
}

function html(tag, className, parent, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  if (parent) parent.append(node);
  return node;
}

function percentOf(x, y, z) {
  const [px, py] = iso(x, y, z);
  return {
    left: ((px - VB.x) / VB.w) * 100,
    top: ((py - VB.y) / VB.h) * 100,
  };
}

function isoBox(parent, x0, y0, w, d, h, cls = "") {
  const group = el("g", cls ? { class: cls } : {}, parent);
  const top = [iso(x0, y0, h), iso(x0 + w, y0, h), iso(x0 + w, y0 + d, h), iso(x0, y0 + d, h)];
  const front = [iso(x0, y0 + d, h), iso(x0 + w, y0 + d, h), iso(x0 + w, y0 + d, 0), iso(x0, y0 + d, 0)];
  const side = [iso(x0 + w, y0, h), iso(x0 + w, y0 + d, h), iso(x0 + w, y0 + d, 0), iso(x0 + w, y0, 0)];
  el("polygon", { points: pointList(side), class: "ft-face ft-face-side" }, group);
  el("polygon", { points: pointList(front), class: "ft-face ft-face-front" }, group);
  el("polygon", { points: pointList(top), class: "ft-face ft-face-top" }, group);
  return group;
}

function stationLabel(parent, xCenter, y0, h, text) {
  const [lx, ly] = iso(xCenter, y0 + MACHINE_DEPTH, h / 2);
  el("text", { x: lx.toFixed(1), y: (ly + 4).toFixed(1), class: "ft-line-sub", "text-anchor": "middle" }, parent).textContent = text;
}

function reel(parent, cx, cy, cz, radius) {
  const [px, py] = iso(cx, cy, cz);
  const matrix = `matrix(${(-ISO_COS * radius).toFixed(3)}, ${(ISO_SIN * radius).toFixed(3)}, 0, ${(-radius).toFixed(3)}, ${px.toFixed(1)}, ${py.toFixed(1)})`;
  const group = el("g", { transform: matrix }, parent);
  el("circle", {
    r: 1,
    style: "fill: rgba(56,193,177,0.07); stroke: rgba(56,193,177,0.8); stroke-width: 0.04",
  }, group);
  el("circle", {
    r: 0.62,
    style: "fill: none; stroke: rgba(56,193,177,0.55); stroke-width: 0.028",
  }, group);
  const spokes = el("g", { class: "ft-reel-spokes" }, group);
  for (const angle of [0, 60, 120]) {
    const rad = (angle * Math.PI) / 180;
    el("line", {
      x1: (-Math.cos(rad)).toFixed(3),
      y1: (-Math.sin(rad)).toFixed(3),
      x2: Math.cos(rad).toFixed(3),
      y2: Math.sin(rad).toFixed(3),
      style: "stroke: rgba(56,193,177,0.65); stroke-width: 0.045",
    }, spokes);
  }
  el("circle", { r: 0.13, style: "fill: rgba(56,193,177,0.9); stroke: none" }, group);
  return group;
}

// A small wireframe operator silhouette standing at (x, y) on the floor.
function worker(parent, x, y, cls) {
  const group = el("g", { class: `ft-worker ${cls ?? ""}`.trim() }, parent);
  const [hx, hy] = iso(x, y, 40);
  el("circle", { cx: hx.toFixed(1), cy: hy.toFixed(1), r: 5.4, class: "ft-worker-part" }, group);
  const body = [iso(x - 7, y, 32), iso(x + 7, y, 32), iso(x + 4.6, y, 8), iso(x - 4.6, y, 8)];
  el("polygon", { points: pointList(body), class: "ft-worker-part" }, group);
  const [l1x, l1y] = iso(x - 3.4, y, 8);
  const [l1bx, l1by] = iso(x - 3.4, y, 0);
  el("line", { x1: l1x.toFixed(1), y1: l1y.toFixed(1), x2: l1bx.toFixed(1), y2: l1by.toFixed(1), class: "ft-worker-part" }, group);
  const [l2x, l2y] = iso(x + 3.4, y, 8);
  const [l2bx, l2by] = iso(x + 3.4, y, 0);
  el("line", { x1: l2x.toFixed(1), y1: l2y.toFixed(1), x2: l2bx.toFixed(1), y2: l2by.toFixed(1), class: "ft-worker-part" }, group);
  const [fx, fy] = iso(x, y, 58);
  const flag = el("text", { x: fx.toFixed(1), y: fy.toFixed(1), class: "ft-worker-flag", "text-anchor": "middle" }, group);
  flag.textContent = "!";
  return group;
}

function cablePath(lineY) {
  const yc = lineY + MACHINE_DEPTH / 2;
  const anchors = [
    [78, 60], [190, 44], [450, 44], [505, 30], [715, 30], [845, 56],
  ];
  let path = "";
  for (let i = 0; i < anchors.length; i += 1) {
    const [x, z] = anchors[i];
    const [px, py] = iso(x, yc, z);
    if (i === 0) {
      path = `M ${px.toFixed(1)} ${py.toFixed(1)}`;
    } else {
      const [prevX, prevZ] = anchors[i - 1];
      const midX = (prevX + x) / 2;
      const midZ = Math.min(prevZ, z) - 9;
      const [cxp, cyp] = iso(midX, yc, midZ);
      path += ` Q ${cxp.toFixed(1)} ${cyp.toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)}`;
    }
  }
  return path;
}

function buildLine(parent, layout) {
  const group = el("g", {
    class: "ft-line",
    "data-line-id": layout.id,
    "data-line-state": "running",
    style: `--flow-dur:${layout.flowDur}; --spin-dur:${layout.spinDur}`,
  }, parent);
  const y = layout.y;
  const yc = y + MACHINE_DEPTH / 2;

  isoBox(group, 20, y + 14, 110, MACHINE_DEPTH - 28, 26);
  reel(group, 78, yc, 60, 40);
  stationLabel(group, 75, y, 42, "DÉROULEUR");

  isoBox(group, 190, y, 260, MACHINE_DEPTH, 74);
  isoBox(group, 355, y + 16, 60, MACHINE_DEPTH - 42, 104);
  for (const bandX of [240, 300, 360]) {
    const [x1, y1] = iso(bandX, y + MACHINE_DEPTH, 18);
    const [x2, y2] = iso(bandX, y + MACHINE_DEPTH, 58);
    el("line", { x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1), class: "ft-face", "stroke-width": 0.9 }, group);
  }
  stationLabel(group, 320, y, 74, "EXTRUDEUSE");

  isoBox(group, 505, y + 6, 210, MACHINE_DEPTH - 12, 34);
  const [w1x, w1y] = iso(516, yc, 34);
  const [w2x, w2y] = iso(704, yc, 34);
  el("line", { x1: w1x.toFixed(1), y1: w1y.toFixed(1), x2: w2x.toFixed(1), y2: w2y.toFixed(1), stroke: "rgba(124,212,200,0.7)", "stroke-width": 1.6, "stroke-dasharray": "10 7" }, group);
  stationLabel(group, 610, y, 34, "REFROIDISSEMENT");

  isoBox(group, 775, y + 12, 140, MACHINE_DEPTH - 24, 30);
  reel(group, 845, yc, 58, 50);
  stationLabel(group, 845, y, 46, "ENROULEUR");

  // Operators: one at the extruder outlet, one before the take-up, and two
  // reinforcement silhouettes shown only when this line receives moved orders.
  worker(group, 472, y + MACHINE_DEPTH + 12, "ft-worker-a");
  worker(group, 748, y + MACHINE_DEPTH + 12, "ft-worker-b");
  worker(group, 560, y + MACHINE_DEPTH + 20, "ft-worker-helper");
  worker(group, 604, y + MACHINE_DEPTH + 20, "ft-worker-helper");

  const d = cablePath(y);
  el("path", { d, class: "ft-cable-idle" }, group);
  el("path", { d, class: "ft-cable" }, group);

  const [mx1, my1] = iso(955, yc, 0);
  const [mx2, my2] = iso(955, yc, 96);
  el("line", { x1: mx1.toFixed(1), y1: my1.toFixed(1), x2: mx2.toFixed(1), y2: my2.toFixed(1), class: "ft-face", "stroke-width": 1.4 }, group);
  el("circle", { cx: mx2.toFixed(1), cy: my2.toFixed(1), r: 10, class: "ft-beacon-halo" }, group);
  el("circle", { cx: mx2.toFixed(1), cy: my2.toFixed(1), r: 5.2, class: "ft-beacon-core", stroke: "none" }, group);

  const [lx, ly] = iso(-16, yc, 0);
  const label = el("text", { x: lx.toFixed(1), y: ly.toFixed(1), class: "ft-line-label", "text-anchor": "end" }, group);
  label.textContent = layout.id.replace("L", "LIGNE ");
  const sub = el("text", { x: lx.toFixed(1), y: (ly + 16).toFixed(1), class: "ft-line-sub", "text-anchor": "end" }, group);
  sub.textContent = layout.sub;

  return group;
}

function buildScene(svg, scenario) {
  const grid = el("g", {}, svg);
  for (let gx = -40; gx <= 1040; gx += 108) {
    const [x1, y1] = iso(gx, -90);
    const [x2, y2] = iso(gx, 560);
    el("line", { x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1), class: "ft-grid-line" }, grid);
  }
  for (let gy = -90; gy <= 560; gy += 108) {
    const [x1, y1] = iso(-40, gy);
    const [x2, y2] = iso(1040, gy);
    el("line", { x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1), class: "ft-grid-line" }, grid);
  }

  const zoneLine = LINE_LAYOUT.find((line) => line.id === scenario.incident.lineId);
  const zy = zoneLine ? zoneLine.y : 190;
  const zone = [
    iso(150, zy - 20), iso(985, zy - 20), iso(985, zy + MACHINE_DEPTH + 24), iso(150, zy + MACHINE_DEPTH + 24),
  ];
  el("polygon", { points: pointList(zone), class: "ft-zone" }, svg);

  const lines = new Map();
  for (const layout of LINE_LAYOUT) {
    lines.set(layout.id, buildLine(svg, layout));
  }

  const [zlx, zly] = iso(735, zy + MACHINE_DEPTH + 18, 0);
  const zoneLabel = el("text", { x: zlx.toFixed(1), y: zly.toFixed(1), class: "ft-zone-label", "text-anchor": "start" }, svg);
  zoneLabel.dataset.zoneLabel = "true";

  const arcs = el("g", { class: "ft-arcs" }, svg);
  return { lines, arcs, zoneLabel };
}

export function initFactoryView(ctx) {
  const root = document.querySelector("#factory-twin");
  const tabs = document.querySelectorAll("[data-view-tab]");
  if (!root || !tabs.length) return () => {};

  const { scenario, incidentImpact } = ctx;
  const orderById = new Map(scenario.orders.map((order) => [order.id, order]));
  const lineYById = new Map(LINE_LAYOUT.map((line) => [line.id, line.y]));

  /* ---------- header ---------- */

  const head = html("div", "ft-head", root);
  const title = html("div", "ft-title", head);
  html("h2", "", title, "Jumeau d'atelier — CableTwin Live");
  html("small", "", title, "Télémétrie simulée · données 100 % synthétiques");
  const clockBox = html("div", "ft-clock", head);
  const clockValue = html("strong", "", clockBox, "10:00:00");
  html("span", "", clockBox, "Temps usine simulé");
  const plantPill = html("span", "ft-plant-pill", head, "Usine en marche · 3 lignes");
  plantPill.setAttribute("role", "status");

  const kpiBox = html("div", "ft-kpis", root);
  const kpiDefs = [
    ["on-time", "Commandes à l'heure"],
    ["at-risk", "Commandes menacées"],
    ["delay", "Retard cumulé"],
    ["moves", "Réaffectations"],
    ["cost", "Surcoût vs plan"],
  ];
  const kpiValues = new Map();
  for (const [key, label] of kpiDefs) {
    const tile = html("article", "ft-kpi", kpiBox);
    tile.dataset.kpi = key;
    html("span", "", tile, label);
    kpiValues.set(key, html("strong", "", tile, "—"));
  }

  /* ---------- stage + scene ---------- */

  const stage = html("div", "ft-stage", root);
  const frame = html("div", "ft-scene-box", stage);
  frame.style.position = "absolute";
  const svg = el("svg", { viewBox: `${VB.x} ${VB.y} ${VB.w} ${VB.h}`, preserveAspectRatio: "xMidYMid meet", "aria-hidden": "true" }, frame);
  const scene = buildScene(svg, scenario);
  const overlay = html("div", "ft-overlay", frame);
  const stamp = html("div", "ft-stamp", stage, "Plan validé — audit 10:07");
  stamp.setAttribute("aria-hidden", "true");

  function fitFrame() {
    const box = stage.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const scale = Math.min(box.width / VB.w, box.height / VB.h);
    const width = VB.w * scale;
    const height = VB.h * scale;
    frame.style.left = `${(box.width - width) / 2}px`;
    frame.style.top = `${(box.height - height) / 2}px`;
    frame.style.width = `${width}px`;
    frame.style.height = `${height}px`;
  }
  fitFrame();
  new ResizeObserver(fitFrame).observe(stage);

  /* ---------- telemetry chips ---------- */

  const chipAnchors = {
    speed: [152, 98],
    temp: [400, 176],
    tension: [860, 152],
  };
  const chipLabels = { speed: "Vitesse ligne", temp: "Temp. extrudeuse", tension: "Tension enroulage" };
  const chips = new Map();
  for (const layout of LINE_LAYOUT) {
    for (const [kind, [ax, az]] of Object.entries(chipAnchors)) {
      const pos = percentOf(ax, layout.y + MACHINE_DEPTH / 2, az);
      const chip = html("div", "ft-chip", overlay);
      chip.style.left = `${pos.left.toFixed(2)}%`;
      chip.style.top = `${pos.top.toFixed(2)}%`;
      html("small", "", chip, chipLabels[kind]);
      const value = html("strong", "", chip, "—");
      chips.set(`${layout.id}:${kind}`, { chip, value });
    }
  }

  // Crew-reinforcement badges, one per line, shown when the line receives
  // moved orders in the previewed/approved plan.
  const crewBadges = new Map();
  for (const layout of LINE_LAYOUT) {
    const pos = percentOf(655, layout.y - 12, 72);
    const badge = html("div", "ft-crew-badge", overlay, "équipe mobilisée · +2 opérateurs");
    badge.style.left = `${pos.left.toFixed(2)}%`;
    badge.style.top = `${pos.top.toFixed(2)}%`;
    crewBadges.set(layout.id, badge);
  }

  /* ---------- recompute overlay (the "war room" sequence) ---------- */

  const calc = html("div", "ft-calc", stage);
  const calcWindow = html("div", "ft-calc-window", calc);
  const calcHead = html("div", "ft-calc-head", calcWindow);
  html("span", "ft-calc-dot", calcHead);
  html("strong", "", calcHead, "CABLETWIN · MOTEUR DE REPLANIFICATION");
  html("span", "ft-calc-live", calcHead, "EN CALCUL");
  const calcLog = html("div", "ft-calc-log", calcWindow);
  const calcCounters = html("div", "ft-calc-counters", calcWindow);
  const counterA = html("div", "ft-calc-counter", calcCounters);
  const counterAValue = html("strong", "", counterA, "0");
  html("span", "", counterA, "combinaisons explorées");
  const counterB = html("div", "ft-calc-counter", calcCounters);
  const counterBValue = html("strong", "", counterB, "0");
  html("span", "", counterB, "plannings faisables");
  html("p", "ft-calc-skip", calcWindow, "cliquer pour passer l'animation");

  let calcTimers = [];
  let calcRaf = 0;
  let calcDone = null;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function calcLine(text, cls) {
    const line = html("p", cls ? `ft-calc-line ${cls}` : "ft-calc-line", calcLog, text);
    calcLog.scrollTop = calcLog.scrollHeight;
    while (calcLog.childElementCount > 24) calcLog.firstElementChild.remove();
    return line;
  }

  function animateCounter(node, target, durationMs, formatter) {
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      node.textContent = formatter(Math.round(target * eased));
      if (t < 1) calcRaf = requestAnimationFrame(step);
    };
    calcRaf = requestAnimationFrame(step);
  }

  function stopCalcSequence() {
    for (const timer of calcTimers) window.clearTimeout(timer);
    calcTimers = [];
    cancelAnimationFrame(calcRaf);
  }

  function finishCalc() {
    stopCalcSequence();
    const fmt = (value) => value.toLocaleString("fr-FR");
    counterAValue.textContent = fmt(SEARCH_SPACE.candidates);
    counterBValue.textContent = fmt(SEARCH_SPACE.feasible);
    root.dataset.calc = "done";
    root.dataset.panel = "open";
    if (calcDone) { calcDone(); calcDone = null; }
  }

  calc.addEventListener("click", () => {
    if (root.dataset.calc === "running") finishCalc();
  });

  function playCalcSequence(state) {
    const fmt = (value) => value.toLocaleString("fr-FR");
    calcLog.replaceChildren();
    counterAValue.textContent = "0";
    counterBValue.textContent = "0";
    root.dataset.calc = "running";

    const exposed = incidentImpact.affectedOrderIds.join(" · ");
    const planLine = (id, label) => {
      const plan = state.plans.find((candidate) => candidate.strategy.id === id);
      if (!plan) return `> politique ${label} — indisponible`;
      const m = plan.metrics;
      return `> optimum ${label} — retard ${ctx.formatDuration(m.totalDelayMinutes)} · ${m.onTimeOrders}/10 à l'heure · ${m.movements} réaffect. · ${ctx.formatDt(ctx.costDelta(m), true)}`;
    };

    const script = [
      [0, () => calcLine(`> analyse incident — ${scenario.incident.lineId} hors service 10:00 → 14:00`, "is-alert")],
      [260, () => calcLine(`> commandes exposées : ${exposed}`, "is-alert")],
      [520, () => calcLine("> contraintes actives : compatibilité lignes · occupation unique · fenêtre d'arrêt · échéances")],
      [780, () => {
        calcLine("> exploration exhaustive de l'espace borné…");
        animateCounter(counterAValue, SEARCH_SPACE.candidates, 1150, fmt);
      }],
      [1000, () => calcLine("· candidat rejeté — chevauchement de la fenêtre d'arrêt L2", "is-dim")],
      [1150, () => calcLine("· candidat rejeté — ligne incompatible avec la section du câble", "is-dim")],
      [1300, () => calcLine("· candidat rejeté — dépassement d'échéance client prioritaire", "is-dim")],
      [1480, () => calcLine("· candidat retenu — plan faisable, coût recalculé", "is-dim")],
      [1700, () => {
        calcLine(`> ${fmt(SEARCH_SPACE.feasible)} plannings faisables retenus`);
        animateCounter(counterBValue, SEARCH_SPACE.feasible, 800, fmt);
      }],
      [2050, () => calcLine("> évaluation multi-objectifs : retard · service · surcoût · stabilité")],
      [2300, () => calcLine(planLine("service", "SERVICE"), "is-optimum")],
      [2520, () => calcLine(planLine("cost", "COÛT MAÎTRISÉ"), "is-optimum")],
      [2740, () => calcLine(planLine("stability", "STABILITÉ"), "is-optimum")],
      [3050, () => calcLine("> RECALCUL TERMINÉ — 3 scénarios prêts · la décision reste humaine", "is-final")],
      [3350, () => finishCalc()],
    ];

    if (reducedMotion) {
      for (const [, run] of script.slice(0, -1)) run();
      finishCalc();
      return;
    }
    calcTimers = script.map(([delay, run]) => window.setTimeout(run, delay));
  }

  /* ---------- strategy inspector (tabs) ---------- */

  const inspector = html("aside", "ft-inspector", stage);
  inspector.setAttribute("aria-label", "Scénarios de reprise calculés");
  const tabsRow = html("div", "ft-inspector-tabs", inspector);
  const strategyDefs = [
    ["service", "Service"],
    ["cost", "Coût maîtrisé"],
    ["stability", "Stabilité"],
  ];
  const strategyTabs = new Map();
  for (const [id, label] of strategyDefs) {
    const tab = html("button", "ft-tab", tabsRow, label);
    tab.type = "button";
    tab.dataset.ftStrategy = id;
    tab.setAttribute("aria-pressed", "false");
    tab.addEventListener("click", () => ctx.actions.selectStrategy(id));
    strategyTabs.set(id, tab);
  }
  const inspectorBody = html("div", "ft-inspector-body", inspector);
  const approveBtn = html("button", "ft-btn ft-btn-approve ft-inspector-approve", inspector, "✓ Valider ce plan");
  approveBtn.type = "button";
  approveBtn.dataset.ftAction = "approve";
  approveBtn.addEventListener("click", () => ctx.actions.approveSelection());

  const STRATEGY_COPY = {
    service: {
      tagline: "Protéger les livraisons clients, quoi qu'il en coûte.",
      pros: (m, ref) => [
        `Retard réduit à ${ctx.formatDuration(m.totalDelayMinutes)} (contre ${ctx.formatDuration(ref.totalDelayMinutes)} sans réaction)`,
        `${m.onTimeOrders}/10 commandes livrées à l'heure`,
        "Les clients prioritaires passent en premier",
      ],
      cons: (m) => [
        `${m.movements} réaffectations à orchestrer dans l'atelier`,
        `Surcoût ${ctx.formatDt(ctx.costDelta(m), true)}`,
        `${m.overtimeMinutes} min d'heures supplémentaires`,
      ],
    },
    cost: {
      tagline: "Le meilleur compromis économique.",
      pros: (m) => [
        `Surcoût le plus bas des trois plans (${ctx.formatDt(ctx.costDelta(m), true)})`,
        `${m.onTimeOrders}/10 commandes à l'heure`,
        `Seulement ${m.movements} réaffectations`,
      ],
      cons: (m, ref, service) => [
        `Retard ${ctx.formatDuration(m.totalDelayMinutes)} (contre ${ctx.formatDuration(service.totalDelayMinutes)} en Service)`,
        `${m.overtimeMinutes} min d'heures supplémentaires`,
      ],
    },
    stability: {
      tagline: "Ne rien bouger : absorber l'incident.",
      pros: () => [
        "Zéro réaffectation — le planning des autres lignes reste intact",
        "Aucune perturbation d'équipe ni de réglage machine",
      ],
      cons: (m) => [
        `${ctx.formatDuration(m.totalDelayMinutes)} de retard subis`,
        `${m.onTimeOrders}/10 commandes à l'heure seulement`,
        `${m.overtimeMinutes} min d'heures supplémentaires`,
        `Surcoût ${ctx.formatDt(ctx.costDelta(m), true)}`,
      ],
    },
  };

  function renderInspector(state, phase) {
    const activeId = state.approvedPlan?.strategy.id ?? state.selectedPlan?.strategy.id ?? null;
    inspectorBody.replaceChildren();

    if (!activeId) {
      const empty = html("div", "ft-inspector-empty", inspectorBody);
      html("strong", "", empty, "3 scénarios calculés");
      html("p", "", empty, "Choisissez un onglet pour prévisualiser son plan sur le jumeau. Rien n'est envoyé à l'atelier.");
      approveBtn.disabled = true;
      approveBtn.textContent = "✓ Valider ce plan";
      return;
    }

    const plan = state.plans.find((candidate) => candidate.strategy.id === activeId);
    const reference = state.plans.find((candidate) => candidate.strategy.id === "stability");
    const service = state.plans.find((candidate) => candidate.strategy.id === "service");
    if (!plan || !reference || !service) return;
    const copy = STRATEGY_COPY[activeId];
    const m = plan.metrics;

    html("h3", "ft-inspector-title", inspectorBody, plan.strategy.name);
    html("p", "ft-inspector-tagline", inspectorBody, copy.tagline);

    const grid = html("div", "ft-inspector-metrics", inspectorBody);
    const metricDefs = [
      ["À l'heure", `${m.onTimeOrders}/10`],
      ["Retard", ctx.formatDuration(m.totalDelayMinutes)],
      ["Overtime", `${m.overtimeMinutes} min`],
      ["Réaffect.", String(m.movements)],
      ["Surcoût", ctx.formatDt(ctx.costDelta(m), true)],
      ["Exposées", String(m.lateOrders)],
    ];
    for (const [label, value] of metricDefs) {
      const cell = html("div", "", grid);
      html("span", "", cell, label);
      html("strong", "", cell, value);
    }

    const prosList = html("ul", "ft-inspector-list is-pros", inspectorBody);
    for (const item of copy.pros(m, reference.metrics, service.metrics)) html("li", "", prosList, item);
    const consList = html("ul", "ft-inspector-list is-cons", inspectorBody);
    for (const item of copy.cons(m, reference.metrics, service.metrics)) html("li", "", consList, item);

    if (phase === "resolved") {
      approveBtn.disabled = true;
      approveBtn.textContent = "Plan validé et tracé ✓ — audit 10:07";
    } else {
      approveBtn.disabled = phase !== "selected";
      approveBtn.textContent = "✓ Valider ce plan";
    }
  }

  /* ---------- control rail ---------- */

  const controls = html("div", "ft-controls", root);
  const simulateBtn = html("button", "ft-btn ft-btn-primary", controls, "⚡ Simuler l'arrêt de la ligne 2");
  simulateBtn.type = "button";
  simulateBtn.dataset.ftAction = "simulate";
  const resetBtn = html("button", "ft-btn", controls, "↺ Recommencer");
  resetBtn.type = "button";
  resetBtn.dataset.ftAction = "reset";
  html("p", "ft-controls-note", controls,
    "Chaque valeur vient du moteur de planification. Aucune commande n'est envoyée à une machine.");

  let pendingCalc = false;
  simulateBtn.addEventListener("click", () => {
    pendingCalc = true;
    ctx.actions.simulateIncident();
  });
  resetBtn.addEventListener("click", () => ctx.actions.resetDemo());

  /* ---------- view switching ---------- */

  function setView(view) {
    document.body.dataset.view = view;
    for (const tab of tabs) {
      const active = tab.dataset.viewTab === view;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    }
    if (view === "factory") {
      window.scrollTo({ top: 0, behavior: "auto" });
      history.replaceState(null, "", "#twin");
    } else {
      history.replaceState(null, "", window.location.pathname);
    }
  }
  for (const tab of tabs) {
    tab.addEventListener("click", () => setView(tab.dataset.viewTab));
  }
  if (window.location.hash === "#twin") setView("factory");
  else document.body.dataset.view = "decision";

  /* ---------- pucks + arcs + crew ---------- */

  const pucks = new Map();

  function slotPosition(lineId, index) {
    const lineY = lineYById.get(lineId) ?? 0;
    return percentOf(190 + index * 88, lineY + MACHINE_DEPTH + 96, 0);
  }

  function syncPucks(view, phase) {
    const seen = new Set();
    scene.arcs.replaceChildren();
    const helperLines = new Set();

    for (const layout of LINE_LAYOUT) {
      const entries = view.schedule
        .filter((entry) => entry.lineId === layout.id)
        .sort((a, b) => a.startMinute - b.startMinute);

      entries.forEach((entry, index) => {
        const order = orderById.get(entry.orderId);
        seen.add(entry.orderId);
        let puck = pucks.get(entry.orderId);
        if (!puck) {
          puck = html("div", "ft-puck", overlay, entry.orderId);
          pucks.set(entry.orderId, puck);
        }
        const pos = slotPosition(layout.id, index);
        puck.style.left = `${pos.left.toFixed(2)}%`;
        puck.style.top = `${pos.top.toFixed(2)}%`;
        puck.classList.toggle("is-priority", (order?.priority ?? 0) >= 4);
        puck.classList.toggle("is-risk", phase !== "baseline" && entry.endMinute > (order?.dueMinute ?? Infinity));
        const moved = Boolean(entry.movedFromLineId);
        puck.classList.toggle("is-moved", moved);
        let moveTag = puck.querySelector(".ft-puck-move");
        if (moved) {
          if (!moveTag) moveTag = html("span", "ft-puck-move", puck);
          moveTag.textContent = `${entry.movedFromLineId}→${entry.lineId}`;
        } else if (moveTag) {
          moveTag.remove();
        }

        if (moved && (phase === "selected" || phase === "resolved")) {
          helperLines.add(layout.id);
          const fromY = lineYById.get(entry.movedFromLineId) ?? 0;
          const [x1, y1] = iso(500, fromY + MACHINE_DEPTH + 96, 0);
          const [x2, y2] = iso(190 + index * 88, (lineYById.get(layout.id) ?? 0) + MACHINE_DEPTH + 96, 0);
          const [cxp, cyp] = iso((500 + 190 + index * 88) / 2, ((fromY + (lineYById.get(layout.id) ?? 0)) / 2) + MACHINE_DEPTH, 190);
          el("path", { d: `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cxp.toFixed(1)} ${cyp.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`, class: "ft-arc" }, scene.arcs);
        }
      });
    }

    for (const [orderId, puck] of pucks) {
      if (!seen.has(orderId)) {
        puck.remove();
        pucks.delete(orderId);
      }
    }

    for (const layout of LINE_LAYOUT) {
      const active = helperLines.has(layout.id);
      scene.lines.get(layout.id).setAttribute("data-line-helpers", String(active));
      crewBadges.get(layout.id).classList.toggle("is-visible", active);
    }
  }

  /* ---------- clock ---------- */

  const clock = { phase: "baseline", startedAt: null };

  function renderClock() {
    if (clock.phase === "baseline") {
      clockValue.textContent = "10:00:00";
      return;
    }
    if (clock.phase === "resolved") {
      clockValue.textContent = "10:07:00";
      return;
    }
    const elapsed = clock.startedAt === null ? 0 : Math.min(405, Math.floor((Date.now() - clock.startedAt) / 1000) + 12);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    clockValue.textContent = `10:0${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  /* ---------- telemetry ---------- */

  const lineStates = new Map(LINE_LAYOUT.map((line) => [line.id, "running"]));
  const stoppedTicks = new Map();
  const rngs = new Map(LINE_LAYOUT.map((line, index) => [line.id, mulberry32(0xc0ffee ^ (index + 1))]));
  const formatValue = (value, digits) => value.toLocaleString("fr-FR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

  function tickTelemetry() {
    for (const layout of LINE_LAYOUT) {
      const base = TELEMETRY_BASE[layout.id];
      const state = lineStates.get(layout.id);
      const rng = rngs.get(layout.id);
      const speedChip = chips.get(`${layout.id}:speed`);
      const tempChip = chips.get(`${layout.id}:temp`);
      const tensionChip = chips.get(`${layout.id}:tension`);
      const alarm = state === "stopped";

      if (alarm) {
        const ticks = (stoppedTicks.get(layout.id) ?? 0) + 1;
        stoppedTicks.set(layout.id, ticks);
        speedChip.value.textContent = "0,0 m/min";
        tempChip.value.textContent = `${formatValue(40 + (base.temp - 40) * Math.exp(-ticks / 45), 1)} °C`;
        tensionChip.value.textContent = "—";
      } else {
        stoppedTicks.delete(layout.id);
        const boost = state === "adapted" ? 1.04 : 1;
        speedChip.value.textContent = `${formatValue(base.speed * boost + (rng() - 0.5) * 1.8, 1)} m/min`;
        tempChip.value.textContent = `${formatValue(base.temp + (rng() - 0.5) * 2.6, 1)} °C`;
        tensionChip.value.textContent = `${formatValue(base.tension + (rng() - 0.5) * 14, 0)} N`;
      }
      for (const entry of [speedChip, tempChip, tensionChip]) {
        entry.chip.classList.toggle("is-alarm", alarm);
      }
    }
    renderClock();
  }

  const ticker = window.setInterval(tickTelemetry, 900);
  window.addEventListener("pagehide", () => window.clearInterval(ticker), { once: true });

  /* ---------- sync helpers ---------- */

  function syncControls(phase) {
    simulateBtn.disabled = phase !== "baseline";
    simulateBtn.textContent = phase === "baseline" ? "⚡ Simuler l'arrêt de la ligne 2" : "Incident simulé";
  }

  function syncTabs(phase, state) {
    const nudge = phase === "incident" && root.dataset.panel === "open";
    for (const [id, tab] of strategyTabs) {
      const pressed = state.selectedPlan?.strategy.id === id || state.approvedPlan?.strategy.id === id;
      tab.setAttribute("aria-pressed", String(Boolean(pressed)));
      tab.disabled = phase === "baseline" || (phase === "resolved" && state.approvedPlan?.strategy.id !== id);
      tab.classList.toggle("is-nudge", nudge && !pressed);
    }
  }

  function syncKpis(metrics, phase) {
    const extraCost = ctx.costDelta(metrics);
    kpiValues.get("on-time").textContent = `${metrics.onTimeOrders} / ${metrics.totalOrders}`;
    kpiValues.get("at-risk").textContent = phase === "baseline" ? "0" : String(metrics.lateOrders);
    kpiValues.get("delay").textContent = phase === "baseline" ? "0 h" : ctx.formatDuration(metrics.totalDelayMinutes);
    kpiValues.get("moves").textContent = String(metrics.movements ?? 0);
    kpiValues.get("cost").textContent = phase === "baseline" ? "0 DT" : ctx.formatDt(extraCost, true);

    kpiBox.querySelector('[data-kpi="on-time"]').dataset.tone =
      metrics.onTimeOrders === metrics.totalOrders ? "good" : "alert";
    kpiBox.querySelector('[data-kpi="at-risk"]').dataset.tone =
      phase !== "baseline" && metrics.lateOrders ? "alert" : "good";
    kpiBox.querySelector('[data-kpi="delay"]').dataset.tone =
      phase !== "baseline" && metrics.totalDelayMinutes ? "alert" : "good";
    kpiBox.querySelector('[data-kpi="cost"]').dataset.tone =
      phase !== "baseline" && extraCost > 0 ? "alert" : "good";
  }

  function syncPlant(phase, state) {
    if (phase === "baseline") {
      plantPill.textContent = "Usine en marche · 3 lignes";
    } else if (phase === "incident") {
      plantPill.textContent = `INCIDENT — Ligne 2 à l'arrêt · ${incidentImpact.affectedOrderIds.length} commandes exposées`;
    } else if (phase === "selected") {
      plantPill.textContent = `Prévisualisation « ${state.selectedPlan.strategy.name} » — rien n'est envoyé à l'atelier`;
    } else {
      plantPill.textContent = `Plan « ${state.approvedPlan.strategy.name} » validé — audit 10:07`;
    }
    scene.zoneLabel.textContent =
      phase === "resolved" ? "L2 — REPRISE PLANIFIÉE À 14:00" : "L2 À L'ARRÊT · 10:00 → 14:00";
  }

  /* ---------- main sync (called by app.js render) ---------- */

  return function sync(view, phase) {
    root.dataset.phase = phase;
    const state = ctx.getState();

    for (const layout of LINE_LAYOUT) {
      const stopped = layout.id === scenario.incident.lineId && phase !== "baseline";
      const adapted = !stopped && (phase === "selected" || phase === "resolved");
      const next = stopped ? "stopped" : adapted ? "adapted" : "running";
      lineStates.set(layout.id, next);
      scene.lines.get(layout.id).setAttribute("data-line-state", next);
    }

    if (phase === "baseline") {
      clock.phase = "baseline";
      clock.startedAt = null;
      root.dataset.calc = "idle";
      root.dataset.panel = "closed";
      stopCalcSequence();
      pendingCalc = false;
    } else if (phase === "resolved") {
      clock.phase = "resolved";
    } else {
      if (clock.phase === "baseline" || clock.startedAt === null) clock.startedAt = Date.now();
      clock.phase = "running";
    }

    if (phase === "incident" && pendingCalc) {
      pendingCalc = false;
      playCalcSequence(state);
    } else if (phase !== "baseline" && root.dataset.calc !== "running") {
      root.dataset.panel = "open";
    }

    syncPucks(view, phase);
    syncKpis(view.metrics, phase);
    syncPlant(phase, state);
    syncControls(phase);
    syncTabs(phase, state);
    renderInspector(state, phase);
    tickTelemetry();
  };
}
