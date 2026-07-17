import {
  SYNTHETIC_DATA_NOTICE,
  createFactoryScenario,
} from "../engine/factory-data.js";
import {
  analyzeIncident,
  approveRecoveryPlan,
  calculateMetrics,
  compareMetrics,
  formatClockMinute,
  generateRecoveryPlans,
} from "../engine/twin-engine.js";

const scenario = createFactoryScenario();
const initialMetrics = calculateMetrics(scenario, scenario.initialSchedule);
const incidentImpact = analyzeIncident(scenario);
const orderById = new Map(scenario.orders.map((order) => [order.id, order]));

const state = {
  phase: "baseline",
  plans: [],
  selectedPlan: null,
  approvedPlan: null,
};

const elements = {
  body: document.body,
  gantt: document.querySelector("#gantt"),
  incident: document.querySelector("#incident"),
  simulationStatus: document.querySelector("#simulation-status"),
  strategyCards: document.querySelector("#strategy-cards"),
  strategyLock: document.querySelector("[data-strategy-lock]"),
  approveButton: document.querySelector("#approve-button"),
  resetButton: document.querySelector("#reset-button"),
  simulateButtons: [
    document.querySelector("#simulate-button"),
    document.querySelector("[data-simulate-trigger]"),
  ].filter(Boolean),
  selectedStrategy: document.querySelector("[data-selected-strategy]"),
  livePill: document.querySelector(".live-pill"),
  promiseValue: document.querySelector(".promise-card strong"),
  promiseStatus: document.querySelector(".promise-status"),
  incidentLog: document.querySelector('[data-log-entry="incident"]'),
  decisionLog: document.querySelector('[data-log-entry="decision"]'),
};

const numberFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

function formatDt(value, signed = false) {
  const rounded = Math.round(value);
  const sign = signed ? (rounded > 0 ? "+ " : rounded < 0 ? "− " : "") : "";
  return `${sign}${numberFormatter.format(Math.abs(rounded))} DT`;
}

function formatDuration(minutes) {
  if (!minutes) return "0 h";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder} min`;
  return remainder ? `${hours} h ${remainder} min` : `${hours} h`;
}

function costDelta(metrics) {
  return metrics.estimatedCostDt - initialMetrics.estimatedCostDt;
}

function setButtonLabel(button, label, arrow = true) {
  button.replaceChildren(document.createTextNode(label));
  if (arrow) {
    const icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "→";
    button.append(icon);
  }
}

function setLivePill(label, mode) {
  elements.livePill.replaceChildren();
  const dot = document.createElement("span");
  dot.setAttribute("aria-hidden", "true");
  elements.livePill.append(dot, document.createTextNode(` ${label}`));
  elements.livePill.dataset.mode = mode;
}

function setKpi(id, value, change, tone = "neutral") {
  const card = document.querySelector(`[data-kpi="${id}"]`);
  if (!card) return;
  card.querySelector("[data-kpi-value]").textContent = value;
  const changeElement = card.querySelector("[data-kpi-change]");
  changeElement.textContent = change;
  changeElement.classList.remove("is-positive", "is-negative", "is-warning");
  if (tone !== "neutral") changeElement.classList.add(`is-${tone}`);
}

function updateKpis(metrics, phase) {
  const extraCost = costDelta(metrics);

  if (phase === "baseline") {
    setKpi(
      "on-time-orders",
      `${metrics.onTimeOrders} / ${metrics.totalOrders}`,
      "Objectif tenu",
      "positive",
    );
    setKpi("at-risk-orders", "0", "Aucun risque");
    setKpi("estimated-delay", "0 h", "Planning nominal");
    setKpi("extra-cost", "0 DT", "Budget de référence");
    return;
  }

  const isDecision = phase === "selected" || phase === "resolved";
  const reference = state.plans.find((plan) => plan.strategy.id === "stability");
  const comparison =
    isDecision && reference ? compareMetrics(reference.metrics, metrics) : null;

  setKpi(
    "on-time-orders",
    `${metrics.onTimeOrders} / ${metrics.totalOrders}`,
    comparison
      ? `${comparison.onTimeRatePoints >= 0 ? "+" : ""}${comparison.onTimeRatePoints} pts vs statu quo`
      : "Sans adaptation",
    metrics.onTimeOrders >= reference?.metrics.onTimeOrders ? "positive" : "warning",
  );
  setKpi(
    "at-risk-orders",
    String(metrics.lateOrders),
    isDecision
      ? "Après adaptation"
      : `${incidentImpact.affectedOrderIds.length} ordres exposés`,
    metrics.lateOrders ? "warning" : "positive",
  );
  setKpi(
    "estimated-delay",
    formatDuration(metrics.totalDelayMinutes),
    comparison
      ? `${comparison.delayMinutes <= 0 ? "− " : "+ "}${formatDuration(
          Math.abs(comparison.delayMinutes),
        )} vs statu quo`
      : "Conséquence simulée",
    metrics.totalDelayMinutes ? "warning" : "positive",
  );
  setKpi(
    "extra-cost",
    formatDt(extraCost, true),
    phase === "resolved" ? "Plan validé" : "Estimation comparative",
    extraCost > 0 ? "warning" : "positive",
  );
}

function lineLoad(schedule, lineId) {
  const minutes = schedule
    .filter((entry) => entry.lineId === lineId)
    .reduce((total, entry) => total + entry.endMinute - entry.startMinute, 0);
  const normalEnd = scenario.lines.find((line) => line.id === lineId).normalEndMinute;
  return Math.round((minutes / normalEnd) * 100);
}

function updateFactory(schedule, phase) {
  for (const line of scenario.lines) {
    const lineNumber = line.id.replace("L", "");
    const card = document.querySelector(`[data-line="${lineNumber}"]`);
    if (!card) continue;

    const isStopped = line.id === scenario.incident.lineId && phase !== "baseline";
    card.dataset.status = isStopped ? "stopped" : "running";

    const output = card.querySelector("[data-line-output]");
    output.textContent = isStopped ? "0%" : `${lineLoad(schedule, line.id)}%`;

    const status = card.querySelector("[data-line-status]");
    status.className = `status-chip ${isStopped ? "status-stopped" : "status-running"}`;
    status.textContent = isStopped
      ? "Arrêt simulé"
      : phase === "selected" || phase === "resolved"
        ? "Plan adapté"
        : "En marche";
  }
}

function createTimeScale() {
  const scale = document.createElement("div");
  scale.className = "gantt-times";
  scale.setAttribute("aria-hidden", "true");
  scale.style.gridTemplateColumns = "84px repeat(8, minmax(0, 1fr))";
  scale.append(document.createElement("span"));

  for (let minute = 0; minute <= scenario.clock.planningHorizonMinute; minute += 120) {
    const label = document.createElement("span");
    label.textContent = formatClockMinute(minute, scenario.clock.dayStartMinute);
    scale.append(label);
  }
  return scale;
}

function createJob(entry) {
  const order = orderById.get(entry.orderId);
  const job = document.createElement("span");
  const duration = entry.endMinute - entry.startMinute;
  const startColumn = Math.floor(entry.startMinute / 30) + 1;
  const span = Math.max(1, Math.ceil(duration / 30));
  const isLate = entry.endMinute > order.dueMinute;

  job.className = "job";
  if (order.priority >= 4) job.classList.add("priority");
  if (isLate) job.classList.add("is-at-risk");
  if (entry.movedFromLineId) job.classList.add("is-moved");
  job.dataset.order = order.id;
  job.style.setProperty("--start", String(startColumn));
  job.style.setProperty("--span", String(span));
  job.textContent = order.id;

  const moveText = entry.movedFromLineId
    ? ` · déplacé depuis ${entry.movedFromLineId}`
    : "";
  const timing = `${formatClockMinute(
    entry.startMinute,
    scenario.clock.dayStartMinute,
  )}–${formatClockMinute(entry.endMinute, scenario.clock.dayStartMinute)}`;
  job.title = `${order.id} · ${order.product} · ${timing}${moveText}`;
  job.setAttribute("aria-label", job.title);
  return job;
}

function createIncidentWindow() {
  const windowElement = document.createElement("span");
  const horizon = scenario.clock.planningHorizonMinute;
  const startPercent = (scenario.incident.startMinute / horizon) * 100;
  const widthPercent =
    ((scenario.incident.endMinute - scenario.incident.startMinute) / horizon) * 100;

  windowElement.className = "breakdown-window";
  windowElement.style.left = `${startPercent}%`;
  windowElement.style.width = `${widthPercent}%`;
  windowElement.style.opacity = "1";
  windowElement.style.transform = "scaleX(1)";
  windowElement.setAttribute(
    "aria-label",
    `Arrêt simulé de ${formatClockMinute(
      scenario.incident.startMinute,
      scenario.clock.dayStartMinute,
    )} à ${formatClockMinute(
      scenario.incident.endMinute,
      scenario.clock.dayStartMinute,
    )}`,
  );
  return windowElement;
}

function renderGantt(schedule, mode) {
  elements.gantt.dataset.schedule = mode;
  elements.gantt.replaceChildren(createTimeScale());

  for (const line of scenario.lines) {
    const row = document.createElement("div");
    row.className = "gantt-row";
    row.dataset.ganttLine = line.id.replace("L", "");

    const label = document.createElement("strong");
    label.textContent = line.id.replace("L", "Ligne ");

    const track = document.createElement("div");
    track.className = "gantt-track";
    track.style.setProperty("--columns", "28");

    const entries = schedule
      .filter((entry) => entry.lineId === line.id)
      .sort((left, right) => left.startMinute - right.startMinute);
    for (const entry of entries) track.append(createJob(entry));
    if (line.id === scenario.incident.lineId && mode !== "baseline") {
      track.append(createIncidentWindow());
    }

    row.append(label, track);
    elements.gantt.append(row);
  }
}

function renderStrategies() {
  const unlocked = state.plans.length > 0;
  elements.strategyCards.dataset.locked = unlocked ? "false" : "true";
  elements.strategyLock.hidden = unlocked;
  const reference = state.plans.find((plan) => plan.strategy.id === "stability");

  for (const card of elements.strategyCards.querySelectorAll("[data-strategy-card]")) {
    const strategyId = card.dataset.strategyCard;
    const plan = state.plans.find((candidate) => candidate.strategy.id === strategyId);
    const button = card.querySelector("[data-strategy]");
    const selected = state.selectedPlan?.strategy.id === strategyId;
    const approved = state.approvedPlan?.strategy.id === strategyId;

    card.classList.toggle("is-selected", selected || approved);
    button.disabled = !unlocked || state.phase === "resolved";
    button.setAttribute("aria-pressed", String(selected || approved));

    if (!plan) {
      const defaultDescriptions = {
        service: "Déplacer les commandes urgentes vers les lignes disponibles.",
        cost: "Protéger l'essentiel tout en limitant le coût total simulé.",
        stability: "Préserver le planning des autres lignes et absorber le retard.",
      };
      card.querySelector(":scope > p").textContent = defaultDescriptions[strategyId];
      for (const metric of card.querySelectorAll("[data-metric]")) {
        metric.textContent = "—";
      }
      setButtonLabel(button, "Choisir cette option", false);
      continue;
    }

    const delayGain = reference
      ? reference.metrics.totalDelayMinutes - plan.metrics.totalDelayMinutes
      : 0;
    const explanations = {
      service:
        `Récupère ${formatDuration(delayGain)} de retard face au statu quo, ` +
        `avec ${plan.metrics.movements} réaffectations.`,
      cost:
        `${plan.metrics.onTimeOrders}/10 commandes à l'heure avec le coût simulé ` +
        `le plus bas et ${plan.metrics.movements} réaffectations.`,
      stability:
        `Aucune réaffectation, mais ${plan.metrics.lateOrders} commandes restent ` +
        `en retard après l'incident.`,
    };
    card.querySelector(":scope > p").textContent = explanations[strategyId];
    card.querySelector('[data-metric="on-time"]').textContent =
      `${plan.metrics.onTimeOrders} / ${plan.metrics.totalOrders}`;
    card.querySelector('[data-metric="cost"]').textContent = formatDt(
      costDelta(plan.metrics),
      true,
    );
    card.querySelector('[data-metric="changes"]').textContent = String(
      plan.metrics.movements,
    );
    setButtonLabel(
      button,
      approved
        ? "Option validée"
        : selected
          ? "Option prévisualisée"
          : "Choisir cette option",
      false,
    );
  }
}

function updateJourney() {
  const steps = ["situation", "incident", "strategies", "decision"];
  const activeIndex =
    state.phase === "baseline" ? 0 : state.phase === "incident" ? 2 : 3;

  for (const [index, stepName] of steps.entries()) {
    const step = document.querySelector(`[data-journey-step="${stepName}"]`);
    step.classList.toggle("is-active", index === activeIndex);
    step.dataset.complete = String(
      state.phase === "resolved" ? index <= activeIndex : index < activeIndex,
    );
  }
}

function updateAudit() {
  const incidentTime = elements.incidentLog.querySelector(".audit-time");
  const incidentText = elements.incidentLog.querySelector("small");
  const decisionTime = elements.decisionLog.querySelector(".audit-time");
  const decisionTitle = elements.decisionLog.querySelector("strong");
  const decisionText = elements.decisionLog.querySelector("small");

  if (state.phase === "baseline") {
    elements.incidentLog.classList.add("is-pending");
    incidentTime.textContent = "—";
    incidentText.textContent = "En attente de la simulation";
    elements.decisionLog.classList.add("is-pending");
    decisionTime.textContent = "—";
    decisionTitle.textContent = "Décision responsable";
    decisionText.textContent = "En attente de validation";
    return;
  }

  elements.incidentLog.classList.remove("is-pending");
  incidentTime.textContent = "10:00";
  incidentText.textContent =
    `${incidentImpact.affectedOrderIds.length} commandes exposées par un arrêt de 4 h`;

  if (state.phase !== "resolved") {
    elements.decisionLog.classList.add("is-pending");
    decisionTime.textContent = "—";
    decisionTitle.textContent = state.selectedPlan
      ? `Option « ${state.selectedPlan.strategy.name} » prévisualisée`
      : "Décision responsable";
    decisionText.textContent = state.selectedPlan
      ? "En attente de validation humaine"
      : "En attente du choix d'une option";
    return;
  }

  elements.decisionLog.classList.remove("is-pending");
  decisionTime.textContent = "10:07";
  decisionTitle.textContent = `Option « ${state.approvedPlan.strategy.name} » validée`;
  decisionText.textContent =
    `Responsable production · ${state.approvedPlan.metrics.onTimeOrders}/10 commandes à l'heure`;
}

function updateDecision() {
  const label = elements.selectedStrategy.querySelector("strong");
  if (!state.selectedPlan) {
    label.textContent = "Aucune option pour le moment";
    elements.approveButton.disabled = true;
    setButtonLabel(elements.approveButton, "Valider le nouveau plan");
    return;
  }

  const metrics = state.selectedPlan.metrics;
  label.textContent =
    `${state.selectedPlan.strategy.name} · ${metrics.onTimeOrders}/10 à l'heure · ` +
    `${formatDt(costDelta(metrics), true)} · ${metrics.movements} changement(s)`;

  if (state.phase === "resolved") {
    elements.approveButton.disabled = true;
    setButtonLabel(elements.approveButton, "Plan validé et tracé ✓", false);
  } else {
    elements.approveButton.disabled = false;
    setButtonLabel(elements.approveButton, "Valider le nouveau plan");
  }
}

function updateStory(metrics, phase) {
  if (phase === "baseline") {
    setLivePill("Usine en marche", "running");
    elements.promiseValue.textContent = `${metrics.onTimeOrders} / 10 commandes à l'heure`;
    elements.promiseStatus.textContent = "Plan réalisable";
    return;
  }

  if (phase === "incident") {
    setLivePill("Incident simulé", "incident");
    elements.promiseValue.textContent =
      `${metrics.onTimeOrders} / 10 sans réaffectation`;
    elements.promiseStatus.textContent = "Décision requise";
    return;
  }

  if (phase === "selected") {
    setLivePill("Option prévisualisée", "preview");
    elements.promiseValue.textContent =
      `${metrics.onTimeOrders} / 10 avec ${state.selectedPlan.strategy.shortName}`;
    elements.promiseStatus.textContent = "Conséquences visibles";
    return;
  }

  setLivePill("Plan validé", "approved");
  elements.promiseValue.textContent =
    `${metrics.onTimeOrders} / 10 avec ${state.approvedPlan.strategy.shortName}`;
  elements.promiseStatus.textContent = "Décision tracée";
}

function currentView() {
  if (state.phase === "baseline") {
    return {
      schedule: scenario.initialSchedule,
      metrics: initialMetrics,
      mode: "baseline",
    };
  }
  if (state.phase === "incident") {
    const reference = state.plans.find((plan) => plan.strategy.id === "stability");
    return {
      schedule: reference.schedule,
      metrics: reference.metrics,
      mode: "incident",
    };
  }
  if (state.phase === "resolved") {
    return {
      schedule: state.approvedPlan.schedule,
      metrics: state.approvedPlan.metrics,
      mode: "approved",
    };
  }
  return {
    schedule: state.selectedPlan.schedule,
    metrics: state.selectedPlan.metrics,
    mode: "preview",
  };
}

function render() {
  const view = currentView();
  elements.body.dataset.simulationState =
    state.phase === "baseline"
      ? "baseline"
      : state.phase === "resolved"
        ? "resolved"
        : "incident";
  elements.incident.dataset.incidentState =
    state.phase === "baseline"
      ? "ready"
      : state.phase === "resolved"
        ? "resolved"
        : "active";

  updateFactory(view.schedule, state.phase);
  updateKpis(view.metrics, state.phase);
  renderGantt(view.schedule, view.mode);
  renderStrategies();
  updateDecision();
  updateAudit();
  updateJourney();
  updateStory(view.metrics, state.phase);
}

function scrollToSection(selector) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelector(selector)?.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
}

function simulateIncident() {
  if (state.phase !== "baseline") return;
  state.plans = generateRecoveryPlans(scenario);
  state.selectedPlan = null;
  state.approvedPlan = null;
  state.phase = "incident";

  for (const button of elements.simulateButtons) {
    button.disabled = true;
    setButtonLabel(button, "Incident simulé", false);
  }
  elements.simulationStatus.textContent =
    `${incidentImpact.affectedOrderIds.length} commandes exposées · 3 options calculées`;
  render();
  scrollToSection("#strategies");
}

function selectStrategy(strategyId) {
  if (!state.plans.length || state.phase === "resolved") return;
  const plan = state.plans.find((candidate) => candidate.strategy.id === strategyId);
  if (!plan) return;
  state.selectedPlan = plan;
  state.phase = "selected";
  elements.simulationStatus.textContent =
    `Option « ${plan.strategy.name} » prévisualisée · aucune action envoyée à l'atelier`;
  render();
  scrollToSection("#decision");
}

function approveSelection() {
  if (!state.selectedPlan || state.phase === "resolved") return;
  state.approvedPlan = approveRecoveryPlan(state.selectedPlan, {
    approvedBy: "Responsable production",
    approvedAt: "2026-07-17T10:07:00+01:00",
    note: "Plan approuvé dans le démonstrateur CableTwin.",
  });
  state.selectedPlan = state.approvedPlan;
  state.phase = "resolved";
  elements.simulationStatus.textContent =
    "Décision validée à 10:07 · journal d'audit mis à jour";
  render();
}

function resetDemo() {
  state.phase = "baseline";
  state.plans = [];
  state.selectedPlan = null;
  state.approvedPlan = null;
  for (const button of elements.simulateButtons) {
    button.disabled = false;
  }
  setButtonLabel(elements.simulateButtons[0], "Simuler l'arrêt de la ligne 2");
  if (elements.simulateButtons[1]) {
    setButtonLabel(elements.simulateButtons[1], "Lancer la simulation");
  }
  elements.simulationStatus.textContent = "Simulation prête";
  render();
  scrollToSection("#top");
}

for (const button of elements.simulateButtons) {
  button.addEventListener("click", simulateIncident);
}
for (const button of document.querySelectorAll("[data-strategy]")) {
  button.addEventListener("click", () => selectStrategy(button.dataset.strategy));
}
elements.approveButton.addEventListener("click", approveSelection);
elements.resetButton.addEventListener("click", resetDemo);

document.querySelector(".assumptions-content p").textContent =
  `${SYNTHETIC_DATA_NOTICE.text} CableTwin ne pilote aucune machine dans cette version.`;

render();
