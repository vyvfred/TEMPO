import { SolverConfig, loadSolverConfig } from "./solverConfig";
import type { Personnel, Besoin, AppState, Absence } from "@/store/AppContext";

/**
 * Moteur de Solveur Multi‑Objectifs
 * Implémente l'algorithme de résolution pour l'affectation du personnel
 */

export interface Assignment {
  besoinId: string;
  personnelId: string;
  score: number;
  reasons: string[];
  locked: boolean;
}

export interface SolverResult {
  success: boolean;
  assignments: Assignment[];
  uncoveredNeeds: Besoin[];
  warnings: string[];
  errors: string[];
  stats: {
    totalNeeds: number;
    coveredNeeds: number;
    partialNeeds: number;
    uncoveredNeeds: number;
    totalAssignments: number;
    executionTime: number;
  };
}

export interface ScoringBreakdown {
  baseScore: number;
  equityScore: number;
  preferenceScore: number;
  qualificationScore: number;
  totalScore: number;
  softScore: number; // components of the soft score}

/* -------------------------------------------------------------------------- */
/* 1️⃣  Scores de base                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Score lié à la qualification du personnel pour le besoin.
 */
function calculateQualificationScore(
  personnel: Personnel,
  besoin: Besoin
): number {
  const qualMap: Record<string, string[]> = {
    ambulance: ["ADE"],
    VSL: ["ADE", "VSL"],
    taxi: ["ADE", "AA", "VSL", "REG"],
  };

  const requiredQuals = qualMap[besoin.typePoste] || ["ADE"];
  const personnelQual = personnel.qualification.abreviation;

  return requiredQuals.includes(personnelQual) ? 20 : -20;
}

/**
 * Score de préférence (night / week‑end) – valeur dure.
 */
function calculatePreferenceScore(
  personnel: Personnel,
  besoin: Besoin,
  config: SolverConfig
): number {
  if (!config.preferences.respectPreferences) return 0;

  let score = 0;
  const reasons: string[] = [];

  // Préférence nuit
  if (besoin.quart === "nuit" && personnel.preferenciasNuit) {
    score += config.preferences.nightPreferenceBonus;
    reasons.push(`+${config.preferences.nightPreferenceBonus} préf. nuit`);
  }

  // Préférence week‑end
  const isWeekend =
    new Date(besoin.date).getDay() === 0 ||
    new Date(besoin.date).getDay() === 6;
  if (isWeekend && personnel.preferenciasWE) {
    score += config.preferences.wePreferenceBonus;
    reasons.push(`+${config.preferences.wePreferenceBonus} préf. WE`);
  }

  return score;
}

/**
 * Score d'équité – incite à équilibrer la charge.
 */
function calculateEquityScore(
  personnel: Personnel,
  allPersonnel: Personnel[],
  config: SolverConfig
): number {
  if (!config.equity.enableEquityScoring) return 0;

  const equityWeight = config.equity.equityWeight / 100;
  const maxAffectations = Math.max(
    ...allPersonnel.map((p) => p.affectationsCount)
  );
  const currentAffectations = personnel.affectationsCount;

  if (maxAffectations === 0) return 50;
  const gapRatio = 1 - currentAffectations / maxAffectations;
  return gapRatio * 50 * equityWeight;
}

/**
 * Score « soft » : fairness, night distribution, overtime penalty,
 * et bonus de préférence lorsqu’ils coïncident avec le besoin.
 */
function calculateSoftScore(
  personnel: Personnel,
  besoin: Besoin,
  allPersonnel: Personnel[],
  config: SolverConfig
): number {
  let soft = 0;

  // 1️⃣ Fairness – reward when the employee is close to the minimum load
  const minAffect = Math.min(...allPersonnel.map((p) => p.affectationsCount));
  const diffToMin = personnel.affectationsCount - minAffect;
  // smaller diff → higher soft score (max 5 points)
  soft += Math.max(0, 5 - Math.abs(diffToMin));

  // 2️⃣ Night distribution – bonus if the shift is night and the employee prefers night
  if (besoin.quart === "nuit" && personnel.preferenciasNuit) {
    soft += 3; // night‑preference bonus
  }

  // 3️⃣ Overtime penalty – penalise heavy load (> 5 assignments)
  if (personnel.affectationsCount > 5) {
    soft -= 2; // small penalty
  }

  // 4️⃣ Additional preference bonus when the shift matches a declared preference
  if (
    (besoin.quart === "nuit" && personnel.preferenciasNuit) ||
    (besoin.quart === "apres-midi" && personnel.preferenciasWE)
  ) {
    soft += 2;
  }

  return soft;
}

/**
 * Score total d’une affectation candidate (capped at 100).
 */
function calculateTotalScore(
  personnel: Personnel,
  besoin: Besoin,
  allPersonnel: Personnel[],
  besoins: Besoin[],
  config: SolverConfig
): ScoringBreakdown {
  const baseScore = 50;

  const equityScore = calculateEquityScore(personnel, allPersonnel, config);
  const preferenceScore = calculatePreferenceScore(personnel, besoin, config);
  const qualificationScore = calculateQualificationScore(personnel, besoin);
  const softScore = calculateSoftScore(
    personnel,
    besoin,
    allPersonnel,
    config  );

  const totalScore = Math.max(
    0,
    Math.min(
      100,
      baseScore + equityScore + preferenceScore + qualificationScore + softScore    )
  );

  return {
    baseScore,
    equityScore,
    preferenceScore,
    qualificationScore,
    totalScore,
    softScore,
  };
}

/* -------------------------------------------------------------------------- */
/* 2️⃣  Candidate generation & need solving                                      */
/* -------------------------------------------------------------------------- */

/**
 * Vérifie les contraintes légales d’un salarié pour un besoin donné.
 * Retourne toujours valide dans cette implémentation simplifiée.
 */
function checkLegalConstraints(
  personnel: Personnel,
  allBesoins: Besoin[],
  besoin: Besoin,
  config: SolverConfig,
  absences: Absence[]
): { valid: boolean; reason?: string } {
  // Exemple de contrainte : aucune restriction médicale active ne doit bloquer
  // une affectation immédiate.  (Vous pouvez l’enrichir selon vos besoins.)
  const hasActiveRestriction = personnel.restrictions.length > 0;
  if (hasActiveRestriction) {
    return { valid: false, reason: "Restriction médicale active" };
  }
  return { valid: true };
}

/**
 * Génère tous les candidats possibles pour un besoin.
 * Chaque candidat est un couple { personnel, score }.
 */
function generateCandidates(
  besoin: Besoin,
  personnel: Personnel[],
  allBesoins: Besoin[],
  config: SolverConfig,
  absences: Absence[]
): Array<{ personnel: Personnel; score: ScoringBreakdown }> {
  const candidates: Array<{ personnel: Personnel; score: ScoringBreakdown }> = [];

  for (const p of personnel) {
    // Ne pas ré‑affecter un personnel déjà affecté à ce besoin
    if (besoin.personnelAffecte.includes(p.id)) continue;

    // Appliquer les contraintes légales
    const constraints = checkLegalConstraints(p, allBesoins, besoin, config, absences);
    if (!constraints.valid) continue;

    // Calculer le score (inclut les composantes soft)
    const score = calculateTotalScore(p, besoin, personnel, allBesoins, config);
    candidates.push({ personnel: p, score });
  }

  // Trier du meilleur score au pire
  candidates.sort((a, b) => b.score.totalScore - a.score.totalScore);
  return candidates;
}

/**
 * Résout l'affectation pour un besoin donné.
 * Retourne un tableau d'Affectation (une par salarié affecté).
 */
function solveForNeed(
  besoin: Besoin,
  personnel: Personnel[],
  allBesoins: Besoin[],
  config: SolverConfig,
  absences: Absence[]
): Assignment[] {
  const assignments: Assignment[] = [];
  const needed = besoin.personnelRequis - besoin.personnelAffecte.length;

  if (needed <= 0) return assignments;

  // Générer les candidats classés par score
  const candidates = generateCandidates(besoin, personnel, allBesoins, config, absences);

  // Affecter les meilleurs candidats jusqu'à la quantité requise
  for (let i = 0; i < Math.min(needed, candidates.length); i++) {
    const { personnel: p, score } = candidates[i];
    assignments.push({
      besoinId: besoin.id,
      personnelId: p.id,
      score: score.totalScore,
      reasons: [
        score.equityScore > 0 ? "Équité respectée" : "",
        score.preferenceScore > 0 ? "Préférence respectée" : "",
        score.qualificationScore > 0 ? "Qualification adaptée" : "",
      ].filter(Boolean),
      locked: false,
    });
  }

  return assignments;
}

/* -------------------------------------------------------------------------- */
/* 3️⃣  Solver orchestration                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Point d’entrée du solveur – renvoie un SolverResult.
 */
export function solvePlanning(
  state: AppState,
  config?: SolverConfig
): SolverResult {
  const startTime = performance.now();
  const solverConfig = config || loadSolverConfig();

  const { besoins, personnel, absences } = state;
  const date = state.selectedDate;

  // Besoins à traiter pour la date sélectionnée
  const needsForDate = besoins.filter(
    (b) => b.date === date && b.statut !== "complete"
  );

  // Personnel disponible, trié par nombre d'affectations (celui qui est le moins chargé en premier)
  const availablePersonnel = [...personnel]
    .filter((p) => p.statut === "disponible" && p.actif)
    .sort((a, b) => a.affectationsCount - b.affectationsCount);

  const allAssignments: Assignment[] = [];
  const uncoveredNeeds: Besoin[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  // Traitement de chaque besoin
  for (const besoin of needsForDate) {
    const needed = besoin.personnelRequis - besoin.personnelAffecte.length;
    if (needed <= 0) continue;

    const needAssignments = solveForNeed(
      besoin,
      availablePersonnel,
      besoins,
      solverConfig,
      absences
    );

    if (needAssignments.length < needed) {
      uncoveredNeeds.push(besoin);
      warnings.push(
        `${besoin.service}: ${needed - needAssignments.length}/${needed} non couvert(s)`
      );
    }

    allAssignments.push(...needAssignments);
  }

  // Vérifier l'écart d'équité si l'option est activée
  if (solverConfig.equity.enableEquityScoring) {
    const assignedIds = allAssignments.map((a) => a.personnelId);
    const assignedCounts = new Map<string, number>();

    for (const id of assignedIds) {
      assignedCounts.set(id, (assignedCounts.get(id) || 0) + 1);
    }

    const counts = Array.from(assignedCounts.values());
    const maxCount = Math.max(...counts, 0);
    const minCount = counts.length > 0 ? Math.min(...counts) : 0;
    const gap = maxCount - minCount;

    if (gap > solverConfig.equity.maxAffectationGap) {
      warnings.push(
        `Écart d'affectations: ${gap} (max autorisé: ${solverConfig.equity.maxAffectationGap})`
      );
    }
  }

  // Statistiques de la résolution  const coveredNeeds = needsForDate.filter((b) => {
    const assigned = allAssignments.filter((a) => a.besoinId === b.id).length;
    const total = b.personnelAffecte.length + assigned;
    return total >= b.personnelRequis;
  }).length;

  const partialNeeds = needsForDate.filter((b) => {
    const assigned = allAssignments.filter((a) => a.besoinId === b.id).length;
    const total = b.personnelAffecte.length + assigned;
    return total > 0 && total < b.personnelRequis;
  }).length;

  const executionTime = performance.now() - startTime;

  return {
    success: uncoveredNeeds.length === 0,
    assignments: allAssignments,
    uncoveredNeeds,
    warnings,
    errors,
    stats: {
      totalNeeds: needsForDate.length,
      coveredNeeds,
      partialNeeds,
      uncoveredNeeds: uncoveredNeeds.length,
      totalAssignments: allAssignments.length,
      executionTime,
    },
  };
}

/**
 * Applique les résultats du solveur à l'état de l'application.
 */
export function applySolverResults(
  result: SolverResult,
  dispatch: React.Dispatch<any>
): void {
  for (const assignment of result.assignments) {
    dispatch({
      type: "AFFECTER_PERSONNEL",
      payload: {
        besoinId: assignment.besoinId,
        personnelId: assignment.personnelId,
      },
    });
  }
}

/**
 * Solveur pas‑à‑pas – génère un candidat à la fois.
 * Utile pour les visualisations ou les tests.
 */
export function* solvePlanningStepByStep(
  state: AppState,
  config?: SolverConfig
): Generator<
  {
    step: number;
    type: "candidate" | "assignment" | "warning" | "complete";
    data: any;
  },
  void,
  unknown
> {
  const solverConfig = config || loadSolverConfig();
  const { besoins, personnel, absences } = state;
  const date = state.selectedDate;

  // Besoins à traiter pour la date sélectionnée
  const needsForDate = besoins.filter(
    (b) => b.date === date && b.statut !== "complete"
  );

  // Personnel disponible, trié par charge actuelle
  const availablePersonnel = [...personnel]
    .filter((p) => p.statut === "disponible" && p.actif)
    .sort((a, b) => a.affectationsCount - b.affectationsCount);

  let step = 0;

  for (const besoin of needsForDate) {
    const needed = besoin.personnelRequis - besoin.personnelAffecte.length;
    if (needed <= 0) continue;

    const candidates = generateCandidates(
      besoin,
      availablePersonnel,
      besoins,
      solverConfig,
      absences
    );

    // Emit the top‑5 candidates (or fewer)
    yield {
      step: ++step,
      type: "candidate",
      data: {
        besoin,
        candidates: candidates.slice(0, 5),
      },
    };

    // Emit each assignment that will be performed
    for (let i = 0; i < Math.min(needed, candidates.length); i++) {
      const { personnel: p, score } = candidates[i];
      yield {
        step: ++step,
        type: "assignment",
        data: {
          besoin,
          personnel: p,
          score,
        },
      };
    }
  }

  // Signal the end of the algorithm  yield {
    step: ++step,
    type: "complete",
    data: { message: "Résolution terminée" },
  };
}