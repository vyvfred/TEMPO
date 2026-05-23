import { loadSolverConfig } from "./solverConfig";
import type { SolverConfig } from "./solverConfig";
import type { Personnel, Besoin, AppState, Absence } from "@/store/AppContext";

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
  contractScore: number;
  totalScore: number;
  softScore: number;
}

function calculateQualificationScore(personnel: Personnel, besoin: Besoin): number {
  const qualMap: Record<string, string[]> = {
    ambulance: ["ADE"],
    VSL: ["ADE", "VSL"],
    taxi: ["ADE", "AA", "VSL", "REG"],
  };
  const requiredQuals = qualMap[besoin.typePoste] || ["ADE"];
  if (requiredQuals.includes(personnel.qualification.abreviation)) return 20;
  return -20;
}

function calculatePreferenceScore(personnel: Personnel, besoin: Besoin, config: SolverConfig): number {
  if (!config.preferences.respectPreferences) return 0;
  let score = 0;
  if (besoin.quart === "nuit" && personnel.preferenciasNuit) score += config.preferences.nightPreferenceBonus;
  const isWeekend = new Date(besoin.date).getDay() === 0 || new Date(besoin.date).getDay() === 6;
  if (isWeekend && personnel.preferenciasWE) score += config.preferences.wePreferenceBonus;
  return score;
}

function calculateEquityScore(personnel: Personnel, allPersonnel: Personnel[], config: SolverConfig): number {
  if (!config.equity.enableEquityScoring) return 0;
  const equityWeight = config.equity.equityWeight / 100;
  const maxAffectations = Math.max(...allPersonnel.map((p) => p.affectationsCount));
  if (maxAffectations === 0) return 50;
  return (1 - personnel.affectationsCount / maxAffectations) * 50 * equityWeight;
}

function getPlannedWeeklyHours(personnel: Personnel, besoins: Besoin[], currentDate: string): number {
  const weekStart = new Date(currentDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekEndStr = weekEnd.toISOString().split('T')[0];
  let total = 0;
  besoins.forEach((b) => {
    if (b.personnelAffecte.includes(personnel.id) && b.date >= weekStartStr && b.date <= weekEndStr) total += 8;
  });
  return total;
}

function getPlannedWeeklyDays(personnel: Personnel, besoins: Besoin[], currentDate: string): number {
  const weekStart = new Date(currentDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekEndStr = weekEnd.toISOString().split('T')[0];
  const days = new Set<string>();
  besoins.forEach((b) => {
    if (b.personnelAffecte.includes(personnel.id) && b.date >= weekStartStr && b.date <= weekEndStr) days.add(b.date);
  });
  return days.size;
}

/**
 * Calcule le score de contrat pour une affectation
 * Utilise les champs weeklyContractHours et weeklyExpectedDays du Personnel
 * - Pénalise les dépassements d'heures
 * - Favorise les salariés en déficit d'heures
 */
function calculateContractScore(
  personnel: Personnel,
  besoin: Besoin,
  besoins: Besoin[],
  config: SolverConfig
): number {
  if (!config.contract.enableContractCompliance) return 0;

  const weeklyHours = getPlannedWeeklyHours(personnel, besoins, besoin.date);
  const weeklyDays = getPlannedWeeklyDays(personnel, besoins, besoin.date);

  // Utilise les champs individuels du personnel
  const contractHours = personnel.weeklyContractHours || 35;
  const expectedDays = personnel.weeklyExpectedDays || 5;

  const hoursGap = weeklyHours - contractHours;
  const daysGap = weeklyDays - expectedDays;

  let score = 0;
  score += Math.max(0, hoursGap) * -2;
  score += Math.min(0, hoursGap) * 2;
  score += Math.max(0, daysGap) * -2;
  score += Math.min(0, daysGap) * 2;
  if (weeklyHours < contractHours * 0.9) score += 5;
  return score;
}

function calculateSoftScore(personnel: Personnel, besoin: Besoin, allPersonnel: Personnel[]): number {
  let soft = 0;
  const minAffect = Math.min(...allPersonnel.map((p) => p.affectationsCount));
  soft += Math.max(0, 5 - Math.abs(personnel.affectationsCount - minAffect));
  if (besoin.quart === "nuit" && personnel.preferenciasNuit) soft += 3;
  if (personnel.affectationsCount > 5) soft -= 2;
  return soft;
}

function calculateTotalScore(
  personnel: Personnel,
  besoin: Besoin,
  allPersonnel: Personnel[],
  besoinsList: Besoin[],
  config: SolverConfig
): ScoringBreakdown {
  const baseScore = 50;
  const equityScore = calculateEquityScore(personnel, allPersonnel, config);
  const preferenceScore = calculatePreferenceScore(personnel, besoin, config);
  const qualificationScore = calculateQualificationScore(personnel, besoin);
  const contractScore = calculateContractScore(personnel, besoin, besoinsList, config);
  const softScore = calculateSoftScore(personnel, besoin, allPersonnel);
  const totalScore = Math.max(0, Math.min(100, baseScore + equityScore + preferenceScore + qualificationScore + contractScore + softScore));
  return { baseScore, equityScore, preferenceScore, qualificationScore, contractScore, totalScore, softScore };
}

function checkConstraints(personnel: Personnel): { valid: boolean; reason?: string } {
  if (personnel.restrictions.length > 0) return { valid: false, reason: "Restrictions médicales actives" };
  if (personnel.statut !== "disponible") return { valid: false, reason: "Statut non disponible" };
  if (!personnel.actif) return { valid: false, reason: "Personnel inactif" };
  return { valid: true };
}

function generateCandidates(besoin: Besoin, personnel: Personnel[], allBesoins: Besoin[], config: SolverConfig): Array<{ personnel: Personnel; score: ScoringBreakdown }> {
  const candidates: Array<{ personnel: Personnel; score: ScoringBreakdown }> = [];
  for (const p of personnel) {
    if (besoin.personnelAffecte.includes(p.id)) continue;
    if (!checkConstraints(p).valid) continue;
    const score = calculateTotalScore(p, besoin, personnel, allBesoins, config);
    candidates.push({ personnel: p, score });
  }
  candidates.sort((a, b) => b.score.totalScore - a.score.totalScore);
  return candidates;
}

function solveForNeed(besoin: Besoin, personnel: Personnel[], allBesoins: Besoin[], config: SolverConfig): Assignment[] {
  const assignments: Assignment[] = [];
  const needed = besoin.personnelRequis - besoin.personnelAffecte.length;
  if (needed <= 0) return assignments;
  const candidates = generateCandidates(besoin, personnel, allBesoins, config);
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

export function solvePlanning(state: AppState, config?: SolverConfig): SolverResult {
  const startTime = performance.now();
  const solverConfig = config || loadSolverConfig();
  const { besoins, personnel } = state;
  const date = state.selectedDate;
  const needsForDate = besoins.filter((b) => b.date === date && b.statut !== "complete");
  const availablePersonnel = [...personnel].filter((p) => p.statut === "disponible" && p.actif).sort((a, b) => a.affectationsCount - b.affectationsCount);
  const allAssignments: Assignment[] = [];
  const uncoveredNeeds: Besoin[] = [];
  const warnings: string[] = [];

  for (const besoin of needsForDate) {
    const needed = besoin.personnelRequis - besoin.personnelAffecte.length;
    if (needed <= 0) continue;
    const needAssignments = solveForNeed(besoin, availablePersonnel, besoins, solverConfig);
    if (needAssignments.length < needed) {
      uncoveredNeeds.push(besoin);
      warnings.push(`${besoin.service}: ${needed - needAssignments.length}/${needed} non couvert(s)`);
    }
    allAssignments.push(...needAssignments);
  }

  if (solverConfig.equity.enableEquityScoring) {
    const counts = allAssignments.reduce((acc, a) => { acc.set(a.personnelId, (acc.get(a.personnelId) || 0) + 1); return acc; }, new Map<string, number>());
    const vals = Array.from(counts.values());
    const gap = vals.length > 0 ? Math.max(...vals) - Math.min(...vals) : 0;
    if (gap > solverConfig.equity.maxAffectationGap) warnings.push(`Écart d'affectations: ${gap} (max: ${solverConfig.equity.maxAffectationGap})`);
  }

  const coveredNeeds = needsForDate.filter((b) => {
    const assigned = allAssignments.filter((a) => a.besoinId === b.id).length;
    return b.personnelAffecte.length + assigned >= b.personnelRequis;
  }).length;
  const partialNeeds = needsForDate.filter((b) => {
    const assigned = allAssignments.filter((a) => a.besoinId === b.id).length;
    const total = b.personnelAffecte.length + assigned;
    return total > 0 && total < b.personnelRequis;
  }).length;

  return {
    success: uncoveredNeeds.length === 0,
    assignments: allAssignments,
    uncoveredNeeds,
    warnings,
    errors: [],
    stats: { totalNeeds: needsForDate.length, coveredNeeds, partialNeeds, uncoveredNeeds: uncoveredNeeds.length, totalAssignments: allAssignments.length, executionTime: performance.now() - startTime },
  };
}

export function applySolverResults(result: SolverResult, dispatch: React.Dispatch<any>): void {
  for (const assignment of result.assignments) {
    dispatch({ type: "AFFECTER_PERSONNEL", payload: { besoinId: assignment.besoinId, personnelId: assignment.personnelId } });
  }
}

export function* solvePlanningStepByStep(state: AppState, config?: SolverConfig): Generator<{ step: number; type: "candidate" | "assignment" | "warning" | "complete"; data: any }, void, unknown> {
  const solverConfig = config || loadSolverConfig();
  const { besoins, personnel } = state;
  const needsForDate = besoins.filter((b) => b.date === state.selectedDate && b.statut !== "complete");
  const availablePersonnel = [...personnel].filter((p) => p.statut === "disponible" && p.actif).sort((a, b) => a.affectationsCount - b.affectationsCount);
  let step = 0;
  for (const besoin of needsForDate) {
    const needed = besoin.personnelRequis - besoin.personnelAffecte.length;
    if (needed <= 0) continue;
    const candidates = generateCandidates(besoin, availablePersonnel, besoins, solverConfig);
    yield { step: ++step, type: "candidate", data: { besoin, candidates: candidates.slice(0, 5) } };
    for (let i = 0; i < Math.min(needed, candidates.length); i++) {
      const { personnel: p, score } = candidates[i];
      yield { step: ++step, type: "assignment", data: { besoin, personnel: p, score } };
    }
  }
  yield { step: ++step, type: "complete", data: { message: "Résolution terminée" } };
}