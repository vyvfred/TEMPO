/**
 * Moteur de Solveur Multi-Objectifs
 * Implémente l'algorithme de résolution pour l'affectation du personnel
 */

import { SolverConfig, DEFAULT_SOLVER_CONFIG, loadSolverConfig } from './solverConfig';
import type { Personnel, Besoin, AppState } from '@/store/AppContext';

// Types pour le solveur
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
}

/**
 * Calcule le score de qualification pour un affectation
 */
function calculateQualificationScore(
  personnel: Personnel,
  besoin: Besoin
): number {
  const qualMap: Record<string, string[]> = {
    'ambulance': ['ADE'], // ADE requis pour ambulance
    'VSL': ['ADE', 'VSL'], // ADE ou VSL pour VSL
    'taxi': ['ADE', 'AA', 'VSL', 'REG'], // Tous types pour taxi
  };
  
  const requiredQuals = qualMap[besoin.typePoste] || ['ADE'];
  const personnelQual = personnel.qualification.abreviation;
  
  if (requiredQuals.includes(personnelQual)) {
    return 20; // Qualification parfaite
  }
  return -20; // Qualification non adaptée
}

/**
 * Calcule le score de préférence pour un affectation
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
  if (besoin.quart === 'nuit' && personnel.preferenciasNuit) {
    score += config.preferences.nightPreferenceBonus;
    reasons.push(`+${config.preferences.nightPreferenceBonus} préf. nuit`);
  }
  
  // Préférence week-end
  const isWeekend = new Date(besoin.date).getDay() === 0 || 
                   new Date(besoin.date).getDay() === 6;
  if (isWeekend && personnel.preferenciasWE) {
    score += config.preferences.wePreferenceBonus;
    reasons.push(`+${config.preferences.wePreferenceBonus} préf. WE`);
  }
  
  return score;
}

/**
 * Calcule le score d'équité pour un affectation
 */
function calculateEquityScore(
  personnel: Personnel,
  allPersonnel: Personnel[],
  config: SolverConfig
): number {
  if (!config.equity.enableEquityScoring) return 0;
  
  // Plus le score d'équité est bas, plus la personne mérite des affectations
  const equityWeight = config.equity.equityWeight / 100;
  const maxAffectations = Math.max(...allPersonnel.map(p => p.affectationsCount));
  const currentAffectations = personnel.affectationsCount;
  
  // Score basé sur la différence avec le max
  if (maxAffectations === 0) return 50;
  
  const gapRatio = 1 - (currentAffectations / maxAffectations);
  return gapRatio * 50 * equityWeight;
}

/**
 * Vérifie les contraintes légales
 */
function checkLegalConstraints(
  personnel: Personnel,
  besoins: Besoin[],
  besoin: Besoin,
  config: SolverConfig
): { valid: boolean; reason?: string } {
  // Statut disponible
  if (personnel.statut !== 'disponible') {
    return { valid: false, reason: 'Statut non disponible' };
  }
  
  if (!personnel.actif) {
    return { valid: false, reason: 'Personnel inactif' };
  }
  
  // Vérifier les nuits consécutives
  if (besoin.quart === 'nuit') {
    const recentNights = besoins.filter(
      b => b.date === besoins[0]?.date && 
           b.quart === 'nuit' && 
           b.personnelAffecte.includes(personnel.id)
    ).length;
    
    if (recentNights >= config.legal.maxConsecutiveNights) {
      return { valid: false, reason: `Max ${config.legal.maxConsecutiveNights} nuits consécutives atteint` };
    }
  }
  
  // Vérifier les restrictions médicales
  if (personnel.restrictions.length > 0) {
    return { valid: false, reason: `Restrictions: ${personnel.restrictions.join(', ')}` };
  }
  
  return { valid: true };
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
  
  // Score de préférences
  const preferenceScore = calculatePreferenceScore(personnel, besoin, config);
  
  // Score de qualification
  const qualificationScore = calculateQualificationScore(personnel, besoin);
  
  // Score total
  const totalScore = Math.max(0, Math.min(100,
    baseScore + equityScore + preferenceScore + qualificationScore
  ));
  
  return {
    baseScore,
    equityScore,
    preferenceScore,
    qualificationScore,
    totalScore,
  };
}

/**
 * Génère tous les candidats possibles pour un besoin
 */
function generateCandidates(
  besoin: Besoin,
  personnel: Personnel[],
  allBesoins: Besoin[],
  config: SolverConfig
): Array<{ personnel: Personnel; score: ScoringBreakdown }> {
  const candidates: Array<{ personnel: Personnel; score: ScoringBreakdown }> = [];
  
  for (const p of personnel) {
    // Ne pas ré-affecter déjà affecté
    if (besoin.personnelAffecte.includes(p.id)) continue;
    
    // Vérifier les contraintes légales
    const constraints = checkLegalConstraints(p, allBesoins, besoin, config);
    if (!constraints.valid) continue;
    
    // Calculer le score
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
  config: SolverConfig
): Assignment[] {
  const assignments: Assignment[] = [];
  const needed = besoin.personnelRequis - besoin.personnelAffecte.length;
  
  if (needed <= 0) return assignments;
  
  // Générer les candidats
  const candidates = generateCandidates(besoin, personnel, allBesoins, config);
  
  // Affecter les meilleurs candidats
  for (let i = 0; i < Math.min(needed, candidates.length); i++) {
    const { personnel: p, score } = candidates[i];
    
    assignments.push({
      besoinId: besoin.id,
      personnelId: p.id,
      score: score.totalScore,
      reasons: [
        score.equityScore > 0 ? 'Équité respectée' : '',
        score.preferenceScore > 0 ? 'Préférence respectée' : '',
        score.qualificationScore > 0 ? 'Qualification adaptée' : '',
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
  
  const { besoins, personnel } = state;
  const date = state.selectedDate;
  
  // Filtrer les besoins pour la date sélectionnée
  const needsForDate = besoins.filter(b => 
    b.date === date && 
    b.statut !== 'complete'
  );
  
  // Personnel disponible trié par score d'équité (les plus нуждающиеся en premier)
  const availablePersonnel = [...personnel]
    .filter(p => p.statut === 'disponible' && p.actif)
    .sort((a, b) => a.affectationsCount - b.affectationsCount);
  
  const allAssignments: Assignment[] = [];
  const uncoveredNeeds: Besoin[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Traiter chaque besoin
  for (const besoin of needsForDate) {
    const needed = besoin.personnelRequis - besoin.personnelAffecte.length;
    
    if (needed <= 0) continue;
    
    // Résoudre pour ce besoin
    const needAssignments = solveForNeed(besoin, availablePersonnel, besoins, solverConfig);
    
    if (needAssignments.length < needed) {
      uncoveredNeeds.push(besoin);
      warnings.push(
        `${besoin.service}: ${needed - needAssignments.length}/${needed} non couvert(s)`
      );
    }
    
    allAssignments.push(...needAssignments);
  }
  
  // Vérifier l'écart d'équité
  if (solverConfig.equity.enableEquityScoring) {
    const assignedIds = allAssignments.map(a => a.personnelId);
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
  
  // Calculer les statistiques
  const coveredNeeds = needsForDate.filter(b => {
    const assigned = allAssignments.filter(a => a.besoinId === b.id).length;
    const total = b.personnelAffecte.length + assigned;
    return total >= b.personnelRequis;
  }).length;
  
  const partialNeeds = needsForDate.filter(b => {
    const assigned = allAssignments.filter(a => a.besoinId === b.id).length;
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
 * Applique les résultats du solveur à l'état de l'application
 */
export function applySolverResults(
  result: SolverResult,
  dispatch: React.Dispatch<any>
): void {
  for (const assignment of result.assignments) {
    dispatch({
      type: 'AFFECTER_PERSONNEL',
      payload: {
        besoinId: assignment.besoinId,
        personnelId: assignment.personnelId,
      },
    });
  }
}

/**
 * Mode pas à pas - retourne un seul candidat à la fois
 */
export function* solvePlanningStepByStep(
  state: AppState,
  config?: SolverConfig
): Generator<{
  step: number;
  type: 'candidate' | 'assignment' | 'warning' | 'complete';
  data: any;
}, void, unknown> {
  const solverConfig = config || loadSolverConfig();
  const { besoins, personnel } = state;
  const date = state.selectedDate;
  
  const needsForDate = besoins.filter(b => b.date === date && b.statut !== 'complete');
  const availablePersonnel = [...personnel]
    .filter(p => p.statut === 'disponible' && p.actif)
    .sort((a, b) => a.affectationsCount - b.affectationsCount);
  
  let step = 0;
  
  for (const besoin of needsForDate) {
    const needed = besoin.personnelRequis - besoin.personnelAffecte.length;
    if (needed <= 0) continue;
    
    const candidates = generateCandidates(besoin, availablePersonnel, besoins, solverConfig);
    
    yield {
      step: ++step,
      type: 'candidate',
      data: {
        besoin,
        candidates: candidates.slice(0, 5), // Top 5
      },
    };
    
    for (let i = 0; i < Math.min(needed, candidates.length); i++) {
      const { personnel: p, score } = candidates[i];
      
      yield {
        step: ++step,
        type: 'assignment',
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
    type: 'complete',
    data: { message: 'Résolution terminée' },
  };
}