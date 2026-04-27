import React from 'react';
import { useAppState } from '@/store/AppContext';
import { Users, Truck, CalendarCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon, trend = 'neutral', color = 'bg-gray-50 text-text-muted' }) => {
  return (
    <Card className="p-5 bg-surface border-border rounded-xl shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-text-muted mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-text-main">{value}</h3>
        <p className="text-xs text-text-muted mt-2">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const { state } = useAppState();
  const { personnel, besoins } = state;

  // Calcul des KPIs réels
  const today = state.selectedDate;
  const besoinsDuJour = besoins.filter(b => b.date === today);
  
  const disponibles = personnel.filter(p => p.statut === 'disponible').length;
  const enPoste = personnel.filter(p => p.statut === 'en-poste').length;
  const totalActifs = disponibles + enPoste;
  
  const besoinsComplets = besoinsDuJour.filter(b => b.statut === 'complete').length;
  const besoinsPartiels = besoinsDuJour.filter(b => b.statut === 'partiel').length;
  const besoinsNonCouverts = besoinsDuJour.filter(b => b.statut === 'non-couvert').length;
  const tauxCouverture = besoinsDuJour.length > 0 
    ? Math.round((besoinsComplets / besoinsDuJour.length) * 100) 
    : 0;

  // Besoins critiques (non couverts)
  const besoinsCritiques = besoinsDuJour.filter(b => b.statut === 'non-couvert');

  // Données pour le graphique en barres (besoins par service)
  const servicesData = besoinsDuJour.reduce((acc, besoin) => {
    const existing = acc.find(a => a.name === besoin.service);
    if (existing) {
      existing.value += besoin.personnelRequis;
    } else {
      acc.push({ name: besoin.service, value: besoin.personnelRequis });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Données pour le camembert (statuts)
  const statutData = [
    { name: 'Complets', value: besoinsComplets, color: '#10b981' },
    { name: 'Partiels', value: besoinsPartiels, color: '#f59e0b' },
    { name: 'Non couverts', value: besoinsNonCouverts, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Données par quart
  const quartData = ['matin', 'apres-midi', 'nuit'].map(quart => {
    const besoinsQuart = besoinsDuJour.filter(b => b.quart === quart);
    const labels = { matin: 'Matin', 'apres-midi': 'A-Midi', nuit: 'Nuit' };
    return {
      name: labels[quart as keyof typeof labels],
      besoins: besoinsQuart.length,
      couverts: besoinsQuart.filter(b => b.statut === 'complete').length,
    };
  });

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-main">Tableau de bord</h2>
        <p className="text-text-muted mt-1">
          {new Date(today).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard 
          title="Effectifs Disponibles" 
          value={disponibles} 
          subtitle={`${totalActifs} actifs aujourd'hui`}
          icon={<Users size={24}/>}
          trend={disponibles > 5 ? 'up' : 'down'}
          color="bg-green-50 text-success"
        />
        <KPICard 
          title="En Poste" 
          value={enPoste} 
          subtitle={`${personnel.length} effectifs totaux`}
          icon={<Truck size={24}/>}
          trend="neutral"
          color="bg-blue-50 text-blue-600"
        />
        <KPICard 
          title="Taux de Couverture" 
          value={`${tauxCouverture}%`} 
          subtitle={`${besoinsComplets}/${besoinsDuJour.length} besoins couverts`}
          icon={<CalendarCheck size={24}/>}
          trend={tauxCouverture >= 80 ? 'up' : 'down'}
          color={tauxCouverture >= 80 ? 'bg-green-50 text-success' : 'bg-yellow-50 text-warning'}
        />
        <KPICard 
          title="Alertes" 
          value={besoinsNonCouverts + besoinsPartiels} 
          subtitle={`${besoinsNonCouverts} non couverts, ${besoinsPartiels} partiels`}
          icon={<AlertTriangle size={24}/>}
          trend={besoinsNonCouverts > 0 ? 'down' : 'up'}
          color={besoinsNonCouverts > 0 ? 'bg-red-50 text-danger' : 'bg-green-50 text-success'}
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Graphique en barres - Besoins par service */}
        <Card className="p-6 bg-surface border-border rounded-xl">
          <h3 className="text-lg font-bold text-text-main mb-4">Besoins par Service</h3>
          {servicesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={servicesData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-text-muted">
              Aucune donnée disponible
            </div>
          )}
        </Card>

        {/* Camembert - Statuts des besoins */}
        <Card className="p-6 bg-surface border-border rounded-xl">
          <h3 className="text-lg font-bold text-text-main mb-4">Statut des Besoins</h3>
          {statutData.length > 0 ? (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-text-muted">
              Aucune donnée disponible
            </div>
          )}
          <div className="flex justify-center gap-4 mt-4">
            {statutData.map((statut, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statut.color }} />
                <span className="text-sm text-text-muted">{statut.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Graphique par quart */}
      <Card className="p-6 bg-surface border-border rounded-xl mb-8">
        <h3 className="text-lg font-bold text-text-main mb-4">Répartition par Quart</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={quartData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="besoins" name="Total besoins" fill="#0f766e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="couverts" name="Couverts" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Section des alertes */}
      {besoinsCritiques.length > 0 && (
        <Card className="p-6 bg-red-50 border-danger rounded-xl mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-danger" />
            <h3 className="text-lg font-bold text-danger">Besoins Non Couverts</h3>
          </div>
          <div className="space-y-2">
            {besoinsCritiques.map(besoin => (
              <div key={besoin.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-100">
                <div>
                  <span className="font-semibold text-text-main">{besoin.service}</span>
                  <span className="text-text-muted ml-2">• {besoin.quart}</span>
                </div>
                <div className="text-sm text-danger">
                  {besoin.personnelRequis} agent(s) requis
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Résumé par quart */}
      <Card className="p-6 bg-surface border-border rounded-xl">
        <h3 className="text-lg font-bold text-text-main mb-4">Vue d'ensemble</h3>
        <div className="grid grid-cols-3 gap-4">
          {['matin', 'apres-midi', 'nuit'].map(quart => {
            const besoinsQuart = besoinsDuJour.filter(b => b.quart === quart);
            const labels = { matin: 'Matin', 'apres-midi': 'Après-midi', nuit: 'Nuit' };
            return (
              <div key={quart} className="text-center p-4 bg-bg rounded-lg">
                <p className="text-sm text-text-muted mb-1">{labels[quart as keyof typeof labels]}</p>
                <p className="text-2xl font-bold text-text-main">{besoinsQuart.length}</p>
                <p className="text-xs text-text-muted">besoins</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};