import { SolverLegalConstraints, SolverPreferences, SolverEquity, SolverLocking } from "./solverConfig";

export interface SolverContract {
  enableContractCompliance: boolean; // Activer le contrôle contrat
  weeklyContractHours: number; // Heures de contrat par semaine (ex: 35h)
  weeklyExpectedDays: number; // Jours de travail attendus par semaine (ex: 5)
}

export interface SolverConfig {
  legal: SolverLegalConstraints;
  preferences: SolverPreferences;
  equity: SolverEquity;
  contract: SolverContract; // Ajout du contrôle contrat
  locking: SolverLocking;
}

// Configuration par défaut
export const DEFAULT_SOLVER_CONFIG: SolverConfig = {
  legal: {
    maxHoursPerDay: 10,
    maxHoursPerWeek: 48,
    minRestBetweenShifts: 11,
    maxConsecutiveNights: 3,
  },
  preferences: {
    respectPreferences: true,
    nightPreferenceBonus: 15,
    wePreferenceBonus: 10,
  },
  equity: {
    enableEquityScoring: true,
    equityWeight: 30,
    maxAffectationGap: 5,
  },
  contract: {
    enableContractCompliance: true, // Activer le contrôle contrat
    weeklyContractHours: 35, // Heures de contrat par semaine
    weeklyExpectedDays: 5, // Jours de travail attendus par semaine
  },
  locking: {
    allowManualOverride: true,
    lockGeneratedAssignments: false,
  },
};

/**
 * Charger la configuration depuis localStorage
 */
export function loadSolverConfig(): SolverConfig {
  try {
    const stored = localStorage.getItem('solver_config');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        legal: { ...DEFAULT_SOLVER_CONFIG.legal, ...parsed.legal },
        preferences: { ...DEFAULT_SOLVER_CONFIG.preferences, ...parsed.preferences },
        equity: { ...DEFAULT_SOLVER_CONFIG.equity, ...parsed.equity },
        contract: { ...DEFAULT_SOLVER_CONFIG.contract, ...parsed.contract },
        locking: { ...DEFAULT_SOLVER_CONFIG.locking, ...parsed.locking },
      };
    }
  } catch (e) {
    console.warn('Erreur lors du chargement de la config du solveur:', e);
  }
  return DEFAULT_SOLVER_CONFIG;
}

/**
 * Sauvegarder la configuration dans localStorage
 */
export function saveSolverConfig(config: SolverConfig): void {
  localStorage.setItem('solver_config', JSON.stringify(config));
}

/**
 * Validation des contraintes légales
 */
export interface ConstraintValidation {
  valid: boolean;
  reason?: string;
  severity: 'error' | 'warning';
}

export function validateLegalConstraints(
  personnel: { id: string; affectationsCount: number; restrictions: string[] },
  config: SolverLegalConstraints
): ConstraintValidation {
  // Vérifier les restrictions médicales
  if (personnel.restrictions.length > 0) {
    return {
      valid: false,
      reason: 'Restrictions médicales actives',
      severity: 'error',
    };
  }
  
  return { valid: true, severity: 'warning' };
}