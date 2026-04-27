import React, { useState } from 'react';
import { useAppState, Besoin } from '@/store/AppContext';
import { generateWeeklyRecurringBesoins } from '@/utils/planningAlgorithm';
import { 
  Calendar, ChevronLeft, ChevronRight, Plus, Download, 
  RefreshCw, Eye, Grid3X3, List, Sparkles, Users, MapPin,
  Clock, CheckCircle, AlertCircle, XCircle, Filter, Settings
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const quartLabels = {
  'matin': 'Matin (06h-14h)',
  'apres-midi': 'Après-midi (14h-22h)',
  'nuit': 'Nuit (22h-06h)',
};

const quartColors = {
  'matin': 'bg-amber-100 border-amber-300',
  'apres-midi': 'bg-orange-100 border-orange-300',
  'nuit': 'bg-indigo-100 border-indigo-300',
};

const statutConfig = {
  'complete': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' },
  'partiel': { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-300' },
  'non-couvert': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300' },
};

interface WeekData {
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

interface DayData {
  date: string;
  dayName: string;
  besoins: Besoin[];
}

export const MonthlyPlanner: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { besoins, personnel, bureaux } = state;
  
  const [currentWeek, setCurrentWeek] = useState(0);
  const [weeksToShow, setWeeksToShow] = useState(5);
  const [viewMode, setViewMode] = useState<'single' | 'multi'>('multi');
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedBureau, setSelectedBureau] = useState<string>('all');

  // Get the current month and year
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Generate weeks for the month (5 weeks by default)
  const generateMonthWeeks = (): WeekData[] => {
    const weeks: WeekData[] = [];
    
    for (let w = 0; w < weeksToShow; w++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + (w * 7) - today.getDay() + 1); // Start from Monday
      
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
      
      weeks.push({
        weekNumber: w + 1,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        days,
        stats,
      });
    }
    
    return weeks;
  };

  const weeks = generateMonthWeeks();

  // Generate recurring needs for a week
  const handleGenerateWeek = (weekIndex: number) => {
    setIsGenerating(true);
    
    const week = weeks[weekIndex];
    const recurringBesoins = besoins.filter(b => b.recurrente);
    
    // Generate needs for each day of the week
    week.days.forEach(day => {
      recurringBesoins.forEach(template => {
        // Check if need already exists
        const exists = besoins.some(
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
            recurrente: false, // Already generated, don't regenerate
            beneficiaire: template.beneficiaire,
          };
          
          dispatch({ type: 'ADD_BESOIN', payload: newBesoin });
        }
      });
    });
    
    setTimeout(() => {
      setIsGenerating(false);
      toast.success(`Semaine ${weekIndex + 1} générée !`);
    }, 1500);
  };

  // Generate all weeks
  const handleGenerateAllWeeks = () => {
    setIsGenerating(true);
    
    weeks.forEach((week, weekIndex) => {
      const recurringBesoins = besoins.filter(b => b.recurrente);
      
      week.days.forEach(day => {
        recurringBesoins.forEach(template => {
          const exists = besoins.some(
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
    });
    
    setTimeout(() => {
      setIsGenerating(false);
      toast.success(`Toutes les ${weeksToShow} semaines générées !`);
    }, 2000);
  };

  // Get stats for all weeks
  const totalStats = weeks.reduce(
    (acc, w) => ({
      total: acc.total + w.stats.total,
      covered: acc.covered + w.stats.covered,
      partial: acc.partial + w.stats.partial,
      uncovered: acc.uncovered + w.stats.uncovered,
    }),
    { total: 0, covered: 0, partial: 0, uncovered: 0 }
  );

  const coverageRate = totalStats.total > 0 
    ? Math.round((totalStats.covered / totalStats.total) * 100) 
    : 0;

  // Single week view
  const selectedWeekData = selectedWeek !== null ? weeks[selectedWeek] : weeks[0];

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <Calendar size={28} className="text-accent" />
            Planning Mensuel
          </h2>
          <p className="text-text-muted mt-1">
            {new Date(currentYear, currentMonth, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            {' - '}{weeksToShow} semaines
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleGenerateAllWeeks}
            className="bg-accent hover:bg-accent/90"
            disabled={isGenerating}
          >
            {isGenerating ? <RefreshCw size={16} className="mr-2 animate-spin" /> : <Sparkles size={16} className="mr-2" />}
            Générer tout
          </Button>
          
          <select
            value={selectedBureau}
            onChange={(e) => setSelectedBureau(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-lg text-text-main text-sm"
          >
            <option value="all">Tous les bureaux</option>
            {bureaux.map(bureau => (
              <option key={bureau.id} value={bureau.id}>{bureau.nom}</option>
            ))}
          </select>

          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setWeeksToShow(1)}
              className={`px-3 py-2 ${weeksToShow === 1 ? 'bg-accent text-white' : 'bg-surface text-text-main'}`}
            >
              1S
            </button>
            <button
              onClick={() => setWeeksToShow(2)}
              className={`px-3 py-2 ${weeksToShow === 2 ? 'bg-accent text-white' : 'bg-surface text-text-main'}`}
            >
              2S
            </button>
            <button
              onClick={() => setWeeksToShow(3)}
              className={`px-3 py-2 ${weeksToShow === 3 ? 'bg-accent text-white' : 'bg-surface text-text-main'}`}
            >
              3S
            </button>
            <button
              onClick={() => setWeeksToShow(5)}
              className={`px-3 py-2 ${weeksToShow === 5 ? 'bg-accent text-white' : 'bg-surface text-text-main'}`}
            >
              5S
            </button>
          </div>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4 bg-surface border-border rounded-xl text-center">
          <p className="text-3xl font-bold text-text-main">{totalStats.total}</p>
          <p className="text-sm text-text-muted">Besoins totaux</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200 rounded-xl text-center">
          <p className="text-3xl font-bold text-green-600">{totalStats.covered}</p>
          <p className="text-sm text-green-600">Couverts</p>
        </Card>
        <Card className="p-4 bg-yellow-50 border-yellow-200 rounded-xl text-center">
          <p className="text-3xl font-bold text-yellow-600">{totalStats.partial}</p>
          <p className="text-sm text-yellow-600">Partiels</p>
        </Card>
        <Card className="p-4 bg-red-50 border-red-200 rounded-xl text-center">
          <p className="text-3xl font-bold text-red-600">{totalStats.uncovered}</p>
          <p className="text-sm text-red-600">Non couverts</p>
        </Card>
        <Card className={`p-4 border-border rounded-xl text-center ${coverageRate >= 80 ? 'bg-green-50 border-green-200' : coverageRate >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-3xl font-bold ${coverageRate >= 80 ? 'text-green-600' : coverageRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {coverageRate}%
          </p>
          <p className="text-sm text-text-muted">Taux couverture</p>
        </Card>
      </div>

      {/* Week Tabs for single view */}
      {weeksToShow === 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {weeks.map((week, i) => (
            <button
              key={i}
              onClick={() => setSelectedWeek(i)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                selectedWeek === i 
                  ? 'bg-accent text-white' 
                  : 'bg-surface border border-border text-text-main hover:bg-bg'
              }`}
            >
              Semaine {week.weekNumber}
              <span className="ml-2 text-xs opacity-75">
                ({week.days[0].date.split('-')[2]}/{week.days[6].date.split('-')[2]})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Multi-week view */}
      {weeksToShow > 1 ? (
        <div className="space-y-6">
          {weeks.map((week, weekIndex) => (
            <Card key={weekIndex} className="bg-surface border-border rounded-xl overflow-hidden">
              {/* Week Header */}
              <div className="bg-accent/5 px-6 py-4 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="bg-accent text-white px-4 py-2 rounded-lg font-bold">
                    S{week.weekNumber}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main">
                      Semaine {week.weekNumber}
                    </h3>
                    <p className="text-sm text-text-muted">
                      {new Date(week.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      {' - '}
                      {new Date(week.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateWeek(weekIndex)}
                    disabled={isGenerating}
                  >
                    <Sparkles size={14} className="mr-1" />
                    Générer
                  </Button>
                </div>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-1 md:grid-cols-7 gap-2 p-4">
                {week.days.map((day, dayIndex) => (
                  <div 
                    key={dayIndex}
                    className={`p-3 rounded-lg border ${
                      day.date === new Date().toISOString().split('T')[0]
                        ? 'border-accent bg-accent/5'
                        : 'border-border bg-bg'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-main capitalize">
                        {day.dayName}
                      </span>
                      <span className="text-xs text-text-muted">
                        {day.date.split('-')[2]}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      {day.besoins.length > 0 ? (
                        day.besoins.map(besoin => {
                          const statusInfo = statutConfig[besoin.statut];
                          const StatusIcon = statusInfo.icon;
                          
                          return (
                            <div
                              key={besoin.id}
                              className={`p-2 rounded border text-xs ${statusInfo.bg} ${statusInfo.border}`}
                            >
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
                        <div className="text-center py-4 text-text-muted text-xs">
                          Aucun besoin
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Single week view */
        <Card className="bg-surface border-border rounded-xl overflow-hidden">
          <div className="bg-accent/5 px-6 py-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-4">
              <div className="bg-accent text-white px-4 py-2 rounded-lg font-bold">
                S{selectedWeekData.weekNumber}
              </div>
              <div>
                <h3 className="font-semibold text-text-main">
                  Semaine {selectedWeekData.weekNumber}
                </h3>
                <p className="text-sm text-text-muted">
                  {new Date(selectedWeekData.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  {' - '}
                  {new Date(selectedWeekData.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{selectedWeekData.stats.covered}</p>
                <p className="text-xs text-text-muted">Couverts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{selectedWeekData.stats.partial}</p>
                <p className="text-xs text-text-muted">Partiels</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-danger">{selectedWeekData.stats.uncovered}</p>
                <p className="text-xs text-text-muted">Non couverts</p>
              </div>
            </div>
          </div>

          {/* Detailed Days */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 p-6">
            {selectedWeekData.days.map((day, dayIndex) => (
              <div 
                key={dayIndex}
                className={`p-4 rounded-xl border ${
                  day.date === new Date().toISOString().split('T')[0]
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-bg'
                }`}
              >
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                  <span className="text-lg font-bold text-text-main capitalize">
                    {day.dayName}
                  </span>
                  <span className="text-sm text-text-muted">
                    {day.date.split('-')[2]}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {day.besoins.length > 0 ? (
                    day.besoins.map(besoin => {
                      const statusInfo = statutConfig[besoin.statut];
                      const StatusIcon = statusInfo.icon;
                      const bureau = bureaux.find(b => b.id === besoin.bureauId);
                      
                      return (
                        <div
                          key={besoin.id}
                          className={`p-3 rounded-lg border ${statusInfo.bg} ${statusInfo.border}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-text-main">{besoin.service}</span>
                            <StatusIcon size={16} className={statusInfo.color} />
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1 text-text-muted">
                              <Clock size={12} />
                              <span className="capitalize">{besoin.quart.replace('-', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-1 text-text-muted">
                              <MapPin size={12} />
                              <span className="truncate">{bureau?.nom}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 pt-2 border-t border-border">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-text-muted">Affectés</span>
                              <span className="font-bold text-text-main">
                                {besoin.personnelAffecte.length}/{besoin.personnelRequis}
                              </span>
                            </div>
                          </div>
                          
                          {besoin.personnelAffecte.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {besoin.personnelAffecte.map(id => {
                                const p = personnel.find(person => person.id === id);
                                return p ? (
                                  <span 
                                    key={id} 
                                    className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full"
                                  >
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
                      <Calendar size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucun besoin</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Personnel disponible */}
      <Card className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-main flex items-center gap-2">
            <Users size={20} className="text-success" />
            Personnel disponible cette période
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {personnel.filter(p => p.statut === 'disponible' && p.actif).map(p => (
            <span 
              key={p.id} 
              className="px-3 py-1.5 bg-white border border-green-200 text-success text-sm rounded-full font-medium"
            >
              {p.prenom} {p.nom}
              <span className="ml-1 text-xs opacity-60">({p.qualification.abreviation})</span>
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
};