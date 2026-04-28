import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

// ============ TYPES ============
export interface Agence {
  id: string;
  nom: string;
  code: string;
  couleur: string;
}

export interface Bureau {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  responsable: string;
}

export interface Qualification {
  id: string;
  nom: string;
  abreviation: string;
}

export interface Personnel {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  telephone: string;
  email: string;
  qualificationId: string;
  qualification: Qualification;
  statut: 'disponible' | 'en-poste' | 'conge' | 'absent' | 'formation';
  bureauId: string;
  restrictions: string[];
  preferenciasNuit: boolean;
  preferenciasWE: boolean;
  actif: boolean;
  // Absences
  cpRestants: number;
  rttRestants: number;
  rcRestants: number;
  // Stats
  affectationsCount: number;
  equidadScore: number;
}

export interface Besoin {
  id: string;
  date: string;
  bureauId: string;
  service: string;
  typePoste: 'ambulance' | 'VSL' | 'taxi';
  quart: 'matin' | 'apres-midi' | 'nuit';
  personnelRequis: number;
  personnelAffecte: string[];
  statut: 'non-couvert' | 'partiel' | 'complete';
  recurrente: boolean;
  beneficiaire?: string;
}

export interface Activite {
  id: string;
  date: string;
  bureauId: string;
  type: 'UPH' | 'manifestation' | 'permanence' | 'evennement';
  nom: string;
  lieu: string;
  besoins: number;
  affectes: string[];
  statut: 'planifie' | 'en-cours' | 'termine';
  observations?: string;
}

export interface Tache {
  id: string;
  date: string;
  bureauId: string;
  type: 'regulation' | 'formation' | 'entretien' | 'reunion' | 'autre';
  nom: string;
  personnel: string[];
  duree: number; // en heures
  statut: 'planifie' | 'en-cours' | 'termine';
}

export interface Absence {
  id: string;
  personnelId: string;
  dateDebut: string;
  dateFin: string;
  type: 'CP' | 'RTT' | 'RC' | 'maladie' | 'formation' | 'autre';
  statut: 'planifie' | 'en-cours' | 'termine';
  observations?: string;
}

// ============ ETAT ============
export interface AppState {
  currentAgence: Agence;
  bureaux: Bureau[];
  qualifications: Qualification[];
  personnel: Personnel[];
  besoins: Besoin[];
  activites: Activite[];
  taches: Tache[];
  absences: Absence[];
  selectedDate: string;
  selectedBureauId: string | null;
  user: {
    nom: string;
    prenom: string;
    role: string;
  };
}

// ============ ACTIONS ============
type AppAction =
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_BUREAU'; payload: string | null }
  | { type: 'SET_PERSONNEL'; payload: Personnel[] }
  | { type: 'ADD_PERSONNEL'; payload: Personnel }
  | { type: 'UPDATE_PERSONNEL'; payload: Personnel }
  | { type: 'DELETE_PERSONNEL'; payload: string }
  | { type: 'SET_BESOINS'; payload: Besoin[] }
  | { type: 'ADD_BESOIN'; payload: Besoin }
  | { type: 'UPDATE_BESOIN'; payload: Besoin }
  | { type: 'DELETE_BESOIN'; payload: string }
  | { type: 'AFFECTER_PERSONNEL'; payload: { besoinId: string; personnelId: string } }
  | { type: 'DESAFFECTER_PERSONNEL'; payload: { besoinId: string; personnelId: string } }
  | { type: 'SET_ACTIVITES'; payload: Activite[] }
  | { type: 'ADD_ACTIVITE'; payload: Activite }
  | { type: 'UPDATE_ACTIVITE'; payload: Activite }
  | { type: 'DELETE_ACTIVITE'; payload: string }
  | { type: 'SET_TACHES'; payload: Tache[] }
  | { type: 'ADD_TACHE'; payload: Tache }
  | { type: 'UPDATE_TACHE'; payload: Tache }
  | { type: 'DELETE_TACHE'; payload: string }
  | { type: 'SET_ABSENCES'; payload: Absence[] }
  | { type: 'ADD_ABSENCE'; payload: Absence }
  | { type: 'DELETE_ABSENCE'; payload: string }
  | { type: 'LOAD_FROM_STORAGE'; payload: Partial<AppState> }
  | { type: 'GENERATE_PLANNING'; payload: { date: string } };

// ============ REDUCER ============
const initialState: AppState = {
  currentAgence: { id: 'sgxv', nom: 'Ambuplan Pro', code: 'SGXV', couleur: '#0f766e' },
  bureaux: [
    { id: 'b1', nom: 'Bureau Central', adresse: '123 Rue de la Santé, 75001 Paris', telephone: '01 23 45 67 89', responsable: 'Dr. Martin' },
    { id: 'b2', nom: 'Antenne Nord', adresse: '45 Avenue des Lilas, 75019 Paris', telephone: '01 98 76 54 32', responsable: 'Dr. Dubois' },
    { id: 'b3', nom: 'Antenne Sud', adresse: '78 Boulevard des Fleurs, 75013 Paris', telephone: '01 56 78 90 12', responsable: 'Dr. Bernard' },
  ],
  qualifications: [
    { id: 'q1', nom: 'Ambulancier Diplômé d\'État', abreviation: 'ADE' },
    { id: 'q2', nom: 'Auxiliaire Ambulancier', abreviation: 'AA' },
    { id: 'q3', nom: 'Ambulancier VSL', abreviation: 'VSL' },
    { id: 'q4', nom: 'Régulation', abreviation: 'REG' },
  ],
  personnel: [],
  besoins: [],
  activites: [],
  taches: [],
  absences: [],
  selectedDate: new Date().toISOString().split('T')[0],
  selectedBureauId: null,
  user: { nom: 'Dupont', prenom: 'Jean', role: 'Coordinateur' },
};

// Calcul du statut d'un besoin
function calculateStatut(besoin: Besoin): Besoin['statut'] {
  const count = besoin.personnelAffecte.length;
  if (count === 0) return 'non-couvert';
  if (count < besoin.personnelRequis) return 'partiel';
  return 'complete';
}

// Calcul du score d'équité pour un personnel
function calculateEquidadScore(personnel: Personnel[], affectationsCounts: Map<string, number>): number {
  const values = Array.from(affectationsCounts.values());
  if (values.length === 0) return 100;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  if (avg === 0) return 100;
  return Math.round(avg * 100); // Simplified score based on average
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload };
    
    case 'SET_BUREAU':
      return { ...state, selectedBureauId: action.payload };
    
    case 'SET_PERSONNEL':
      return { ...state, personnel: action.payload };
    
    case 'ADD_PERSONNEL':
      return { ...state, personnel: [...state.personnel, action.payload] };
    
    case 'UPDATE_PERSONNEL':
      return {
        ...state,
        personnel: state.personnel.map(p => 
          p.id === action.payload.id ? action.payload : p
        )
      };
    
    case 'DELETE_PERSONNEL':
      return {
        ...state,
        personnel: state.personnel.filter(p => p.id !== action.payload)
      };
    
    case 'SET_BESOINS':
      return { ...state, besoins: action.payload };
    
    case 'ADD_BESOIN':
      return { ...state, besoins: [...state.besoins, action.payload] };
    
    case 'UPDATE_BESOIN':
      return {
        ...state,
        besoins: state.besoins.map(b => 
          b.id === action.payload.id ? action.payload : b
        )
      };
    
    case 'DELETE_BESOIN':
      return { ...state, besoins: state.besoins.filter(b => b.id !== action.payload) };
    
    case 'AFFECTER_PERSONNEL': {
      const { besoinId, personnelId } = action.payload;
      return {
        ...state,
        besoins: state.besoins.map(b => {
          if (b.id !== besoinId) return b;
          const newAffecte = [...b.personnelAffecte, personnelId];
          return {
            ...b,
            personnelAffecte: newAffecte,
            statut: calculateStatut({ ...b, personnelAffecte: newAffecte })
          };
        }),
        personnel: state.personnel.map(p => {
          if (p.id !== personnelId) return p;
          const newCount = p.affectationsCount + 1;
          return { 
            ...p, 
            statut: 'en-poste' as const,
            affectationsCount: newCount
          };
        }),
      };
    }
    
    case 'DESAFFECTER_PERSONNEL': {
      const { besoinId, personnelId } = action.payload;
      return {
        ...state,
        besoins: state.besoins.map(b => {
          if (b.id !== besoinId) return b;
          const newAffecte = b.personnelAffecte.filter(id => id !== personnelId);
          return {
            ...b,
            personnelAffecte: newAffecte,
            statut: calculateStatut({ ...b, personnelAffecte: newAffecte })
          };
        }),
        personnel: state.personnel.map(p => {
          if (p.id !== personnelId) return p;
          const newCount = Math.max(0, p.affectationsCount - 1);
          const hasOtherAffectation = state.besoins.some(
            b => b.id !== besoinId && b.personnelAffecte.includes(personnelId)
          );
          return { 
            ...p, 
            statut: hasOtherAffectation ? 'en-poste' as const : 'disponible' as const,
            affectationsCount: newCount
          };
        }),
      };
    }
    
    case 'SET_ACTIVITES':
      return { ...state, activites: action.payload };
    
    case 'ADD_ACTIVITE':
      return { ...state, activites: [...state.activites, action.payload] };
    
    case 'UPDATE_ACTIVITE':
      return {
        ...state,
        activites: state.activites.map(a => 
          a.id === action.payload.id ? action.payload : a
        )
      };
    
    case 'DELETE_ACTIVITE':
      return { ...state, activites: state.activites.filter(a => a.id !== action.payload) };
    
    case 'SET_TACHES':
      return { ...state, taches: action.payload };
    
    case 'ADD_TACHE':
      return { ...state, taches: [...state.taches, action.payload] };
    
    case 'UPDATE_TACHE':
      return {
        ...state,
        taches: state.taches.map(t => 
          t.id === action.payload.id ? action.payload : t
        )
      };
    
    case 'DELETE_TACHE':
      return { ...state, taches: state.taches.filter(t => t.id !== action.payload) };
    
    case 'SET_ABSENCES':
      return { ...state, absences: action.payload };
    
    case 'ADD_ABSENCE':
      return { ...state, absences: [...state.absences, action.payload] };
    
    case 'DELETE_ABSENCE':
      return { ...state, absences: state.absences.filter(a => a.id !== action.payload) };
    
    case 'LOAD_FROM_STORAGE':
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
}

// ============ CONTEXT ============
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Chargement des données depuis localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('ambuplan_data');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsed });
      } catch {
        loadMockData(dispatch);
      }
    } else {
      loadMockData(dispatch);
    }
  }, []);

  // Sauvegarde dans localStorage à chaque changement
  useEffect(() => {
    if (state.personnel.length > 0 || state.besoins.length > 0) {
      localStorage.setItem('ambuplan_data', JSON.stringify({
        bureaux: state.bureaux,
        qualifications: state.qualifications,
        personnel: state.personnel,
        besoins: state.besoins,
        activites: state.activites,
        taches: state.taches,
        absences: state.absences,
        selectedDate: state.selectedDate,
        selectedBureauId: state.selectedBureauId,
      }));
    }
  }, [state.personnel, state.besoins, state.activites, state.taches, state.absences, state.selectedDate, state.selectedBureauId]);

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

// ============ MOCK DATA ============
function loadMockData(dispatch: React.Dispatch<AppAction>) {
  const today = new Date().toISOString().split('T')[0];
  
  const mockPersonnel: Personnel[] = [
    { id: 'p1', nom: 'Martin', prenom: 'Sophie', dateNaissance: '1985-03-15', telephone: '06 12 34 56 78', email: 'sophie.martin@ambuplan.fr', qualificationId: 'q1', qualification: { id: 'q1', nom: 'Ambulancier Diplômé d\'État', abreviation: 'ADE' }, statut: 'disponible', bureauId: 'b1', restrictions: [], preferenciasNuit: true, preferenciasWE: false, actif: true, cpRestants: 18, rttRestants: 5, rcRestants: 2, affectationsCount: 45, equidadScore: 92 },
    { id: 'p2', nom: 'Bernard', prenom: 'Pierre', dateNaissance: '1978-07-22', telephone: '06 23 45 67 89', email: 'pierre.bernard@ambuplan.fr', qualificationId: 'q1', qualification: { id: 'q1', nom: 'Ambulancier Diplômé d\'État', abreviation: 'ADE' }, statut: 'en-poste', bureauId: 'b1', restrictions: ['Dos'], preferenciasNuit: false, preferenciasWE: true, actif: true, cpRestants: 22, rttRestants: 8, rcRestants: 3, affectationsCount: 52, equidadScore: 88 },
    { id: 'p3', nom: 'Dubois', prenom: 'Marie', dateNaissance: '1990-11-08', telephone: '06 34 56 78 90', email: 'marie.dubois@ambuplan.fr', qualificationId: 'q2', qualification: { id: 'q2', nom: 'Auxiliaire Ambulancier', abreviation: 'AA' }, statut: 'disponible', bureauId: 'b1', restrictions: [], preferenciasNuit: true, preferenciasWE: false, actif: true, cpRestants: 15, rttRestants: 4, rcRestants: 1, affectationsCount: 38, equidadScore: 95 },
    { id: 'p4', nom: 'Thomas', prenom: 'Lucas', dateNaissance: '1988-05-30', telephone: '06 45 67 89 01', email: 'lucas.thomas@ambuplan.fr', qualificationId: 'q1', qualification: { id: 'q1', nom: 'Ambulancier Diplômé d\'État', abreviation: 'ADE' }, statut: 'disponible', bureauId: 'b2', restrictions: [], preferenciasNuit: false, preferenciasWE: true, actif: true, cpRestants: 20, rttRestants: 6, rcRestants: 4, affectationsCount: 48, equidadScore: 90 },
    { id: 'p5', nom: 'Robert', prenom: 'Julie', dateNaissance: '1992-09-12', telephone: '06 56 78 90 12', email: 'julie.robert@ambuplan.fr', qualificationId: 'q3', qualification: { id: 'q3', nom: 'Ambulancier VSL', abreviation: 'VSL' }, statut: 'conge', bureauId: 'b1', restrictions: [], preferenciasNuit: false, preferenciasWE: false, actif: true, cpRestants: 12, rttRestants: 3, rcRestants: 0, affectationsCount: 25, equidadScore: 100 },
    { id: 'p6', nom: 'Petit', prenom: 'Nicolas', dateNaissance: '1982-01-25', telephone: '06 67 89 01 23', email: 'nicolas.petit@ambuplan.fr', qualificationId: 'q1', qualification: { id: 'q1', nom: 'Ambulancier Diplômé d\'État', abreviation: 'ADE' }, statut: 'disponible', bureauId: 'b2', restrictions: ['Cardiaque'], preferenciasNuit: true, preferenciasWE: true, actif: true, cpRestants: 25, rttRestants: 9, rcRestants: 5, affectationsCount: 55, equidadScore: 85 },
    { id: 'p7', nom: 'Roux', prenom: 'Claire', dateNaissance: '1995-12-03', telephone: '06 78 90 12 34', email: 'claire.roux@ambuplan.fr', qualificationId: 'q2', qualification: { id: 'q2', nom: 'Auxiliaire Ambulancier', abreviation: 'AA' }, statut: 'en-poste', bureauId: 'b3', restrictions: [], preferenciasNuit: false, preferenciasWE: false, actif: true, cpRestants: 10, rttRestants: 2, rcRestants: 1, affectationsCount: 30, equidadScore: 97 },
    { id: 'p8', nom: 'Moreau', prenom: 'Antoine', dateNaissance: '1987-06-18', telephone: '06 89 01 23 45', email: 'antoine.moreau@ambuplan.fr', qualificationId: 'q4', qualification: { id: 'q4', nom: 'Régulation', abreviation: 'REG' }, statut: 'formation', bureauId: 'b1', restrictions: [], preferenciasNuit: true, preferenciasWE: true, actif: true, cpRestants: 28, rttRestants: 7, rcRestants: 3, affectationsCount: 0, equidadScore: 100 },
    { id: 'p9', nom: 'Leroy', prenom: 'Camille', dateNaissance: '1991-04-27', telephone: '06 90 12 34 56', email: 'camille.leroy@ambuplan.fr', qualificationId: 'q1', qualification: { id: 'q1', nom: 'Ambulancier Diplômé d\'État', abreviation: 'ADE' }, statut: 'disponible', bureauId: 'b3', restrictions: [], preferenciasNuit: true, preferenciasWE: false, actif: true, cpRestants: 16, rttRestants: 5, rcRestants: 2, affectationsCount: 42, equidadScore: 93 },
    { id: 'p10', nom: 'Durand', prenom: 'Maxime', dateNaissance: '1984-08-14', telephone: '06 01 23 45 67', email: 'maxime.durand@ambuplan.fr', qualificationId: 'q1', qualification: { id: 'q1', nom: 'Ambulancier Diplômé d\'État', abreviation: 'ADE' }, statut: 'disponible', bureauId: 'b2', restrictions: ['Vertige'], preferenciasNuit: false, preferenciasWE: true, actif: true, cpRestants: 24, rttRestants: 8, rcRestants: 4, affectationsCount: 50, equidadScore: 89 },
  ];

  const mockBesoins: Besoin[] = [
    { id: 'b1', date: today, bureauId: 'b1', service: 'Urgences', typePoste: 'ambulance', quart: 'matin', personnelRequis: 3, personnelAffecte: ['p1', 'p2', 'p4'], statut: 'complete', recurrente: true, beneficiaire: 'Hôpital Central' },
    { id: 'b2', date: today, bureauId: 'b1', service: 'Radiologie', typePoste: 'VSL', quart: 'matin', personnelRequis: 1, personnelAffecte: ['p3'], statut: 'complete', recurrente: true },
    { id: 'b3', date: today, bureauId: 'b2', service: 'Cardiologie', typePoste: 'ambulance', quart: 'matin', personnelRequis: 2, personnelAffecte: ['p6'], statut: 'partiel', recurrente: true },
    { id: 'b4', date: today, bureauId: 'b3', service: 'Dialyse', typePoste: 'VSL', quart: 'apres-midi', personnelRequis: 1, personnelAffecte: [], statut: 'non-couvert', recurrente: true },
    { id: 'b5', date: today, bureauId: 'b1', service: 'Scanner', typePoste: 'taxi', quart: 'apres-midi', personnelRequis: 1, personnelAffecte: ['p9'], statut: 'complete', recurrente: true },
    { id: 'b6', date: today, bureauId: 'b2', service: 'Réanimation', typePoste: 'ambulance', quart: 'nuit', personnelRequis: 2, personnelAffecte: [], statut: 'non-couvert', recurrente: true },
    { id: 'b7', date: today, bureauId: 'b1', service: 'Chirurgie', typePoste: 'ambulance', quart: 'nuit', personnelRequis: 1, personnelAffecte: ['p10'], statut: 'complete', recurrente: true },
    { id: 'b8', date: today, bureauId: 'b3', service: 'Maternité', typePoste: 'ambulance', quart: 'matin', personnelRequis: 2, personnelAffecte: ['p7'], statut: 'partiel', recurrente: false },
  ];

  const mockActivites: Activite[] = [
    { id: 'a1', date: today, bureauId: 'b1', type: 'UPH', nom: 'Marathon de Paris', lieu: 'Parc des Expositions', besoins: 4, affectes: ['p1', 'p2'], statut: 'planifie', observations: 'Équipe médicale complète requise' },
    { id: 'a2', date: today, bureauId: 'b2', type: 'permanence', nom: 'Centre commercial - Animation santé', lieu: 'Westfield La Défense', besoins: 2, affectes: [], statut: 'planifie' },
    { id: 'a3', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], bureauId: 'b1', type: 'manifestation', nom: 'Fête de la Musique', lieu: 'Bercy', besoins: 6, affectes: [], statut: 'planifie', observations: 'Prévoir postes de secours' },
  ];

  const mockTaches: Tache[] = [
    { id: 't1', date: today, bureauId: 'b1', type: 'regulation', nom: 'Régulation SAMU', personnel: ['p8'], duree: 8, statut: 'planifie' },
    { id: 't2', date: today, bureauId: 'b2', type: 'formation', nom: 'Formation continue PSC1', personnel: ['p4', 'p10'], duree: 4, statut: 'planifie' },
    { id: 't3', date: today, bureauId: 'b1', type: 'entretien', nom: 'Maintenance ambulance A-12', personnel: [], duree: 2, statut: 'en-cours' },
  ];

  dispatch({ type: 'SET_PERSONNEL', payload: mockPersonnel });
  dispatch({ type: 'SET_BESOINS', payload: mockBesoins });
  dispatch({ type: 'SET_ACTIVITES', payload: mockActivites });
  dispatch({ type: 'SET_TACHES', payload: mockTaches });
}

// ============ HELPERS ============
export function getPersonnelById(state: AppState, id: string): Personnel | undefined {
  return state.personnel.find(p => p.id === id);
}

export function getBureauById(state: AppState, id: string): Bureau | undefined {
  return state.bureaux.find(b => b.id === id);
}

export function getBesoinsByDate(state: AppState, date: string): Besoin[] {
  return state.besoins.filter(b => b.date === date);
}

export function getActivitesByDate(state: AppState, date: string): Activite[] {
  return state.activites.filter(a => a.date === date);
}

export function getTachesByDate(state: AppState, date: string): Tache[] {
  return state.taches.filter(t => t.date === date);
}

export function getAbsencesByPersonnel(state: AppState, personnelId: string): Absence[] {
  return state.absences.filter(a => a.personnelId === personnelId);
}

export function getAvailablePersonnel(state: AppState, bureauId?: string): Personnel[] {
  return state.personnel.filter(p => {
    if (!p.actif) return false;
    if (p.statut !== 'disponible') return false;
    if (bureauId && p.bureauId !== bureauId) return false;
    return true;
  });
}

export function checkPersonnelRestrictions(
  personnel: Personnel,
  besoins: Besoin[]
): { valid: boolean; reason?: string } {
  // Vérifier les nuits consécutives
  const recentNights = besoins.filter(b => b.quart === 'nuit');
  if (recentNights.length >= 3) {
    return { valid: false, reason: 'Trop de nuits consécutives' };
  }
  
  return { valid: true };
}