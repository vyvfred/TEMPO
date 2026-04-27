import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/store/AppContext';
import { 
  Users, Truck, CalendarCheck, AlertTriangle, TrendingUp, 
  Activity as ActivityIcon, Briefcase, Clock, Award,
  ArrowRight, CheckCircle, XCircle, UserPlus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: number;
  color: string;
  bgColor: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon, trend, color, bgColor }) => {
  return (
    <Card className="p-5 bg-surface border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-muted mb-1">{title}</p>
          <h3 className="text-3xl font-bold" style={{ color }}>{value}</h3>
          <p className="text-xs text-text-muted mt-2">{subtitle}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
              <TrendingUp size={14} className={trend < 0 ? 'rotate-180' : ''} />
              <span>{Math.abs(trend)}% vs hier</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`} style={{ color }}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const { state } = useAppState();
  const navigate = useNavigate();
  const { personnel, besoins, activites, taches } = state;

  // Calcul des KPIs réels
  const today = state.selectedDate;
  const besoinsDuJour = besoins.filter(b => b.date === today);
  
  const disponibles = personnel.filter(p => p.statut === 'disponible').length;
  const enPoste = personnel.filter(p => p.statut === 'en-poste').length;
  const enFormation = personnel.filter(p => p.statut === 'formation').length;
  const enConge = personnel.filter(p => p.statut === 'conge').length;
  
  const besoinsComplets = besoinsDuJour.filter(b => b.statut === 'complete').length;
  const besoinsPartiels = besoinsDuJour.filter(b => b.statut === 'partiel').length;
  const besoinsNonCouverts = besoinsDuJour.filter(b => b.statut === 'non-couvert').length;
  const tauxCouverture = besoinsDuJour.length > 0 
    ? Math.round((besoinsComplets / besoinsDuJour.length) * 100) 
    : 0;

  const activitiesDuJour = activites.filter(a => a.date === today);
  const tachesDuJour = taches.filter(t => t.date === today);

  // Données pour graphiques
  const statutData = [
    { name: 'Complets', value: besoinsComplets, color: '#10b981' },
    { name: 'Partiels', value: besoinsPartiels, color: '#f59e0b' },
    { name: 'Non couverts', value: besoinsNonCouverts, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const quartData = ['matin', 'apres-midi', 'nuit'].map(quart => {
    const besoinsQuart = besoinsDuJour.filter(b => b.quart === quart);
    return {
      name: quart === 'matin' ? 'Matin' : quart === 'apres-midi' ? 'Après-midi' : 'Nuit',
      besoins: besoinsQuart.length,
      couverts: besoinsQuart.filter(b => b.statut === 'complete').length,
    };
  });

  const bureauData = state.bureaux.map(bureau => {
    const bureauPersonnel = personnel.filter(p => p.bureauId === bureau.id);
    return {
      name: bureau.nom.replace('Bureau ', '').replace('Antenne ', ''),
      disponibles: bureauPersonnel.filter(p => p.statut === 'disponible').length,
      enPoste: bureauPersonnel.filter(p => p.statut === 'en-poste').length,
    };
  });

  // Besoins critiques
  const besoinsCritiques = besoinsDuJour.filter(b => b.statut === 'non-couvert');

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Tableau de bord</h2>
          <p className="text-text-muted mt-1">
            {new Date(today).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button onClick={() => navigate('/planning')} className="bg-accent hover:bg-accent/90">
          <ActivityIcon size={18} className="mr-2" />
          Générer Planning
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard 
          title="Effectifs Disponibles" 
          value={disponibles} 
          subtitle={`${personnel.filter(p => p.actif).length} actifs au total`}
          icon={<Users size={28}/>}
          trend={5}
          color="#10b981"
          bgColor="bg-green-50"
        />
        <KPICard 
          title="En Poste" 
          value={enPoste} 
          subtitle={`${activitiesDuJour.length} activités`}
          icon={<Truck size={28}/>}
          color="#0f766e"
          bgColor="bg-teal-50"
        />
        <KPICard 
          title="Taux de Couverture" 
          value={`${tauxCouverture}%`} 
          subtitle={`${besoinsComplets}/${besoinsDuJour.length} besoins`}
          icon={<CalendarCheck size={28}/>}
          trend={tauxCouverture >= 80 ? 12 : -8}
          color={tauxCouverture >= 80 ? '#10b981' : '#f59e0b'}
          bgColor={tauxCouverture >= 80 ? 'bg-green-50' : 'bg-yellow-50'}
        />
        <KPICard 
          title="Alertes" 
          value={besoinsNonCouverts + besoinsPartiels} 
          subtitle={`${besoinsNonCouverts} non couverts`}
          icon={<AlertTriangle size={28}/>}
          color={besoinsNonCouverts > 0 ? '#ef4444' : '#10b981'}
          bgColor={besoinsNonCouverts > 0 ? 'bg-red-50' : 'bg-green-50'}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-surface border border-border rounded-xl text-center">
          <Award size={24} className="mx-auto mb-2 text-blue-600" />
          <p className="text-2xl font-bold text-text-main">{enFormation}</p>
          <p className="text-xs text-text-muted">En formation</p>
        </div>
        <div className="p-4 bg-surface border border-border rounded-xl text-center">
          <Clock size={24} className="mx-auto mb-2 text-purple-600" />
          <p className="text-2xl font-bold text-text-main">{enConge}</p>
          <p className="text-xs text-text-muted">En congé</p>
        </div>
        <div className="p-4 bg-surface border border-border rounded-xl text-center">
          <Briefcase size={24} className="mx-auto mb-2 text-orange-600" />
          <p className="text-2xl font-bold text-text-main">{tachesDuJour.length}</p>
          <p className="text-xs text-text-muted">Tâches du jour</p>
        </div>
        <div className="p-4 bg-surface border border-border rounded-xl text-center">
          <ActivityIcon size={24} className="mx-auto mb-2 text-indigo-600" />
          <p className="text-2xl font-bold text-text-main">{activitiesDuJour.length}</p>
          <p className="text-xs text-text-muted">Activités</p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Statut des besoins */}
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
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
              <CheckCircle size={32} className="mr-2" />
              Aucun besoin aujourd'hui
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

        {/* Besoins par quart */}
        <Card className="p-6 bg-surface border-border rounded-xl">
          <h3 className="text-lg font-bold text-text-main mb-4">Répartition par Quart</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={quartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="besoins" name="Total" fill="#0f766e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="couverts" name="Couverts" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Personnel par bureau */}
      <Card className="p-6 bg-surface border-border rounded-xl mb-8">
        <h3 className="text-lg font-bold text-text-main mb-4">Effectifs par Bureau</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={bureauData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="disponibles" name="Disponibles" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="enPoste" name="En poste" fill="#0f766e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Alertes */}
      {besoinsCritiques.length > 0 && (
        <Card className="p-6 bg-red-50 border-2 border-red-200 rounded-xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={24} className="text-danger" />
              <h3 className="text-lg font-bold text-danger">Besoins Non Couverts</h3>
            </div>
            <Badge variant="destructive">{besoinsCritiques.length}</Badge>
          </div>
          <div className="space-y-2">
            {besoinsCritiques.map(besoin => {
              const bureau = state.bureaux.find(b => b.id === besoin.bureauId);
              return (
                <div key={besoin.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-red-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <XCircle size={20} className="text-danger" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-main">{besoin.service}</p>
                      <p className="text-sm text-text-muted">{bureau?.nom} • {besoin.quart.replace('-', ' ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-danger">{besoin.personnelRequis}</p>
                    <p className="text-xs text-text-muted">requis</p>
                  </div>
                </div>
              );
            })}
          </div>
          <Button 
            onClick={() => navigate('/besoins')}
            variant="outline" 
            className="w-full mt-4 border-red-300 text-red-600 hover:bg-red-100"
          >
            Gérer les besoins <ArrowRight size={16} className="ml-2" />
          </Button>
        </Card>
      )}

      {/* Actions rapides */}
      <Card className="p-6 bg-surface border-border rounded-xl">
        <h3 className="text-lg font-bold text-text-main mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={() => navigate('/personnel')}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <UserPlus size={24} className="text-accent" />
            <span>Ajouter personnel</span>
          </Button>
          <Button 
            onClick={() => navigate('/besoins')}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <CalendarCheck size={24} className="text-accent" />
            <span>Créer un besoin</span>
          </Button>
          <Button 
            onClick={() => navigate('/activites')}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <ActivityIcon size={24} className="text-accent" />
            <span>Planifier activité</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};