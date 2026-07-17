#!/usr/bin/env python3
"""
CableTwin - moteur de replanification V0 (scenario synthetique S1).

Modele : un atelier de cablerie a 3 lignes. La ligne L2 tombe en panne a
t=120 min. Trois commandes non commencees etaient planifiees sur L2.
Le moteur enumere exhaustivement tous les plans de reprise faisables
(reaffectations de ligne compatibles + sequencements + heures supplementaires
bornees), calcule les KPI de chaque plan, puis selectionne trois strategies
selon des profils d'objectifs distincts.

Proprietes : deterministe, hors ligne, python stdlib uniquement.
AVERTISSEMENT : scenario 100 % synthetique. Aucun chiffre produit ici ne
represente une performance mesuree dans une usine reelle.

Usage :
    python cabletwin_sim.py            # resume lisible
    python cabletwin_sim.py --json     # resultats complets en JSON
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from itertools import permutations, product

# ---------------------------------------------------------------------------
# Scenario S1 (synthetique) - toutes les durees en minutes depuis 06:00
# ---------------------------------------------------------------------------

T0_LABEL = "06:00"
SHIFT_END = 720          # fin de poste planifiee (18:00)
OVERTIME_MAX = 180       # heures supplementaires max par ligne (min)
OVERTIME_RATE = 2        # cout synthetique par minute d'heure sup (u/min)
TRANSFER_SETUP = 30      # reglage/changement de ligne pour une commande transferee (min)
TRANSFER_COST = 150      # cout synthetique d'un transfert de ligne (u)

INCIDENT = {
    "line": "L2",
    "t_fail": 120,           # panne detectee a 08:00
    "t_repair_done": 600,    # L2 redisponible a 16:00 (MTTR 8 h)
    "cause": "avarie moteur d'extrudeuse (synthetique)",
}

# busy_until : fin des travaux deja engages / non deplacables sur la ligne.
# families : familles de produits que la ligne sait produire.
LINES = {
    "L1": {"busy_until": 290, "families": {"F1"}, "label": "Extrusion BT - ligne 1"},
    "L2": {"busy_until": 0, "families": {"F1", "F2", "F3"}, "label": "Extrusion BT - ligne 2 (polyvalente)"},
    "L3": {"busy_until": 620, "families": {"F2"}, "label": "Extrusion MT - ligne 3"},
}

# Commandes engagees (demarrees ou figees) : elles materialisent les fenetres
# busy_until ci-dessus et ne sont pas replanifiables. Toutes finissent a l'heure.
# Sur L2, CMD-105/106 sont achevees avant la panne (t=120).
COMMITTED_ORDERS = [
    {"id": "CMD-101", "line": "L1", "start": 0, "end": 150, "due": 210, "desc": "Cable BT 5G6 - 6 km"},
    {"id": "CMD-102", "line": "L1", "start": 150, "end": 290, "due": 350, "desc": "Cable BT 3G1,5 - 8 km"},
    {"id": "CMD-105", "line": "L2", "start": 0, "end": 60, "due": 120, "desc": "Cable BT 2x0,75 - 3 km"},
    {"id": "CMD-106", "line": "L2", "start": 60, "end": 120, "due": 180, "desc": "Cable BT 3G2,5 - 4 km"},
    {"id": "CMD-103", "line": "L3", "start": 0, "end": 200, "due": 260, "desc": "Cable MT 5,5/10 kV - 5 km"},
    {"id": "CMD-104", "line": "L3", "start": 200, "end": 410, "due": 470, "desc": "Cable MT 8,7/15 kV - 6 km"},
    {"id": "CMD-110", "line": "L3", "start": 410, "end": 620, "due": 680, "desc": "Cable MT 12/20 kV - 7 km"},
]

# Commandes impactees : planifiees sur L2, non commencees au moment de la panne.
# proc : duree de production par ligne compatible (min). due : echeance promise (min).
AFFECTED_ORDERS = [
    {"id": "CMD-107", "family": "F1", "proc": {"L1": 90, "L2": 90}, "due": 420,
     "desc": "Cable BT 3x2,5 mm2 - 9 km - client OEM auto"},
    {"id": "CMD-108", "family": "F2", "proc": {"L2": 120, "L3": 120}, "due": 630,
     "desc": "Cable MT 12/20 kV - 4 km - distributeur energie"},
    {"id": "CMD-109", "family": "F3", "proc": {"L2": 60}, "due": 700,
     "desc": "Cable instrumentation blinde - 2 km - integrateur industriel"},
]

ORIGINAL_LINE = "L2"
BASELINE_NAME = "Sans action (attendre la reparation, sequence initiale)"


@dataclass(frozen=True)
class Plan:
    assignment: tuple          # ligne retenue pour chaque commande (ordre de AFFECTED_ORDERS)
    sequences: tuple           # ((ligne, (ids ordonnes)), ...)
    schedule: tuple            # details par commande
    tardiness_total: int
    n_late: int
    n_transfers: int
    overtime_min: int
    cost_u: int

    def kpis(self) -> dict:
        n_total = len(COMMITTED_ORDERS) + len(AFFECTED_ORDERS)
        return {
            "retard_total_min": self.tardiness_total,
            "commandes_en_retard": self.n_late,
            "commandes_a_l_heure": len(AFFECTED_ORDERS) - self.n_late,
            "a_l_heure_sur_total": f"{n_total - self.n_late}/{n_total}",
            "transferts_de_ligne": self.n_transfers,
            "heures_sup_min": self.overtime_min,
            "surcout_synthetique_u": self.cost_u,
        }


def line_available_from(line: str) -> int:
    """Instant a partir duquel une ligne peut demarrer une commande impactee."""
    t = LINES[line]["busy_until"]
    if line == INCIDENT["line"]:
        t = max(t, INCIDENT["t_repair_done"])
    return t


def allowed_lines(order: dict) -> list[str]:
    return sorted(l for l in LINES if order["family"] in LINES[l]["families"] and l in order["proc"])


def build_plan(assignment: tuple[str, ...], per_line_seq: dict[str, tuple[int, ...]]) -> Plan | None:
    """Construit et evalue un plan ; None si infaisable (heures sup > borne)."""
    schedule = []
    sequences = []
    tard_total = n_late = n_transfers = overtime = 0
    for line in sorted(per_line_seq):
        t = line_available_from(line)
        seq_ids = []
        for idx in per_line_seq[line]:
            order = AFFECTED_ORDERS[idx]
            transferred = line != ORIGINAL_LINE
            if transferred:
                t += TRANSFER_SETUP
                n_transfers += 1
            start, end = t, t + order["proc"][line]
            t = end
            tard = max(0, end - order["due"])
            tard_total += tard
            n_late += 1 if tard > 0 else 0
            seq_ids.append(order["id"])
            schedule.append({
                "commande": order["id"], "ligne": line, "debut_min": start,
                "fin_min": end, "echeance_min": order["due"], "retard_min": tard,
                "transferee": transferred,
            })
        line_ot = max(0, t - SHIFT_END)
        if line_ot > OVERTIME_MAX:
            return None
        overtime += line_ot
        sequences.append((line, tuple(seq_ids)))
    cost = n_transfers * TRANSFER_COST + overtime * OVERTIME_RATE
    schedule.sort(key=lambda s: (s["ligne"], s["debut_min"]))
    return Plan(assignment, tuple(sequences), tuple(tuple(sorted(s.items())) for s in schedule),
                tard_total, n_late, n_transfers, overtime, cost)


def enumerate_plans() -> list[Plan]:
    """Recherche exhaustive sous contraintes : affectations compatibles x sequencements."""
    plans = []
    domains = [allowed_lines(o) for o in AFFECTED_ORDERS]
    for assignment in product(*domains):
        by_line: dict[str, list[int]] = {}
        for idx, line in enumerate(assignment):
            by_line.setdefault(line, []).append(idx)
        seq_options = [
            [(line, perm) for perm in permutations(idxs)] for line, idxs in sorted(by_line.items())
        ]
        for combo in product(*seq_options):
            plan = build_plan(assignment, dict(combo))
            if plan is not None:
                plans.append(plan)
    return plans


def baseline_plan() -> Plan:
    """Sans action : tout reste sur L2 apres reparation, sequence initiale (par echeance)."""
    order_idx = sorted(range(len(AFFECTED_ORDERS)), key=lambda i: AFFECTED_ORDERS[i]["due"])
    plan = build_plan(tuple(ORIGINAL_LINE for _ in AFFECTED_ORDERS), {ORIGINAL_LINE: tuple(order_idx)})
    assert plan is not None
    return plan


def nominal_plan() -> dict:
    """Plan nominal sans incident : les commandes impactees s'enchainent sur L2
    apres les commandes engagees (fin a t=120). Reference avant-incident."""
    t = max(o["end"] for o in COMMITTED_ORDERS if o["line"] == ORIGINAL_LINE)
    schedule, tard_total, n_late = [], 0, 0
    for order in sorted(AFFECTED_ORDERS, key=lambda o: o["due"]):
        start, end = t, t + order["proc"][ORIGINAL_LINE]
        t = end
        tard = max(0, end - order["due"])
        tard_total += tard
        n_late += 1 if tard > 0 else 0
        schedule.append({"commande": order["id"], "ligne": ORIGINAL_LINE, "debut_min": start,
                         "fin_min": end, "echeance_min": order["due"], "retard_min": tard,
                         "transferee": False})
    n_total = len(COMMITTED_ORDERS) + len(AFFECTED_ORDERS)
    overtime = max(0, t - SHIFT_END)
    return {
        "strategie": "Plan nominal avant incident",
        "kpis": {
            "retard_total_min": tard_total, "commandes_en_retard": n_late,
            "commandes_a_l_heure": len(AFFECTED_ORDERS) - n_late,
            "a_l_heure_sur_total": f"{n_total - n_late}/{n_total}",
            "transferts_de_ligne": 0, "heures_sup_min": overtime,
            "surcout_synthetique_u": overtime * OVERTIME_RATE,
        },
        "ordonnancement": schedule,
    }


def select_strategies(plans: list[Plan], baseline: Plan) -> dict[str, Plan]:
    """Trois profils d'objectifs -> trois plans distincts et comparables."""
    ranked = sorted(plans, key=lambda p: (p.tardiness_total, p.cost_u, p.n_transfers, p.sequences))
    vitesse = ranked[0]

    max_cost = max(p.cost_u for p in plans) or 1
    ref_tard = baseline.tardiness_total or 1

    def balanced_score(p: Plan) -> float:
        return 0.5 * p.tardiness_total / ref_tard + 0.5 * p.cost_u / max_cost

    equilibre = min(plans, key=lambda p: (balanced_score(p), p.tardiness_total, p.sequences))

    zero_transfer = min((p for p in plans if p.n_transfers == 0),
                        key=lambda p: (p.tardiness_total, p.cost_u, p.sequences))
    return {"vitesse": vitesse, "equilibre": equilibre, "zero_transfert": zero_transfer}


def threatened_at_incident(baseline: Plan) -> dict:
    return {
        "commandes_menacees": len(AFFECTED_ORDERS),
        "sur_total_commandes": len(COMMITTED_ORDERS) + len(AFFECTED_ORDERS),
        "ids": [o["id"] for o in AFFECTED_ORDERS],
        "retard_projete_sans_action_min": baseline.tardiness_total,
    }


def plan_to_dict(name: str, plan: Plan) -> dict:
    return {
        "strategie": name,
        "kpis": plan.kpis(),
        "ordonnancement": [dict(items) for items in plan.schedule],
    }


def run() -> dict:
    plans = enumerate_plans()
    baseline = baseline_plan()
    strategies = select_strategies(plans, baseline)
    gains = {
        name: round(100 * (baseline.tardiness_total - p.tardiness_total) / baseline.tardiness_total, 1)
        for name, p in strategies.items()
    }
    return {
        "avertissement": "Scenario synthetique S1. Resultats de simulation uniquement - "
                         "aucune performance mesuree en usine reelle.",
        "scenario": {
            "t0": T0_LABEL, "fin_de_poste_min": SHIFT_END, "incident": INCIDENT,
            "lignes": {k: {**v, "families": sorted(v["families"])} for k, v in LINES.items()},
            "commandes_engagees": COMMITTED_ORDERS,
            "commandes_impactees": AFFECTED_ORDERS,
            "parametres": {
                "reglage_transfert_min": TRANSFER_SETUP, "cout_transfert_u": TRANSFER_COST,
                "heures_sup_max_min": OVERTIME_MAX, "cout_heure_sup_u_par_min": OVERTIME_RATE,
            },
        },
        "menace_a_l_incident": threatened_at_incident(baseline),
        "plans_faisables_evalues": len(plans),
        "plan_nominal": nominal_plan(),
        "sans_action": plan_to_dict(BASELINE_NAME, baseline),
        "strategies": {k: plan_to_dict(k, p) for k, p in strategies.items()},
        "reduction_retard_vs_sans_action_pct": gains,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="CableTwin - simulation V0 (scenario synthetique)")
    parser.add_argument("--json", action="store_true", help="sortie JSON complete")
    args = parser.parse_args()
    result = run()
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return
    print("CableTwin - scenario synthetique S1 (aucun chiffre issu d'une usine reelle)")
    nom = result["plan_nominal"]["kpis"]
    base = result["sans_action"]["kpis"]
    print(f"Plans faisables evalues : {result['plans_faisables_evalues']}")
    print(f"Nominal (avant incident) : retard {nom['retard_total_min']} min, "
          f"a l'heure {nom['a_l_heure_sur_total']}, surcout {nom['surcout_synthetique_u']} u")
    print(f"Sans action : retard total {base['retard_total_min']} min, "
          f"a l'heure {base['a_l_heure_sur_total']}, surcout {base['surcout_synthetique_u']} u")
    for name, s in result["strategies"].items():
        k = s["kpis"]
        print(f"  {name:14s} retard {k['retard_total_min']:4d} min "
              f"({result['reduction_retard_vs_sans_action_pct'][name]:+.1f}% vs sans action) | "
              f"a l'heure {k['a_l_heure_sur_total']} | transferts {k['transferts_de_ligne']} | "
              f"h.sup {k['heures_sup_min']} min | surcout {k['surcout_synthetique_u']} u")


if __name__ == "__main__":
    main()
