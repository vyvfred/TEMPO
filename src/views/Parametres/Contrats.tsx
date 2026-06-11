import React, { useState, useMemo } from 'react';
import { useAppState } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, Clock, TrendingUp, AlertTriangle, CheckCircle, 
  Users, FileText, Download, Search, Filter, BarChart3,
  ArrowUp, ArrowDown, Minus, Info, Shield
} from 'lucide-react';
import { toast } from 'sonner';

export const ParametresContrats: React.FC = () => {
  const { state } = useAppState();
  const { personnel, besoins } = state;
  const [filterBureau, setFilterBureau] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'hours' | 'days' | 'deficit'>('deficit');

  // Calculate weekly stats for each personnel
  const getWeeklyStats = (personId: string) => {
    const weekStart = new Date(state.selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const weekBesoins = besoins.filter(b => 
      b.personnelAffecte.includes(personId) && 
      b.date >= weekStartStr && 
      b.date <= weekEndStr
    );

    const hours = weekBesoins.length * 8;
    const days = new Set(weekBesoins.map(b => b.date)).size;

    return { hours, days };
  };

  // Personnel with contract analysis
  const personnelWithAnalysis = useMemo(() => {
    return personnel
      .filter(p => p.actif)
      .filter(p => filterBureau === 'all' || p.bureauId === filterBureau)
      .map(p => {
        const { hours, days } = getWeeklyStats(p.id);
        const contractHours = p.weeklyContractHours || 35;
        const expectedDays = p.weeklyExpectedDays || 5;
        
        const hoursGap = hours - contractHours;
        const daysGap = days - expectedDays;
        const hoursPercent = (hours / contractHours) * 100;
        const daysPercent = (days / expectedDays) * 100;

        let status: 'overload' | 'complete' | 'good' | 'deficit' = 'good';
        let statusLabel = 'En bonne voie';
        let statusColor = 'text-blue-600 bg-blue-50';

        if (hoursGap > 0 || daysGap > 0) {
          status = 'overload';
          statusLabel = 'Surcharge';
          statusColor = 'text-red-600 bg-red-50';
        } else if (hoursPercent >= 100 && daysPercent >= 100) {
          status = 'complete';
          statusLabel = 'Contrat atteint';
          statusColor = 'text-green-600 bg-green-50';
        } else if (hoursPercent >= 80 || daysPercent >= 80) {
          status = 'good';
          statusLabel = 'En bonne voie';
          statusColor = 'text-blue-600 bg-blue-50';
        } else {
          status = 'deficit';
          statusLabel = 'Sous-charge';
          statusColor = 'text-orange-600 bg-orange-50';
        }

        return {
          ...p,
          hours,
          days,
          contractHours,
          expectedDays,
          hoursGap,
          daysGap,
          hoursPercent,
          daysPercent,
          status,
          statusLabel,
          statusColor,
        };
      })
      .sort((a, b) => {
        if (sortBy === 'deficit') return a.hoursGap - b.hoursGap;
        if (sortBy === 'hours') return b.hours - a.hours;
        return b.days - a.days;
      });
  }, [personnel, besoins, state.selectedDate, filterBureau, sortBy]);

  // Global stats
  const globalStats = useMemo(() => {
    const totalHours = personnelWithAnalysis.reduce((sum, p) => sum + p.hours, 0);
    const totalContractHours = personnelWithAnalysis.reduce((sum, p) => sum + p.contractHours, 0);
    const totalDays = personnelWithAnalysis.reduce((sum, p) => sum + p.days, 0);
    const totalExpectedDays = personnelWithAnalysis.reduce((sum, p) => sum + p.expectedDays, 0);
    
    const overloaded = personnelWithAnalysis.filter(p => p.status === 'overload').length;
    const underloaded = personnelWithAnalysis.filter(p => p.status === 'deficit').length;
    const compliant = personnelWithAnalysis.filter(p => p.status === 'complete' || p.status === 'good').length;

    return {
      totalHours,
      totalContractHours,
      totalDays,
      totalExpectedDays,
      overloaded,
      underloaded,
      compliant,
      totalPersonnel: personnelWithAnalysis.length,
    };
  }, [personnelWithAnalysis]);

  const handleExportReport = () => {
    const headers = ['Nom', 'Prénom', 'Heures réalisées', 'Heures contrat', 'Écart heures', 'Jours réalisés', 'Jours attendus', 'Écart jours', 'Statut'];
    const rows = personnelWithAnalysis.map(p => [
      p.nom,
      p.prenom,
      p.hours,
      p.contractHours,
      p.hoursGap,
      p.days,
      p.expectedDays,
      p.daysGap,
      p.statusLabel,
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapport_contrats_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Rapport des contrats exporté');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
          <Calendar size={28} className="text-accent" />
          Tableau de Bord des Contrats
        </h2>
        <p className="text-text-muted mt-1">Suivi hebdomadaire des heures et jours de travail par rapport aux contrats</p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-5 bg-surface border-border rounded-xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock size={20} className="text-accent" />
            <span className="text-sm text-text-muted font-medium">Heures réalisées</span>
          </div>
          <p className="text-3xl font-extrabold text-text-main">{globalStats.totalHours}h</p>
          <p className="text-xs text-text-muted">/ {globalStats.totalContractHours}h contratées</p>
          <Progress 
            value={Math.min(100, (globalStats.totalHours / globalStats.totalContractHours) * 100)} 
            className="mt-2 h-2" 
          />
        </Card>

        <Card className="p-5 bg-surface border-border rounded-xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar size={20} className="text-accent" />
            <span className="text-sm text-text-muted font-medium">Jours réalisés</span>
          </div>
          <p className="text-3xl font-extrabold text-text-main">{globalStats.totalDays}j</p>
          <p className="text-xs text-text-muted">/ {globalStats.totalExpectedDays}j attendus</p>
          <Progress 
            value={Math.min(100, (globalStats.totalDays / globalStats.totalExpectedDays) * 100)} 
            className="mt-2 h-2" 
          />
        </Card>

        <Card className="p-5 bg-green-50 border-green-200 rounded-xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle size={20} className="text-green-600" />
            <span className="text-sm text-green-600 font-medium">Conforme</span>
          </div>
          <p className="text-3xl font-extrabold text-green-600">{globalStats.compliant}</p>
          <p className="text-xs text-green-600">employés dans les clous</p>
        </Card>

        <Card className="p-5 bg-red-50 border-red-200 rounded-xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle size={20} className="text-red-600" />
            <span className="text-sm text-red-600 font-medium">Alertes</span>
          </div>
          <p className="text-3xl font-extrabold text-red-600">{globalStats.overloaded + globalStats.underloaded}</p>
          <p className="text-xs text-red-600">{globalStats.overloaded} surcharge, {globalStats.underloaded} sous-charge</p>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="p-4 bg-surface border-border rounded-xl mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filterBureau}
              onChange={(e) => setFilterBureau(e.target.value)}
              className="px-3 py-2 bg-bg border border-border rounded-lg text-text-main text-sm"
            >
              <option value="all">Tous les bureaux</option>
              {state.bureaux.map(bureau => (
                <option key={bureau.id} value={bureau.id}>{bureau.nom}</option>
              ))}
            </select>

            <div className="flex items-center gap-2 text-sm text-text-muted">
              <span>Trier par:</span>
              <button
                onClick={() => setSortBy('deficit')}
                className={`px-3 py-1 rounded-lg ${sortBy === 'deficit' ? 'bg-accent text-white' : 'bg-bg hover:bg-slate-100'}`}
              >
                Déficit
              </button>
              <button
                onClick={() => setSortBy('hours')}
                className={`px-3 py-1 rounded-lg ${sortBy === 'hours' ? 'bg-accent text-white' : 'bg-bg hover:bg-slate-100'}`}
              >
                Heures
              </button>
              <button
                onClick={() => setSortBy('days')}
                className={`px-3 py-1 rounded-lg ${sortBy === 'days' ? 'bg-accent text-white' : 'bg-bg hover:bg-slate-100'}`}
              >
                Jours
              </button>
            </div>
          </div>

          <Button onClick={handleExportReport} variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Exporter le rapport
          </Button>
        </div>
      </Card>

      {/* Personnel List with Contract Details */}
      <Card className="bg-surface border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg border-b border-border">
              <tr>
                <th className="text-left p-4 font-medium text-text-muted">Salarié</th>
                <th className="text-center p-4 font-medium text-text-muted">Heures réalisées</th>
                <th className="text-center p-4 font-medium text-text-muted">Contrat</th>
                <th className="text-center p-4 font-medium text-text-muted">Écart</th>
                <th className="text-center p-4 font-medium text-text-muted">Jours</th>
                <th className="text-center p-4 font-medium text-text-muted">Attendus</th>
                <th className="text-center p-4 font-medium text-text-muted">Écart</th>
                <th className="text-center p-4 font-medium text-text-muted">Statut</th>
              </tr>
            </thead>
            <tbody>
              {personnelWithAnalysis.map((person) => (
                <tr key={person.id} className="border-b border-border hover:bg-bg transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        person.status === 'overload' ? 'bg-red-500' :
                        person.status === 'deficit' ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}>
                        {person.prenom[0]}{person.nom[0]}
                      </div>
                      <div>
                        <p className="font-medium text-text-main">{person.prenom} {person.nom}</p>
                        <p className="text-xs text-text-muted">{person.qualification.abreviation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-lg font-bold text-text-main">{person.hours}h</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-lg font-bold text-text-muted">{person.contractHours}h</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className={`flex items-center justify-center gap-1 ${
                      person.hoursGap > 0 ? 'text-red-600' :
                      person.hoursGap < 0 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {person.hoursGap > 0 ? <ArrowUp size={16} /> : person.hoursGap < 0 ? <ArrowDown size={16} /> : <Minus size={16} />}
                      <span className="font-bold">{Math.abs(person.hoursGap)}h</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-lg font-bold text-text-main">{person.days}j</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-lg font-bold text-text-muted">{person.expectedDays}j</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className={`flex items-center justify-center gap-1 ${
                      person.daysGap > 0 ? 'text-red-600' :
                      person.daysGap < 0 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {person.daysGap > 0 ? <ArrowUp size={16} /> : person.daysGap < 0 ? <ArrowDown size={16} /> : <Minus size={16} />}
                      <span className="font-bold">{Math.abs(person.daysGap)}j</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Badge className={`${person.statusColor} border font-bold text-xs uppercase`}>
                      {person.statusLabel}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {personnelWithAnalysis.length === 0 && (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-text-muted">Aucun personnel trouvé</p>
          </div>
        )}
      </Card>

      {/* Info Box */}
      <Card className="p-5 bg-blue-50 border-blue-200 rounded-xl mt-6">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-text-muted space-y-1">
            <h4 className="font-bold text-text-main text-sm mb-1">Comment fonctionne le suivi des contrats ?</h4>
            <ul className="space-y-1">
              <li>• Les heures et jours sont calculés sur la semaine en cours (lundi au dimanche)</li>
              <li>• Chaque affectation à un besoin compte pour 8 heures de travail</li>
              <li>• Le solveur de planning utilise ces données pour équilibrer la charge de travail</li>
              <li>• Les employés en déficit sont prioritaires pour de nouvelles affectations</li>
              <li>• Les employés en surcharge sont déprioritisés par le solveur</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ParametresContrats;