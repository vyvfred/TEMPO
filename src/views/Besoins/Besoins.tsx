import React, { useState } from 'react';
import { useAppState, Besoin } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MapPin, Clock, Filter, AlertCircle, CheckCircle, Plus, 
  Download, Search, X, Calendar, RefreshCw, ChevronDown,
  Trash2, Edit, Eye
} from 'lucide-react';
import { AffecterPersonnelModal } from '@/components/AffecterPersonnelModal';
import { toast } from 'sonner';

const quartLabels = {
  'matin': 'Matin (06h-14h)',
  'apres-midi': 'Après-midi (14h-22h)',
  'nuit': 'Nuit (22h-06h)',
};

const statutConfig = {
  'complete': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Complet', icon: CheckCircle },
  'partiel': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Partiel', icon: AlertCircle },
  'non-couvert': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Non couvert', icon: AlertCircle },
};

const typePosteLabels = {
  'ambulance': 'Ambulance',
  'VSL': 'VSL',
  'taxi': 'Taxi',
};

export const Besoins: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { besoins, personnel, bureaux } = state;
  const [filter, setFilter] = useState<'all' | 'non-couvert' | 'partiel' | 'complete'>('all');
  const [searchService, setSearchService] = useState('');
  const [selectedBureau, setSelectedBureau] = useState<string>('all');
  const [selectedQuart, setSelectedQuart] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedBesoin, setSelectedBesoin] = useState<Besoin | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Services uniques
  const services = [...new Set(besoins.map(b => b.service))].sort();

  const filteredBesoins = besoins.filter(b => {
    if (filter !== 'all' && b.statut !== filter) return false;
    if (selectedBureau !== 'all' && b.bureauId !== selectedBureau) return false;
    if (selectedQuart !== 'all' && b.quart !== selectedQuart) return false;
    if (selectedType !== 'all' && b.typePoste !== selectedType) return false;
    if (searchService && !b.service.toLowerCase().includes(searchService.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: besoins.length,
    complete: besoins.filter(b => b.statut === 'complete').length,
    partiel: besoins.filter(b => b.statut === 'partiel').length,
    nonCouvert: besoins.filter(b => b.statut === 'non-couvert').length,
  };

  const handleOpenModal = (besoin: Besoin) => {
    setSelectedBesoin(besoin);
    setModalOpen(true);
  };

  const handleDelete = (besoinId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce besoin ?')) {
      dispatch({ type: 'DELETE_BESOIN', payload: besoinId });
      toast.success('Besoin supprimé');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Service', 'Bureau', 'Type', 'Quart', 'Requis', 'Affectés', 'Statut'];
    const rows = filteredBesoins.map(b => {
      const bureau = bureaux.find(bv => bv.id === b.bureauId);
      return [
        b.date,
        b.service,
        bureau?.nom || '',
        typePosteLabels[b.typePoste],
        quartLabels[b.quart],
        b.personnelRequis,
        b.personnelAffecte.length,
        statutConfig[b.statut].label,
      ];
    });
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `besoins_${state.selectedDate}.csv`;
    link.click();
    toast.success('Export CSV effectué');
  };

  const clearFilters = () => {
    setFilter('all');
    setSelectedBureau('all');
    setSelectedQuart('all');
    setSelectedType('all');
    setSearchService('');
  };

  const hasActiveFilters = filter !== 'all' || selectedBureau !== 'all' || selectedQuart !== 'all' || selectedType !== 'all' || searchService !== '';

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Gestion des Besoins</h2>
          <p className="text-text-muted mt-1">{stats.total} besoins au total</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="print:hidden">
            <Download size={16} className="mr-1" />
            Export CSV
          </Button>
          <Button className="bg-accent hover:bg-accent/90">
            <Plus size={16} className="mr-1" />
            Nouveau besoin
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-surface border-border rounded-xl text-center cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilter('all')}>
          <p className="text-3xl font-bold text-text-main">{stats.total}</p>
          <p className="text-sm text-text-muted">Total</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200 rounded-xl text-center cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilter('complete')}>
          <p className="text-3xl font-bold text-green-600">{stats.complete}</p>
          <p className="text-sm text-green-600">Complets</p>
        </Card>
        <Card className="p-4 bg-yellow-50 border-yellow-200 rounded-xl text-center cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilter('partiel')}>
          <p className="text-3xl font-bold text-yellow-600">{stats.partiel}</p>
          <p className="text-sm text-yellow-600">Partiels</p>
        </Card>
        <Card className="p-4 bg-red-50 border-red-200 rounded-xl text-center cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilter('non-couvert')}>
          <p className="text-3xl font-bold text-red-600">{stats.nonCouvert}</p>
          <p className="text-sm text-red-600">Non couverts</p>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="p-4 bg-surface border-border rounded-xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Rechercher un service..."
              value={searchService}
              onChange={(e) => setSearchService(e.target.value)}
              className="pl-10 bg-bg border-border"
            />
          </div>
          
          <select
            value={selectedBureau}
            onChange={(e) => setSelectedBureau(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-text-main text-sm"
          >
            <option value="all">Tous les bureaux</option>
            {bureaux.map(bureau => (
              <option key={bureau.id} value={bureau.id}>{bureau.nom}</option>
            ))}
          </select>
          
          <select
            value={selectedQuart}
            onChange={(e) => setSelectedQuart(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-text-main text-sm"
          >
            <option value="all">Tous les quarts</option>
            <option value="matin">Matin</option>
            <option value="apres-midi">Après-midi</option>
            <option value="nuit">Nuit</option>
          </select>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-text-main text-sm"
          >
            <option value="all">Tous les types</option>
            <option value="ambulance">Ambulance</option>
            <option value="VSL">VSL</option>
            <option value="taxi">Taxi</option>
          </select>
        </div>
        
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border flex-wrap">
            <Filter size={16} className="text-text-muted" />
            <span className="text-sm text-text-muted">Filtres: </span>
            {filter !== 'all' && (
              <Badge variant="outline" className="cursor-pointer bg-yellow-50" onClick={() => setFilter('all')}>
                {statutConfig[filter as keyof typeof statutConfig].label} ×
              </Badge>
            )}
            {selectedBureau !== 'all' && (
              <Badge variant="outline" className="cursor-pointer" onClick={() => setSelectedBureau('all')}>
                {bureaux.find(b => b.id === selectedBureau)?.nom} ×
              </Badge>
            )}
            {selectedQuart !== 'all' && (
              <Badge variant="outline" className="cursor-pointer" onClick={() => setSelectedQuart('all')}>
                {selectedQuart} ×
              </Badge>
            )}
            {selectedType !== 'all' && (
              <Badge variant="outline" className="cursor-pointer" onClick={() => setSelectedType('all')}>
                {selectedType} ×
              </Badge>
            )}
            {searchService && (
              <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchService('')}>
                "{searchService}" ×
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
              <X size={14} className="mr-1" />
              Effacer tout
            </Button>
          </div>
        )}
      </Card>

      {/* Liste des besoins */}
      {filteredBesoins.length > 0 ? (
        <div className="space-y-4">
          {filteredBesoins.map((besoin) => {
            const statutInfo = statutConfig[besoin.statut];
            const StatusIcon = statutInfo.icon;
            const bureau = bureaux.find(b => b.id === besoin.bureauId);
            
            return (
              <Card key={besoin.id} className={`p-5 bg-surface border-2 rounded-xl hover:shadow-lg transition-all ${statutInfo.color}`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <MapPin size={18} className="text-accent" />
                      <h4 className="font-bold text-text-main text-lg">{besoin.service}</h4>
                      <Badge variant="outline" className={statutInfo.color}>
                        <StatusIcon size={12} className="mr-1" />
                        {statutInfo.label}
                      </Badge>
                      {besoin.recurrente && (
                        <Badge variant="secondary" className="bg-accent/10 text-accent">
                          Récurrent
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(besoin.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {quartLabels[besoin.quart]}
                      </div>
                      <Badge variant="outline" className="capitalize">{typePosteLabels[besoin.typePoste]}</Badge>
                      <span className="text-text-muted">• {bureau?.nom}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-center min-w-[80px]">
                      <p className="text-3xl font-bold text-text-main">{besoin.personnelAffecte.length}/{besoin.personnelRequis}</p>
                      <p className="text-xs text-text-muted">affectés/requis</p>
                    </div>
                    
                    {besoin.personnelAffecte.length > 0 && (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {besoin.personnelAffecte.map(id => {
                          const p = personnel.find(person => person.id === id);
                          return p ? (
                            <span key={id} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full font-medium">
                              {p.prenom} {p.nom[0]}.
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleOpenModal(besoin)}
                        className="bg-accent hover:bg-accent/90"
                        size="sm"
                      >
                        <Plus size={14} className="mr-1" />
                        Affecter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit size={14} />
                      </Button>
                      <Button
                        onClick={() => handleDelete(besoin.id)}
                        variant="ghost"
                        size="sm"
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
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-text-main mb-2">Aucun besoin trouvé</h3>
          <p className="text-text-muted mb-4">
            {hasActiveFilters 
              ? 'Aucun besoin ne correspond à vos filtres.' 
              : 'Aucun besoin n\'a été créé.'}
          </p>
          {hasActiveFilters ? (
            <Button onClick={clearFilters} variant="outline">
              <X size={16} className="mr-1" />
              Effacer les filtres
            </Button>
          ) : (
            <Button className="bg-accent hover:bg-accent/90">
              <Plus size={16} className="mr-1" />
              Créer un besoin
            </Button>
          )}
        </Card>
      )}

      {/* Modal d'affectation */}
      <AffecterPersonnelModal
        besoin={selectedBesoin}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};