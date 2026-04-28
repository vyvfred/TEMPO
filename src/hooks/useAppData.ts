import { useEffect } from 'react';
import { useAppState, Personnel, Besoin } from '@/store/AppContext';

// Données de démonstration réalistes
const mockPersonnel: Personnel[] = [
  { id: 'p1', nom: 'Martin', prenom: 'Sophie', dateNaissance: '1985-03-15', telephone: '06 12 34 56 78', email: 'sophie.martin@ambuplan.fr', qualificationId: 'q1', qualification: { id: 'q1', nom: 'Ambulancière DE', abreviation: 'ADE' }, statut: 'disponible', bureauId: 'b1', restrictions: [], preferenciasNuit: true, preferenciasWE: false, actif: true, cpRestants: 18, rttRestants: 5, rcRestants: 2, affectationsCount: 0, equidadScore: 100 },
  { id: 'p2', nom: 'Bernard', prenom: 'Pierre', dateNaissance: '1978-07-22', telephone: '06 23 45 67 89', email: 'pierre.bernard@ambuplan.fr', qualificationId: 'q1', qualification: { id: 'q1', nom: 'Ambulancier DE', abreviation: 'ADE' }, statut: 'en-poste', bureauId: 'b1', restrictions: [], preferenciasNuit: false, preferenciasWE: true, actif: true, cpRestants: 22, rttRestants: 8, rcRestants: 3, affectationsCount: 0, equidadScore: 100 },
  { id: 'p3', nom: 'Dubois', prenom: 'Marie', dateNaissance: '1990-11-08', telephone: '06 34 56 78 90', email: 'marie.dubois@ambuplan.fr', qualificationId: 'q2', qualification: { id: 'q2', nom: 'Auxiliaire Ambulancier', abreviation: 'AA' }, statut: 'disponible', bureauId: 'b1', restrictions: [], preferenciasNuit: true, preferenciasWE: false, actif: true, cpRestants: 15, rttRestants: 4, rcRestants: 1, affectationsCount: 0, equidadScore: 100 },
  { id: 'p4', nom: 'Thomas', prenom: 'Lucas', dateNaissance: '1988-05-30', telephone: '06 45 67 89 01', email: 'lucas.thomas@ambuplan.fr', qualificationId: 'q1', qualification: { id: 'q1', nom: 'Ambulancier DE', abreviation: 'ADE' }, statut: 'disponible', bureauId: 'b2', restrictions: [], preferenciasNuit: false, preferenciasWE: true, actif: true, cpRestants: 20, rttRestants: 6, rcRestants: 4, affectationsCount: 0, equidadScore: 100 },
  { id: 'p5', nom: 'Robert', prenom: 'Julie', dateNaissance: '1992-09-12', telephone: '06 56 78 90 12', email: 'julie.robert@ambuplan.fr', qualificationId: 'q3', qualification: { id: 'q3', nom: 'Ambulancière VSL', abreviation: 'VSL' }, statut: 'conge', bureauId: 'b1', restrictions: [], preferenciasNuit: false, preferenciasWE: false, actif: true, cpRestants: 12, rttRestants: 3, rcRestants: 0, affectationsCount: 0, equidadScore: 100 },
  { id: 'p6', nom: 'Petit', prenom: 'Nicolas', dateNaissance: '1982-01-25', telephone: '06 67 89 01 23', email: 'nicolas.petit@ambuplan.fr', qualificationId: 'q1', qualification: { id: 'q1', nom: 'Ambulancier DE', abreviation: 'ADE' }, statut: 'disponible', bureauId: 'b2', restrictions: [], preferenciasNuit: true, preferenciasWE: true, actif: true, cpRestants: 25, rttRestants: 9, rcRestants: 5, affectationsCount: 0, equidadScore: 100 },
  { id: 'p7', nom: 'Roux', prenom: 'Claire', dateNaissance: '1995-12-03', telephone: '06 78 90 12 34', email: 'claire.roux@ambuplan.fr', qualificationId: 'q2', qualification: { id: 'q2', nom: 'Auxiliaire Ambulancier', abreviation: 'AA' }, statut: 'en-poste', bureauId: 'b3', restrictions: [], preferenciasNuit: false, preferenciasWE: false, actif: true, cpRestants: 10, rttRestants: 2, rcRestants: 1, affectationsCount: 0, equidadScore: 100 },
  { id: 'p8', nom: 'Moreau', prenom: 'Antoine', dateNaissance: '1987-06-18', telephone: '06 89 01 23 45', email: 'antoine.moreau@ambuplan.fr', qualificationId: 'q4', qualification: { id: 'q4', nom: 'Régulation', abreviation: 'REG' }, statut: 'absent', bureauId: 'b1', restrictions: [], preferenciasNuit: true, preferenciasWE: true, actif: true, cpRestants: 28, rttRestants: 7, rcRestants: 3, affectationsCount: 0, equidadScore: 100 },
  { id: 'p9', nom: 'Leroy', prenom: 'Camille', dateNaissance: '1991-04-27', telephone: '06 90 12 34 56', email: 'camille.leroy@ambuplan.fr', qualificationId: 'q1', qualification: { id: 'q1', nom: 'Ambulancière DE', abreviation: 'ADE' }, statut: 'disponible', bureauId: 'b3', restrictions: [], preferenciasNuit: true, preferenciasWE: false, actif: true, cpRestants: 16, rttRestants: 5, rcRestants: 2, affectationsCount: 0, equidadScore: 100 },
  { id: 'p10', nom: 'Durand', prenom: 'Maxime', dateNaissance: '1984-08-14', telephone: '06 01 23 45 67', email: 'maxime.durand@ambuplan.fr', qualificationId: 'q1', qualification: { id: 'q1', nom: 'Ambulancier DE', abreviation: 'ADE' }, statut: 'disponible', bureauId: 'b2', restrictions: [], preferenciasNuit: false, preferenciasWE: true, actif: true, cpRestants: 24, rttRestants: 8, rcRestants: 4, affectationsCount: 0, equidadScore: 100 },
];

const today = new Date().toISOString().split('T')[0];

const mockBesoins: Besoin[] = [
  { id: 'b1', date: today, bureauId: 'b1', service: 'Urgences', typePoste: 'ambulance', quart: 'matin', personnelRequis: 2, personnelAffecte: ['p1', 'p2'], statut: 'complete', recurrente: true },
  { id: 'b2', date: today, bureauId: 'b1', service: 'Radiologie', typePoste: 'VSL', quart: 'matin', personnelRequis: 1, personnelAffecte: ['p3'], statut: 'complete', recurrente: true },
  { id: 'b3', date: today, bureauId: 'b2', service: 'Cardiologie', typePoste: 'ambulance', quart: 'matin', personnelRequis: 2, personnelAffecte: ['p4'], statut: 'partiel', recurrente: true },
  { id: 'b4', date: today, bureauId: 'b3', service: 'Dialyse', typePoste: 'VSL', quart: 'apres-midi', personnelRequis: 1, personnelAffecte: [], statut: 'non-couvert', recurrente: true },
  { id: 'b5', date: today, bureauId: 'b1', service: 'Urgences', typePoste: 'ambulance', quart: 'apres-midi', personnelRequis: 2, personnelAffecte: ['p6', 'p7'], statut: 'complete', recurrente: true },
  { id: 'b6', date: today, bureauId: 'b1', service: 'Scanner', typePoste: 'taxi', quart: 'apres-midi', personnelRequis: 1, personnelAffecte: ['p9'], statut: 'complete', recurrente: true },
  { id: 'b7', date: today, bureauId: 'b2', service: 'Réanimation', typePoste: 'ambulance', quart: 'nuit', personnelRequis: 2, personnelAffecte: [], statut: 'non-couvert', recurrente: true },
  { id: 'b8', date: today, bureauId: 'b1', service: 'Chirurgie', typePoste: 'ambulance', quart: 'nuit', personnelRequis: 1, personnelAffecte: ['p10'], statut: 'complete', recurrente: true },
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