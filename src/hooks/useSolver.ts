/**
 * Hook useSolver - Interface React pour le solveur de planning
 */

import { useState, useCallback, useRef } from 'react';
import { solvePlanning, applySolverResults, solvePlanningStepByStep, SolverResult, Assignment } from '@/utils/solverEngine';
import { loadSolverConfig, SolverConfig } from '@/utils/solverConfig';
import { useAppState } from '@/store/AppContext';
import { toast } from 'sonner';

export interface UseSolverReturn {
  // État
  isSolving: boolean;
  result: SolverResult | null;
  config: SolverConfig;
  
  // Méthodes
  runSolver: (options?: SolverOptions) => Promise<SolverResult>;
  runStepByStep: () => Generator<any>;
  clearResults: () => void;
  refreshConfig: () => void;
}

export interface SolverOptions {
  showToasts?: boolean;
  onComplete?: (result: SolverResult) => void;
  onError?: (error: string) => void;
}

export function useSolver(): UseSolverReturn {
  const { state, dispatch } = useAppState();
  const [isSolving, setIsSolving] = useState(false);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [config, setConfig] = useState<SolverConfig>(loadSolverConfig);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const refreshConfig = useCallback(() => {
    setConfig(loadSolverConfig());
  }, []);
  
  const clearResults = useCallback(() => {
    setResult(null);
  }, []);
  
  const runSolver = useCallback(async (options?: SolverOptions): Promise<SolverResult> => {
    const {
      showToasts = true,
      onComplete,
      onError,
    } = options || {};
    
    // Annuler la résolution précédente si en cours
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setIsSolving(true);
    refreshConfig();
    
    try {
      // Exécuter le solveur (avec un léger délai pour l'UX)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const solverResult = solvePlanning(state, config);
      
      // Appliquer les résultats
      applySolverResults(solverResult, dispatch);
      
      setResult(solverResult);
      
      // Notifications
      if (showToasts) {
        if (solverResult.stats.totalAssignments > 0) {
          toast.success(
            `${solverResult.stats.totalAssignments} affectation(s) effectuée(s)`,
            {
              description: `${solverResult.stats.coveredNeeds}/${solverResult.stats.totalNeeds} besoins couverts`,
            }
          );
        }
        
        if (solverResult.warnings.length > 0) {
          solverResult.warnings.forEach(warning => {
            toast.warning(warning);
          });
        }
        
        if (solverResult.uncoveredNeeds.length > 0) {
          toast.error(
            `${solverResult.uncoveredNeeds.length} besoin(s) restent non couverts`,
            {
              description: `Exécution en ${solverResult.stats.executionTime.toFixed(0)}ms`,
            }
          );
        }
      }
      
      onComplete?.(solverResult);
      
      return solverResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      if (showToasts) {
        toast.error(`Erreur du solveur: ${errorMessage}`);
      }
      
      onError?.(errorMessage);
      throw error;
    } finally {
      setIsSolving(false);
      abortControllerRef.current = null;
    }
  }, [state, config, dispatch, refreshConfig]);
  
  const runStepByStep = useCallback(function* () {
    refreshConfig();
    
    for (const step of solvePlanningStepByStep(state, config)) {
      yield step;
    }
  }, [state, config, refreshConfig]);
  
  return {
    isSolving,
    result,
    config,
    runSolver,
    runStepByStep,
    clearResults,
    refreshConfig,
  };
}

/**
 * Hook pour analyser l'équité de la répartition actuelle
 */
export function useEquityAnalysis() {
  const { state } = useAppState();
  const { personnel, besoins } = state;
  
  const analysis = useCallback(() => {
    const today = state.selectedDate;
    const besoinsDuJour = besoins.filter(b => b.date === today);
    
    // Compter les affectations par personne
    const affectationCounts = new Map<string, number>();
    
    for (const besoin of besoinsDuJour) {
      for (const pId of besoin.personnelAffecte) {
        affectationCounts.set(pId, (affectationCounts.get(pId) || 0) + 1);
      }
    }
    
    // Statistiques
    const counts = Array.from(affectationCounts.values());
    const total = counts.reduce((a, b) => a + b, 0);
    const moyenne = counts.length > 0 ? total / counts.length : 0;
    const max = counts.length > 0 ? Math.max(...counts) : 0;
    const min = counts.length > 0 ? Math.min(...counts) : 0;
    const ecart = max - min;
    
    // Personnel le plus/moins chargé
    const charged = personnel.filter(p => affectationCounts.has(p.id));
    const chargedSorted = [...charged].sort((a, b) => 
      (affectationCounts.get(b.id) || 0) - (affectationCounts.get(a.id) || 0)
    );
    
    return {
      totalAffectations: total,
      moyenne: Math.round(moyenne * 10) / 10,
      max,
      min,
      ecart,
      plusCharge: chargedSorted[0],
      moinsCharge: chargedSorted[chargedSorted.length - 1],
      personneCounts: Object.fromEntries(affectationCounts),
    };
  }, [personnel, besoins, state.selectedDate]);
  
  return { analyze: analysis };
}