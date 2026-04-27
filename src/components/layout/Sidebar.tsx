import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Users, Settings, ClipboardList, LayoutDashboard } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Accueil', end: true },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
  { to: '/planning', icon: Calendar, label: 'Planning' },
  { to: '/personnel', icon: Users, label: 'Personnel' },
  { to: '/besoins', icon: ClipboardList, label: 'Besoins' },
];

export const Sidebar: React.FC = () => {
  return (
    <nav className="p-4 space-y-2">
      {navItems.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `px-3 py-2 flex items-center gap-3 font-medium rounded-lg transition-colors ${
              isActive
                ? 'bg-accent/10 text-accent'
                : 'text-text-muted hover:bg-bg hover:text-text-main'
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
      
      <div className="pt-6 mt-6 border-t border-border">
        <NavLink
          to="/parametres"
          className={({ isActive }) =>
            `px-3 py-2 flex items-center gap-3 font-medium rounded-lg transition-colors ${
              isActive
                ? 'bg-accent/10 text-accent'
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