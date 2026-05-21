import React, { useState, useMemo } from 'react';
import { useAppState, Absence, Personnel } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, Plus, Search, X, Clock, User, 
  Edit, Trash2, Plane, BookOpen, Heart, Stethoscope,
  AlertTriangle, ShieldAlert, CheckCircle, BarChart3, Info
} from 'lucide-react';
import { AbsenceFormModal } from '@/components/AbsenceFormModal';
import { toast } from 'sonner';

const typeConfig = {
  'CP': { color: 'bg-teal-100 text-teal-800 border-teal-300', icon: '🏖️', label: 'Congés Payés' },
  'RTT': { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '📅', label: 'RTT' },
  'RC': { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: '🌴', label: 'Récupération' },
  'maladie': { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '🤒', label: 'Maladie' },
  'formation': { color: 'bg-red-100 text-red-800 border-red-300', icon: '📚', label: 'Formation' },
  'autre': { color: 'bg-slate-100 text-slate-800 border-slate-300', icon: '📋', label: 'Autre' },
};

const statutConfig = {
  'planifie': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Planifié' },
  'en-cours': { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Actif en ce moment' },
  'termine': { color: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Terminé' },
};

export const Absences: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { absences, personnel, besoins } = state;
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const filteredAbsences = absences.filter(a => {
    if (filterType !== 'all' && a.type !== filterType) return false;
    if (filterStatut !== 'all' && a.statut !== filterStatut) return false;
    if (search) {
      const person = personnel.find(p => p.id === a.personnelId);
      if (person) {
        const fullName = `${person.prenom} ${person.nom}`.toLowerCase();
        if (!fullName.includes(search.toLowerCase())) return false;
      } else return false;
    }
    return true;
  });

  // Compteurs globaux pour les widgets de pools
  const poolStats = useMemo(() => {
    const totalCPUsed = absences.filter(a => a.type === 'CP').length;
    const totalRTTUsed = absences.filter(a => a.type === 'RTT').length;
    const totalMaladies = absences.filter(a => a.type === 'maladie').length;
    const totalPersonnelCount = personnel.filter(p => p.actif).length;

    return {
      totalCPUsed,
      totalRTTUsed,
      totalMaladies,
      totalPersonnelCount
    };
  }, [absences, personnel]);

  // Détecter un conflit de planning :
  // Si le salarié a une mission de transport planifiée à une date où il est absent
  const checkConflict = (absence: Absence): { conflict: boolean; details?: string } => {
    const activeConflicts = besoins.filter(b => 
      b.personnelAffecte.includes(absence.personnelId) && 
      b.date >= absence.dateDebut && 
      b.date <= absence.dateFin
    );

    if (activeConflicts.length > 0) {
      return {
        conflict: true,
        details: `${activeConflicts.length} mission(s) active(s) : ${activeConflicts.map(c => c.service).join(', ')}`
      };
    }
    return { conflict: false };
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette déclaration de congé ?')) {
      dispatch({ type: 'DELETE_ABSENCE', payload: id });
      toast.success('Demande d\'absence supprimée de l\'historique');
    }
  };

  const calculateDays = (debut: string, fin: string) => {
    const d1 = new Date(debut);
    const d2 = new Date(fin);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff;
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <Plane size={28} className="text-accent" />
            Commandes des Absences & Congés
          </h2>
          <p className="text-text-muted mt-1">{absences.length} demandes planifiées ou archivées</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-accent hover:bg-accent/90 font-bold text-xs h-9">
          <Plus size={16} className="mr-1.5" />
          Déclarer une absence
        </Button>
      </div>

      {/* Pools de compteurs globaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pool CP */}
        <Card className="p-5 bg-white border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pool des Congés Payés (CP)</span>
            <span className="text-teal-600 font-extrabold text-sm">{poolStats.totalCPUsed} jours posés</span>
          </div>
          <Progress value={Math.min(100, (poolStats.totalCPUsed / 10) * 100)} className="h-2 bg-teal-50" />
          <div className="flex items-center justify-between text-[10px] text-text-muted font-semibold">
            <span>Seuil d'alerte : Bas</span>
            <span>Moyenne/Ambulancier : {Math.round(poolStats.totalCPUsed / (poolStats.totalPersonnelCount || 1))}j</span>
          </div>
        </Card>

        {/* Pool RTT */}
        <Card className="p-5 bg-white border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pool des RTT</span>
            <span className="text-purple-600 font-extrabold text-sm">{poolStats.totalRTTUsed} jours posés</span>
          </div>
          <Progress value={Math.min(100, (poolStats.totalRTTUsed / 10) * 100)} className="h-2 bg-purple-50" />
          <div className="flex items-center justify-between text-[10px] text-text-muted font-semibold">
            <span>Solde global annuel planifiable</span>
            <span>{poolStats.totalRTTUsed * 8}h estimées</span>
          </div>
        </Card>

        {/* Indice maladie */}
        <Card className="p-5 bg-white border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taux d'Arrêts maladies</span>
            <span className="text-blue-600 font-extrabold text-sm">{poolStats.totalMaladies} cas actifs</span>
          </div>
          <Progress value={Math.min(100, (poolStats.totalMaladies / 5) * 100)} className="h-2 bg-blue-50" />
          <div className="flex items-center justify-between text-[10px] text-text-muted font-semibold">
            <span>Alerte sous-tension : Normale</span>
            <span>Indice de remplacement : Stable</span>
          </div>
        </Card>

      </div>

      {/* Barre de filtrage & recherche */}
      <Card className="p-4 bg-surface border-border rounded-xl">
        <div className="flex flex-col md:flex-row gap-4">
          
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Rechercher par nom de l'ambulancier..."
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
            <option value="all">Tous les types de congés</option>
            <option value="CP">CP (Congés Payés)</option>
            <option value="RTT">RTT</option>
            <option value="RC">Récupération</option>
            <option value="maladie">Arrêt Maladie</option>
            <option value="formation">Formation</option>
          </select>
          
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-text-main text-xs font-semibold"
          >
            <option value="all">Tous les statuts</option>
            <option value="planifie">Planifié</option>
            <option value="en-cours">En cours</option>
            <option value="termine">Historisé / Terminé</option>
          </select>
          
          {(filterType !== 'all' || filterStatut !== 'all' || search) && (
            <Button variant="outline" onClick={() => { setFilterType('all'); setFilterStatut('all'); setSearch(''); }} className="text-xs">
              <X size={14} className="mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>
      </Card>

      {/* Liste des absences */}
      {filteredAbsences.length > 0 ? (
        <div className="space-y-4">
          {filteredAbsences.map((absence) => {
            const typeInfo = typeConfig[absence.type as keyof typeof typeConfig] || typeConfig.autre;
            const statutInfo = statutConfig[absence.statut as keyof typeof statutConfig] || statutConfig.planifie;
            const person = personnel.find(p => p.id === absence.personnelId);
            const days = calculateDays(absence.dateDebut, absence.dateFin);
            
            // Évaluer s'il y a conflit de planning
            const conflictCheck = checkConflict(absence);

            return (
              <Card key={absence.id} className={`p-5 bg-surface border-2 rounded-xl hover:shadow-md transition-all ${
                conflictCheck.conflict ? 'border-red-300 bg-red-50/5' : 'border-border'
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-xl">
                      {typeInfo.icon}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge className={`${typeInfo.color} text-[10px] font-bold uppercase`}>
                          {typeInfo.label}
                        </Badge>
                        <Badge className={`${statutInfo.color} text-[10px] font-bold uppercase`}>
                          {statutInfo.label}
                        </Badge>
                      </div>
                      
                      {person && (
                        <h4 className="font-extrabold text-text-main text-base">
                          {person.prenom} {person.nom} 
                          <span className="text-xs font-semibold text-text-muted ml-2">({person.qualification.abreviation})</span>
                        </h4>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-text-muted mt-1.5 font-semibold">
                        <div className="flex items-center gap-1">
                          <Calendar size={13} className="text-accent" />
                          Du {new Date(absence.dateDebut).toLocaleDateString('fr-FR')} au {new Date(absence.dateFin).toLocaleDateString('fr-FR')}
                        </div>
                        <span className="text-accent font-extrabold">({days} jour{days > 1 ? 's' : ''})</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Alerte et Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    
                    {/* Témoin Conflit ou Succès */}
                    {conflictCheck.conflict ? (
                      <div className="p-3 bg-red-100/50 border border-red-200 rounded-lg text-xs flex items-start gap-2 max-w-[300px]">
                        <ShieldAlert className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                        <div>
                          <p className="font-bold text-red-800">Conflit d'affectation !</p>
                          <p className="text-[10px] text-red-700 leading-tight">{conflictCheck.details}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs flex items-center gap-2">
                        <CheckCircle className="text-emerald-600 flex-shrink-0" size={15} />
                        <span className="font-bold text-emerald-800">Aucun conflit d'ordonnance</span>
                      </div>
                    )}

                    {/* Quick controls */}
                    <div className="flex gap-2 items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(absence.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg h-9 w-9 p-0"
                        title="Rejeter"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>

                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center bg-surface border-border rounded-xl">
          <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-text-main mb-2">Aucune absence trouvée</h3>
          <p className="text-text-muted text-xs">Modifiez vos filtres ou déclarez une nouvelle absence pour vos ambulanciers.</p>
        </Card>
      )}

      {/* Guide d'aide */}
      <Card className="p-5 bg-blue-50 border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700 space-y-1">
            <h4 className="font-bold text-text-main text-xs mb-1">Notice d'ordonnance des absences de transport médical</h4>
            <p>• Le système surveille de façon dynamique les conflits : si un salarié est marqué "Absent" mais reste affecté à des dialyses ou urgences critiques, une alerte d'ordonnance rouge apparaît.</p>
            <p>• Vous pouvez libérer le salarié en cliquant sur "Gomme" dans le chrono-planning ou en le désaffectant du besoin critique.</p>
          </div>
        </div>
      </Card>

      {/* Modal */}
      <AbsenceFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};