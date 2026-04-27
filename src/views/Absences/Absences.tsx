import React, { useState } from 'react';
import { useAppState, Absence } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar, Plus, Search, X, Clock, User, 
  Edit, Trash2, Plane, BookOpen, Heart, Stethoscope
} from 'lucide-react';
import { toast } from 'sonner';

const typeConfig = {
  'CP': { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '🏖️', label: 'Congés Payés' },
  'RTT': { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '📅', label: 'RTT' },
  'RC': { color: 'bg-green-100 text-green-800 border-green-300', icon: '🌴', label: 'Récupération' },
  'maladie': { color: 'bg-red-100 text-red-800 border-red-300', icon: '🤒', label: 'Maladie' },
  'formation': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '📚', label: 'Formation' },
  'autre': { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: '📋', label: 'Autre' },
};

const statutConfig = {
  'planifie': { color: 'bg-gray-100 text-gray-600', label: 'Planifié' },
  'en-cours': { color: 'bg-blue-100 text-blue-600', label: 'En cours' },
  'termine': { color: 'bg-green-100 text-green-600', label: 'Terminé' },
};

export const Absences: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { absences, personnel } = state;
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [search, setSearch] = useState('');

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

  // Calculer les compteurs par personnel
  const getPersonnelSolde = (personnelId: string, type: Absence['type']) => {
    const person = personnel.find(p => p.id === personnelId);
    if (!person) return { restants: 0, label: '' };
    
    switch (type) {
      case 'CP': return { restants: person.cpRestants, label: 'CP restants' };
      case 'RTT': return { restants: person.rttRestants, label: 'RTT restants' };
      case 'RC': return { restants: person.rcRestants, label: 'RC restants' };
      default: return { restants: 0, label: '' };
    }
  };

  const stats = {
    total: absences.length,
    enCours: absences.filter(a => a.statut === 'en-cours').length,
    planifie: absences.filter(a => a.statut === 'planifie').length,
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette absence ?')) {
      dispatch({ type: 'DELETE_ABSENCE', payload: id });
      toast.success('Absence supprimée');
    }
  };

  const calculateDays = (debut: string, fin: string) => {
    const d1 = new Date(debut);
    const d2 = new Date(fin);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff;
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Gestion des Absences</h2>
          <p className="text-text-muted mt-1">{stats.total} absences au total</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90">
          <Plus size={16} className="mr-1" />
          Nouvelle absence
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4 bg-surface border-border rounded-xl text-center">
          <p className="text-3xl font-bold text-text-main">{stats.total}</p>
          <p className="text-sm text-text-muted">Total</p>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200 rounded-xl text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.planifie}</p>
          <p className="text-sm text-blue-600">Planifiées</p>
        </Card>
        <Card className="p-4 bg-red-50 border-red-200 rounded-xl text-center">
          <p className="text-3xl font-bold text-red-600">{stats.enCours}</p>
          <p className="text-sm text-red-600">En cours</p>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200 rounded-xl text-center">
          <p className="text-2xl font-bold text-blue-600">
            {personnel.reduce((sum, p) => sum + p.cpRestants, 0)}
          </p>
          <p className="text-xs text-blue-600">CP restants</p>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-200 rounded-xl text-center">
          <p className="text-2xl font-bold text-purple-600">
            {personnel.reduce((sum, p) => sum + p.rttRestants, 0)}
          </p>
          <p className="text-xs text-purple-600">RTT restants</p>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="p-4 bg-surface border-border rounded-xl mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Rechercher par nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-bg border-border"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-text-main text-sm"
          >
            <option value="all">Tous les types</option>
            <option value="CP">CP</option>
            <option value="RTT">RTT</option>
            <option value="RC">RC</option>
            <option value="maladie">Maladie</option>
            <option value="formation">Formation</option>
            <option value="autre">Autre</option>
          </select>
          
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-text-main text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="planifie">Planifié</option>
            <option value="en-cours">En cours</option>
            <option value="termine">Terminé</option>
          </select>
          
          {(filterType !== 'all' || filterStatut !== 'all' || search) && (
            <Button variant="outline" onClick={() => { setFilterType('all'); setFilterStatut('all'); setSearch(''); }}>
              <X size={16} />
            </Button>
          )}
        </div>
      </Card>

      {/* Liste */}
      {filteredAbsences.length > 0 ? (
        <div className="space-y-4">
          {filteredAbsences.map((absence) => {
            const typeInfo = typeConfig[absence.type as keyof typeof typeConfig] || typeConfig.autre;
            const statutInfo = statutConfig[absence.statut as keyof typeof statutConfig] || statutConfig.planifie;
            const person = personnel.find(p => p.id === absence.personnelId);
            const days = calculateDays(absence.dateDebut, absence.dateFin);
            const solde = getPersonnelSolde(absence.personnelId, absence.type);
            
            return (
              <Card key={absence.id} className={`p-5 bg-surface border-2 rounded-xl hover:shadow-lg transition-all ${
                absence.statut === 'en-cours' ? 'border-red-200' : 'border-border'
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-2xl">
                      {typeInfo.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                        <Badge className={statutInfo.color}>{statutInfo.label}</Badge>
                      </div>
                      {person && (
                        <h4 className="font-bold text-text-main text-lg">
                          {person.prenom} {person.nom}
                        </h4>
                      )}
                      <div className="flex items-center gap-4 text-sm text-text-muted mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(absence.dateDebut).toLocaleDateString('fr-FR')} → {new Date(absence.dateFin).toLocaleDateString('fr-FR')}
                        </div>
                        <span className="font-medium">({days} jour{days > 1 ? 's' : ''})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {solde.restants > 0 && (
                      <div className="text-center px-4">
                        <p className="text-2xl font-bold text-accent">{solde.restants}</p>
                        <p className="text-xs text-text-muted">{solde.label}</p>
                      </div>
                    )}
                    
                    {absence.observations && (
                      <p className="text-sm text-text-muted italic max-w-[200px] hidden lg:block">
                        {absence.observations}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit size={14} className="mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(absence.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
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
          <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-text-main mb-2">Aucune absence trouvée</h3>
          <p className="text-text-muted">Modifiez vos filtres ou déclarez une nouvelle absence.</p>
        </Card>
      )}
    </div>
  );
};