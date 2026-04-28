import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, LayoutDashboard, Calendar, Users, ClipboardList, 
  Activity, Briefcase, FileText, Settings, ChevronDown, 
  MapPin, Clock, Award, AlertTriangle, TrendingUp, CalendarDays,
  Building2, Shield, Book, HelpCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAppState } from '@/store/AppContext';

const navItems = [
  { to: '/', icon: Home, label: 'Accueil', end: true },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
  { to: '/planning', icon: CalendarDays, label: 'Planning Mensuel', badge: 'Principal' },
  { to: '/personnel', icon: Users, label: 'Personnel' },
  { to: '/besoins', icon: ClipboardList, label: 'Besoins' },
  { to: '/activites', icon: Activity, label: 'Activités' },
  { to: '/taches', icon: Briefcase, label: 'Tâches' },
  { to: '/absences', icon: FileText, label: 'Absences' },
];

const secondaryNavItems = [
  { to: '/agences', icon: Building2, label: 'Agences & Bureaux' },
  { to: '/equite', icon: Shield, label: 'Équité & Préférences' },
  { to: '/guide', icon: Book, label: 'Guide Utilisation' },
];

export const Sidebar: React.FC = () => {
  const { state } = useAppState();
  
  // Calculate stats for badges
  const besoinsDuJour = state.besoins.filter(b => b.date === state.selectedDate);
  const nonCouverts = besoinsDuJour.filter(b => b.statut === 'non-couvert').length;
  const upcomingActivities = state.activites.filter(a => a.date === state.selectedDate).length;
  const disponibles = state.personnel.filter(p => p.statut === 'disponible').length;
  const enFormation = state.personnel.filter(p => p.statut === 'formation').length;

  return (
    <nav className="p-4 space-y-1">
      {/* Main Navigation */}
      <div className="space-y-1">
        {navItems.map(({ to, icon: Icon, label, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `px-3 py-2.5 flex items-center gap-3 font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-accent/10 text-accent shadow-sm'
                  : 'text-text-muted hover:bg-bg hover:text-text-main'
              }`
            }
          >
            <Icon size={20} />
            <span className="flex-1">{label}</span>
            {badge && (
              <Badge variant="secondary" className="text-xs bg-accent text-white">
                {badge}
              </Badge>
            )}
            {label === 'Personnel' && disponibles > 0 && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                {disponibles}
              </Badge>
            )}
            {label === 'Besoins' && nonCouverts > 0 && (
              <Badge variant="destructive" className="text-xs">
                {nonCouverts}
              </Badge>
            )}
            {label === 'Activités' && upcomingActivities > 0 && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                {upcomingActivities}
              </Badge>
            )}
          </NavLink>
        ))}
      </div>
      
      {/* Stats Section */}
      <div className="pt-6 mt-6 border-t border-border">
        <h4 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
          Aperçu rapide
        </h4>
        
        <div className="space-y-2">
          {/* Disponibles */}
          <div className="px-3 py-2 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-success" />
              <span className="text-sm text-text-main font-medium">Disponibles</span>
            </div>
            <p className="text-2xl font-bold text-success mt-1">{disponibles}</p>
          </div>
          
          {/* Non couverts */}
          {nonCouverts > 0 && (
            <div className="px-3 py-2 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-danger" />
                <span className="text-sm text-text-main font-medium">Non couverts</span>
              </div>
              <p className="text-2xl font-bold text-danger mt-1">{nonCouverts}</p>
            </div>
          )}
          
          {/* En formation */}
          {enFormation > 0 && (
            <div className="px-3 py-2 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-blue-600" />
                <span className="text-sm text-text-main font-medium">En formation</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-1">{enFormation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="pt-6 mt-6 border-t border-border">
        <h4 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
          Outils
        </h4>
        
        <div className="space-y-1">
          {secondaryNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-2.5 flex items-center gap-3 font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-accent/10 text-accent shadow-sm'
                    : 'text-text-muted hover:bg-bg hover:text-text-main'
                }`
              }
            >
              <Icon size={20} />
              <span className="flex-1">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
      
      {/* Settings at bottom */}
      <div className="pt-6 mt-6 border-t border-border">
        <NavLink
          to="/parametres"
          className={({ isActive }) =>
            `px-3 py-2.5 flex items-center gap-3 font-medium rounded-lg transition-all ${
              isActive
                ? 'bg-accent/10 text-accent shadow-sm'
                : 'text-text-muted hover:bg-bg hover:text-text-main'
            }`
          }
        >
          <Settings size={20} />
          Paramètres
        </NavLink>
      </div>
    </nav>
  );
};