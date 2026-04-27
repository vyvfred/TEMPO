import React, { useState } from 'react';
import { useAppState, Besoin, Activite, Tache } from '@/store/AppContext';
import { generatePlanning } from '@/utils/planningAlgorithm';
import { 
  Clock, AlertCircle, CheckCircle, MapPin, Plus, Printer, 
  Play, RefreshCw, Calendar, Activity as ActivityIcon, Briefcase,
  Sparkles, Users, ArrowRight, Settings2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const quartLabels = {
  'matin': 'Matin (06h-14h)',
  'apres-midi': 'Après-midi (14h-22h)',
  'nuit': 'Nuit (22h-06h)',
};

const statutConfig = {
  'complete': { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Complet' },
  'partiel': { icon: AlertCircle, color: 'bg-yellow-100 text-yellow-800', label: 'Partiel' },
  'non-couvert': { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Non couvert' },
};

const activiteTypeConfig = {
  'UPH': { color: 'border-blue-500 bg-blue-50', textColor: 'text-blue-700' },
  'manifestation': { color: 'border-orange-500 bg-orange-50', textColor: 'text-orange-700' },
  'permanence': { color: 'border-purple-500 bg-purple-50', textColor: 'text-purple-700' },
  'evennement': { color: 'border-pink-500 bg-pink-50', textColor: 'text-pink-700' },
};

export const Planning: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { besoins, activites, taches, personnel } = state;
  const [selectedBesoin, setSelectedBesoin] = useState<Besoin | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredBesoins = besoins.filter(b => b.date === state.selectedDate);
  const filteredActivites = activites.filter(a => a.date === state.selectedDate);
  const filteredTaches = taches.filter(t => t.date === state.selectedDate);

  const groupedByQuart = filteredBesoins.reduce((acc, besoin) => {
    if (!acc[besoin.quart]) acc[besoin.quart] = [];
    acc[besoin.quart].push(besoin);
    return acc;
  }, {} as Record<string, typeof filteredBesoins>);

  const availablePersonnel = personnel.filter(p => p.statut === 'disponible' && p.actif);
  
  const stats = {
    besoinsTotal: filteredBesoins.length,
    besoinsCouverts: filteredBesoins.filter(b => b.statut === 'complete').length,
    activites: filteredActivites.length,
    taches: filteredTaches.length,
  };

  const handleGeneratePlanning = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const result = generatePlanning(besoins, personnel, state.selectedDate);
      
      for (const affectation of result.affectations) {
        if (affectation.success) {
          dispatch({
            type: 'AFFECTER_PERSONNEL',
            payload: { besoinId: affectation.besoinId, personnelId: affectation.personnelId },
          });
        }
      }

      if (result.affectations.length > 0) {
        toast.success(`${result.affectations.length} affectation(s) effectuée(s) !`);
      }
      
      if (result.alerts.length > 0) {
        result.alerts.forEach(alert => toast.warning(alert));
      }

      if (result.nonCouverts.length > 0) {
        toast.error(`${result.nonCouverts.length} besoin(s) restent non couverts`);
      }

      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Planning du jour</h2>
          <p className="text-text-muted mt-1">
            {new Date(state.selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleGeneratePlanning} 
            className="bg-accent hover:bg-accent/90"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <RefreshCw size={16} className="mr-2 animate-spin" />
            ) : (
              <Sparkles size={16} className="mr-2" />
            )}
            {isGenerating ? 'Génération...' : 'Générer Planning'}
          </Button>
          <Button onClick={() => window.print()} variant="outline" className="print:hidden">
            <Printer size={16} className="mr-2" />
            Imprimer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 bg-surface border-border rounded-xl text-center">
          <Calendar size={24} className="mx-auto mb-2 text-accent" />
          <p className="text-3xl font-bold text-text-main">{stats.besoinsTotal}</p>
          <p className="text-sm text-text-muted">Besoins</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200 rounded-xl text-center">
          <CheckCircle size={24} className="mx-auto mb-2 text-success" />
          <p className="text-3xl font-bold text-success">{stats.besoinsCouverts}</p>
          <p className="text-sm text-green-600">Couverts</p>
        </Card>
        <Card className="p-4 bg-orange-50 border-orange-200 rounded-xl text-center">
          <ActivityIcon size={24} className="mx-auto mb-2 text-orange-600" />
          <p className="text-3xl font-bold text-orange-600">{stats.activites}</p>
          <p className="text-sm text-orange-600">Activités</p>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-200 rounded-xl text-center">
          <Briefcase size={24} className="mx-auto mb-2 text-purple-600" />
          <p className="text-3xl font-bold text-purple-600">{stats.taches}</p>
          <p className="text-sm text-purple-600">Tâches</p>
        </Card>
      </div>

      {/* Personnel disponible */}
      <Card className="p-5 mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-success" />
            <h3 className="font-semibold text-text-main">Personnel disponible</h3>
            <Badge variant="secondary" className="bg-success text-white">{availablePersonnel.length}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {availablePersonnel.length > 0 ? (
            availablePersonnel.map(p => (
              <span 
                key={p.id} 
                className="px-3 py-1.5 bg-white border border-green-200 text-success text-sm rounded-full font-medium hover:shadow-sm transition-shadow"
              >
                {p.prenom} {p.nom}
                <span className="ml-1 text-xs opacity-60">({p.qualification.abreviation})</span>
              </span>
            ))
          ) : (
            <span className="text-text-muted text-sm italic">Aucun personnel disponible</span>
          )}
        </div>
      </Card>

      {/* Besoins par quart */}
      {Object.keys(groupedByQuart).length > 0 ? (
        Object.entries(groupedByQuart).map(([quart, besoins]) => (
          <div key={quart} className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-accent/10 p-2 rounded-lg">
                <Clock size={20} className="text-accent" />
              </div>
              <h3 className="text-xl font-bold text-text-main">{quartLabels[quart as keyof typeof quartLabels]}</h3>
              <Badge variant="outline" className="ml-2">
                {besoins.length} besoin{besoins.length > 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {besoins.map((besoin) => {
                const statutInfo = statutConfig[besoin.statut];
                const StatusIcon = statutInfo.icon;
                const bureau = state.bureaux.find(b => b.id === besoin.bureauId);
                
                return (
                  <Card 
                    key={besoin.id} 
                    className={`p-5 bg-surface border-2 rounded-xl hover:shadow-lg transition-all ${
                      besoin.statut === 'non-couvert' ? 'border-red-200' :
                      besoin.statut === 'partiel' ? 'border-yellow-200' : 'border-green-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-accent" />
                        <span className="font-bold text-text-main text-lg">{besoin.service}</span>
                      </div>
                      <Badge className={`${statutInfo.color} border-0`}>
                        <StatusIcon size={12} className="mr-1" />
                        {statutInfo.label}
                      </Badge>
                    </div>
                    
                    <div className="text-sm space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Bureau</span>
                        <span className="font-medium text-text-main">{bureau?.nom}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Type</span>
                        <Badge variant="outline" className="capitalize">{besoin.typePoste}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Requis / Affectés</span>
                        <span className="font-bold text-text-main">
                          {besoin.personnelAffecte.length}/{besoin.personnelRequis}
                        </span>
                      </div>
                    </div>
                    
                    {besoin.personnelAffecte.length > 0 && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-xs text-text-muted mb-2">Affectés:</p>
                        <div className="flex flex-wrap gap-1">
                          {besoin.personnelAffecte.map(id => {
                            const p = personnel.find(person => person.id === id);
                            return p ? (
                              <span 
                                key={id} 
                                className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full font-medium"
                              >
                                {p.prenom} {p.nom[0]}.
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <Card className="p-12 text-center bg-surface border-border rounded-xl mb-8">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={40} className="text-accent" />
          </div>
          <h3 className="text-xl font-semibold text-text-main mb-2">Aucun besoin prévu</h3>
          <p className="text-text-muted mb-4">
            Aucun besoin n'a été créé pour cette date.
          </p>
          <Button className="bg-accent hover:bg-accent/90">
            <Plus size={16} className="mr-2" />
            Créer un besoin
          </Button>
        </Card>
      )}

      {/* Activités */}
      {filteredActivites.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-orange-100 p-2 rounded-lg">
              <ActivityIcon size={20} className="text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-text-main">Activités planifiées</h3>
            <Badge variant="outline" className="ml-2">{filteredActivites.length}</Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {filteredActivites.map((activite) => {
              const config = activiteTypeConfig[activite.type as keyof typeof activiteTypeConfig] || activiteTypeConfig.permanence;
              const bureau = state.bureaux.find(b => b.id === activite.bureauId);
              
              return (
                <Card key={activite.id} className={`p-5 border-l-4 ${config.color} rounded-xl`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge className={`${config.textColor} bg-white border`}>{activite.type}</Badge>
                      <h4 className="font-bold text-text-main mt-2">{activite.nom}</h4>
                    </div>
                    <Badge variant="secondary">{activite.statut}</Badge>
                  </div>
                  <div className="text-sm text-text-muted space-y-1">
                    <p>📍 {activite.lieu}</p>
                    <p>🏢 {bureau?.nom}</p>
                    <p>👥 {activite.affectes.length}/{activite.besoins} affectés</p>
                  </div>
                  {activite.observations && (
                    <p className="text-sm text-text-muted mt-3 italic">"{activite.observations}"</p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tâches */}
      {filteredTaches.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Briefcase size={20} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-text-main">Tâches non roulantes</h3>
            <Badge variant="outline" className="ml-2">{filteredTaches.length}</Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTaches.map((tache) => {
              const typeConfig = {
                'regulation': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '📞' },
                'formation': { bg: 'bg-green-100', text: 'text-green-700', icon: '📚' },
                'entretien': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🔧' },
                'reunion': { bg: 'bg-purple-100', text: 'text-purple-700', icon: '👥' },
                'autre': { bg: 'bg-gray-100', text: 'text-gray-700', icon: '📋' },
              };
              const config = typeConfig[tache.type as keyof typeof typeConfig] || typeConfig.autre;
              
              return (
                <Card key={tache.id} className="p-5 bg-surface border-border rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <h4 className="font-bold text-text-main">{tache.nom}</h4>
                      <Badge variant="outline" className={`${config.bg} ${config.text}`}>
                        {tache.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-text-muted space-y-1">
                    <p>⏱️ {tache.duree}h</p>
                    <p>👥 {tache.personnel.length} personne(s)</p>
                    <p>📊 {tache.statut}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};