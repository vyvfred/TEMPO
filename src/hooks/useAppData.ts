import { useEffect } from 'react';
import { useAppState, Personnel, Besoin } from '@/store/AppContext';

// Données de démonstration réalistes
const mockPersonnel: Personnel[] = [
  { id: 'p1', nom: 'Martin', prenom: 'Sophie', qualification: 'Ambulancière DE', statut: 'disponible' },
  { id: 'p2', nom: 'Bernard', prenom: 'Pierre', qualification: 'Ambulancier DE', statut: 'en-poste' },
  { id: 'p3', nom: 'Dubois', prenom: 'Marie', qualification: 'Ambulancière DE', statut: 'disponible' },
  { id: 'p4', nom: 'Thomas', prenom: 'Lucas', qualification: 'Auxiliaire ambulance', statut: 'disponible' },
  { id: 'p5', nom: 'Robert', prenom: 'Julie', qualification: 'Ambulancière DE', statut: 'conge' },
  { id: 'p6', nom: 'Petit', prenom: 'Nicolas', qualification: 'Ambulancier DE', statut: 'disponible' },
  { id: 'p7', nom: 'Roux', prenom: 'Claire', qualification: 'Ambulancière DE', statut: 'en-poste' },
  { id: 'p8', nom: 'Moreau', prenom: 'Antoine', qualification: 'Auxiliaire ambulance', statut: 'absent' },
  { id: 'p9', nom: 'Leroy', prenom: 'Camille', qualification: 'Ambulancière DE', statut: 'disponible' },
  { id: 'p10', nom: 'Durand', prenom: 'Maxime', qualification: 'Ambulancier DE', statut: 'disponible' },
];

const today = new Date().toISOString().split('T')[0];

const mockBesoins: Besoin[] = [
  { id: 'b1', date: today, service: 'Urgences', typePoste: 'ambulance', quart: 'matin', personnelRequis: 2, personnelAffecte: ['p1', 'p2'], statut: 'complete' },
  { id: 'b2', date: today, service: 'Radiologie', typePoste: 'VSL', quart: 'matin', personnelRequis: 1, personnelAffecte: ['p3'], statut: 'complete' },
  { id: 'b3', date: today, service: 'Cardiologie', typePoste: 'ambulance', quart: 'matin', personnelRequis: 2, personnelAffecte: ['p4'], statut: 'partiel' },
  { id: 'b4', date: today, service: 'Dialyse', typePoste: 'VSL', quart: 'apres-midi', personnelRequis: 1, personnelAffecte: [], statut: 'non-couvert' },
  { id: 'b5', date: today, service: 'Urgences', typePoste: 'ambulance', quart: 'apres-midi', personnelRequis: 2, personnelAffecte: ['p6', 'p7'], statut: 'complete' },
  { id: 'b6', date: today, service: 'Scanner', typePoste: 'Taxis', quart: 'apres-midi', personnelRequis: 1, personnelAffecte: ['p9'], statut: 'complete' },
  { id: 'b7', date: today, service: 'Réanimation', typePoste: 'ambulance', quart: 'nuit', personnelRequis: 2, personnelAffecte: [], statut: 'non-couvert' },
  { id: 'b8', date: today, service: 'Chirurgie', typePoste: 'ambulance', quart: 'nuit', personnelRequis: 1, personnelAffecte: ['p10'], statut: 'complete' },
];

export function useAppData() {
  const { state, dispatch } = useAppState();

  useEffect(() => {
    // Chargement initial des données mockées
    dispatch({ type: 'SET_PERSONNEL', payload: mockPersonnel });
    dispatch({ type: 'SET_BESOINS', payload: mockBesoins });
  }, [dispatch]);

  return {
    personnel: state.personnel,
    besoins: state.besoins,
    currentAgence: state.currentAgence,
    selectedDate: state.selectedDate,
    user: state.user,
    dispatch,
  };
}