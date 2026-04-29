import React from 'react';
import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useAppState } from '@/store/AppContext';

interface AvailablePersonnelProps {
  title?: string;
  showTitle?: boolean;
}

export const AvailablePersonnel: React.FC<AvailablePersonnelProps> = ({ title = "Personnel disponible", showTitle = true }) => {
  const { state } = useAppState();
  const availablePersonnel = state.personnel.filter(p => p.statut === 'disponible' && p.actif);

  return (
    <Card className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 rounded-xl">
      {showTitle && (
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-success" />
          <h3 className="font-semibold text-text-main">{title}</h3>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {availablePersonnel.length > 0 ? (
          availablePersonnel.map(p => (
            <span key={p.id} className="px-3 py-1.5 bg-white border border-green-200 text-success text-sm rounded-full font-medium">
              {p.prenom} {p.nom}
              <span className="ml-1 text-xs opacity-60">({p.qualification.abreviation})</span>
            </span>
          ))
        ) : (
          <p className="text-text-muted text-sm italic">Aucun personnel disponible</p>
        )}
      </div>
    </Card>
  );
};

export default AvailablePersonnel;