import React, { useState } from 'react';
import { useAppState, Besoin } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MapPin, Clock, Filter, AlertCircle, CheckCircle, Plus, 
  Download, Search, X, Calendar, ShieldAlert, HeartPulse, 
  Activity, AlertTriangle, Users
} from 'lucide-react';
import { AffecterPersonnelModal } from '@/components/AffecterPersonnelModal';
import { BesoinFormModal } from '@/components/BesoinFormModal';
import { toast } from 'sonner';

const quartLabels = {
  'matin': 'Matin (06h-14h)',
  'apres-midi': 'Après-midi (14h-22h)',
  'nuit': 'Nuit (22h-06h)',
};

const statutConfig = {
  'complete': { bg: 'bg-[#0f766e] text-white hover:bg-[#0f766e]/90', label: 'Complet', icon: CheckCircle },
  'partiel': { bg: 'bg-[#d97706] text-white hover:bg-[#d97706]/90', label: 'Partiel', icon: AlertTriangle },
  'non-couvert': { bg: 'bg-[#b91c1c] text-white hover:bg-[#b91c1c]/90', label: 'Non couvert', icon: ShieldAlert },
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
  const [modalAffectOpen, setModalAffectOpen] = useState(false);
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [besoinToEdit, setBesoinToEdit] = useState<Besoin | null>(null);

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

  const handleOpenAffectModal = (besoin: Besoin) => {
    setSelectedBesoin(besoin);
    setModalAffectOpen(true);
  };

  const handleOpenFormModal = (besoin?: Besoin) => {
    setBesoinToEdit(besoin || null);
    setModalFormOpen(true);
  };

  const handleDelete = (besoinId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce besoin ?')) {
      dispatch({ type: 'DELETE_BESOIN', payload: besoinId });
      toast.success('Besoin supprimé');
    }
  };

  const getPriorityInfo = (service: string, typePoste: string) => {
    const s = service.toLowerCase();
    if (s.includes('urg') || s.includes('réa') || s.includes('samu')) {
      return { label: 'CRITIQUE / URGENCE', color: 'bg-red-500 text-white', icon: HeartPulse };
    }
    if (s.includes('dial')) {
      return { label: 'DIALYSE RÉCURRENTE', color: 'bg-blue-600 text-white', icon: Activity };
    }
    if (typePoste === 'VSL') {
      return { label: 'CONSULTATION PROGRAMMÉE', color: 'bg-teal-600 text-white', icon: Clock };
    }
    return { label: 'TRANSFERT INTER-HÔPITAUX', color: 'bg-slate-600 text-white', icon: MapPin };
  };

  // Inspecter si la qualification requise de l'ambulance (ADE) est respectée
  const checkQualificationCompliance = (besoin: Besoin): { compliant: boolean; message: string } => {
    if (besoin.personnelAffecte.length === 0) return { compliant: true, message: '' };

    const assignedCrews = personnel.filter(p => besoin.personnelAffecte.includes(p.id));
    
    if (besoin.typePoste === 'ambulance') {
      // Les ambulances requièrent obligatoirement au moins un Ambulancier Diplômé d'État (ADE)
      const hasADE = assignedCrews.some(p => p.qualification.abreviation === 'ADE');
      if (!hasADE) {
        return { compliant: false, message: "Équipage Ambulance sous-qualifié (Sans DEA/ADE)" };
      }
    }
    return { compliant: true, message: '' };
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
        b.statut,
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
          <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <HeartPulse size={28} className="text-accent" />
            Gestion des Besoins Roulants & Missions
          </h2>
          <p className="text-text-muted mt-1">{stats.total} opportunités de transport enregistrées</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="print:hidden">
            <Download size={16} className="mr-1.5" />
            Export CSV
          </Button>
          <Button onClick={() => handleOpenFormModal()} className="bg-accent hover:bg-accent/90 font-bold text-xs h-9">
            <Plus size={16} className="mr-1.5" />
            Nouveau besoin / Mission
          </Button>
        </div>
      </div>

      {/* Stats Widgets - High Visibility solid block style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-slate-100 hover:shadow-md transition-shadow text-center cursor-pointer border-slate-200"
          onClick={() => setFilter('all')}>
          <p className="text-3xl font-extrabold text-slate-800">{stats.total}</p>
          <p className="text-xs font-bold text-slate-500 uppercase mt-1">Total Missions</p>
        </Card>
        <Card className="p-4 bg-emerald-600 hover:shadow-md transition-shadow text-center cursor-pointer border-emerald-700 text-white"
          onClick={() => setFilter('complete')}>
          <p className="text-3xl font-extrabold">{stats.complete}</p>
          <p className="text-xs font-bold uppercase mt-1">Complets</p>
        </Card>
        <Card className="p-4 bg-amber-500 hover:shadow-md transition-shadow text-center cursor-pointer border-amber-600 text-white"
          onClick={() => setFilter('partiel')}>
          <p className="text-3xl font-extrabold">{stats.partiel}</p>
          <p className="text-xs font-bold uppercase mt-1">Partiels</p>
        </Card>
        <Card className="p-4 bg-red-700 hover:shadow-md transition-shadow text-center cursor-pointer border-red-800 text-white"
          onClick={() => setFilter('non-couvert')}>
          <p className="text-3xl font-extrabold">{stats.nonCouvert}</p>
          <p className="text-xs font-bold uppercase mt-1">Non couverts</p>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="p-4 bg-surface border-border rounded-xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Rechercher un service (ex : urgence, dialyse)..."
              value={searchService}
              onChange={(e) => setSearchService(e.target.value)}
              className="pl-10 bg-bg border-border text-xs focus:ring-1 focus:ring-accent"
            />
          </div>
          
          <select
            value={selectedBureau}
            onChange={(e) => setSelectedBureau(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-text-main text-xs font-semibold"
          >
            <option value="all">Tous les bureaux</option>
            {bureaux.map(bureau => (
              <option key={bureau.id} value={bureau.id}>{bureau.nom}</option>
            ))}
          </select>
          
          <select
            value={selectedQuart}
            onChange={(e) => setSelectedQuart(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-text-main text-xs font-semibold"
          >
            <option value="all">Tous les quarts</option>
            <option value="matin">Matin</option>
            <option value="apres-midi">Après-midi</option>
            <option value="nuit">Nuit</option>
          </select>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-text-main text-xs font-semibold"
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
            <span className="text-xs text-text-muted">Filtres: </span>
            {filter !== 'all' && (
              <Badge variant="outline" className="cursor-pointer bg-slate-100">
                {statutConfig[filter as keyof typeof statutConfig].label} ×
              </Badge>
            )}
            {selectedBureau !== 'all' && (
              <Badge variant="outline" className="cursor-pointer" onClick={() => setSelectedBureau('all')}>
                {bureaux.find(b => b.id === selectedBureau)?.nom} ×
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto text-xs h-7">
              <X size={14} className="mr-1" />
              Effacer tout
            </Button>
          </div>
        )}
      </Card>

      {/* Liste de run-sheets */}
      {filteredBesoins.length > 0 ? (
        <div className="space-y-4">
          {filteredBesoins.map((besoin) => {
            const priority = getPriorityInfo(besoin.service, besoin.typePoste);
            const PriorityIcon = priority.icon;
            
            const statutInfo = statutConfig[besoin.statut] || statutConfig['non-couvert'];
            const StatusIcon = statutInfo.icon;
            const bureau = bureaux.find(b => b.id === besoin.bureauId);
            const qualCheck = checkQualificationCompliance(besoin);
            
            return (
              <Card key={besoin.id} className="p-5 bg-surface border border-l-4 rounded-xl hover:shadow-md transition-all border-l-accent">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <PriorityIcon size={18} className="text-accent" />
                      <h4 className="font-extrabold text-text-main text-lg">{besoin.service}</h4>
                      
                      {/* Badge de priorité de course */}
                      <Badge className={`text-[9px] font-bold py-0.5 px-2 ${priority.color} tracking-wider`}>
                        {priority.label}
                      </Badge>

                      <Badge className={`text-[10px] font-bold ${statutInfo.bg} border-0`}>
                        <StatusIcon size={12} className="mr-1" />
                        {statutInfo.label}
                      </Badge>

                      {besoin.recurrente && (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-800 text-[10px] uppercase font-bold">
                          Récurrent QD
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted font-semibold">
                      <div className="flex items-center gap-1">
                        <Calendar size={13} className="text-accent" />
                        {new Date(besoin.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={13} className="text-accent" />
                        {quartLabels[besoin.quart]}
                      </div>
                      <Badge variant="outline" className="capitalize text-[10px] font-bold">{typePosteLabels[besoin.typePoste]}</Badge>
                      <span className="text-text-muted">• {bureau?.nom}</span>
                    </div>

                    {/* Alerte de qualification sous-qualifiée */}
                    {!qualCheck.compliant && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 font-extrabold bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg max-w-md">
                        <AlertCircle size={15} />
                        {qualCheck.message}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-center min-w-[80px]">
                      <p className="text-3xl font-extrabold text-text-main">{besoin.personnelAffecte.length}/{besoin.personnelRequis}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Équipage</p>
                    </div>
                    
                    {besoin.personnelAffecte.length > 0 && (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {besoin.personnelAffecte.map(id => {
                          const p = personnel.find(person => person.id === id);
                          return p ? (
                            <span key={id} className="px-2.5 py-1 bg-accent/15 text-accent text-xs rounded-full font-bold">
                              {p.prenom} {p.nom[0]}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleOpenAffectModal(besoin)}
                        className="bg-accent hover:bg-accent/90 text-xs font-bold h-8"
                        size="sm"
                      >
                        <Plus size={14} className="mr-1" />
                        Affecter
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenFormModal(besoin)}
                        className="text-xs h-8"
                      >
                        Modifier
                      </Button>
                      <Button
                        onClick={() => handleDelete(besoin.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <X size={16} />
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
          <MapPin size={40} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-main mb-2">Aucun besoin trouvé</h3>
          <p className="text-text-muted text-xs mb-4">Ajustez vos filtres d'affichage ou créez de nouveaux transports.</p>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline" className="text-xs">
              Effacer les filtres
            </Button>
          )}
        </Card>
      )}

      {/* Modal d'affectation */}
      <AffecterPersonnelModal
        besoin={selectedBesoin}
        open={modalAffectOpen}
        onOpenChange={setModalAffectOpen}
      />

      {/* Modal de création/édition */}
      <BesoinFormModal
        open={modalFormOpen}
        onOpenChange={setModalFormOpen}
        besoinToEdit={besoinToEdit}
      />
    </div>
  );
};