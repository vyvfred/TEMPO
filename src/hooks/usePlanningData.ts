import { useMemo } from 'react';
import { useAppState } from '@/store/AppContext';
import type { Besoin } from '@/store/AppContext';

export interface WeekData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  days: DayData[];
  stats: {
    total: number;
    covered: number;
    partial: number;
    uncovered: number;
  };
}

export interface DayData {
  date: string;
  dayName: string;
  besoins: Besoin[];
}

export function usePlanningData(selectedBureau: string = 'all') {
  const { state } = useAppState();
  const besoins = state.besoins;

  const generateMonthWeeks = useMemo((): WeekData[] => {
    const today = new Date();
    const weeks: WeekData[] = [];
    
    for (let w = 0; w < 5; w++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + (w * 7) - today.getDay() + 1);
      
      const days: DayData[] = [];
      let stats = { total: 0, covered: 0, partial: 0, uncovered: 0 };
      
      for (let d = 0; d < 7; d++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayBesoins = besoins.filter(b => {
          if (b.date !== dateStr) return false;
          if (selectedBureau !== 'all' && b.bureauId !== selectedBureau) return false;
          return true;
        });
        
        dayBesoins.forEach(b => {
          stats.total++;
          if (b.statut === 'complete') stats.covered++;
          else if (b.statut === 'partiel') stats.partial++;
          else stats.uncovered++;
        });
        
        days.push({
          date: dateStr,
          dayName: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
          besoins: dayBesoins,
        });
      }
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      weeks.push({
        weekNumber: w + 1,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
        days,
        stats,
      });
    }
    
    return weeks;
  }, [besoins, selectedBureau]);

  const totalStats = useMemo(() => ({
    total: generateMonthWeeks.reduce((acc, w) => acc + w.stats.total, 0),
    covered: generateMonthWeeks.reduce((acc, w) => acc + w.stats.covered, 0),
    partial: generateMonthWeeks.reduce((acc, w) => acc + w.stats.partial, 0),
    uncovered: generateMonthWeeks.reduce((acc, w) => acc + w.stats.uncovered, 0),
  }), [generateMonthWeeks]);

  const isToday = (dateStr: string): boolean => dateStr === new Date().toISOString().split('T')[0];

  return { weeks: generateMonthWeeks, totalStats, isToday };
}

export default usePlanningData;