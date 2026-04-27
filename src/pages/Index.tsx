import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Users, Calendar, ClipboardList, Activity as ActivityIcon, Briefcase, FileText, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppState } from '@/store/AppContext';

const Index = () => {
  const navigate = useNavigate();
  const { state } = useAppState();
  
  const today = state.selectedDate;
  const besoinsDuJour = state.besoins.filter(b => b.date === today);
  const activitiesDuJour = state.activites.filter(a => a.date === today);
  
  const besoinsComplets = besoinsDuJour.filter(b => b.statut === 'complete').length;
  const besoinsNonCouverts = besoinsDuJour.filter(b => b.statut === 'non-couvert').length;
  const disponibles = state.personnel.filter(p => p.statut === 'disponible').length;

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: TrendingUp, 
      title: 'Tableau de bord', 
      description: 'Vue d\'ensemble et KPIs',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    { 
      path: '/planning', 
      icon: Calendar, 
      title: 'Planning', 
      description: 'Génération automatique',
      color: 'bg-gradient-to-br from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      badge: 'Nouveau'
    },
    { 
      path: '/personnel', 
      icon: Users, 
      title: 'Personnel', 
      description: `${disponibles} disponibles`,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    { 
      path: '/besoins', 
      icon: ClipboardList, 
      title: 'Besoins', 
      description: `${besoinsComplets}/${besoinsDuJour.length} couverts`,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    { 
      path: '/activites', 
      icon: ActivityIcon, 
      title: 'Activités', 
      description: `${activitiesDuJour.length} prévues`,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    { 
      path: '/taches', 
      icon: Briefcase, 
      title: 'Tâches', 
      description: 'Tâches non roulantes',
      color: 'bg-gradient-to-br from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
    },
    { 
      path: '/absences', 
      icon: FileText, 
      title: 'Absences', 
      description: 'CP, RTT, RC',
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-accent to-accent-light text-white py-12 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <Activity size={40}/>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{state.currentAgence.nom}</h1>
              <p className="text-white/80 text-lg">{state.currentAgence.code} - {state.bureaux.length} sites</p>
            </div>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            Gestion optimale des affectations d'ambulances avec planification intelligente 
            et contrôle des contraintes légales.
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-2xl font-bold">{disponibles}</div>
              <div className="text-sm text-white/80">Disponibles</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-2xl font-bold">{besoinsComplets}/{besoinsDuJour.length}</div>
              <div className="text-sm text-white/80">Besoins couverts</div>
            </div>
            {besoinsNonCouverts > 0 && (
              <div className="bg-red-500/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-red-400/30">
                <div className="text-2xl font-bold">{besoinsNonCouverts}</div>
                <div className="text-sm text-white/80">Non couverts</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-8 -mt-4">
        <h2 className="text-xl font-bold text-text-main mb-4">Navigation rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <Card 
              key={item.path}
              className="p-5 bg-surface border-border rounded-xl hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => navigate(item.path)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center`}>
                  <item.icon size={24} className={item.iconColor}/>
                </div>
                {item.badge && (
                  <Badge className="bg-accent text-white text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-bold text-text-main mb-1">{item.title}</h3>
              <p className="text-sm text-text-muted mb-3">{item.description}</p>
              <div className={`w-full h-1 rounded-full bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </Card>
          ))}
        </div>
      </div>

      {/* Today's Summary */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Besoins du jour */}
          <Card className="p-6 bg-surface border-border rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                <ClipboardList size={20} className="text-accent" />
                Besoins du jour
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/besoins')}
                className="text-accent"
              >
                Voir tout <ArrowRight size={16} className="ml-1"/>
              </Button>
            </div>
            
            {besoinsDuJour.length > 0 ? (
              <div className="space-y-3">
                {besoinsDuJour.slice(0, 5).map((besoin) => (
                  <div 
                    key={besoin.id}
                    className="flex items-center justify-between p-3 bg-bg rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        besoin.statut === 'complete' ? 'bg-success' :
                        besoin.statut === 'partiel' ? 'bg-warning' : 'bg-danger'
                      }`} />
                      <div>
                        <p className="font-medium text-text-main">{besoin.service}</p>
                        <p className="text-xs text-text-muted capitalize">{besoin.quart.replace('-', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-text-main">{besoin.personnelAffecte.length}/{besoin.personnelRequis}</p>
                      <Badge 
                        variant="secondary"
                        className={`text-xs ${
                          besoin.statut === 'complete' ? 'bg-green-100 text-green-700' :
                          besoin.statut === 'partiel' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {besoin.statut === 'complete' ? 'OK' : besoin.statut === 'partiel' ? 'Partiel' : 'Non'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted">
                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                <p>Aucun besoin prévu aujourd'hui</p>
              </div>
            )}
          </Card>

          {/* Activités du jour */}
          <Card className="p-6 bg-surface border-border rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                <ActivityIcon size={20} className="text-accent" />
                Activités planifiées
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/activites')}
                className="text-accent"
              >
                Voir tout <ArrowRight size={16} className="ml-1"/>
              </Button>
            </div>
            
            {activitiesDuJour.length > 0 ? (
              <div className="space-y-3">
                {activitiesDuJour.slice(0, 4).map((activite) => (
                  <div 
                    key={activite.id}
                    className="flex items-center justify-between p-3 bg-bg rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={
                        activite.type === 'UPH' ? 'border-blue-500 text-blue-600' :
                        activite.type === 'manifestation' ? 'border-orange-500 text-orange-600' :
                        'border-purple-500 text-purple-600'
                      }>
                        {activite.type}
                      </Badge>
                      <div>
                        <p className="font-medium text-text-main">{activite.nom}</p>
                        <p className="text-xs text-text-muted">{activite.lieu}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-text-main">{activite.affectes.length}/{activite.besoins}</p>
                      <p className="text-xs text-text-muted">affectés</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted">
                <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p>Aucune activité prévue aujourd'hui</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;