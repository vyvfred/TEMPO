import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Cpu } from 'lucide-react';
import { useAppState } from '@/store/AppContext';

interface PlanningHeaderProps {
  onOpenSolver: () => void;
  weeksToShow: number;
  onWeeksChange: (weeks: number) => void;
  selectedBureau: string;
  onBureauChange: (bureauId: string) => void;
}

export const PlanningHeader: React.FC<PlanningHeaderProps> = ({
  onOpenSolver,
  weeksToShow,
  onWeeksChange,
  selectedBureau,
  onBureauChange,
}) => {
  const { state } = useAppState();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
      <div>
        <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
          <Calendar size={28} className="text-accent" />
          Planning Mensuel
        </h2>
        <p className="text-text-muted mt-1">
          {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          {' - '}{weeksToShow} semaine{weeksToShow > 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={onOpenSolver}
          variant="outline"
          className="border-accent text-accent hover:bg-accent hover:text-white"
        >
          <Cpu size={16} className="mr-2" />
          Solveur IA
        </Button>
        
        <select
          value={selectedBureau}
          onChange={(e) => onBureauChange(e.target.value)}
          className="px-3 py-2 bg-surface border border-border rounded-lg text-text-main text-sm"
        >
          <option value="all">Tous les bureaux</option>
          {state.bureaux.map(bureau => (
            <option key={bureau.id} value={bureau.id}>{bureau.nom}</option>
          ))}
        </select>

        <div className="flex border border-border rounded-lg overflow-hidden">
          {[1, 2, 3, 5].map(weeks => (
            <button
              key={weeks}
              onClick={() => onWeeksChange(weeks)}
              className={`px-3 py-2 transition-colors ${
                weeksToShow === weeks 
                  ? 'bg-accent text-white' 
                  : 'bg-surface text-text-main hover:bg-bg'
              }`}
            >
              {weeks}S
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanningHeader;