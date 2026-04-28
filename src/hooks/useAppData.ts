import { useEffect } from 'react';
import { useAppState, Personnel, Besoin } from '@/store/AppContext';

// Ce hook n'est plus utilisé - les données sont chargées directement dans AppContext
// Conservation du fichier pour référence future si nécessaire

export function useAppData() {
  const { state, dispatch } = useAppState();

  // Les données sont déjà chargées dans AppContext via loadMockData
  // Ce hook était utilisé pour charger des données mockées supplémentaires
  
  return {
    personnel: state.personnel,
    besoins: state.besoins,
    currentAgence: state.currentAgence,
    selectedDate: state.selectedDate,
    user: state.user,
    dispatch,
  };
}