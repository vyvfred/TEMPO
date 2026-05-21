import React, { useState, useMemo } from 'react';
import { useAppState, Tache, Personnel } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase, Calendar, Plus, Search, X, Clock, Users,
  Edit, Trash2, AlertTriangle, ShieldCheck, CheckCircle2,
  Wrench, Activity, AlertCircle, Sparkles, BookOpen
} from 'lucide-react';
import { TacheFormModal } from '@/components/TacheFormModal';
import { toast } from 'sonner';

const typeConfig = {
  'regulation': { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: '📞', label: 'Régulation' },
  'formation': { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '📚', label: 'Formation' },
  'entretien': { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '🔧', label: 'Entretien mat.' },
  'reunion': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '👥', label: 'Réunion' },
  'autre': { color: 'bg-slate-100 text-slate-800 border-slate-200', icon: '📋', label: 'Autre' },
};

const statutConfig = {
  'planifie': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Planifié' },
  'en-cours': { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'En cours' },
  'termine': { color: 'bg-green-50 text-green-700 border-green-200', label: 'Terminé' },
};

export const Taches: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { taches, personnel, besoins, absences, bureaux } = state;
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [tacheToEdit, setTacheToEdit] = useState<Tache | null>(null);

  const filteredTaches = taches.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterStatut !== 'all' && t.statut !== filterStatut) return false;
    if (search && !t.nom.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Calcul du volume horaire loggé par type d'activité
  const taskStats = useMemo(() => {
    let regulationHours = 0;
    let formationHours = 0;
    let maintenanceHours = 0;
    let totalTrackedHours = 0;

    taches.forEach(t => {
      totalTrackedHours += t.duree;
      if (t.type === 'regulation') regulationHours += t.duree;
      else if (t.type === 'formation') formationHours += t.duree;
      else if (t.type === 'entretien') maintenanceHours += t.duree;
    });

    return {
      regulationHours,
      formationHours,
      maintenanceHours,
      totalTrackedHours
    };
  }, [taches]);

  // Détecter si un agent affecté à une tâche est déjà en poste ou absent le même jour (Anti-Collision)
  const checkTaskCollision = (tache: Tache): { conflict: boolean; message?: string } => {
    if (tache.personnel.length === 0) return { conflict: false };

    for (const personId of tache.personnel) {
      // 1. Conflit transport
      const alreadyDriving = besoins.some(b => 
        b.date === tache.date && 
        b.personnelAffecte.includes(personId)
      );
      if (alreadyDriving) {
        const p = personnel.find(auth => auth.id === personId);
        return { 
          conflict: true, 
          message: `Double planification : ${p?.prenom} ${p?.nom} est affecté à un transport ce jour` 
        };
      }

      // 2. Conflit absence
      const isAbsent = absences.some(a => 
        personId === a.personnelId && 
        tache.date >= a.dateDebut && 
        tache.date <= a.dateFin
      );
      if (isAbsent) {
        const p = personnel.find(auth => auth.id === personId);
        return { 
          conflict: true, 
          message: `Conflit d'absence : ${p?.prenom} ${p?.nom} est en congé ou indisponible` 
        };
      }
    }

    return { conflict: false };
  };

  const handleOpenModal = (tache?: Tache) => {
    setTacheToEdit(tache || null);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Confirmer la suppression de cette tâche ?')) {
      dispatch({ type: 'DELETE_TACHE', payload: id });
      toast.success('Tâche administrative supprimée');
    }
  };

  const handleToggleStatut = (tache: Tache) => {
    const nextStatut = tache.statut === 'planifie' ? 'en-cours' : 
                       tache.statut === 'en-cours' ? 'termine' : 'planifie';
    
    dispatch({
      type: 'UPDATE_TACHE',
      payload: { ...tache, statut: nextStatut }
    });
    toast.success(`Statut de "${tache.nom}" passé en: ${statutConfig[nextStatut].label}`);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <Briefcase size={28} className="text-indigo-600" />
            Activités Internes & Tâches Non Roulantes
          </h2>
          <p className="text-text-muted mt-1">{taches.length} activités actives planifiées ou complétées</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-accent hover:bg-accent/90 font-bold text-xs h-9">
          <Plus size={16} className="mr-1.5" />
          Planifier une activité interne
        </Button>
      </div>

      {/* Télémétrie Logistique Horaires */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Heures */}
        <Card className="p-5 bg-white border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Volume Global Tâches</span>
            <span className="text-slate-800 font-extrabold text-sm">{taskStats.totalTrackedHours}h</span>
          </div>
          <Progress value={Math.min(100, (taskStats.totalTrackedHours / 50) * 100)} className="h-2 bg-slate-150" />
          <p className="text-[10px] text-text-muted font-semibold">Tâches administratives et hors transports</p>
        </Card>

        {/* Régulation heures */}
        <Card className="p-5 bg-white border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Heures de Régulation</span>
            <span className="text-[#3b82f6] font-extrabold text-sm">{taskStats.regulationHours}h</span>
          </div>
          <Progress value={Math.min(100, (taskStats.regulationHours / 30) * 100)} className="h-2 bg-indigo-50" />
          <p className="text-[10px] text-text-muted font-semibold">Garde de régulation en centre d'appels</p>
        </Card>

        {/* Formation heures */}
        <Card className="p-5 bg-white border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Formations Continuées</span>
            <span className="text-[#10b981] font-extrabold text-sm">{taskStats.formationHours}h</span>
          </div>
          <Progress value={Math.min(100, (taskStats.formationHours / 20) * 100)} className="h-2 bg-emerald-50" />
          <p className="text-[10px] text-text-muted font-semibold">Mise à niveau obligatoire PSC1 / DEA</p>
        </Card>

        {/* Entretien Mécanique */}
        <Card className="p-5 bg-white border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flotte & Entretien Véhicules</span>
            <span className="text-amber-600 font-extrabold text-sm">{taskStats.maintenanceHours}h</span>
          </div>
          <Progress value={Math.min(100, (taskStats.maintenanceHours / 15) * 100)} className="h-2 bg-amber-50" />
          <p className="text-[10px] text-text-muted font-semibold">Désinfection & vidanges ambulances</p>
        </Card>

      </div>

      {/* Filtres */}
      <Card className="p-4 bg-surface border-border rounded-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Rechercher par nom de l'activité ou de l'animateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-bg border-border text-xs focus:ring-1 focus:ring-accent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-text-main text-xs font-semibold"
          >
            <option value="all">Tous les types de tâches</option>
            <option value="regulation">Régulation SAMU</option>
            <option value="formation">Formations continue</option>
            <option value="entretien">Entretien / Logistique</option>
            <option value="reunion">Réunion administrative</option>
            <option value="autre">Autre</option>
          </select>
          
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-text-main text-xs font-semibold"
          >
            <option value="all">Tous les statuts</option>
            <option value="planifie">Planifiée</option>
            <option value="en-cours">En cours</option>
            <option value="termine">Terminée</option>
          </select>
        </div>
      </Card>

      {/* Liste des tâches */}
      {filteredTaches.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTaches.map((tache) => {
            const typeInfo = typeConfig[tache.type as keyof typeof typeConfig] || typeConfig.autre;
            const statutInfo = statutConfig[tache.statut as keyof typeof statutConfig] || statutConfig.planifie;
            const bureau = bureaux.find(b => b.id === tache.bureauId);
            
            // Collision checker
            const checker = checkTaskCollision(tache);
            
            return (
              <Card key={tache.id} className={`p-5 bg-surface border rounded-xl hover:shadow-lg transition-all flex flex-col justify-between ${
                tache.statut === 'termine' ? 'opacity-65' : ''
              }`}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{typeInfo.icon}</span>
                      <Badge className={`${typeInfo.color} font-bold text-[10px] uppercase border`}>
                        {typeInfo.label}
                      </Badge>
                    </div>
                    
                    <button 
                      onClick={() => handleToggleStatut(tache)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold border capitalize transition-colors ${statutInfo.color}`}
                      title="Changer de statut"
                    >
                      {statutInfo.label}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-extrabold text-text-main text-base mb-1">{tache.nom}</h4>
                    <p className="text-[10px] text-text-muted font-semibold flex items-center gap-1">
                      📍 {bureau?.nom || 'Antenne Principale'}
                    </p>
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-text-muted bg-slate-50 p-3 rounded-lg border border-slate-100 font-semibold">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-accent" />
                      <span>{new Date(tache.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-accent" />
                      <span>Durée estimée : {tache.duree}h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={13} className="text-accent" />
                      <span>{tache.personnel.length} agent(s) assigné(s)</span>
                    </div>
                  </div>

                  {/* Anti-collision Alert Box */}
                  {checker.conflict && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-[10px] flex items-start gap-1.5 font-bold leading-tight">
                      <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={14} />
                      <span className="text-red-800">{checker.message}</span>
                    </div>
                  )}
                  
                  {/* Liste des agents affectés */}
                  {tache.personnel.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {tache.personnel.map(pId => {
                        const p = personnel.find(auth => auth.id === pId);
                        return p ? (
                          <span key={pId} className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded-full font-bold">
                            {p.prenom} {p.nom[0]}.
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-5 pt-3 border-t border-slate-100">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs font-bold h-8" 
                    onClick={() => handleOpenModal(tache)}
                  >
                    Fiche d'Activité
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(tache.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center bg-surface border-border rounded-xl">
          <Briefcase size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-text-main mb-2">Aucune activité planifiée</h3>
          <p className="text-text-muted text-xs">Modifiez vos filtres ou planifiez de nouvelles tâches administratives ou de garde.</p>
        </Card>
      )}

      {/* Modal */}
      <TacheFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        tacheToEdit={tacheToEdit}
      />
    </div>
  );
};