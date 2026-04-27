import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Users, Calendar, ClipboardList } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-accent to-accent-light text-white py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Activity size={32}/>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Ambuplan Pro</h1>
              <p className="text-white/80 text-sm">Gestion des affectations d'ambulances</p>
            </div>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            Optimisez la gestion de votre agence d'ambulances avec un outil puissant 
            de planification et d'affectation du personnel.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-6xl mx-auto px-8 py-12 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-surface border-border rounded-xl hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => navigate('/planning')}>
            <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Calendar size={24} className="text-blue-600"/>
            </div>
            <h3 className="text-lg font-bold text-text-main mb-2">Planning du jour</h3>
            <p className="text-sm text-text-muted mb-4">Consultez et gérez les affectations de la journée</p>
            <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-white group-hover:border-accent">
              Ouvrir <ArrowRight size={16} className="ml-2"/>
            </Button>
          </Card>

          <Card className="p-6 bg-surface border-border rounded-xl hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => navigate('/besoins')}>
            <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <ClipboardList size={24} className="text-green-600"/>
            </div>
            <h3 className="text-lg font-bold text-text-main mb-2">Gestion des besoins</h3>
            <p className="text-sm text-text-muted mb-4">Visualisez et filtrez les besoins par statut</p>
            <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-white group-hover:border-accent">
              Ouvrir <ArrowRight size={16} className="ml-2"/>
            </Button>
          </Card>

          <Card className="p-6 bg-surface border-border rounded-xl hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => navigate('/personnel')}>
            <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users size={24} className="text-purple-600"/>
            </div>
            <h3 className="text-lg font-bold text-text-main mb-2">Personnel</h3>
            <p className="text-sm text-text-muted mb-4">Gérez les effectifs et leur disponibilité</p>
            <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-white group-hover:border-accent">
              Ouvrir <ArrowRight size={16} className="ml-2"/>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;