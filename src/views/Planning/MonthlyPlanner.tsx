import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, Besoin, Personnel, Absence, Tache } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, AlertCircle, XCircle, Sparkles, Cpu, 
  Search, Shield, Calendar, Users, Grid, Plus, Lock, Info, 
  ChevronLeft, ChevronRight, Eye, Eraser, Printer, Save, HelpCircle, Filter,
  Highlighter, Paintbrush, Edit3, Clipboard, HelpCircle as HelpIcon, TrendingUp, BarChart3, Clock,
  AlertTriangle, AlertOctagon
} from 'lucide-react';
import { toast } from 'sonner';
import { SolverModal } from '@/components/Planning/SolverModal';
import { useSolver } from '@/hooks/useSolver';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// Palette de styles étendue inspirée de l'image de référence
const scheduleStyles = {
  // Amplitudes Standards (Bleu & Sarcelle / Turquoise)
  'AMP8': { bg: 'bg-[#1e40af] text-white border-[#1d4ed8]', label: 'AMP 8h', text: 'text-white' },
  'AMP6': { bg: 'bg-[#3b82f6] text-white border-[#60a5fa]', label: 'AMP 6h', text: 'text-white' },
  'AMV': { bg: 'bg-[#0f766e] text-white border-[#14b8a6]', label: 'AMV/VSL', text: 'text-white' },
  'TAXI': { bg: 'bg-[#0ea5e9] text-white border-[#38bdf8]', label: 'TAXI Standard', text: 'text-white' },
  'REG1': { bg: 'bg-[#7e22ce] text-white border-[#a855f7]', label: 'RÉGUL', text: 'text-white' },

  // Absences Diverses (Orange / Bordeaux)
  'ABS7': { bg: 'bg-[#f97316] text-white border-[#ea580c]', label: 'ABS7', text: 'text-white' },
  'CS': { bg: 'bg-[#d97706] text-white border-[#b55607]', label: 'CS', text: 'text-white' },
  'RC': { bg: 'bg-[#ea580c] text-white border-[#c2410c]', label: 'RÉCUP', text: 'text-white' },
  'FOR': { bg: 'bg-[#881337] text-white border-[#9f1239]', label: 'FORMA', text: 'text-white' },

  // Congés Payés (Vert d'eau / Turquoise)
  'CP': { bg: 'bg-[#0d9488] text-white border-[#0f766e]', label: 'C.P.', text: 'text-white' },
  'CP5': { bg: 'bg-[#14b8a6] text-white border-[#0d9488]', label: 'CP 5j', text: 'text-white' },

  // Jours chômés / Fériés (Rose / Saumon)
  'JF': { bg: 'bg-[#ec4899] text-white border-[#db2777]', label: 'FÉRIÉ', text: 'text-white' },
  'JF2': { bg: 'bg-[#f472b6] text-white border-[#f43f5e]', label: 'JF 2h', text: 'text-white' },

  // Maladie / Accident (Bleu marine foncé)
  'CM': { bg: 'bg-[#1e3a8a] text-white border-[#172554]', label: 'MALAD', text: 'text-white' },
  'AT': { bg: 'bg-[#1e1b4b] text-white border-[#0f172a]', label: 'ACCID', text: 'text-white' },

  // Repos / Disponibilité par défaut
  'REP': { bg: 'bg-[#cbd5e1] text-slate-800 border-[#94a3b8]', label: 'REPOS', text: 'text-slate-800' }
};

interface LegendStamp {
  code: string;
  category: 'amplitude' | 'absence' | 'conge' | 'ferie' | 'maladie' | 'outil';
  bg: string;
  textColor: string;
  name: string;
}

// Liste riche de gommes & tampons conforme aux habitudes des utilisateurs
const legendStamps: LegendStamp[] = [
  // 1. Amplitudes standards
  { code: 'AMP8', category: 'amplitude', bg: '#1e40af', textColor: '#ffffff', name: 'Amplitude 8h' },
  { code: 'AMP6', category: 'amplitude', bg: '#3b82f6', textColor: '#ffffff', name: 'Amplitude 6h' },
  { code: 'AMV', category: 'amplitude', bg: '#0f766e', textColor: '#ffffff', name: 'VSL / AMV' },
  { code: 'TAXI', category: 'amplitude', bg: '#0ea5e9', textColor: '#ffffff', name: 'Taxi Sanitaire' },
  { code: 'REG1', category: 'amplitude', bg: '#7e22ce', textColor: '#ffffff', name: 'Régulation' },
  
  // 2. Absences / Formations
  { code: 'ABS7', category: 'absence', bg: '#f97316', textColor: '#ffffff', name: 'Absence Standard' },
  { code: 'CS', category: 'absence', bg: '#d97706', textColor: '#ffffff', name: 'Congé Spécial' },
  { code: 'RC', category: 'absence', bg: '#ea580c', textColor: '#ffffff', name: 'Récupération' },
  { code: 'FOR', category: 'absence', bg: '#881337', textColor: '#ffffff', name: 'Formation Pro' },
  
  // 3. Congés (Vert d'eau)
  { code: 'CP', category: 'conge', bg: '#0d9488', textColor: '#ffffff', name: 'Congés Payés' },
  { code: 'CP5', category: 'conge', bg: '#14b8a6', textColor: '#ffffff', name: 'CP partiels (5j)' },
  
  // 4. Jours chômés / Fériés
  { code: 'JF', category: 'ferie', bg: '#ec4899', textColor: '#ffffff', name: 'Jour Férié' },
  { code: 'JF2', category: 'ferie', bg: '#f472b6', textColor: '#ffffff', name: 'Férié Partiel' },
  
  // 5. Maladie (Bleu marine)
  { code: 'CM', category: 'maladie', bg: '#1e3a8a', textColor: '#ffffff', name: 'Congé Maladie' },
  { code: 'AT', category: 'maladie', bg: '#1e1b4b', textColor: '#ffffff', name: 'Accident Travail' },
];

export const MonthlyPlanner: React.FC = () => {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const { personnel, besoins, absences, taches, bureaux } = state;
  const { isSolving, runSolver } = useSolver();

  // États de réglages de grille
  const [weeksToShow, setWeeksToShow] = useState<number>(3);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBureau, setSelectedBureau] = useState<string>('all');
  const [selectedQual, setSelectedQual] = useState<string>('all');
  const [showSolverModal, setShowSolverModal] = useState(false);
  
  // Modes de boîte à outils (Tampon ou Surlignage)
  const [toolboxMode, setToolboxMode] = useState<'paint' | 'highlight'>('paint');
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const [isEraserMode, setIsEraserMode] = useState<boolean>(false);
  const [isAutoSaveChecked, setIsAutoSaveChecked] = useState<boolean>(true);

  // Inspecteur de cellule (Double-clic)
  const [inspectedCell, setInspectedCell] = useState<{
    personnelId: string;
    personnelName: string;
    dateStr: string;
    schedule: any;
    note: string;
    vehicle: string;
  } | null>(null);

  // Contract alerts state
  const [showContractAlerts, setShowContractAlerts] = useState<boolean>(true);

  // Calculer les stats contractuelles pour la période
  const contractStats = useMemo(() => {
    const weekStart = new Date(state.selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const stats: { overloaded: number; underloaded: number; compliant: number; alerts: { name: string; hours: number; contract: number; status: string }[] } = {
      overloaded: 0,
      underloaded: 0,
      compliant: 0,
      alerts: []
    };

    personnel.filter(p => p.actif).forEach(p => {
      const weekBesoins = besoins.filter(b => 
        b.personnelAffecte.includes(p.id) && 
        b.date >= weekStartStr && 
        b.date <= weekEndStr
      );
      const hours = weekBesoins.length * 8;
      const contractHours = p.weeklyContractHours || 35;
      const percent = (hours / contractHours) * 100;

      if (percent >= 100) {
        stats.overloaded++;
        stats.alerts.push({ name: `${p.prenom} ${p.nom}`, hours, contract: contractHours, status: 'Surcharge' });
      } else if (percent >= 80) {
        stats.compliant++;
      } else if (percent < 50) {
        stats.underloaded++;
        stats.alerts.push({ name: `${p.prenom} ${p.nom}`, hours, contract: contractHours, status: 'Sous-charge' });
      } else {
        stats.compliant++;
      }
    });

    return stats;
  }, [personnel, besoins, state.selectedDate]);

  // Dictionary local des notes personnalisées par utilisateur & jour
  const [cellNotes, setCellNotes] = useState<Record<string, { note: string; vehicle: string }>>(() => {
    try {
      const stored = localStorage.getItem('ambuplan_detailed_notes');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Sauvegarder les observations additionnelles
  const saveDetailedNote = (personnelId: string, dateStr: string, noteText: string, vehicleStr: string) => {
    const key = `${personnelId}_${dateStr}`;
    const updated = {
      ...cellNotes,
      [key]: { note: noteText, vehicle: vehicleStr }
    };
    setCellNotes(updated);
    localStorage.setItem('ambuplan_detailed_notes', JSON.stringify(updated));
    toast.success('Observations du planning sauvegardées');
    setInspectedCell(null);
  };

  // Générer la liste d'affichage des jours (Lundi de la semaine de selectedDate)
  const daysOfPeriod = useMemo(() => {
    const list: Date[] = [];
    const baseDate = new Date(state.selectedDate);
    const dayOfWeek = baseDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + diffToMonday);
    
    const totalDays = weeksToShow * 7;
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      list.push(d);
    }
    return list;
  }, [state.selectedDate, weeksToShow]);

  // Groupement par semaine
  const weekGroups = useMemo(() => {
    const groups: { weekNumber: number; days: Date[] }[] = [];
    let currentWeek: Date[] = [];
    
    daysOfPeriod.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === daysOfPeriod.length - 1) {
        const firstDay = currentWeek[0];
        const startOfYear = new Date(firstDay.getFullYear(), 0, 1);
        const pastDaysOfYear = (firstDay.getTime() - startOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
        
        groups.push({
          weekNumber: weekNum,
          days: currentWeek
        });
        currentWeek = [];
      }
    });
    
    return groups;
  }, [daysOfPeriod]);

  // Filtrer les salariés
  const filteredPersonnel = useMemo(() => {
    return personnel.filter(p => {
      if (!p.actif) return false;
      if (selectedBureau !== 'all' && p.bureauId !== selectedBureau) return false;
      if (selectedQual !== 'all' && p.qualificationId !== selectedQual) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          p.nom.toLowerCase().includes(search) || 
          p.prenom.toLowerCase().includes(search) ||
          p.qualification.abreviation.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [personnel, selectedBureau, selectedQual, searchTerm]);

  // Masqués par filtrage
  const employeesFilteredCount = useMemo(() => {
    const totalActive = personnel.filter(p => p.actif).length;
    return Math.max(0, totalActive - filteredPersonnel.length);
  }, [personnel, filteredPersonnel]);

  // Analyser l'affectation d'un salarié
  const getDaySchedule = (personnelId: string, dateStr: string) => {
    // 1. Absence active
    const activeAbsence = absences.find(a => 
      a.personnelId === personnelId && 
      dateStr >= a.dateDebut && 
      dateStr <= a.dateFin
    );
    if (activeAbsence) {
      const absenceCode = activeAbsence.type === 'maladie' ? 'CM' : activeAbsence.type;
      return {
        type: 'absence',
        code: absenceCode,
        label: absenceCode,
        detail: activeAbsence.observations || 'Absence planifiée'
      };
    }

    // 2. Besoin roulant / Transport
    const activeBesoin = besoins.find(b => 
      b.date === dateStr && 
      b.personnelAffecte.includes(personnelId)
    );
    if (activeBesoin) {
      let code = 'AMP8';
      if (activeBesoin.typePoste === 'VSL') code = 'AMV';
      else if (activeBesoin.typePoste === 'taxi') code = 'TAXI';
      else if (activeBesoin.quart === 'apres-midi') code = 'AMP6';
      
      return {
        type: 'ambulance',
        code,
        label: code,
        detail: `${activeBesoin.service} (${activeBesoin.quart})`
      };
    }

    // 3. Tâche non-roulante / Régulation
    const activeTache = taches.find(t => 
      t.date === dateStr && 
      t.personnel.includes(personnelId)
    );
    if (activeTache) {
      return {
        type: 'tache',
        code: 'REG1',
        label: 'REG1',
        detail: activeTache.nom
      };
    }

    return {
      type: 'repos',
      code: 'REP',
      label: 'REP',
      detail: 'Pas d\'affectation'
    };
  };

  // Naviguer
  const handleNavigateWeeks = (direction: number) => {
    const baseDate = new Date(state.selectedDate);
    baseDate.setDate(baseDate.getDate() + (direction * 7 * weeksToShow));
    dispatch({ type: 'SET_DATE', payload: baseDate.toISOString().split('T')[0] });
  };

  // Clic sur l'en-tête de tampon ou surbrillance
  const handleStampTrigger = (code: string) => {
    if (toolboxMode === 'highlight') {
      setHighlightedCode(highlightedCode === code ? null : code);
    } else {
      setSelectedStamp(selectedStamp === code ? null : code);
      setIsEraserMode(false);
    }
  };

  // Peindre les cellules du planning au clic ou double-clic
  const handleCellClick = (personnelId: string, d: Date) => {
    const dateStr = d.toISOString().split('T')[0];

    // Mode Gomme d'effacement rapide
    if (isEraserMode) {
      // Retirer des besoins
      besoins.filter(b => b.date === dateStr && b.personnelAffecte.includes(personnelId)).forEach(b => {
        dispatch({ type: 'DESAFFECTER_PERSONNEL', payload: { besoinId: b.id, personnelId } });
      });
      // Retirer des absences
      absences.filter(a => a.personnelId === personnelId && dateStr >= a.dateDebut && dateStr <= a.dateFin).forEach(a => {
        dispatch({ type: 'DELETE_ABSENCE', payload: a.id });
      });
      toast.info('Cellule réinitialisée en REPOS');
      return;
    }

    if (!selectedStamp) return;

    // Réinitialiser d'abord tout ce qui est existant pour éviter les conflits de double planification
    besoins.filter(b => b.date === dateStr && b.personnelAffecte.includes(personnelId)).forEach(b => {
      dispatch({ type: 'DESAFFECTER_PERSONNEL', payload: { besoinId: b.id, personnelId } });
    });
    absences.filter(a => a.personnelId === personnelId && dateStr >= a.dateDebut && dateStr <= a.dateFin).forEach(a => {
      dispatch({ type: 'DELETE_ABSENCE', payload: a.id });
    });

    // Option Repos (REP)
    if (selectedStamp === 'REP') {
      toast.success('Journée marquée en REPOS (REP)');
      return;
    }

    // Absences / Congés
    if (['CP', 'CP5', 'ABS7', 'CS', 'RC', 'FOR', 'maladie', 'JF', 'JF2', 'CM', 'AT'].includes(selectedStamp)) {
      const typeStr = (selectedStamp === 'CM' || selectedStamp === 'maladie') ? 'maladie' : 
                      (selectedStamp === 'FOR') ? 'formation' : 
                      (selectedStamp === 'CP5' || selectedStamp === 'CP') ? 'CP' : 
                      (selectedStamp === 'RC') ? 'RC' : 'autre';
      
      const newAbsence: Absence = {
        id: `abs-${Date.now()}`,
        personnelId,
        dateDebut: dateStr,
        dateFin: dateStr,
        type: typeStr as any,
        statut: 'planifie'
      };

      dispatch({ type: 'ADD_ABSENCE', payload: newAbsence });
      toast.success(`Absence ${selectedStamp} appliquée`);
      return;
    }

    // Amplitudes Standards (AMP8, AMP6, AMV, TAXI, REG1)
    if (['AMP8', 'AMP6', 'AMV', 'TAXI', 'REG1'].includes(selectedStamp)) {
      let typePoste: Besoin['typePoste'] = 'ambulance';
      let quart: Besoin['quart'] = 'matin';
      let service = 'Transport Standard';

      if (selectedStamp === 'AMV') {
        typePoste = 'VSL';
        service = 'VSL Standard';
      } else if (selectedStamp === 'TAXI') {
        typePoste = 'taxi';
        service = 'Taxi Standard';
      } else if (selectedStamp === 'AMP6') {
        quart = 'apres-midi';
        service = 'Amplitude après-midi';
      } else if (selectedStamp === 'REG1') {
        // Ajouter une tâche non roulante Régulation
        const newTache: Tache = {
          id: `t-${Date.now()}`,
          date: dateStr,
          bureauId: state.selectedBureauId || 'b1',
          type: 'regulation',
          nom: 'Régulation',
          personnel: [personnelId],
          duree: 8,
          statut: 'planifie'
        };
        dispatch({ type: 'ADD_TACHE', payload: newTache });
        toast.success('Affecté à la Régulation (REG1)');
        return;
      }

      // Rechercher ou générer le besoin
      const targetBureauId = state.selectedBureauId || 'b1';
      const existingBesoin = besoins.find(b => 
        b.date === dateStr && 
        b.typePoste === typePoste && 
        b.quart === quart &&
        b.bureauId === targetBureauId
      );

      if (existingBesoin) {
        dispatch({
          type: 'AFFECTER_PERSONNEL',
          payload: { besoinId: existingBesoin.id, personnelId }
        });
      } else {
        const newB: Besoin = {
          id: `b-${Date.now()}`,
          date: dateStr,
          bureauId: targetBureauId,
          service,
          typePoste,
          quart,
          personnelRequis: 1,
          personnelAffecte: [personnelId],
          statut: 'complete',
          recurrente: false
        };
        dispatch({ type: 'ADD_BESOIN', payload: newB });
      }
      toast.success(`Amplitude ${selectedStamp} appliquée`);
    }
  };

  // Inspecter les détails ou observations d'une cellule au double-clic
  const handleCellDoubleClick = (personnelId: string, personnelName: string, dateStr: string, schedule: any) => {
    const key = `${personnelId}_${dateStr}`;
    const customData = cellNotes[key] || { note: '', vehicle: '' };
    setInspectedCell({
      personnelId,
      personnelName,
      dateStr,
      schedule,
      note: customData.note,
      vehicle: customData.vehicle
    });
  };

  // Solveur Intelligent Multi-Objectifs
  const handleAutoOptimize = async () => {
    toast.promise(runSolver({ showToasts: false }), {
      loading: 'Optimisation automatique par le solveur intelligent Vyv...',
      success: (res) => `Planning optimisé ! ${res?.stats.totalAssignments || 0} affectations générées.`,
      error: 'Erreur lors de l\'optimisation'
    });
  };

  // Calcul des statistiques globales sur la période d'affichage active
  const periodStats = useMemo(() => {
    let totalAssignments = 0;
    let occurrences = {
      amplitudes: 0,
      cp: 0,
      rtt: 0,
      rc: 0,
      maladie: 0,
      regul: 0,
    };

    filteredPersonnel.forEach(p => {
      daysOfPeriod.forEach(day => {
        const dateStr = day.toISOString().split('T')[0];
        const sched = getDaySchedule(p.id, dateStr);
        if (['AMP8', 'AMP6', 'AMV', 'TAXI'].includes(sched.code)) {
          totalAssignments += 1;
          occurrences.amplitudes += 1;
        } else if (sched.code === 'CP' || sched.code === 'CP5') {
          occurrences.cp += 1;
        } else if (sched.code === 'RTT') {
          occurrences.rtt += 1;
        } else if (sched.code === 'RC') {
          occurrences.rc += 1;
        } else if (sched.code === 'CM') {
          occurrences.maladie += 1;
        } else if (sched.code === 'REG1') {
          occurrences.regul += 1;
        }
      });
    });

    const totalHours = totalAssignments * 8; // Estimé à 8h par shift
    const averageHoursPerAgent = filteredPersonnel.length > 0 
      ? Math.round(totalHours / filteredPersonnel.length) 
      : 0;

    return {
      totalHours,
      averageHoursPerAgent,
      occurrences
    };
  }, [filteredPersonnel, daysOfPeriod, besoins, absences, taches]);

  // Alerte d'effectifs sous-dotés jour par jour
  const understaffedDays = useMemo(() => {
    const alerts: { dateStr: string; label: string; missing: number }[] = [];
    
    daysOfPeriod.forEach(day => {
      const dateStr = day.toISOString().split('T')[0];
      const needs = besoins.filter(b => b.date === dateStr);
      let missingCount = 0;
      
      needs.forEach(n => {
        const diff = n.personnelRequis - n.personnelAffecte.length;
        if (diff > 0) {
          missingCount += diff;
        }
      });

      if (missingCount > 0) {
        alerts.push({
          dateStr,
          label: day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
          missing: missingCount
        });
      }
    });

    return alerts.slice(0, 5); // Conserver les 5 alertes les plus critiques
  }, [daysOfPeriod, besoins]);

  return (
    <div className="p-4 md:p-6 space-y-4">
      
      {/* Contract Alerts Banner */}
      {(contractStats.overloaded > 0 || contractStats.underloaded > 0) && showContractAlerts && (
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertOctagon size={24} className="text-orange-600" />
              <div>
                <p className="font-bold text-text-main">Alertes Contractuelles</p>
                <p className="text-sm text-text-muted">
                  {contractStats.overloaded} en surcharge, {contractStats.underloaded} en sous-charge cette semaine
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/parametres/contrats')}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                Voir détails
              </Button>
              <button 
                onClick={() => setShowContractAlerts(false)}
                className="p-1 hover:bg-orange-100 rounded"
              >
                <XCircle size={18} className="text-orange-400" />
              </button>
            </div>
          </div>
          {contractStats.alerts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {contractStats.alerts.slice(0, 5).map((alert, i) => (
                <Badge 
                  key={i} 
                  className={alert.status === 'Surcharge' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}
                >
                  {alert.name}: {alert.hours}h/{alert.contract}h
                </Badge>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* 1. BARRE DE COMMANDE SUPÉRIEURE (Comme le logiciel historique) */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border shadow-sm">
        
        {/* Navigation Date à gauche */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <Calendar size={22} />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleNavigateWeeks(-1)} 
                className="h-8 w-8 p-0"
              >
                <ChevronLeft size={18} />
              </Button>
              <h2 className="text-base font-bold text-text-main min-w-[200px] text-center">
                Date : {new Date(state.selectedDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleNavigateWeeks(1)} 
                className="h-8 w-8 p-0"
              >
                <ChevronRight size={18} />
              </Button>
            </div>
            <p className="text-[10px] text-text-muted mt-0.5 text-center">Plage d'affichage réglée sur {weeksToShow} Semaines</p>
          </div>
        </div>

        {/* Témoin de salariés filtrés */}
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className={`text-xs font-semibold py-1 px-3 ${
            employeesFilteredCount > 0 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-green-50 text-green-700 border-green-200'
          }`}>
            {employeesFilteredCount === 0 ? 'TOUTES LES ÉQUIPES VISIBLES' : `${employeesFilteredCount} SALARIÉS FILTRÉS`}
          </Badge>
        </div>

        {/* Boutons d'actions à droite */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          
          {/* Séparateur pour la boîte à outils */}
          <div className="flex border border-border rounded-lg overflow-hidden bg-bg p-0.5">
            <Button
              variant={toolboxMode === 'paint' ? 'default' : 'ghost'}
              onClick={() => { setToolboxMode('paint'); setHighlightedCode(null); }}
              size="sm"
              className="h-7 text-[11px] font-bold px-2 flex items-center gap-1"
            >
              <Paintbrush size={12} />
              Tampon
            </Button>
            <Button
              variant={toolboxMode === 'highlight' ? 'default' : 'ghost'}
              onClick={() => { setToolboxMode('highlight'); setSelectedStamp(null); }}
              size="sm"
              className="h-7 text-[11px] font-bold px-2 flex items-center gap-1"
            >
              <Highlighter size={12} />
              Surligneur
            </Button>
          </div>

          <div className="h-6 w-px bg-border hidden sm:block mx-1"></div>

          {/* Nombre de semaines */}
          <div className="flex border border-border rounded-lg overflow-hidden bg-bg p-0.5">
            {[1, 2, 3, 5].map(wk => (
              <button
                key={wk}
                onClick={() => setWeeksToShow(wk)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all ${
                  weeksToShow === wk 
                    ? 'bg-accent text-white shadow-sm' 
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {wk} S.
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-border hidden sm:block mx-1"></div>

          {/* Outil Gomme de nettoyage de planning */}
          <Button
            variant={isEraserMode ? 'default' : 'outline'}
            onClick={() => {
              setIsEraserMode(!isEraserMode);
              if (!isEraserMode) setSelectedStamp(null);
            }}
            size="sm"
            className={`text-xs font-bold ${isEraserMode ? 'bg-red-500 hover:bg-red-600 text-white border-red-600' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
          >
            <Eraser size={14} className="mr-1.5" />
            Gomme
          </Button>

          {/* Sauvegarde automatique indicateur */}
          <label className="flex items-center gap-2 bg-bg px-2.5 py-1.5 rounded-lg border border-border text-xs text-text-muted cursor-pointer hover:bg-slate-100 select-none">
            <input 
              type="checkbox" 
              checked={isAutoSaveChecked} 
              onChange={(e) => setIsAutoSaveChecked(e.target.checked)} 
              className="rounded border-slate-300 text-accent focus:ring-accent"
            />
            Sauvegarde Auto.
          </label>

          {/* Solveur IA & Opt */}
          <Button 
            onClick={handleAutoOptimize}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm h-8"
            disabled={isSolving}
          >
            <Sparkles size={13} className="mr-1.5" />
            {isSolving ? 'Optimisation...' : 'Solveur Auto'}
          </Button>

          <Button 
            onClick={() => setShowSolverModal(true)}
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-bold h-8"
          >
            <Cpu size={13} className="mr-1.5" />
            Solveur Plan
          </Button>

          <Button 
            onClick={() => window.print()}
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            title="Imprimer le chrono-planning"
          >
            <Printer size={15} />
          </Button>
        </div>
      </div>

      {/* 2. LEGENDE D'AMPLITUDES ET ABSENCES INTERACTIVES (Palette de Tampons - Rubber Stamps - Avec commutateur Mode Surlignage) */}
      <Card className="p-4 bg-surface border-border rounded-xl shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1 border-b border-border/60">
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Plus size={14} className="text-accent" />
              {toolboxMode === 'paint' 
                ? 'Boîte à Tampons (Sélectionnez un code pour l\'appliquer sur une case au clic)' 
                : 'Filtre de Surlignage (Sélectionnez un code pour atténuer le reste du planning)'}
            </h4>
            
            {/* Témoin actif selon le toolboxMode */}
            {toolboxMode === 'paint' && selectedStamp && (
              <Badge className="bg-accent text-white uppercase text-[10px] animate-pulse">
                Tampon Actif: {selectedStamp}
              </Badge>
            )}
            {toolboxMode === 'highlight' && highlightedCode && (
              <Badge className="bg-purple-600 text-white uppercase text-[10px] animate-pulse">
                Surlignage: {highlightedCode}
              </Badge>
            )}
          </div>
          
          {/* Catégories de Tampons alignées sur l'image */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            {/* Standards amplitudes */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase block border-b border-border/40 pb-0.5">Amplitudes</span>
              <div className="flex flex-wrap gap-1.5">
                {legendStamps.filter(s => s.category === 'amplitude').map(stamp => {
                  const isActive = toolboxMode === 'paint' ? (selectedStamp === stamp.code) : (highlightedCode === stamp.code);
                  return (
                    <button
                      key={stamp.code}
                      onClick={() => handleStampTrigger(stamp.code)}
                      style={{ backgroundColor: stamp.bg, color: stamp.textColor }}
                      className={`px-2 py-1 rounded text-[11px] font-bold border-0 hover:scale-105 transition-all uppercase ${
                        isActive ? 'ring-2 ring-black ring-offset-1 scale-105 shadow-md' : 'opacity-90'
                      }`}
                    >
                      {stamp.code}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Absences */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase block border-b border-border/40 pb-0.5">Absences</span>
              <div className="flex flex-wrap gap-1.5">
                {legendStamps.filter(s => s.category === 'absence').map(stamp => {
                  const isActive = toolboxMode === 'paint' ? (selectedStamp === stamp.code) : (highlightedCode === stamp.code);
                  return (
                    <button
                      key={stamp.code}
                      onClick={() => handleStampTrigger(stamp.code)}
                      style={{ backgroundColor: stamp.bg, color: stamp.textColor }}
                      className={`px-2 py-1 rounded text-[11px] font-bold border-0 hover:scale-105 transition-all uppercase ${
                        isActive ? 'ring-2 ring-black ring-offset-1 scale-105 shadow-md' : 'opacity-90'
                      }`}
                    >
                      {stamp.code}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Congés */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase block border-b border-border/40 pb-0.5">Congés</span>
              <div className="flex flex-wrap gap-1.5">
                {legendStamps.filter(s => s.category === 'conge').map(stamp => {
                  const isActive = toolboxMode === 'paint' ? (selectedStamp === stamp.code) : (highlightedCode === stamp.code);
                  return (
                    <button
                      key={stamp.code}
                      onClick={() => handleStampTrigger(stamp.code)}
                      style={{ backgroundColor: stamp.bg, color: stamp.textColor }}
                      className={`px-2 py-1 rounded text-[11px] font-bold border-0 hover:scale-105 transition-all uppercase ${
                        isActive ? 'ring-2 ring-black ring-offset-1 scale-105 shadow-md' : 'opacity-90'
                      }`}
                    >
                      {stamp.code}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Jours chômés */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase block border-b border-border/40 pb-0.5">JF / Fériés</span>
              <div className="flex flex-wrap gap-1.5">
                {legendStamps.filter(s => s.category === 'ferie').map(stamp => {
                  const isActive = toolboxMode === 'paint' ? (selectedStamp === stamp.code) : (highlightedCode === stamp.code);
                  return (
                    <button
                      key={stamp.code}
                      onClick={() => handleStampTrigger(stamp.code)}
                      style={{ backgroundColor: stamp.bg, color: stamp.textColor }}
                      className={`px-2 py-1 rounded text-[11px] font-bold border-0 hover:scale-105 transition-all uppercase ${
                        isActive ? 'ring-2 ring-black ring-offset-1 scale-105 shadow-md' : 'opacity-90'
                      }`}
                    >
                      {stamp.code}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Maladies */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase block border-b border-border/40 pb-0.5">Médical / Maladie</span>
              <div className="flex flex-wrap gap-1.5">
                {legendStamps.filter(s => s.category === 'maladie').map(stamp => {
                  const isActive = toolboxMode === 'paint' ? (selectedStamp === stamp.code) : (highlightedCode === stamp.code);
                  return (
                    <button
                      key={stamp.code}
                      onClick={() => handleStampTrigger(stamp.code)}
                      style={{ backgroundColor: stamp.bg, color: stamp.textColor }}
                      className={`px-2 py-1 rounded text-[11px] font-bold border-0 hover:scale-105 transition-all uppercase ${
                        isActive ? 'ring-2 ring-black ring-offset-1 scale-105 shadow-md' : 'opacity-90'
                      }`}
                    >
                      {stamp.code}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </Card>

      {/* 3. FILTRES D'AFFICHAGE */}
      <div className="flex flex-col md:flex-row gap-4 bg-surface p-4 rounded-xl border border-border shadow-sm">
        {/* Barre de recherche */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, prénom ou qualification..."
            className="pl-9 h-9 text-xs bg-bg border-border rounded-lg"
          />
        </div>

        {/* Sélection par bureau */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-muted">Bureau:</span>
          <select
            value={selectedBureau}
            onChange={(e) => setSelectedBureau(e.target.value)}
            className="h-9 px-3 bg-bg border border-border rounded-lg text-text-main text-xs font-semibold focus:ring-1 focus:ring-accent"
          >
            <option value="all">Tous les bureaux</option>
            {bureaux.map(b => (
              <option key={b.id} value={b.id}>{b.nom}</option>
            ))}
          </select>
        </div>

        {/* Sélection par qualification */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-muted">Rôle:</span>
          <select
            value={selectedQual}
            onChange={(e) => setSelectedQual(e.target.value)}
            className="h-9 px-3 bg-bg border border-border rounded-lg text-text-main text-xs font-semibold focus:ring-1 focus:ring-accent"
          >
            <option value="all">Toutes les qualifications</option>
            {state.qualifications.map(q => (
              <option key={q.id} value={q.id}>{q.nom} ({q.abreviation})</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. GRILLE CHRONO-PLANNING MATRICIELLE */}
      <Card className="border-border rounded-xl bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full table-fixed min-w-[1100px] border-collapse">
            <thead>
              {/* Ligne : Groupement par Semaine */}
              <tr className="bg-slate-100 border-b border-border">
                <th className="sticky left-0 z-30 bg-slate-100 p-3 text-left font-bold text-xs text-text-main w-[240px] border-r border-border">
                  Structure des Équipes
                </th>
                
                {weekGroups.map((group, wIndex) => (
                  <th 
                    key={group.weekNumber} 
                    colSpan={7} 
                    className={`text-center py-2 text-xs font-bold text-accent uppercase tracking-wider bg-accent/5 border-r border-[#cbd5e1] ${
                      wIndex % 2 === 0 ? 'bg-[#0f766e]/5' : 'bg-slate-100'
                    }`}
                  >
                    Semaine {group.weekNumber}
                  </th>
                ))}
              </tr>

              {/* Ligne : Les Jours */}
              <tr className="bg-slate-50 border-b border-border">
                <th className="sticky left-0 z-30 bg-slate-50 p-2 text-left font-semibold text-[10px] text-text-muted w-[240px] border-r border-border">
                  Salarié / Licence (DEA, TAXI)
                </th>

                {daysOfPeriod.map((day, dIndex) => {
                  const dayName = day.toLocaleDateString('fr-FR', { weekday: 'short' });
                  const dayNum = day.getDate();
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const isCurToday = day.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

                  return (
                    <th 
                      key={dIndex}
                      className={`p-2 text-center border-r border-[#e2e8f0] text-[11px] font-bold w-[120px] ${
                        isWeekend ? 'bg-slate-100/70 text-slate-500' : 'text-slate-700'
                      } ${
                        isCurToday ? 'bg-accent/15 border-b-2 border-b-accent text-accent' : ''
                      }`}
                    >
                      <div className="uppercase opacity-75">{dayName}</div>
                      <div className="text-sm font-extrabold">{dayNum}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Corps */}
            <tbody>
              {filteredPersonnel.map((person) => {
                const totalHours = person.affectationsCount * 8; // Approximation de 8h par shift pour le compteur historique

                return (
                  <tr key={person.id} className="border-b border-border hover:bg-slate-50/50 transition-colors">
                    
                    {/* Profil Salarié Sticky */}
                    <td className="sticky left-0 z-20 bg-surface border-r border-border p-3 w-[240px] shadow-[2px_0_5px_rgba(0,0,0,0.03)] opacity-100">
                      <div className="flex items-center gap-2.5">
                        
                        {/* DEA / AA / VSL badge */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-[11px] text-white ${
                          person.qualification.abreviation === 'ADE' ? 'bg-[#1e40af]' :
                          person.qualification.abreviation === 'AA' ? 'bg-[#3b82f6]' :
                          person.qualification.abreviation === 'VSL' ? 'bg-[#0f766e]' : 'bg-[#7e22ce]'
                        }`} title={person.qualification.nom}>
                          {person.qualification.abreviation}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-extrabold text-xs text-text-main truncate">
                            {person.nom} {person.prenom}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] text-[#475569] font-bold bg-[#f1f5f9] px-1 py-0.2 rounded uppercase">
                              {person.qualification.abreviation}
                            </span>
                            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded-full">
                              {totalHours}:00
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cellules calendrier */}
                    {daysOfPeriod.map((day, dIndex) => {
                      const dateStr = day.toISOString().split('T')[0];
                      const schedule = getDaySchedule(person.id, dateStr);
                      const configStyle = scheduleStyles[schedule.code as keyof typeof scheduleStyles] || scheduleStyles.REP;
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                      const isHighlighted = highlightedCode && schedule.code === highlightedCode;
                      const isSelected = selectedStamp && schedule.code === selectedStamp;

                      return (
                        <td 
                          key={dIndex}
                          className={`relative p-1 border-r border-[#e2e8f0] w-[120px] h-16 ${
                            isWeekend ? 'bg-slate-50/50' : ''
                          } ${isHighlighted ? 'ring-2 ring-purple-500' : ''} ${isSelected ? 'ring-2 ring-accent' : ''}`}
                          onClick={() => handleCellClick(person.id, day)}
                          onDoubleClick={() => handleCellDoubleClick(person.id, `${person.prenom} ${person.nom}`, dateStr, schedule)}
                        >
                          <div className={`h-full rounded border text-center flex flex-col items-center justify-center text-[10px] font-bold uppercase ${configStyle.bg} ${configStyle.text}`}>
                            {schedule.label}
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 text-[8px] text-text-muted opacity-60 truncate px-0.5">
                            {schedule.detail}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal d'inspection de cellule */}
      {inspectedCell && (
        <Dialog open={true} onOpenChange={() => setInspectedCell(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Détails de la cellule</DialogTitle>
              <DialogDescription>
                {inspectedCell.personnelName} • {new Date(inspectedCell.dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-text-main mb-1 block">Code planning</label>
                <div className="px-3 py-2 bg-bg border border-border rounded-lg font-mono text-sm">
                  {inspectedCell.schedule.code}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-text-main mb-1 block">Détail</label>
                <p className="text-sm text-text-muted">{inspectedCell.schedule.detail}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-main mb-1 block">Observations</label>
                <Input
                  value={inspectedCell.note}
                  onChange={(e) => setInspectedCell({ ...inspectedCell, note: e.target.value })}
                  placeholder="Notes libres..."
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-main mb-1 block">Véhicule / Immatriculation</label>
                <Input
                  value={inspectedCell.vehicle}
                  onChange={(e) => setInspectedCell({ ...inspectedCell, vehicle: e.target.value })}
                  placeholder="Ex: AMB-123-AB"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setInspectedCell(null)}>
                  Fermer
                </Button>
                <Button onClick={() => saveDetailedNote(inspectedCell.personnelId, inspectedCell.dateStr, inspectedCell.note, inspectedCell.vehicle)} className="bg-accent hover:bg-accent/90">
                  Sauvegarder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Solver Modal */}
      <SolverModal isOpen={showSolverModal} onClose={() => setShowSolverModal(false)} />
    </div>
  );
};

export default MonthlyPlanner;