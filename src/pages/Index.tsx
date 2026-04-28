import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, Shield, Calendar, Activity, 
  Briefcase, FileText, Settings, HelpCircle, AlertTriangle,
  TrendingUp, CheckCircle, Clock, MapPin, Sun, Moon,
  ChevronRight, Zap, Database, RefreshCw, Home
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppState } from '@/store/AppContext';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppState();
  
  const today = state.selectedDate;
  const besoinsDuJour = state.besoins.filter(b => b.date === today);
  const activitiesDuJour = state.activites.filter(a => a.date === today);
  
  const besoinsComplets = besoinsDuJour.filter(b => b.statut === 'complete').length;
  const besoinsNonCouverts = besoinsDuJour.filter(b => b.statut === 'non-couvert').length;
  const disponibles = state.personnel.filter(p => p.statut === 'disponible').length;
  const enFormation = state.personnel.filter(p => p.statut === 'formation').length;

  // Module zones
  const zones = [
    {
      id: 'ressources',
      title: 'Ressources',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      modules: [
        { path: '/agences', icon: Building2, label: 'Agences & Bureaux', description: 'Multi-agences, sites' },
        { path: '/personnel', icon: Users, label: 'Personnel', description: 'Fiches salariés' },
        { path: '/equite', icon: Shield, label: 'Équité & Préférences', description: 'Score, appétences' },
        { path: '/absences', icon: Calendar, label: 'Absences & Congés', description: 'CP, RTT, Maladie' },
      ]
    },
    {
      id: 'besoins',
      title: 'Besoins',
      icon: Activity,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      modules: [
        { path: '/besoins', icon: Activity, label: 'Besoins Standards', description: 'Trames, roulement' },
        { path: '/activites', icon: Zap, label: 'Activités Ponctuelles', description: 'UPH, Manifestations' },
        { path: '/taches', icon: Briefcase, label: 'Tâches Internes', description: 'Régulation, Formation' },
      ]
    },
    {
      id: 'planification',
      title: 'Planification',
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      modules: [
        { path: '/parametres-solveur', icon: Settings, label: 'Paramètres Solveur', description: 'Règles légales' },
        { path: '/planning', icon: Calendar, label: 'Génération Planning', description: 'Solveur, verrouillage' },
        { path: '/planning-visuel', icon: TrendingUp, label: 'Planning Visuel', description: 'Tableau interactif' },
      ]
    },
    {
      id: 'pilotage',
      title: 'Pilotage',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      modules: [
        { path: '/dashboard', icon: TrendingUp, label: 'Tableau de Bord', description: 'KPIs, alertes' },
        { path: '/rapports', icon: FileText, label: 'Rapports', description: 'Export, stats' },
      ]
    },
    {
      id: 'aide',
      title: 'Aide',
      icon: HelpCircle,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      modules: [
        { path: '/guide', icon: HelpCircle, label: 'Guide Utilisation', description: 'Workflow, FAQ' },
        { path: '/parametres', icon: Settings, label: 'Paramètres App', description: 'Config générale' },
      ]
    },
  ];

  // Quick stats
  const quickStats = [
    { label: 'Disponibles', value: disponibles, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'En Formation', value: enFormation, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Besoins Couverts', value: `${besoinsComplets}/${besoinsDuJour.length}`, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Non Couverts', value: besoinsNonCouverts, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  // Panic button - reset localStorage
  const handlePanicReset = () => {
    if (confirm('⚠️ ATTENTION : Cette action va supprimer TOUTES vos données et réinitialiser l\'application.\n\nÊtes-vous sûr de vouloir continuer ?')) {
      localStorage.removeItem('ambuplan_data');
      toast.success('Cache effacé. Rechargement en cours...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent to-accent-light text-white py-8 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                <Activity size={36} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{state.currentAgence.nom}</h1>
                <p className="text-white/80 text-sm">{state.currentAgence.code} • {state.bureaux.length} sites • {state.personnel.length} salariés</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-3">
              {quickStats.map((stat, i) => (
                <div key={i} className={`${stat.bg} backdrop-blur-sm rounded-lg px-4 py-2 text-center`}>
                  <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Date selector hint */}
          <p className="text-white/70 text-sm mt-4">
            📅 {new Date(today).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        
        {/* Module Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {zones.map((zone) => (
            <Card 
              key={zone.id}
              className={`p-5 bg-surface border-2 ${zone.borderColor} rounded-xl overflow-hidden`}
            >
              {/* Zone Header */}
              <div className={`bg-gradient-to-r ${zone.color} text-white px-4 py-3 -mx-5 -mt-5 mb-4`}>
                <div className="flex items-center gap-2">
                  <zone.icon size={20} />
                  <h3 className="font-bold">{zone.title}</h3>
                </div>
              </div>
              
              {/* Modules List */}
              <div className="space-y-2">
                {zone.modules.map((mod, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(mod.path)}
                    className="w-full flex items-center gap-3 p-3 bg-bg rounded-lg hover:bg-accent/5 transition-colors text-left group"
                  >
                    <div className={`w-10 h-10 ${zone.bgColor} rounded-lg flex items-center justify-center`}>
                      <mod.icon size={18} className={zone.color.replace('from-', 'text-').replace(' to-', '')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-main text-sm">{mod.label}</p>
                      <p className="text-xs text-text-muted truncate">{mod.description}</p>
                    </div>
                    <ChevronRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Today's Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Besoins du jour */}
          <Card className="p-6 bg-surface border-border rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                <Activity size={20} className="text-accent" />
                Besoins du jour
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/besoins')}
                className="text-accent"
              >
                Voir tout <ChevronRight size={16} className="ml-1"/>
              </Button>
            </div>
            
            {besoinsDuJour.length > 0 ? (
              <div className="space-y-3">
                {besoinsDuJour.slice(0, 5).map((besoin) => {
                  const bureau = state.bureaux.find(b => b.id === besoin.bureauId);
                  return (
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
                          <p className="text-xs text-text-muted">{bureau?.nom} • {besoin.quart.replace('-', ' ')}</p>
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
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted">
                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                <p>Aucun besoin prévu aujourd'hui</p>
              </div>
            )}
          </Card>

          {/* Personnel disponible */}
          <Card className="p-6 bg-surface border-border rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                <Users size={20} className="text-accent" />
                Personnel disponible
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/personnel')}
                className="text-accent"
              >
                Voir tout <ChevronRight size={16} className="ml-1"/>
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {state.personnel.filter(p => p.statut === 'disponible' && p.actif).length > 0 ? (
                state.personnel.filter(p => p.statut === 'disponible' && p.actif).map((p) => (
                  <span 
                    key={p.id} 
                    className="px-3 py-1.5 bg-green-50 border border-green-200 text-success text-sm rounded-full font-medium"
                  >
                    {p.prenom} {p.nom[0]}.
                    {p.preferenciasNuit && <Moon size={12} className="inline ml-1 text-blue-500" />}
                    {p.preferenciasWE && <Sun size={12} className="inline ml-1 text-purple-500" />}
                  </span>
                ))
              ) : (
                <div className="text-center py-8 text-text-muted w-full">
                  <Users size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Aucun personnel disponible</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Alerts Section */}
        {besoinsNonCouverts > 0 && (
          <Card className="p-6 bg-red-50 border-2 border-red-200 rounded-xl mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} className="text-danger" />
              <h3 className="text-lg font-bold text-danger">Alertes de Couverture</h3>
              <Badge variant="destructive">{besoinsNonCouverts} besoin{besoinsNonCouverts > 1 ? 's' : ''}</Badge>
            </div>
            <div className="space-y-2">
              {besoinsDuJour.filter(b => b.statut === 'non-couvert').map((besoin) => {
                const bureau = state.bureaux.find(b => b.id === besoin.bureauId);
                return (
                  <div key={besoin.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <MapPin size={16} className="text-danger" />
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
              onClick={() => navigate('/planning')}
              variant="outline" 
              className="w-full mt-4 border-red-300 text-red-600 hover:bg-red-100"
            >
              <RefreshCw size={16} className="mr-2" />
              Relancer le solveur
            </Button>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="p-6 bg-surface border-border rounded-xl mb-8">
          <h3 className="text-lg font-bold text-text-main mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => navigate('/planning')}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 bg-accent/5 hover:bg-accent/10"
            >
              <RefreshCw size={24} className="text-accent" />
              <span className="text-sm">Générer Planning</span>
            </Button>
            <Button 
              onClick={() => navigate('/personnel')}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 bg-blue-50 hover:bg-blue-100"
            >
              <Users size={24} className="text-blue-600" />
              <span className="text-sm">Ajouter Personnel</span>
            </Button>
            <Button 
              onClick={() => navigate('/besoins')}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 bg-green-50 hover:bg-green-100"
            >
              <Activity size={24} className="text-green-600" />
              <span className="text-sm">Créer Besoin</span>
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 bg-orange-50 hover:bg-orange-100"
            >
              <TrendingUp size={24} className="text-orange-600" />
              <span className="text-sm">Voir Dashboard</span>
            </Button>
          </div>
        </Card>

        {/* Panic Button */}
        <Card className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Database size={24} className="text-gray-400" />
              <div>
                <h3 className="font-semibold text-text-main">Problème de données ?</h3>
                <p className="text-sm text-text-muted">Réinitialiser le cache local en cas de corruption</p>
              </div>
            </div>
            <Button 
              onClick={handlePanicReset}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <RefreshCw size={16} className="mr-2" />
              Panic Button - Reset Cache
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;