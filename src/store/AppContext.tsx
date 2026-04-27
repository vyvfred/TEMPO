import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

// Types pour les données métier
export interface Personnel {
  id: string;
  nom: string;
  prenom: string;
  qualification: string;
  statut: 'disponible' | 'en-poste' | 'conge' | 'absent';
  affectations?: string[];
}

export interface Besoin {
  id: string;
  date: string;
  service: string;
  typePoste: 'ambulance' | 'VSL' | 'Taxis';
  quart: 'matin' | 'apres-midi' | 'nuit';
  personnelRequis: number;
  personnelAffecte: string[];
  statut: 'non-couvert' | 'partiel' | 'complete';
}

export interface Agence {
  id: string;
  nom: string;
  code: string;
}

export interface AppState {
  currentAgence: Agence;
  personnel: Personnel[];
  besoins: Besoin[];
  selectedDate: string;
  user: {
    nom: string;
    prenom: string;
    role: string;
  };
}

type AppAction =
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_PERSONNEL'; payload: Personnel[] }
  | { type: 'SET_BESOINS'; payload: Besoin[] }
  | { type: 'AFFECTER_PERSONNEL'; payload: { besoinId: string; personnelId: string } };

// Données initiales
const initialState: AppState = {
  currentAgence: { id: 'sgxv', nom: 'Agence SGXV', code: 'SGXV' },
  personnel: [],
  besoins: [],
  selectedDate: new Date().toISOString().split('T')[0],
  user: { nom: 'Dupont', prenom: 'Jean', role: 'Régulateur' },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_PERSONNEL':
      return { ...state, personnel: action.payload };
    case 'SET_BESOINS':
      return { ...state, besoins: action.payload };
    case 'AFFECTER_PERSONNEL':
      return {
        ...state,
        besoins: state.besoins.map(b =>
          b.id === action.payload.besoinId
            ? { ...b, personnelAffecte: [...b.personnelAffecte, action.payload.personnelId] }
            : b
        ),
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Chargement initial des données mockées
  useEffect(() => {
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

    dispatch({ type: 'SET_PERSONNEL', payload: mockPersonnel });
    dispatch({ type: 'SET_BESOINS', payload: mockBesoins });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
}