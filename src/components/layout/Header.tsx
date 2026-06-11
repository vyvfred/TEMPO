import React, { useState, useEffect } from 'react';
import { useAppState } from '@/store/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircle, Bell, Settings, Activity, ChevronLeft, ChevronRight, 
  Calendar, Sun, Moon, Keyboard, X, AlertTriangle, CheckCircle,
  Building2, ChevronDown, Menu, Home, Clock, TrendingUp, AlertOctagon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

export const Header: React.FC = () => {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBureauSelector, setShowBureauSelector] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculate weekly stats for contract alerts
  const getWeeklyStats = (personId: string) => {
    const weekStart = new Date(state.selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const weekBesoins = state.besoins.filter(b => 
      b.personnelAffecte.includes(personId) && 
      b.date >= weekStartStr && 
      b.date <= weekEndStr
    );

    const hours = weekBesoins.length * 8;
    const days = new Set(weekBesoins.map(b => b.date)).size;

    return { hours, days };
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleDateChange(-1);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        handleDateChange(1);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        handleToday();
      }
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        setShowShortcuts(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowBureauSelector(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate notifications from current state including contract alerts
  useEffect(() => {
    const today = state.selectedDate;
    const besoinsDuJour = state.besoins.filter(b => b.date === today);
    const nonCouverts = besoinsDuJour.filter(b => b.statut === 'non-couvert');
    const partiels = besoinsDuJour.filter(b => b.statut === 'partiel');
    const upcomingActivities = state.activites.filter(a => a.date === today);
    
    const newNotifications: Notification[] = [];
    
    if (nonCouverts.length > 0) {
      newNotifications.push({
        id: 'non-couverts',
        type: 'error',
        message: `${nonCouverts.length} besoin${nonCouverts.length > 1 ? 's' : ''} non couvert${nonCouverts.length > 1 ? 's' : ''}`,
        timestamp: new Date(),
      });
    }
    
    if (partiels.length > 0) {
      newNotifications.push({
        id: 'partiels',
        type: 'warning',
        message: `${partiels.length} besoin${partiels.length > 1 ? 's' : ''} partiellement couvert${partiels.length > 1 ? 's' : ''}`,
        timestamp: new Date(),
      });
    }
    
    if (upcomingActivities.length > 0) {
      newNotifications.push({
        id: 'activities',
        type: 'success',
        message: `${upcomingActivities.length} activité${upcomingActivities.length > 1 ? 's' : ''} prévue${upcomingActivities.length > 1 ? 's' : ''} aujourd'hui`,
        timestamp: new Date(),
      });
    }

    // Contract limit alerts
    const contractAlerts: { type: 'overload' | 'deficit'; personnel: string; hours: number; contractHours: number }[] = [];
    
    state.personnel.filter(p => p.actif && p.statut === 'disponible').forEach(p => {
      const { hours } = getWeeklyStats(p.id);
      const contractHours = p.weeklyContractHours || 35;
      const hoursPercent = (hours / contractHours) * 100;
      
      // Alert if approaching 100% or exceeding
      if (hoursPercent >= 100) {
        contractAlerts.push({
          type: 'overload',
          personnel: `${p.prenom} ${p.nom}`,
          hours,
          contractHours,
        });
      } else if (hoursPercent >= 90) {
        contractAlerts.push({
          type: 'overload',
          personnel: `${p.prenom} ${p.nom}`,
          hours,
          contractHours,
        });
      }
    });

    // Add contract overload alerts
    const overloadAlerts = contractAlerts.filter(a => a.type === 'overload');
    if (overloadAlerts.length > 0) {
      newNotifications.push({
        id: 'contract-overload',
        type: 'warning',
        message: `${overloadAlerts.length} employé(s) proche(s) de la surcharge contractuelle`,
        timestamp: new Date(),
      });
    }
    
    setNotifications(newNotifications);
  }, [state.besoins, state.activites, state.selectedDate, state.personnel]);

  const handleDateChange = (days: number) => {
    const currentDate = new Date(state.selectedDate);
    currentDate.setDate(currentDate.getDate() + days);
    dispatch({ type: 'SET_DATE', payload: currentDate.toISOString().split('T')[0] });
  };

  const handleToday = () => {
    dispatch({ type: 'SET_DATE', payload: new Date().toISOString().split('T')[0] });
  };

  const handleBureauSelect = (bureauId: string | null) => {
    dispatch({ type: 'SET_BUREAU', payload: bureauId });
    setShowBureauSelector(false);
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const unreadCount = notifications.filter(n => n.type !== 'success').length;
  
  const selectedBureau = state.selectedBureauId 
    ? state.bureaux.find(b => b.id === state.selectedBureauId) 
    : null;

  return (
    <>
      <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 md:px-6 z-10">
        {/* Left side - Logo and mobile menu */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-bg rounded-lg transition-colors"
            title="Accueil"
          >
            <Home size={20} className="text-text-muted" />
          </button>
          
          <div className="bg-accent p-2 rounded-lg text-white">
            <Activity size={24}/>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-text-main leading-tight">{state.currentAgence.nom}</h1>
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">{state.currentAgence.code}</span>
          </div>
        </div>

        {/* Center - Date selector */}
        <div className="flex items-center gap-2 bg-bg px-3 md:px-4 py-2 rounded-lg">
          <button 
            onClick={() => handleDateChange(-1)}
            className="p-1 hover:bg-surface rounded transition-colors"
            title="Jour précédent (Ctrl+←)"
          >
            <ChevronLeft size={20} className="text-text-muted" />
          </button>
          
          <div className="flex items-center gap-2 min-w-[140px] md:min-w-[180px] justify-center">
            <Calendar size={16} className="text-accent" />
            <span className="text-sm font-medium text-text-main">
              {new Date(state.selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          
          <button 
            onClick={() => handleDateChange(1)}
            className="p-1 hover:bg-surface rounded transition-colors"
            title="Jour suivant (Ctrl+→)"
          >
            <ChevronRight size={20} className="text-text-muted" />
          </button>
          
          <button 
            onClick={handleToday}
            className="ml-1 md:ml-2 px-2 py-1 text-xs font-medium bg-accent text-white rounded hover:bg-accent/90 transition-colors"
          >
            Aujourd'hui
          </button>
        </div>
        
        {/* Right side - Actions */}
        <div className="flex items-center gap-2 md:gap-3 text-text-muted">
          {/* Bureau selector */}
          <div className="relative hidden md:block">
            <button 
              onClick={() => setShowBureauSelector(!showBureauSelector)}
              className="flex items-center gap-2 px-3 py-2 bg-bg rounded-lg hover:bg-accent/10 transition-colors"
            >
              <Building2 size={18} className="text-accent" />
              <span className="text-sm text-text-main max-w-[100px] truncate">
                {selectedBureau ? selectedBureau.nom : 'Tous les sites'}
              </span>
              <ChevronDown size={16} />
            </button>
            
            {showBureauSelector && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-xl z-50">
                <div className="p-2">
                  <button 
                    onClick={() => handleBureauSelect(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-bg transition-colors ${!state.selectedBureauId ? 'bg-accent/10 text-accent' : 'text-text-main'}`}
                  >
                    <div className="font-medium">Tous les sites</div>
                    <div className="text-xs text-text-muted">{state.bureaux.length} bureaux</div>
                  </button>
                </div>
                <div className="border-t border-border p-2">
                  {state.bureaux.map(bureau => (
                    <button 
                      key={bureau.id}
                      onClick={() => handleBureauSelect(bureau.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-bg transition-colors ${state.selectedBureauId === bureau.id ? 'bg-accent/10 text-accent' : 'text-text-main'}`}
                    >
                      <div className="font-medium">{bureau.nom}</div>
                      <div className="text-xs text-text-muted">{bureau.responsable}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contract Alerts Quick Link */}
          <button 
            onClick={() => navigate('/parametres/contrats')}
            className="p-2 hover:bg-bg rounded-full transition-colors hidden sm:flex"
            title="Suivi des contrats"
          >
            <Clock size={20} className="text-teal-600" />
          </button>

          {/* Dark mode toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 hover:bg-bg rounded-full transition-colors hidden sm:block"
            title={isDark ? "Mode clair" : "Mode sombre"}
          >
            {isDark ? <Sun size={20}/> : <Moon size={20}/>}
          </button>
          
          {/* Keyboard shortcuts */}
          <button 
            onClick={() => setShowShortcuts(true)}
            className="p-2 hover:bg-bg rounded-full transition-colors hidden sm:block"
            title="Raccourcis clavier (?)"
          >
            <Keyboard size={20}/>
          </button>
          
          {/* Notifications */}
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-bg rounded-full transition-colors relative"
          >
            <Bell size={20}/>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Settings */}
          <button 
            onClick={() => navigate('/parametres')}
            className="p-2 hover:bg-bg rounded-full transition-colors"
          >
            <Settings size={20}/>
          </button>
          
          {/* User */}
          <div className="h-8 w-px bg-border mx-1 hidden md:block"></div>
          <div className="hidden md:flex items-center gap-2 cursor-pointer hover:bg-bg p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-border">
            <UserCircle size={32} className="text-accent"/>
            <div className="flex flex-col text-sm">
              <span className="font-semibold text-text-main line-clamp-1">{state.user.prenom} {state.user.nom}</span>
              <span className="text-xs text-text-muted">{state.user.role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-16 right-4 w-80 bg-surface border border-border rounded-xl shadow-xl z-50">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-text-main">Notifications</h3>
            <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-bg rounded">
              <X size={16} className="text-text-muted" />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notif => (
                <div key={notif.id} className={`p-4 border-b border-border last:border-0 flex items-start gap-3 ${
                  notif.type === 'error' ? 'bg-red-50' : notif.type === 'warning' ? 'bg-yellow-50' : 'bg-green-50'
                }`}>
                  {notif.type === 'error' && <AlertTriangle size={18} className="text-danger flex-shrink-0" />}
                  {notif.type === 'warning' && <AlertOctagon size={18} className="text-warning flex-shrink-0" />}
                  {notif.type === 'success' && <CheckCircle size={18} className="text-success flex-shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm text-text-main">{notif.message}</p>
                    {notif.id === 'contract-overload' && (
                      <button 
                        onClick={() => { navigate('/parametres/contrats'); setShowNotifications(false); }}
                        className="text-xs text-accent hover:underline mt-1"
                      >
                        Voir le détail →
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-text-muted">
                <CheckCircle size={32} className="mx-auto mb-2 text-success" />
                <p>Tout est en ordre !</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowShortcuts(false)}>
          <div className="bg-surface rounded-xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2">
              <Keyboard size={24} className="text-accent" />
              Raccourcis clavier
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Jour précédent</span>
                <kbd className="px-3 py-1.5 bg-bg rounded text-sm font-mono border border-border">Ctrl + ←</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Jour suivant</span>
                <kbd className="px-3 py-1.5 bg-bg rounded text-sm font-mono border border-border">Ctrl + →</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Revenir à aujourd'hui</span>
                <kbd className="px-3 py-1.5 bg-bg rounded text-sm font-mono border border-border">Ctrl + T</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Afficher cette aide</span>
                <kbd className="px-3 py-1.5 bg-bg rounded text-sm font-mono border border-border">?</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Fermer les modals</span>
                <kbd className="px-3 py-1.5 bg-bg rounded text-sm font-mono border border-border">Esc</kbd>
              </div>
            </div>
            <Button onClick={() => setShowShortcuts(false)} className="w-full mt-6" variant="outline">
              Fermer
            </Button>
          </div>
        </div>
      )}
    </>
  );
};