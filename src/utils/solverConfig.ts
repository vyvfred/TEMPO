/**
 * Configuration du Solveur de Planning
 * Gère les paramètres de contraintes, préférences, équité et verrouillage
 */

// Types pour la configuration
export interface SolverLegalConstraints {
  maxHoursPerDay: number;      // Heures max par jour
  maxHoursPerWeek: number;     // Heures max par semaine
  minRestBetweenShifts: number; // Repos minimum entre postes (heures)
  maxConsecutiveNights: number; // Nuits consécutives max
}

export interface SolverPreferences {
  respectPreferences: boolean; // Respecter les préférences
  nightPreferenceBonus: number; // Bonus préférence nuit (points)
  wePreferenceBonus: number;    // Bonus préférence week-end (points)
}

export interface SolverEquity {
  enableEquityScoring: boolean; // Activer le scoring d'équité
  equityWeight: number;          // Pondération équité (0-100%)
  maxAffectationGap: number;    // Écart max d'affectations
}

export interface SolverLocking {
  allowManualOverride: boolean;     // Autoriser les overrides manuels
  lockGeneratedAssignments: boolean; // Verrouiller après génération
}

export interface SolverConfig {
  legal: SolverLegalConstraints;
  preferences: SolverPreferences;
  equity: SolverEquity;
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