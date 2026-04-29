import React from 'react';
import { Card } from '@/components/ui/card';

interface StatsOverviewProps {
  stats: {
    total: number;
    covered: number;
    partial: number;
    uncovered: number;
  };
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const coverageRate = stats.total > 0 ? Math.round((stats.covered / stats.total) * 100) : 100;
  const colors = coverageRate >= 80 
    ? { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' }
    : coverageRate >= 50 
    ? { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600' }
    : { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card className="p-4 bg-surface border-border rounded-xl text-center">
        <p className="text-3xl font-bold text-text-main">{stats.total}</p>
        <p className="text-sm text-text-muted">Besoins totaux</p>
      </Card>
      <Card className="p-4 bg-green-50 border-green-200 rounded-xl text-center">
        <p className="text-3xl font-bold text-green-600">{stats.covered}</p>
        <p className="text-sm text-green-600">Couverts</p>
      </Card>
      <Card className="p-4 bg-yellow-50 border-yellow-200 rounded-xl text-center">
        <p className="text-3xl font-bold text-yellow-600">{stats.partial}</p>
        <p className="text-sm text-yellow-600">Partiels</p>
      </Card>
      <Card className="p-4 bg-red-50 border-red-200 rounded-xl text-center">
        <p className="text-3xl font-bold text-red-600">{stats.uncovered}</p>
        <p className="text-sm text-red-600">Non couverts</p>
      </Card>
      <Card className={`p-4 border rounded-xl text-center ${colors.bg} ${colors.border}`}>
        <p className={`text-3xl font-bold ${colors.text}`}>{coverageRate}%</p>
        <p className={`text-sm ${colors.text}`}>Taux couverture</p>
      </Card>
    </div>
  );
};

export default StatsOverview;