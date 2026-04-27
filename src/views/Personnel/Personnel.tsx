import React from 'react';
import { useAppState } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Award } from 'lucide-react';

const statutConfig = {
  'disponible': { color: 'bg-green-100 text-green-800', label: 'Disponible' },
  'en-poste': { color: 'bg-blue-100 text-blue-800', label: 'En poste' },
  'conge': { color: 'bg-gray-100 text-gray-600', label: 'Congé' },
  'absent': { color: 'bg-red-100 text-red-800', label: 'Absent' },
};

export const Personnel: React.FC = () => {
  const { state } = useAppState();
  const { personnel } = state;

  const stats = {
    total: personnel.length,
    disponible: personnel.filter(p => p.statut === 'disponible').length,
    enPoste: personnel.filter(p => p.statut === 'en-poste').length,
    autre: personnel.filter(p => p.statut !== 'disponible' && p.statut !== 'en-poste').length,
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-main">Personnel</h2>
        <p className="text-text-muted mt-1">Gestion des effectifs de l'agence SGXV</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 bg-surface border-border rounded-xl text-center">
          <p className="text-3xl font-bold text-text-main">{stats.total}</p>
          <p className="text-sm text-text-muted">Total</p>
        </Card>
        <Card className="p-4 bg-surface border-border rounded-xl text-center">
          <p className="text-3xl font-bold text-success">{stats.disponible}</p>
          <p className="text-sm text-text-muted">Disponibles</p>
        </Card>
        <Card className="p-4 bg-surface border-border rounded-xl text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.enPoste}</p>
          <p className="text-sm text-text-muted">En poste</p>
        </Card>
        <Card className="p-4 bg-surface border-border rounded-xl text-center">
          <p className="text-3xl font-bold text-warning">{stats.autre}</p>
          <p className="text-sm text-text-muted">Autres</p>
        </Card>
      </div>

      {/* Liste du personnel */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {personnel.map((person) => {
          const statutInfo = statutConfig[person.statut];
          
          return (
            <Card key={person.id} className="p-4 bg-surface border-border rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <User size={24} className="text-accent" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-text-main">{person.prenom} {person.nom}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statutInfo.color}`}>
                      {statutInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Award size={14} />
                    <span>{person.qualification}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};