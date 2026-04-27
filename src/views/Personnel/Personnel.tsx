import React, { useState } from 'react';
import { useAppState, Personnel } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, Search, Award, Phone, Mail, MapPin, Calendar,
  Moon, Sun, AlertTriangle, Plus, ChevronRight, Filter,
  Edit, Trash2, Eye, EyeOff, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

const statutConfig = {
  'disponible': { color: 'bg-green-100 text-green-800', label: 'Disponible' },
  'en-poste': { color: 'bg-blue-100 text-blue-800', label: 'En poste' },
  'conge': { color: 'bg-gray-100 text-gray-600', label: 'Congé' },
  'absent': { color: 'bg-red-100 text-red-800', label: 'Absent' },
  'formation': { color: 'bg-purple-100 text-purple-800', label: 'Formation' },
};

export const Personnel: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { personnel, bureaux, qualifications } = state;
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterBureau, setFilterBureau] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);

  const filteredPersonnel = personnel.filter(p => {
    if (!showInactive && !p.actif) return false;
    if (filterStatut !== 'all' && p.statut !== filterStatut) return false;
    if (filterBureau !== 'all' && p.bureauId !== filterBureau) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        p.nom.toLowerCase().includes(searchLower) ||
        p.prenom.toLowerCase().includes(searchLower) ||
        p.email.toLowerCase().includes(searchLower) ||
        p.qualification.nom.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const stats = {
    total: personnel.filter(p => p.actif).length,
    disponible: personnel.filter(p => p.statut === 'disponible' && p.actif).length,
    enPoste: personnel.filter(p => p.statut === 'en-poste' && p.actif).length,
    autre: personnel.filter(p => p.statut !== 'disponible' && p.statut !== 'en-poste' && p.actif).length,
  };

  const handleToggleActif = (personnelId: string) => {
    const p = personnel.find(p => p.id === personnelId);
    if (p) {
      dispatch({
        type: 'UPDATE_PERSONNEL',
        payload: { ...p, actif: !p.actif }
      });
      toast.success(p.actif ? `${p.prenom} ${p.nom} désactivé(e)` : `${p.prenom} ${p.nom} activé(e)`);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Personnel</h2>
          <p className="text-text-muted mt-1">Gestion des {stats.total} effectifs de l'agence</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90">
          <Plus size={16} className="mr-2" />
          Ajouter personnel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-surface border-border rounded-xl text-center cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => { setFilterStatut('all'); setSearch(''); }}>
          <p className="text-3xl font-bold text-text-main">{stats.total}</p>
          <p className="text-sm text-text-muted">Total actifs</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200 rounded-xl text-center cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilterStatut('disponible')}>
          <p className="text-3xl font-bold text-green-600">{stats.disponible}</p>
          <p className="text-sm text-green-600">Disponibles</p>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200 rounded-xl text-center cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilterStatut('en-poste')}>
          <p className="text-3xl font-bold text-blue-600">{stats.enPoste}</p>
          <p className="text-sm text-blue-600">En poste</p>
        </Card>
        <Card className="p-4 bg-yellow-50 border-yellow-200 rounded-xl text-center cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilterStatut('autre')}>
          <p className="text-3xl font-bold text-yellow-600">{stats.autre}</p>
          <p className="text-sm text-yellow-600">Autres</p>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="p-4 bg-surface border-border rounded-xl mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Rechercher par nom, prénom, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-bg border-border"
            />
          </div>
          
          <select
            value={filterBureau}
            onChange={(e) => setFilterBureau(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-text-main text-sm"
          >
            <option value="all">Tous les bureaux</option>
            {bureaux.map(bureau => (
              <option key={bureau.id} value={bureau.id}>{bureau.nom}</option>
            ))}
          </select>
          
          <Button 
            variant={showInactive ? "default" : "outline"}
            onClick={() => setShowInactive(!showInactive)}
            className={showInactive ? 'bg-gray-500' : ''}
          >
            {showInactive ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="ml-2">Inactifs</span>
          </Button>
        </div>
      </Card>

      {/* Liste du personnel */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPersonnel.map((person) => {
          const statutInfo = statutConfig[person.statut as keyof typeof statutConfig] || statutConfig['disponible'];
          const bureau = bureaux.find(b => b.id === person.bureauId);
          
          return (
            <Card 
              key={person.id} 
              className={`p-5 bg-surface border-border rounded-xl hover:shadow-lg transition-all ${
                !person.actif ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                  person.statut === 'disponible' ? 'bg-green-500' :
                  person.statut === 'en-poste' ? 'bg-blue-500' :
                  person.statut === 'conge' ? 'bg-gray-400' :
                  person.statut === 'formation' ? 'bg-purple-500' : 'bg-red-500'
                }`}>
                  {person.prenom[0]}{person.nom[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-text-main">{person.prenom} {person.nom}</h4>
                    <Badge className={`${statutInfo.color} text-xs`}>
                      {statutInfo.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-muted mt-1">
                    <Award size={14} />
                    <span>{person.qualification.nom}</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-text-muted">
                  <MapPin size={14} />
                  <span>{bureau?.nom}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <Phone size={14} />
                  <span>{person.telephone}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <Mail size={14} />
                  <span className="truncate">{person.email}</span>
                </div>
              </div>

              {/* Préférences */}
              <div className="flex items-center gap-2 mb-4 text-xs">
                {person.preferenciasNuit && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-600">
                    <Moon size={12} className="mr-1" />
                    Nuit
                  </Badge>
                )}
                {person.preferenciasWE && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-600">
                    <Sun size={12} className="mr-1" />
                    WE
                  </Badge>
                )}
                {person.restrictions.length > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-600">
                    <AlertTriangle size={12} className="mr-1" />
                    {person.restrictions.length} restr.
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-lg font-bold text-accent">{person.affectationsCount}</p>
                  <p className="text-xs text-text-muted">Affectations</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-success">{person.equidadScore}%</p>
                  <p className="text-xs text-text-muted">Équité</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">{person.cpRestants}</p>
                  <p className="text-xs text-text-muted">CP</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit size={14} className="mr-1" />
                  Modifier
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleToggleActif(person.id)}
                >
                  {person.actif ? <EyeOff size={14} /> : <Eye size={14} />}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredPersonnel.length === 0 && (
        <Card className="p-12 text-center bg-surface border-border rounded-xl">
          <User size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-text-main mb-2">Aucun personnel trouvé</h3>
          <p className="text-text-muted">
            Modifiez vos critères de recherche ou ajoutez un nouveau membre.
          </p>
        </Card>
      )}
    </div>
  );
};