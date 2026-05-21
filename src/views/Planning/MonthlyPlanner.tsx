import React, { useState, useMemo } from 'react';
import { useAppState, Besoin, Personnel, Absence, Tache } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, AlertCircle, XCircle, Sparkles, Cpu, 
  Search, Shield, Calendar, Users, Grid, List, Plus, Lock, Info, ChevronLeft, ChevronRight, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { SolverModal } from '@/components/Planning/SolverModal';
import { useSolver } from '@/hooks/useSolver';

// Palette de styles inspirée de l'image de référence
const scheduleStyles = {
  // Amplitudes / Transports
  'AMP8': { bg: 'bg-[#1e40af] text-white border-[#1d4ed8]', label: 'AMP 8h' },
  'AMP6': { bg: 'bg-[#3b82f6] text-white border-[#60a5fa]', label: 'AMP 6h' },
  'AMV': { bg: 'bg-[#0f766e] text-white border-[#14b8a6]', label: 'AMV' },
  'TAXI': { bg: 'bg-[#2dd4bf] text-slate-900 border-[#0d9488]', label: 'TAXI' },
  'REG1': { bg: 'bg-[#7e22ce] text-white border-[#a855f7]', label: 'Régul' },
  
  // Congés et absences
  'CP': { bg: 'bg-[#0ea5e9] text-white border-[#0284c7]', label: 'CONGÉ' },
  'RTT': { bg: 'bg-[#f97316] text-white border-[#ea580c]', label: 'RTT' },
  'RC': { bg: 'bg-[#d97706] text-white border-[#b45309]', label: 'RÉCUP' },
  'FOR': { bg: 'bg-[#881337] text-white border-[#9f1239]', label: 'FORMA' },
  'maladie': { bg: 'bg-[#ef4444] text-white border-[#dc2626]', label: 'MALAD' },
  'JF': { bg: 'bg-[#ec4899] text-white border-[#db2777]', label: 'FERIÉ' },
  
  // Disponibilité / Repos
  'REP': { bg: 'bg-[#e2e8f0] text-slate-600 border-[#cbd5e1]', label: 'REPOS' }
};

interface LegendStamp {
  code: string;
  category: 'amplitude' | 'absence' | 'repos';
  bg: string;
  textColor: string;
  name: string;
}

const legendStamps: LegendStamp[] = [
  { code: 'AMP8', category: 'amplitude', bg: '#1e40af', textColor: '#ffffff', name: 'Amplitude 8h' },
  { code: 'AMP6', category: 'amplitude', bg: '#3b82f6', textColor: '#ffffff', name: 'Amplitude 6h' },
  { code: 'AMV', category: 'amplitude', bg: '#0f766e', textColor: '#ffffff', name: 'VSL' },
  { code: 'TAXI', category: 'amplitude', bg: '#2dd4bf', textColor: '#1e293b', name: 'Taxi Standard' },
  { code: 'REG1', category: 'amplitude', bg: '#7e22ce', textColor: '#ffffff', name: 'Régulation' },
  { code: 'CP', category: 'absence', bg: '#0ea5e9', textColor: '#ffffff', name: 'Congés Payés' },
  { code: 'RTT', category: 'absence', bg: '#f97316', textColor: '#ffffff', name: 'RTT' },
  { code: 'RC', category: 'absence', bg: '#d97706', textColor: '#ffffff', name: 'Récupération' },
  { code: 'FOR', category: 'absence', bg: '#881337', textColor: '#ffffff', name: 'Formation' },
  { code: 'maladie', category: 'absence', bg: '#ef4444', textColor: '#ffffff', name: 'Maladie' },
  { code: 'JF', category: 'absence', bg: '#ec4899', textColor: '#ffffff', name: 'Jour Férié' },
  { code: 'REP', category: 'repos', bg: '#cbd5e1', textColor: '#475569', name: 'Repos / Dispo' },
];

export const MonthlyPlanner: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { personnel, besoins, absences, taches, bureaux } = state;
  const { isSolving, runSolver } = useSolver();

  // États locaux de navigation et de filtres
  const [weeksToShow, setWeeksToShow] = useState<number>(3);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBureau, setSelectedBureau] = useState<string>('all');
  const [selectedQual, setSelectedQual] = useState<string>('all');
  const [showSolverModal, setShowSolverModal] = useState(false);
  
  // Outil tampon actuel (mimic historical software stamp feature)
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);

  // Générer la liste des jours pour la période à afficher (à partir du Lundi de la semaine de selectedDate)
  const daysOfPeriod = useMemo(() => {
    const list: Date[] = [];
    const baseDate = new Date(state.selectedDate);
    
    // Obtenir le lundi de la semaine courante
    const dayOfWeek = baseDate.getDay(); // 0 = Dimanche, 1 = Lundi...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + diffToMonday);
    
    // Générer les n * 7 jours
    const totalDays = weeksToShow * 7;
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      list.push(d);
    }
    return list;
  }, [state.selectedDate, weeksToShow]);

  // Regrouper les jours générés par semaines
  const weekGroups = useMemo(() => {
    const groups: { weekNumber: number; days: Date[] }[] = [];
    let currentWeek: Date[] = [];
    
    daysOfPeriod.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === daysOfPeriod.length - 1) {
        // Calculer l'index approximatif de la semaine
        const firstDay = currentWeek[0];
        // Trouver le numéro de semaine de l'année
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

  // Analyser l'état d'affectation d'un salarié pour un jour donné
  const getDaySchedule = (personnelId: string, dateStr: string) => {
    // 1. Vérifier si une absence est planifiée pour ce jour
    const activeAbsence = absences.find(a => 
      a.personnelId === personnelId && 
      dateStr >= a.dateDebut && 
      dateStr <= a.dateFin
    );
    if (activeAbsence) {
      return {
        type: 'absence',
        code: activeAbsence.type === 'maladie' ? 'maladie' : activeAbsence.type,
        label: activeAbsence.type.toUpperCase(),
        detail: activeAbsence.observations || 'Absence planifiée'
      };
    }

    // 2. Vérifier si affecté à un besoin de transport (Besoin / Shift)
    const activeBesoin = besoins.find(b => 
      b.date === dateStr && 
      b.personnelAffecte.includes(personnelId)
    );
    if (activeBesoin) {
      // Déterminer la codification de l'amplitude selon le typePoste et le quart
      let code = 'AMP8';
      if (activeBesoin.typePoste === 'VSL') code = 'AMV';
      else if (activeBesoin.typePoste === 'taxi') code = 'TAXI';
      else if (activeBesoin.quart === 'apres-midi') code = 'AMP6';
      else if (activeBesoin.quart === 'nuit') code = 'AMP8';
      
      return {
        type: 'ambulance',
        code,
        label: code,
        detail: `${activeBesoin.service} (${activeBesoin.quart})`
      };
    }

    // 3. Vérifier si affecté à une tâche non-roulante (Tache)
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

    // Par défaut, repos de type disponible
    return {
      type: 'repos',
      code: 'REP',
      label: 'REP',
      detail: 'Pas d\'affectation'
    };
  };

  // Naviguer par bloc de semaines
  const handleNavigateWeeks = (direction: number) => {
    const baseDate = new Date(state.selectedDate);
    baseDate.setDate(baseDate.getDate() + (direction * 7 * weeksToShow));
    dispatch({ type: 'SET_DATE', payload: baseDate.toISOString().split('T')[0] });
  };

  // Gérer l'application au clic tampon sur une cellule (Painting feature)
  const handleCellClick = (personnelId: string, d: Date) => {
    if (!selectedStamp) return;
    const dateStr = d.toISOString().split('T')[0];
    
    // Si l'utilisateur clique avec un tampon de repos (REP), on supprime les affectations ce jour-là
    if (selectedStamp === 'REP') {
      // Désaffecter de tous les besoins du jour
      const localBesoinsDuJour = besoins.filter(b => b.date === dateStr && b.personnelAffecte.includes(personnelId));
      localBesoinsDuJour.forEach(b => {
        dispatch({
          type: 'DESAFFECTER_PERSONNEL',
          payload: { besoinId: b.id, personnelId }
        });
      });
      // Supprimer les absences du jour
      const localAbsences = absences.filter(a => a.personnelId === personnelId && dateStr >= a.dateDebut && dateStr <= a.dateFin);
      localAbsences.forEach(a => {
        dispatch({ type: 'DELETE_ABSENCE', payload: a.id });
      });
      toast.info('Cellule réinitialisée en REPOS');
      return;
    }

    // Si tampon d'absence (CP, RTT, RC, etc.)
    if (['CP', 'RTT', 'RC', 'FOR', 'maladie', 'JF'].includes(selectedStamp)) {
      const newAbsence: Absence = {
        id: `abs-${Date.now()}`,
        personnelId,
        dateDebut: dateStr,
        dateFin: dateStr,
        type: (selectedStamp === 'maladie' ? 'maladie' : selectedStamp) as any,
        statut: 'planifie'
      };
      
      // Nettoyer d'abord d'éventuelles affectations avant d'ajouter l'absence
      besoins.filter(b => b.date === dateStr && b.personnelAffecte.includes(personnelId)).forEach(b => {
        dispatch({ type: 'DESAFFECTER_PERSONNEL', payload: { besoinId: b.id, personnelId } });
      });

      dispatch({ type: 'ADD_ABSENCE', payload: newAbsence });
      toast.success(`Absence ${selectedStamp} appliquée pour ce jour`);
      return;
    }

    // Si tampon d'amplitude/shift (AMP8, AMP6, AMV, TAXI, REG1)
    if (['AMP8', 'AMP6', 'AMV', 'TAXI', 'REG1'].includes(selectedStamp)) {
      // Trouver ou générer un besoin pour ce jour
      let typePoste: Besoin['typePoste'] = 'ambulance';
      let quart: Besoin['quart'] = 'matin';
      let service = 'Transport Standard';

      if (selectedStamp === 'AMV') {
        typePoste = 'VSL';
        service = 'VSL Standard';
      } else if (selectedStamp === 'TAXI') {
        typePoste = 'taxi';
        service = 'Taxi Vyv';
      } else if (selectedStamp === 'AMP6') {
        quart = 'apres-midi';
        service = 'Amplitude après-midi';
      } else if (selectedStamp === 'REG1') {
        // Ajouter une tâche non roulante Régulation
        const existsTache = taches.find(t => t.date === dateStr && t.type === 'regulation');
        if (existsTache) {
          if (!existsTache.personnel.includes(personnelId)) {
            dispatch({
              type: 'UPDATE_TACHE',
              payload: {
                ...existsTache,
                personnel: [...existsTache.personnel, personnelId]
              }
            });
          }
        } else {
          const newTache: Tache = {
            id: `t-${Date.now()}`,
            date: dateStr,
            bureauId: state.bureaux[0]?.id || 'b1',
            type: 'regulation',
            nom: 'Régulation',
            personnel: [personnelId],
            duree: 8,
            statut: 'planifie'
          };
          dispatch({ type: 'ADD_TACHE', payload: newTache });
        }
        toast.success('Affecté à la Régulation (REG1)');
        return;
      }

      // Pour les besoins roulants
      const existingBesoin = besoins.find(b => 
        b.date === dateStr && 
        b.typePoste === typePoste && 
        b.quart === quart &&
        b.bureauId === (state.selectedBureauId || 'b1')
      );

      if (existingBesoin) {
        if (!existingBesoin.personnelAffecte.includes(personnelId)) {
          dispatch({
            type: 'AFFECTER_PERSONNEL',
            payload: { besoinId: existingBesoin.id, personnelId }
          });
        }
      } else {
        const newB: Besoin = {
          id: `b-${Date.now()}`,
          date: dateStr,
          bureauId: state.selectedBureauId || 'b1',
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
      toast.success(`Amplitude ${selectedStamp} assignée avec succès`);
    }
  };

  // Déclencher le solveur intelligent rapide
  const handleAutoOptimize = async () => {
    toast.promise(runSolver({ showToasts: false }), {
      loading: 'Optimisation automatique du planning de la période...',
      success: (res) => `Planning optimisé ! ${res?.stats.totalAssignments || 0} affectations générées.`,
      error: 'Erreur lors de l’optimisation'
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* 1. Header principal aligné sur l'historique */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <div className="bg-accent p-3 rounded-lg text-white">
            <Grid size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
              Chrono-Planning des Équipes
              <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                Matrix Mode v2.1
              </Badge>
            </h2>
            <p className="text-xs text-text-muted">
              Période affichée : {daysOfPeriod[0]?.toLocaleDateString('fr-FR')} au {daysOfPeriod[daysOfPeriod.length - 1]?.toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Nombre de semaines à afficher */}
          <div className="flex border border-border rounded-lg overflow-hidden bg-bg p-1">
            {[1, 2, 3, 5].map(wk => (
              <button
                key={wk}
                onClick={() => setWeeksToShow(wk)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  weeksToShow === wk 
                    ? 'bg-accent text-white shadow-sm' 
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {wk}S
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-border hidden sm:block mx-1"></div>

          {/* Bouton d'automatisation IA */}
          <Button 
            onClick={handleAutoOptimize}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs"
            disabled={isSolving}
          >
            <Sparkles size={14} className="mr-1.5" />
            {isSolving ? 'Optimisation...' : 'Solveur Auto'}
          </Button>

          <Button 
            onClick={() => setShowSolverModal(true)}
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-semibold"
          >
            <Cpu size={14} className="mr-1.5" />
            Paramètres Solveur
          </Button>
        </div>
      </div>

      {/* 2. LEGENDE D'AMPLITUDES ET ABSENCES INTERACTIVES (Stamps/Outil Tampon) */}
      <Card className="p-4 bg-surface border-border rounded-xl">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Plus size={14} className="text-accent" />
              Palette de Tampons Rapides (Outil de planification au clic)
            </h4>
            {selectedStamp && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedStamp(null)}
                className="text-xs text-red-500 hover:text-red-700 h-7"
              >
                Désactiver l’outil pinceau (Tampon actif : <strong className="ml-1 uppercase">{selectedStamp}</strong>)
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 pt-1">
            {legendStamps.map((stamp) => (
              <button
                key={stamp.code}
                onClick={() => {
                  setSelectedStamp(selectedStamp === stamp.code ? null : stamp.code);
                  toast.info(`Tampon "${stamp.code}" activé. Cliquez maintenant sur une case de planning pour l'affecter.`);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  selectedStamp === stamp.code 
                    ? 'ring-2 ring-accent ring-offset-2 scale-105 shadow-md' 
                    : 'opacity-90 hover:opacity-100 hover:shadow-sm'
                }`}
                style={{ backgroundColor: stamp.bg, color: stamp.textColor, borderColor: `${stamp.bg}dd` }}
              >
                <span className="bg-white/20 px-1 py-0.5 rounded text-[10px] uppercase">{stamp.code}</span>
                <span className="font-medium opacity-90">{stamp.name}</span>
              </button>
            ))}
          </div>
          
          <p className="text-[10px] text-text-muted italic flex items-center gap-1">
            <Info size={12} className="text-blue-500" />
            Cliquez sur l'un des tampons ci-dessus pour le sélectionner, puis cliquez sur n'importe quel jour d'un salarié dans la grille ci-dessous pour modifier son affectation en un instant.
          </p>
        </div>
      </Card>

      {/* 3. BARRE DE FILTRES ET RECHERCHE */}
      <div className="flex flex-col md:flex-row gap-4 bg-surface p-4 rounded-xl border border-border">
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

        {/* Sélection par qualification */}
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

        {/* Navigation temporelle intégrée */}
        <div className="flex items-center gap-1 bg-bg p-1 rounded-lg border border-border">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleNavigateWeeks(-1)} 
            className="h-7 px-2 hover:bg-surface"
            title="Précédent"
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-[11px] font-bold px-2 text-text-main">Naviguer</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleNavigateWeeks(1)} 
            className="h-7 px-2 hover:bg-surface"
            title="Suivant"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* 4. GRILLE MATRICIELLE PRINCIPALE */}
      <Card className="border-border rounded-xl bg-surface overflow-hidden shadow-sm">
        {/* Table conteneur avec scroll horizontal */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full table-fixed min-w-[1100px] border-collapse">
            <thead>
              {/* Ligne de groupement par Semaine */}
              <tr className="bg-slate-100 border-b border-border">
                {/* En-tête Salarié Sticky */}
                <th className="sticky left-0 z-30 bg-slate-100 p-3 text-left font-bold text-xs text-text-main w-[240px] border-r border-border">
                  Structure des Équipes
                </th>
                
                {/* Groupes de semaines */}
                {weekGroups.map((group, wIndex) => (
                  <th 
                    key={group.weekNumber} 
                    colSpan={7} 
                    className={`text-center py-2 text-xs font-bold text-accent uppercase tracking-wider bg-accent/5 border-r border-border ${
                      wIndex % 2 === 0 ? 'bg-[#0f766e]/5' : 'bg-slate-100'
                    }`}
                  >
                    Semaine {group.weekNumber}
                  </th>
                ))}
              </tr>

              {/* Ligne des Jours de semaine */}
              <tr className="bg-slate-50 border-b border-border">
                {/* Info Salarié sous-titre */}
                <th className="sticky left-0 z-30 bg-slate-50 p-2 text-left font-semibold text-[10px] text-text-muted w-[240px] border-r border-border">
                  Identité / Rôle / Compteurs
                </th>

                {/* Liste flatte de jours */}
                {daysOfPeriod.map((day, dIndex) => {
                  const dayName = day.toLocaleDateString('fr-FR', { weekday: 'short' });
                  const dayNum = day.getDate();
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const isCurToday = day.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

                  return (
                    <th 
                      key={dIndex}
                      className={`p-2 text-center border-r border-border text-[11px] font-bold w-[120px] ${
                        isWeekend ? 'bg-slate-100/70 text-slate-500' : 'text-slate-700'
                      } ${
                        isCurToday ? 'bg-accent/10 border-b-2 border-b-accent text-accent' : ''
                      }`}
                    >
                      <div className="uppercase opacity-75">{dayName}</div>
                      <div className="text-sm font-extrabold">{dayNum}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Corps du tableau matriciel */}
            <tbody>
              {filteredPersonnel.map((person) => {
                // Compter les affectations sur les jours visibles
                const totalHours = person.affectationsCount * 8; // Convention d'approximation de 8h par shift

                return (
                  <tr key={person.id} className="border-b border-border hover:bg-slate-50/50 transition-colors">
                    {/* Profil salarié Sticky à gauche */}
                    <td className="sticky left-0 z-20 bg-surface border-r border-border p-3 w-[240px] shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                      <div className="flex items-center gap-2.5">
                        {/* Qualification badge avec couleur */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                          person.qualification.abreviation === 'ADE' ? 'bg-[#1e40af]' :
                          person.qualification.abreviation === 'AA' ? 'bg-[#3b82f6]' :
                          person.qualification.abreviation === 'VSL' ? 'bg-[#0f766e]' : 'bg-[#7e22ce]'
                        }`} title={person.qualification.nom}>
                          {person.qualification.abreviation}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-text-main truncate">
                            {person.nom} {person.prenom}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-text-muted bg-slate-100 px-1 py-0.2 rounded uppercase">
                              {person.qualification.abreviation}
                            </span>
                            <span className="text-[10px] text-teal-600 font-semibold bg-teal-50 px-1.5 py-0.2 rounded-full">
                              {totalHours}h
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cellules temporelles */}
                    {daysOfPeriod.map((day, dIndex) => {
                      const dateStr = day.toISOString().split('T')[0];
                      const schedule = getDaySchedule(person.id, dateStr);
                      const configStyle = scheduleStyles[schedule.code as keyof typeof scheduleStyles] || scheduleStyles.REP;
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                      return (
                        <td 
                          key={dIndex}
                          onClick={() => handleCellClick(person.id, day)}
                          className={`p-1.5 text-center border-r border-border w-[120px] transition-all relative group cursor-pointer ${
                            isWeekend ? 'bg-slate-50/40' : ''
                          } ${
                            selectedStamp ? 'hover:bg-accent/10 hover:border-accent' : ''
                          }`}
                        >
                          {/* Badge de couleur du shift */}
                          <div 
                            className={`w-full py-2.5 rounded-lg text-xs font-bold border flex flex-col items-center justify-center min-h-[50px] transition-all ${
                              configStyle.bg
                            }`}
                            title={schedule.detail}
                          >
                            <span className="tracking-wide uppercase text-[11px] font-extrabold">
                              {schedule.label}
                            </span>
                            
                            {/* Optionnel : libellé court sous-jacent si amplitude/absence */}
                            {schedule.type !== 'repos' && (
                              <span className="text-[9px] opacity-90 font-medium truncate max-w-[95px]">
                                {schedule.type === 'absence' ? 'ABSENCE' : 'ACTIF'}
                              </span>
                            )}
                          </div>

                          {/* Petit outil d'aperçu d'informations au survol */}
                          <div className="absolute hidden group-hover:block z-40 bg-slate-900 text-white rounded text-[10px] p-2 -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap shadow-lg pointer-events-none">
                            <strong>{person.prenom} {person.nom}</strong>
                            <br />
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

        {/* Message d'absence de personnel trouvé sous filtres */}
        {filteredPersonnel.length === 0 && (
          <div className="p-12 text-center bg-slate-50/50">
            <Users size={32} className="mx-auto mb-2 text-text-muted opacity-50" />
            <p className="text-sm font-semibold text-text-main">Aucun personnel trouvé</p>
            <p className="text-xs text-text-muted mt-1">Ajustez vos filtres de recherche ou de bureaux.</p>
          </div>
        )}
      </Card>

      {/* Guide d’aide rapide pour les planificateurs */}
      <Card className="p-5 bg-slate-100 border border-slate-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-slate-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 space-y-1">
            <h4 className="font-bold text-text-main text-sm mb-1">Aide à la planification rapide (Mode Tampon)</h4>
            <p>1. Cliquez sur l’un de nos <strong>Tampons de l'équipe</strong> dans la palette de raccourcis supérieure pour l'activer.</p>
            <p>2. Cliquez ensuite sur n’importe quelle case du planning pour appliquer l'amplitude ou l'absence en un clic.</p>
            <p>3. Pour modifier de façon autonome, vous pouvez lancer ou configurer notre **Solveur Automatique IA** qui affectera le personnel disponible en respectant les contraintes légales et l'équité des salariés.</p>
          </div>
        </div>
      </Card>

      {/* Solver Modal pour la configuration fine */}
      <SolverModal isOpen={showSolverModal} onClose={() => setShowSolverModal(false)} />
    </div>
  );
};

export default MonthlyPlanner;