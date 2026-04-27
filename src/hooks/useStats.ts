import { useMemo } from 'react';
import { useAppState, Besoin, Personnel, Activite, Tache, Absence } from '@/store/AppContext';

export interface Stats {
  totalBesoins: number;
  besoinsComplets: number;
  besoinsPartiels: number;
  besoinsNonCouverts: number;
  tauxCouverture: number;
  
  totalPersonnel: number;
  disponibles: number;
  enPoste: number;
  enConge: number;
  enFormation: number;
  absents: number;
  
  totalActivites: number;
  totalTaches: number;
  totalAbsences: number;
  
  cpRestantsTotal: number;
  rttRestantsTotal: number;
  rcRestantsTotal: number;
}

export function useStats(): Stats {
  const { state } = useAppState();
  const { besoins, personnel, activites, taches, absences } = state;

  return useMemo(() => {
    const today = state.selectedDate;
    const besoinsDuJour = besoins.filter(b => b.date === today);
    
    const totalBesoins = besoinsDuJour.length;
    const besoinsComplets = besoinsDuJour.filter(b => b.statut === 'complete').length;
    const besoinsPartiels = besoinsDuJour.filter(b => b.statut === 'partiel').length;
    const besoinsNonCouverts = besoinsDuJour.filter(b => b.statut === 'non-couvert').length;
    const tauxCouverture = totalBesoins > 0 
      ? Math.round((besoinsComplets / totalBesoins) * 100) 
      : 100;

    const totalPersonnel = personnel.filter(p => p.actif).length;
    const disponibles = personnel.filter(p => p.statut === 'disponible').length;
    const enPoste = personnel.filter(p => p.statut === 'en-poste').length;
    const enConge = personnel.filter(p => p.statut === 'conge').length;
    const enFormation = personnel.filter(p => p.statut === 'formation').length;
    const absents = personnel.filter(p => p.statut === 'absent').length;

    const totalActivites = activites.length;
    const totalTaches = taches.length;
    const totalAbsences = absences.length;

    const cpRestantsTotal = personnel.reduce((sum, p) => sum + p.cpRestants, 0);
    const rttRestantsTotal = personnel.reduce((sum, p) => sum + p.rttRestants, 0);
    const rcRestantsTotal = personnel.reduce((sum, p) => sum + p.rcRestants, 0);

    return {
      totalBesoins,
      besoinsComplets,
      besoinsPartiels,
      besoinsNonCouverts,
      tauxCouverture,
      
      totalPersonnel,
      disponibles,
      enPoste,
      enConge,
      enFormation,
      absents,
      
      totalActivites,
      totalTaches,
      totalAbsences,
      
      cpRestantsTotal,
      rttRestantsTotal,
      rcRestantsTotal,
    };
  }, [besoins, personnel, activites, taches, absences, state.selectedDate]);
}

export function useFilteredBesoins(bureauId?: string | null): Besoin[] {
  const { state } = useAppState();
  
  return useMemo(() => {
    const today = state.selectedDate;
    return state.besoins.filter(b => {
      if (b.date !== today) return false;
      if (bureauId && b.bureauId !== bureauId) return false;
      return true;
    });
  }, [state.besoins, state.selectedDate, bureauId]);
}

export function useAvailablePersonnel(bureauId?: string | null): Personnel[] {
  const { state } = useAppState();
  
  return useMemo(() => {
    return state.personnel.filter(p => {
      if (!p.actif) return false;
      if (p.statut !== 'disponible') return false;
      if (bureauId && p.bureauId !== bureauId) return false;
      return true;
    });
  }, [state.personnel, bureauId]);
}