import React from 'react';
import { Users, Truck, CalendarCheck, TrendingUp } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon, trend = 'neutral' }) => {
  const trendColors = {
    up: 'text-success bg-green-50',
    down: 'text-danger bg-red-50',
    neutral: 'text-text-muted bg-gray-50'
  };

  return (
    <div className="bg-surface p-5 rounded-xl border border-border shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-text-muted mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-text-main">{value}</h3>
        <p className="text-xs text-text-muted mt-2">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-lg ${trendColors[trend]}`}>
        {icon}
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-main">Tableau de bord</h2>
        <p className="text-text-muted mt-1">Vue d'ensemble de l'activité - Agence SGXV</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard 
          title="Effectifs Disponibles" 
          value="42" 
          subtitle="Personnels actifs aujourd'hui"
          icon={<Users size={24}/>}
          trend="up"
        />
        <KPICard 
          title="Besoins Véhicules" 
          value="18" 
          subtitle="Ambulances et VSL assignés"
          icon={<Truck size={24}/>}
          trend="neutral"
        />
        <KPICard 
          title="Taux de Couverture" 
          value="94%" 
          subtitle="Planning vs Besoins standard"
          icon={<CalendarCheck size={24}/>}
          trend="up"
        />
        <KPICard 
          title="Score Équité RH" 
          value="A-" 
          subtitle="Moyenne de l'agence"
          icon={<TrendingUp size={24}/>}
          trend="neutral"
        />
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm min-h-[400px]">
        <h3 className="text-lg font-bold text-text-main mb-4">Activité Récente</h3>
        <p className="text-text-muted text-sm italic">
          Le graphique d'activité et la liste des dernières modifications du planning apparaîtront ici.
        </p>
      </div>
    </div>
  );
};