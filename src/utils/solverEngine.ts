import { SolverConfig, loadSolverConfig } from "./solverConfig";
import type { Personnel, Besoin, AppState, Absence } from "@/store/AppContext";

/**
 * Moteur de Solveur Multi-Objectifs
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
  contractScore: number; // NEW: contract compliance score
  totalScore: number;
  softScore: number; // NEW: soft score components
}

/**
 * Calcule le score de qualification pour une affectation
 */
function calculateQualificationScore(
  personnel: Personnel,
  besoin: Besoin
): number {
  const qualMap: Record<string, string[]> = {
    ambulance: ["ADE"], // ADE requis pour ambulance
    VSL: ["ADE", "VSL"], // ADE ou VSL pour VSL
    taxi: ["ADE", "AA", "VSL", "REG"], // Tous types pour taxi
  };

  const requiredQuals = qualMap[besoin.typePoste] || ["ADE"];
  const personnelQual = personnel.qualification.abreviation;

  if (requiredQuals.includes(personnelQual)) {
    return 20; // Qualification parfaite
  }
  return -20; // Qualification non adaptée
}

/**
 * Calcule le score de préférence pour une affectation
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

  // Préférence week-end
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
 * Calcule le score d'équité pour une affectation
 */
function calculateEquityScore(
  personnel: Personnel,
  allPersonnel: Personnel[],
  config: SolverConfig
): number {
  if (!config.equity.enableEquityScoring) return 0;

  // Plus le score d'équité est bas, plus la personne mérite des affectations
  const equityWeight = config.equity.equityWeight / 100;
  const maxAffectations = Math.max(
    ...allPersonnel.map((p) => p.affectationsCount)
  );
  const currentAffectations = personnel.affectationsCount;

  // Score basé sur la différence avec le max
  if (maxAffectations === 0) return 50;

  const gapRatio = 1 - currentAffectations / maxAffectations;
  return gapRatio * 50 * equityWeight;
}

/**
 * Calcule le score de contrat pour une affectation
 * - Pénalise les dépassements d'heures
 * - Favorise les salariés en déficit d'heures
 */
function calculateContractScore(
  personnel: Personnel,
  besoin: Besoin,
  allPersonnel: Personnel[],
  config: SolverConfig
): number {
  if (!config.contract.enableContractCompliance) return 0;

  // Calculer les heures planifiées par semaine pour ce salarié
  const weeklyHours = getPlannedWeeklyHours(personnel, allPersonnel, besoin.date);
  const weeklyDays = getPlannedWeeklyDays(personnel, allPersonnel, besoin.date);

  // Heures de contrat attendues par semaine (environ 35h)
  const contractHours = config.contract.weeklyContractHours || 35;
  const expectedDays = config.contract.weeklyExpectedDays || 5;

  // Écarts
  const hoursGap = weeklyHours - contractHours;
  const daysGap = weeklyDays - expectedDays;

  // Pénalité pour dépassement d'heures (max -20)
  const hoursPenalty = Math.max(0, hoursGap) * -2; // -2 points par heure de dépassement
  const hoursReward = Math.min(0, hoursGap) * 2; // +2 points par heure de déficit

  // Pénalité pour dépassement de jours (max -10)
  const daysPenalty = Math.max(0, daysGap) * -2; // -2 points par jour de dépassement
  const daysReward = Math.min(0, daysGap) * 2; // +2 points par jour de déficit

  // Bonus si le salarié est en déficit global (encourage l'équilibre)
  let deficitBonus = 0;
  if (weeklyHours < contractHours * 0.9) {
    deficitBonus = 5; // +5 points pour ceux en sous‑charge
  }

  // Alerte si l'écart est important
  if (hoursGap > 10) {
    console.warn(`⚠️ ${personnel.prenom} ${personnel.nom} dépasse de ${hoursGap} heures cette semaine`);
  }

  return hoursPenalty + hoursReward + daysPenalty + daysReward + deficitBonus;
}

/**
 * Calcule le nombre d'heures planifiées par semaine pour un salarié
 */
function getPlannedWeeklyHours(
  personnel: Personnel,
  allPersonnel: Personnel[],
  currentDate: string
): number {
  // Récupérer toutes les affectations de la semaine en cours
  const weekStart = new Date(currentDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Lundi
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  // Compter les affectations dans la semaine
  let totalHours = 0;
  const allBesoins = getAllBesoins(); // Doit être récupéré du contexte

  // Pour simplifier, on considère qu'une affectation = 8h par défaut
  // Dans une version plus avancée, on pourrait utiliser la durée par besoin
  allBesoins.forEach(b => {
    if (b.personnelAffecte.includes(personnel.id) && b.date >= weekStartStr && b.date <= weekEndStr) {
      totalHours += 8; // 8 heures par shift
    }
  });

  return totalHours;
}

/**
 * Calcule le nombre de jours planifiés par semaine pour un salarié
 */
function getPlannedWeeklyDays(
  personnel: Personnel,
  allPersonnel: Personnel[],
  currentDate: string
): number {
  const weekStart = new Date(currentDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Lundi
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  // Compter les jours avec au moins une affectation dans la semaine
  const daysSet = new Set<string>();
  const allBesoins = getAllBesoins();

  allBesoins.forEach(b => {
    if (b.personnelAffecte.includes(personnel.id) && b.date >= weekStartStr && b.date <= weekEndStr) {
      daysSet.add(b.date);
    }
  });

  return daysSet.size;
}

/**
 * Récupère tous les besoins (mock pour l'exemple, à adapter avec le contexte réel)
 */
function getAllBesoins(): Besoin[] {
  // Dans l'implémentation réelle, cette fonction devrait être remplacée
  // par un accès au state via un contexte ou un store
  throw new Error("getAllBesoins must be implemented with real data access");
}

/**
 * Évalue les composantes soft (fairness, night distribution, overtime, preferences)
 * Simple implementation returning extra points (0‑20)
 */
function calculateSoftScore(
  personnel: Personnel,
  besoin: Besoin,
  allPersonnel: Personnel[],
  config: SolverConfig
): number {
  let soft = 0;

  // 1. Fairness – reward when affectation count is close to the minimum
  const minAffect = Math.min(...allPersonnel.map(p => p.affectationsCount));
  const diffToMin = personnel.affectationsCount - minAffect;
  // smaller diff → higher soft score (up to 5 points)
  soft += Math.max(0, 5 - Math.abs(diffToMin));

  // 2. Night distribution – bonus if the need is night and employee prefers night
  if (besoin.quart === "nuit" && personnel.preferenciasNuit) {
    soft += 3; // night‑preference bonus
  }

  // 3. Overtime penalty – penalize heavy load (more than 5 assignments)
  if (personnel.affectationsCount > 5) {
    soft -= 2; // small penalty
  }

  // 4. Preference bonus already partially covered above, but also reward
  //    employees who have any preference when the need matches it
  if (
    (besoin.quart === "nuit" && personnel.preferenciasNuit) ||
    (besoin.quart === "apres-midi" && personnel.preferenciasWE)
  ) {
    soft += 2;
  }

  return soft;
}

/**
 * Calcule le score total pour une affectation candidate
 */
function calculateTotalScore(
  personnel: Personnel,
  besoin: Besoin,
  allPersonnel: Personnel[],
  besoins: Besoin[],
  config: SolverConfig
): ScoringBreakdown {
  // Score de base
  const baseScore = 50;

  // Score d'équité
  const equityScore = calculateEquityScore(personnel, allPersonnel, config);

  // Score de préférence (hard preference bonus)
  const preferenceScore = calculatePreferenceScore(personnel, besoin, config);

  // Score de qualification
  const qualificationScore = calculateQualificationScore(personnel, besoin);

  // Score de contrat (heures et jours)
  const contractScore = calculateContractScore(personnel, besoin, allPersonnel, config);

  // Soft score (fairness, night distribution, overtime, etc.)
  const softScore = calculateSoftScore(
    personnel,
    besoin,
    allPersonnel,
    config
  );

  // Total score (capped at 100)
  const totalScore = Math.max(
    0,
    Math.min(
      100,
      baseScore + equityScore + preferenceScore + qualificationScore + contractScore + softScore
    )
  );

  return {
    baseScore,
    equityScore,
    preferenceScore,
    qualificationScore,
    contractScore,
    totalScore,
    softScore, // expose soft components
  };
}

/**
 * Génère tous les candidats possibles pour un besoin
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
    // Ne pas ré‑affecter déjà affecté
    if (besoin.personnelAffecte.includes(p.id)) continue;

    // Vérifier les contraintes légales strictes
    const constraints = checkLegalConstraints(p, allBesoins, besoin, config, absences);
    if (!constraints.valid) continue;

    // Calculer le score (inclut soft components)
    const score = calculateTotalScore(p, besoin, personnel, allBesoins, config);
    candidates.push({ personnel: p, score });
  }

  // Trier par score décroissant
  candidates.sort((a, b) => b.score.totalScore - a.score.totalScore);

  return candidates;
}

/**
 * Résout le problème d'affectation pour un besoin spécifique
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

  // Générer les candidats
  const candidates = generateCandidates(besoin, personnel, allBesoins, config, absences);

  // Affecter les meilleurs candidats
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
        score.contractScore > 0 ? "Contrat équilibré" : "",
      ].filter(Boolean),
      locked: false,
    });
  }

  return assignments;
}

/**
 * SOLVEUR PRINCIPAL - Génère le planning optimisé
 */
export function solvePlanning(
  state: AppState,
  config?: SolverConfig
): SolverResult {
  const startTime = performance.now();
  const solverConfig = config || loadSolverConfig();

  const { besoins, personnel, absences } = state;
  const date = state.selectedDate;

  // Filter needs for the selected date
  const needsForDate = besoins.filter(
    (b) => b.date === date && b.statut !== "complete"
  );

  // Available personnel sorted by current load (fewest assignments first)
  const availablePersonnel = [...personnel]
    .filter((p) => p.statut === "disponible" && p.actif)
    .sort((a, b) => a.affectationsCount - b.affectationsCount);

  const allAssignments: Assignment[] = [];
  const uncoveredNeeds: Besoin[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  // Process each need
  for (const besoin of needsForDate) {
    const needed = besoin.personnelRequis - besoin.personnelAffecte.length;

    if (needed <= 0) continue;

    // Solve for this need
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

  // Check equity gap
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

  // Compute statistics
  const coveredNeeds = needsForDate.filter((b) => {
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
 * Applies solver results to the application state
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
 * Step‑by‑step solver – yields one candidate at a time
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

  // Filter needs for the selected date
  const needsForDate = besoins.filter(
    (b) => b.date === date && b.statut !== "complete"
  );

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

    yield {
      step: ++step,
      type: "candidate",
      data: {
        besoin,
        candidates: candidates.slice(0, 5), // Top 5
      },
    };

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

  yield {
    step: ++step,
    type: "complete",
    data: { message: "Résolution terminée" },
  };
}