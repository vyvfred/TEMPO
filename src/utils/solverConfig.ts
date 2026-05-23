import type { Besoin, Absence } from '@/store/AppContext';

/* Types */
export interface SolverLegalConstraints {
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  minRestBetweenShifts: number;
  maxConsecutiveNights: number;
}

export interface SolverPreferences {
  respectPreferences: boolean;
  nightPreferenceBonus: number;
  wePreferenceBonus: number;
}

export interface SolverEquity {
  enableEquityScoring: boolean;
  equityWeight: number;
  maxAffectationGap: number;
}

export interface SolverLocking {
  allowManualOverride: boolean;
  lockGeneratedAssignments: boolean;
}

export interface SolverContract {
  enableContractCompliance: boolean;
  weeklyContractHours: number;
  weeklyExpectedDays: number;
}

export interface SolverConfig {
  legal: SolverLegalConstraints;
  preferences: SolverPreferences;
  equity: SolverEquity;
  contract: SolverContract;
  // locking: SolverLocking; // kept for backward compatibility
}

/* Default configuration */
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
    enableContractCompliance: true,
    weeklyContractHours: 35,
    weeklyExpectedDays: 5,
  },
  // locking: { allowManualOverride: true, lockGeneratedAssignments: false },
};

/* Load configuration from localStorage */
export function loadSolverConfig(): SolverConfig {
  try {
    const stored = localStorage.getItem('solver_config');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_SOLVER_CONFIG,
        legal: { ...DEFAULT_SOLVER_CONFIG.legal, ...parsed.legal },
        preferences: { ...DEFAULT_SOLVER_CONFIG.preferences, ...parsed.preferences },
        equity: { ...DEFAULT_SOLVER_CONFIG.equity, ...parsed.equity },
        contract: { ...DEFAULT_SOLVER_CONFIG.contract, ...parsed.contract },
        // locking: { ...DEFAULT_SOLVER_CONFIG.locking, ...parsed.locking },
      };
    }
    return DEFAULT_SOLVER_CONFIG;
  } catch (e) {
    console.warn('Erreur lors du chargement de la config du solveur:', e);
    return DEFAULT_SOLVER_CONFIG;
  }
}

/* Save configuration to localStorage */
export function saveSolverConfig(config: SolverConfig): void {
  localStorage.setItem('solver_config', JSON.stringify(config));
}

/* Validation helpers */
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
    return { valid: false, reason: 'Restrictions médicales actives', severity: 'error' };
  }
  return { valid: true, severity: 'warning' };
}

/**
 * Simple constraint validation (currently only checks medical restrictions)
 */
export function checkLegalConstraints(
  personnel: { id: string; affectationsCount: number; restrictions: string[] },
  besoins: Besoin[],
  besoin: Besoin,
  config: SolverConfig,
  absences: Absence[]
): ConstraintValidation {
  // Simplified: only medical restrictions are checked for now  if (personnel.restrictions.length > 0) {
    return { valid: false, reason: 'Restrictions médicales actives', severity: 'error' };
  }
  return { valid: true, severity: 'warning' };
}