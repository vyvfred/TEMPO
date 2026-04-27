import React, { useState } from 'react';
import { useAppState, Besoin } from '@/store/AppContext';
import { Clock, AlertCircle, CheckCircle, MapPin, Plus, Printer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AffecterPersonnelModal } from '@/components/AffecterPersonnelModal';

const quartLabels = {
  'matin': 'Matin (06h-14h)',
  'apres-midi': 'Après-midi (14h-22h)',
  'nuit': 'Nuit (22h-06h)',
};

const statutConfig = {
  'complete': { icon: CheckCircle, color: 'text-success bg-green-50', label: 'Complet' },
  'partiel': { icon: AlertCircle, color: 'text-warning bg-yellow-50', label: 'Partiel' },
  'non-couvert': { icon: AlertCircle, color: 'text-danger bg-red-50', label: 'Non couvert' },
};

export const Planning: React.FC = () => {
  const { state } = useAppState();
  const { besoins, personnel } = state;
  const [selectedBesoin, setSelectedBesoin] = useState<Besoin | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredBesoins = besoins.filter(b => b.date === state.selectedDate);
  const groupedByQuart = filteredBesoins.reduce((acc, besoin) => {
    if (!acc[besoin.quart]) acc[besoin.quart] = [];
    acc[besoin.quart].push(besoin);
    return acc;
  }, {} as Record<string, typeof filteredBesoins>);

  const availablePersonnel = personnel.filter(p => p.statut === 'disponible');

  const handleOpenModal = (besoin: Besoin) => {
    setSelectedBesoin(besoin);
    setModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const hasQuarts = Object.keys(groupedByQuart).length > 0;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Planning du jour</h2>
          <p className="text-text-muted mt-1">
            {new Date(state.selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button onClick={handlePrint} variant="outline" className="print:hidden">
          <Printer size={16} className="mr-2" />
          Imprimer
        </Button>
      </div>

      {/* Personnel disponible */}
      <Card className="p-4 mb-6 bg-surface border-border rounded-xl">
        <h3 className="font-semibold text-text-main mb-3">Personnel disponible</h3>
        <div className="flex flex-wrap gap-2">
          {availablePersonnel.length > 0 ? (
            availablePersonnel.map(p => (
              <span key={p.id} className="px-3 py-1 bg-green-50 text-success text-sm rounded-full font-medium">
                {p.prenom} {p.nom}
              </span>
            ))
          ) : (
            <span className="text-text-muted text-sm italic">Aucun personnel disponible</span>
          )}
        </div>
      </Card>

      {/* Besoins par quart */}
      {hasQuarts ? (
        Object.entries(groupedByQuart).map(([quart, besoins]) => (
          <div key={quart} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-accent" />
              <h3 className="text-lg font-bold text-text-main">{quartLabels[quart as keyof typeof quartLabels]}</h3>
              <Badge variant="outline" className="ml-2">
                {besoins.length} besoin{besoins.length > 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {besoins.map((besoin) => {
                const statutInfo = statutConfig[besoin.statut];
                const StatusIcon = statutInfo.icon;
                
                return (
                  <Card key={besoin.id} className="p-4 bg-surface border-border rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-accent" />
                        <span className="font-semibold text-text-main">{besoin.service}</span>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statutInfo.color}`}>
                        <StatusIcon size={12} />
                        {statutInfo.label}
                      </div>
                    </div>
                    
                    <div className="text-sm text-text-muted space-y-1">
                      <p>Type: <span className="font-medium text-text-main capitalize">{besoin.typePoste}</span></p>
                      <p>Requis: <span className="font-medium text-text-main">{besoin.personnelRequis}</span></p>
                      <p>Affectés: <span className="font-medium text-text-main">{besoin.personnelAffecte.length}</span></p>
                    </div>
                    
                    {besoin.personnelAffecte.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-text-muted mb-1">Affectés:</p>
                        <div className="flex flex-wrap gap-1">
                          {besoin.personnelAffecte.map(id => {
                            const p = personnel.find(person => person.id === id);
                            return p ? (
                              <span key={id} className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full">
                                {p.prenom} {p.nom[0]}.
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    
                    <Button
                      onClick={() => handleOpenModal(besoin)}
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 border-accent text-accent hover:bg-accent hover:text-white"
                    >
                      <Plus size={14} className="mr-1" />
                      Affecter
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <Card className="p-12 text-center bg-surface border-border rounded-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-text-main mb-2">Aucun besoin</h3>
          <p className="text-text-muted">
            Aucun besoin n'a été créé pour cette date. Allez dans la page Besoins pour en créer.
          </p>
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