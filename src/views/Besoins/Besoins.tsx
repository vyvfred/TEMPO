import React, { useState } from 'react';
import { useAppState, Besoin } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Filter, AlertCircle, CheckCircle } from 'lucide-react';

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
  'Taxis': 'Taxi',
};

export const Besoins: React.FC = () => {
  const { state } = useAppState();
  const { besoins, personnel } = state;
  const [filter, setFilter] = useState<'all' | 'non-couvert' | 'partiel' | 'complete'>('all');

  const filteredBesoins = besoins.filter(b => {
    if (filter === 'all') return true;
    return b.statut === filter;
  });

  const stats = {
    total: besoins.length,
    complete: besoins.filter(b => b.statut === 'complete').length,
    partiel: besoins.filter(b => b.statut === 'partiel').length,
    nonCouvert: besoins.filter(b => b.statut === 'non-couvert').length,
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-main">Gestion des Besoins</h2>
        <p className="text-text-muted mt-1">Vue d'ensemble des besoins journaliers</p>
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

      {/* Filtre actif */}
      {filter !== 'all' && (
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-text-muted" />
          <span className="text-sm text-text-muted">Filtré: </span>
          <Badge variant="outline" className="cursor-pointer" onClick={() => setFilter('all')}>
            {statutConfig[filter].label} ×
          </Badge>
        </div>
      )}

      {/* Liste des besoins */}
      <div className="space-y-4">
        {filteredBesoins.map((besoin) => {
          const statutInfo = statutConfig[besoin.statut];
          const StatusIcon = statutInfo.icon;
          
          return (
            <Card key={besoin.id} className={`p-5 bg-surface border rounded-xl hover:shadow-md transition-shadow ${statutInfo.color}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin size={18} className="text-accent" />
                    <h4 className="font-semibold text-text-main text-lg">{besoin.service}</h4>
                    <Badge variant="outline" className={statutInfo.color}>
                      <StatusIcon size={12} className="mr-1" />
                      {statutInfo.label}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {quartLabels[besoin.quart]}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{typePosteLabels[besoin.typePoste]}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-text-main">{besoin.personnelAffecte.length}/{besoin.personnelRequis}</p>
                    <p className="text-xs text-text-muted">affectés/requis</p>
                  </div>
                  
                  {besoin.personnelAffecte.length > 0 && (
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {besoin.personnelAffecte.map(id => {
                        const p = personnel.find(person => person.id === id);
                        return p ? (
                          <span key={id} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
                            {p.prenom} {p.nom[0]}.
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredBesoins.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          <p>Aucun besoin ne correspond à ce filtre.</p>
        </div>
      )}
    </div>
  );
};