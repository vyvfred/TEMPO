import React, { useState } from 'react';
import { useAppState, Tache } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Briefcase, Calendar, Plus, Search, X, Clock, Users,
  Edit, Trash2
} from 'lucide-react';
import { TacheFormModal } from '@/components/TacheFormModal';
import { toast } from 'sonner';

const typeConfig = {
  'regulation': { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '📞', label: 'Régulation' },
  'formation': { color: 'bg-green-100 text-green-800 border-green-300', icon: '📚', label: 'Formation' },
  'entretien': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '🔧', label: 'Entretien' },
  'reunion': { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '👥', label: 'Réunion' },
  'autre': { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: '📋', label: 'Autre' },
};

const statutConfig = {
  'planifie': { color: 'bg-gray-100 text-gray-600', label: 'Planifié' },
  'en-cours': { color: 'bg-blue-100 text-blue-600', label: 'En cours' },
  'termine': { color: 'bg-green-100 text-green-600', label: 'Terminé' },
};

export const Taches: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { taches, personnel, bureaux } = state;
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

  const stats = {
    total: taches.length,
    planifie: taches.filter(t => t.statut === 'planifie').length,
    enCours: taches.filter(t => t.statut === 'en-cours').length,
    termine: taches.filter(t => t.statut === 'termine').length,
  };

  const handleOpenModal = (tache?: Tache) => {
    setTacheToEdit(tache || null);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette tâche ?')) {
      dispatch({ type: 'DELETE_TACHE', payload: id });
      toast.success('Tâche supprimée');
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Tâches non roulantes</h2>
          <p className="text-text-muted mt-1">{stats.total} tâches au total</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-accent hover:bg-accent/90">
          <Plus size={16} className="mr-1" />
          Nouvelle tâche
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-surface border-border rounded-xl text-center">
          <p className="text-3xl font-bold text-text-main">{stats.total}</p>
          <p className="text-sm text-text-muted">Total</p>
        </Card>
        <Card className="p-4 bg-gray-50 border-gray-200 rounded-xl text-center cursor-pointer"
          onClick={() => setFilterStatut('planifie')}>
          <p className="text-3xl font-bold text-gray-600">{stats.planifie}</p>
          <p className="text-sm text-gray-600">Planifiées</p>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200 rounded-xl text-center cursor-pointer"
          onClick={() => setFilterStatut('en-cours')}>
          <p className="text-3xl font-bold text-blue-600">{stats.enCours}</p>
          <p className="text-sm text-blue-600">En cours</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200 rounded-xl text-center cursor-pointer"
          onClick={() => setFilterStatut('termine')}>
          <p className="text-3xl font-bold text-green-600">{stats.termine}</p>
          <p className="text-sm text-green-600">Terminées</p>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="p-4 bg-surface border-border rounded-xl mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Rechercher une tâche..."
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
            <option value="regulation">Régulation</option>
            <option value="formation">Formation</option>
            <option value="entretien">Entretien</option>
            <option value="reunion">Réunion</option>
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
      {filteredTaches.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTaches.map((tache) => {
            const typeInfo = typeConfig[tache.type as keyof typeof typeConfig] || typeConfig.autre;
            const statutInfo = statutConfig[tache.statut as keyof typeof statutConfig] || statutConfig.planifie;
            const bureau = bureaux.find(b => b.id === tache.bureauId);
            
            return (
              <Card key={tache.id} className={`p-5 bg-surface border-2 rounded-xl hover:shadow-lg transition-all ${
                tache.statut === 'termine' ? 'border-green-200 opacity-75' : 'border-border'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{typeInfo.icon}</span>
                    <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                  </div>
                  <Badge className={statutInfo.color}>{statutInfo.label}</Badge>
                </div>
                
                <h4 className="font-bold text-text-main text-lg mb-2">{tache.nom}</h4>
                
                <div className="space-y-2 text-sm text-text-muted mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(tache.date).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    {tache.duree}h
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} />
                    {bureau?.nom}
                  </div>
                </div>
                
                {tache.personnel.length > 0 && (
                  <div className="flex items-center gap-2 pt-4 border-t border-border">
                    <Users size={16} className="text-accent" />
                    <span className="text-sm text-text-muted">{tache.personnel.length} personne(s)</span>
                  </div>
                )}
                
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenModal(tache)}>
                    <Edit size={14} className="mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(tache.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center bg-surface border-border rounded-xl">
          <Briefcase size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-text-main mb-2">Aucune tâche trouvée</h3>
          <p className="text-text-muted">Modifiez vos filtres ou créez une nouvelle tâche.</p>
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