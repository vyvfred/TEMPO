import React, { useState } from 'react';
import { useAppState, Besoin } from '@/store/AppContext';
import { toast } from 'sonner';
import { WeekCard } from '@/components/Planning/WeekCard';
import { StatsOverview } from '@/components/Planning/StatsOverview';
import { AvailablePersonnel } from '@/components/Planning/AvailablePersonnel';
import { SolverModal } from '@/components/Planning/SolverModal';
import { PlanningHeader } from '@/components/Planning/Header';
import { usePlanningData } from '@/hooks/usePlanningData';

export const MonthlyPlanner: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [weeksToShow, setWeeksToShow] = useState(5);
  const [selectedBureau, setSelectedBureau] = useState<string>('all');
  const [showSolverModal, setShowSolverModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const { weeks, totalStats, isToday } = usePlanningData(selectedBureau);
  const displayedWeeks = weeks.slice(0, weeksToShow);
  const viewMode = weeksToShow === 1 ? 'detailed' : 'compact';

  const handleGenerateWeek = (weekIndex: number) => {
    const week = displayedWeeks[weekIndex];
    if (!week) return;

    const recurringBesoins = state.besoins.filter(b => b.recurrente);
    
    week.days.forEach(day => {
      recurringBesoins.forEach(template => {
        const exists = state.besoins.some(
          b => b.date === day.date && b.bureauId === template.bureauId && 
               b.service === template.service && b.quart === template.quart
        );
        
        if (!exists) {
          const newBesoin: Besoin = {
            id: `b${Date.now()}-${day.date}-${template.id}`,
            date: day.date,
            bureauId: template.bureauId,
            service: template.service,
            typePoste: template.typePoste,
            quart: template.quart,
            personnelRequis: template.personnelRequis,
            personnelAffecte: [],
            statut: 'non-couvert',
            recurrente: false,
            beneficiaire: template.beneficiaire,
          };
          dispatch({ type: 'ADD_BESOIN', payload: newBesoin });
        }
      });
    });
    toast.success(`Semaine ${weekIndex + 1} générée !`);
  };

  return (
    <div className="p-4 md:p-8">
      <PlanningHeader
        onOpenSolver={() => setShowSolverModal(true)}
        weeksToShow={weeksToShow}
        onWeeksChange={setWeeksToShow}
        selectedBureau={selectedBureau}
        onBureauChange={setSelectedBureau}
      />
      
      <StatsOverview stats={totalStats} />

      {weeksToShow === 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {displayedWeeks.map((week, i) => (
            <button
              key={i}
              onClick={() => setSelectedWeek(i)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedWeek === i ? 'bg-accent text-white' : 'bg-surface border border-border text-text-main hover:bg-bg'
              }`}
            >
              Semaine {week.weekNumber}
              <span className="ml-2 text-xs opacity-75">({week.days[0].date.split('-')[2]}/{week.days[6].date.split('-')[2]})</span>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-6 mt-6">
        {displayedWeeks.map((week, index) => (
          <WeekCard
            key={week.weekNumber}
            week={weeksToShow === 1 && selectedWeek !== null ? weeks[selectedWeek] : week}
            onGenerate={() => handleGenerateWeek(index)}
            isToday={isToday}
            viewMode={viewMode}
          />
        ))}
      </div>

      <div className="mt-6">
        <AvailablePersonnel />
      </div>

      <SolverModal isOpen={showSolverModal} onClose={() => setShowSolverModal(false)} />
    </div>
  );
};

export default MonthlyPlanner;