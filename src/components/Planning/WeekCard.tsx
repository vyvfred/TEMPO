import React from 'react';
import { useAppState } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, AlertCircle, XCircle, Sparkles
} from 'lucide-react';

const statutConfig = {
  'complete': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' },
  'partiel': { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-300' },
  'non-couvert': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300' },
};

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
  besoins: import('@/store/AppContext').Besoin[];
}

interface WeekCardProps {
  week: WeekData;
  onGenerate: () => void;
  isToday: (date: string) => boolean;
  viewMode: 'compact' | 'detailed';
}

export const WeekCard: React.FC<WeekCardProps> = ({ week, onGenerate, isToday, viewMode }) => {
  return (
    <Card className="bg-surface border-border rounded-xl overflow-hidden">
      <div className="bg-accent/5 px-6 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-4">
          <div className="bg-accent text-white px-4 py-2 rounded-lg font-bold">
            S{week.weekNumber}
          </div>
          <div>
            <h3 className="font-semibold text-text-main">Semaine {week.weekNumber}</h3>
            <p className="text-sm text-text-muted">
              {formatDate(week.startDate)} - {formatDate(week.endDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <CheckCircle size={14} className="text-green-600" />
              {week.stats.covered}
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle size={14} className="text-yellow-600" />
              {week.stats.partial}
            </span>
            <span className="flex items-center gap-1">
              <XCircle size={14} className="text-red-600" />
              {week.stats.uncovered}
            </span>
          </div>
          <Button size="sm" variant="outline" onClick={onGenerate}>
            <Sparkles size={14} className="mr-1" />
            Générer
          </Button>
        </div>
      </div>
      <div className={`grid gap-2 p-4 ${viewMode === 'compact' ? 'grid-cols-1 md:grid-cols-7' : 'grid-cols-1 md:grid-cols-4 lg:grid-cols-7'}`}>
        {week.days.map((day, dayIndex) => (
          <DayCell key={dayIndex} day={day} isToday={isToday(day.date)} compact={viewMode === 'compact'} />
        ))}
      </div>
    </Card>
  );
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const DayCell: React.FC<{ day: DayData; isToday: boolean; compact: boolean }> = ({ day, isToday, compact }) => {
  const { state } = useAppState();

  if (compact) {
    return (
      <div className={`p-3 rounded-lg border ${isToday ? 'border-accent bg-accent/5' : 'border-border bg-bg'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-main">{day.dayName}</span>
          <span className="text-xs text-text-muted">{day.date.split('-')[2]}</span>
        </div>
        <div className="space-y-1">
          {day.besoins.length > 0 ? (
            day.besoins.map(besoin => {
              const statusInfo = statutConfig[besoin.statut];
              const StatusIcon = statusInfo.icon;
              return (
                <div key={besoin.id} className={`p-2 rounded border text-xs ${statusInfo.bg} ${statusInfo.border}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{besoin.service}</span>
                    <StatusIcon size={12} className={statusInfo.color} />
                  </div>
                  <div className="flex items-center justify-between text-text-muted">
                    <span className="capitalize">{besoin.quart.replace('-', ' ')}</span>
                    <span>{besoin.personnelAffecte.length}/{besoin.personnelRequis}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-text-muted text-xs">Aucun besoin</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border ${isToday ? 'border-accent bg-accent/5' : 'border-border bg-bg'}`}>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <span className="text-lg font-bold text-text-main">{day.dayName}</span>
        <span className="text-sm text-text-muted">{day.date.split('-')[2]}</span>
      </div>
      <div className="space-y-3">
        {day.besoins.length > 0 ? (
          day.besoins.map(besoin => {
            const statusInfo = statutConfig[besoin.statut];
            const StatusIcon = statusInfo.icon;
            const bureau = state.bureaux.find(b => b.id === besoin.bureauId);
            return (
              <div key={besoin.id} className={`p-3 rounded-lg border ${statusInfo.bg} ${statusInfo.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-text-main">{besoin.service}</span>
                  <StatusIcon size={16} className={statusInfo.color} />
                </div>
                <div className="space-y-1 text-sm text-text-muted">
                  <div className="flex items-center gap-1">
                    <span className="capitalize">{besoin.quart.replace('-', ' ')}</span>
                    <span>•</span>
                    <span className="truncate">{bureau?.nom}</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-text-muted">Affectés</span>
                  <span className="font-bold text-text-main">{besoin.personnelAffecte.length}/{besoin.personnelRequis}</span>
                </div>
                {besoin.personnelAffecte.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {besoin.personnelAffecte.map(id => {
                      const p = state.personnel.find(person => person.id === id);
                      return p ? (
                        <span key={id} className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full">
                          {p.prenom[0]}. {p.nom}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-text-muted">
            <p className="text-sm">Aucun besoin</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeekCard;