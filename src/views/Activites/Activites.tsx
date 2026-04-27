import React, { useState } from 'react';
import { useAppState, Activite } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar, MapPin, Plus, Search, X, Users, Clock, 
  Edit, Trash2, Eye, Filter, Download
} from 'lucide-react';
import { toast } from 'sonner';

const typeConfig = {
  'UPH': { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '🏥' },
  'manifestation': { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: '🎪' },
  'permanence': { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '📍' },
  'evennement': { color: 'bg-pink-100 text-pink-800 border-pink-300', icon: '🎉' },
};

const statutConfig = {
  'planifie': { color: 'bg-gray-100 text-gray-600', label: 'Planifié' },
  'en-cours': { color: 'bg-blue-100 text-blue-600', label: 'En cours' },
  'termine': { color: 'bg-green-100 text-green-600', label: 'Terminé' },
};

export const Activites: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { activites, personnel, bureaux } = state;
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredActivites = activites.filter(a => {
    if (filterType !== 'all' && a.type !== filterType) return false;
    if (filterStatut !== 'all' && a.statut !== filterStatut) return false;
    if (search && !a.nom.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: activites.length,
    uph: activites.filter(a => a.type === 'UPH').length,
    manifestations: activites.filter(a => a.type === 'manifestation').length,
    permanences: activites.filter(a => a.type === 'permanence').length,
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette activité ?')) {
      dispatch({ type: 'DELETE_ACTIVITE', payload: id });
      toast.success('Activité supprimée');
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Activités planifiées</h2>
          <p className="text-text-muted mt-1">{stats.total} activités au total</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90">
          <Plus size={16} className="mr-1" />
          Nouvelle activité
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-surface border-border rounded-xl text-center">
          <p className="text-3xl font-bold text-text-main">{stats.total}</p>
          <p className="text-sm text-text-muted">Total</p>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200 rounded-xl text-center cursor-pointer"
          onClick={() => setFilterType('UPH')}>
          <p className="text-3xl font-bold text-blue-600">🏥</p>
          <p className="text-sm text-blue-600">{stats.uph} UPH</p>
        </Card>
        <Card className="p-4 bg-orange-50 border-orange-200 rounded-xl text-center cursor-pointer"
          onClick={() => setFilterType('manifestation')}>
          <p className="text-3xl font-bold text-orange-600">🎪</p>
          <p className="text-sm text-orange-600">{stats.manifestations} Manif.</p>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-200 rounded-xl text-center cursor-pointer"
          onClick={() => setFilterType('permanence')}>
          <p className="text-3xl font-bold text-purple-600">📍</p>
          <p className="text-sm text-purple-600">{stats.permanences} Perm.</p>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="p-4 bg-surface border-border rounded-xl mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Rechercher une activité..."
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
            <option value="UPH">UPH</option>
            <option value="manifestation">Manifestation</option>
            <option value="permanence">Permanence</option>
            <option value="evennement">Événement</option>
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
      {filteredActivites.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredActivites.map((activite) => {
            const typeInfo = typeConfig[activite.type as keyof typeof typeConfig] || typeConfig.permanence;
            const statutInfo = statutConfig[activite.statut as keyof typeof statutConfig] || statutConfig.planifie;
            const bureau = bureaux.find(b => b.id === activite.bureauId);
            
            return (
              <Card key={activite.id} className={`p-5 bg-surface border-2 border-l-4 rounded-xl hover:shadow-lg transition-all border-l-green-500`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{typeInfo.icon}</span>
                    <Badge className={typeInfo.color}>{activite.type}</Badge>
                  </div>
                  <Badge className={statutInfo.color}>{statutInfo.label}</Badge>
                </div>
                
                <h4 className="font-bold text-text-main text-lg mb-2">{activite.nom}</h4>
                
                <div className="space-y-2 text-sm text-text-muted mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(activite.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    {activite.lieu}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    {bureau?.nom}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-1">
                    <Users size={16} className="text-accent" />
                    <span className="font-bold text-text-main">{activite.affectes.length}/{activite.besoins}</span>
                    <span className="text-sm text-text-muted">affectés</span>
                  </div>
                  
                  {activite.observations && (
                    <p className="text-xs text-text-muted italic max-w-[150px] truncate">
                      {activite.observations}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit size={14} className="mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(activite.id)}
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
          <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-text-main mb-2">Aucune activité trouvée</h3>
          <p className="text-text-muted">Modifiez vos filtres ou créez une nouvelle activité.</p>
        </Card>
      )}
    </div>
  );
};