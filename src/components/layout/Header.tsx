import React, { useState, useEffect } from 'react';
import { useAppState } from '@/store/AppContext';
import { UserCircle, Bell, Settings, Activity, ChevronLeft, ChevronRight, Calendar, Sun, Moon, Keyboard } from 'lucide-react';

export const Header: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [isDark, setIsDark] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Arrow for date navigation
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleDateChange(-1);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        handleDateChange(1);
      }
      // Ctrl/Cmd + T for today
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        handleToday();
      }
      // ? for shortcuts help
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        setShowShortcuts(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDateChange = (days: number) => {
    const currentDate = new Date(state.selectedDate);
    currentDate.setDate(currentDate.getDate() + days);
    dispatch({ type: 'SET_DATE', payload: currentDate.toISOString().split('T')[0] });
  };

  const handleToday = () => {
    dispatch({ type: 'SET_DATE', payload: new Date().toISOString().split('T')[0] });
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 md:px-6 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-accent p-2 rounded-lg text-white">
            <Activity size={24}/>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-text-main leading-tight">Ambuplan Pro</h1>
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">Agence SGXV</span>
          </div>
        </div>

        {/* Sélecteur de date */}
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
              {new Date(state.selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
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
        
        <div className="flex items-center gap-2 md:gap-4 text-text-muted">
          <button 
            onClick={toggleDarkMode}
            className="p-2 hover:bg-bg rounded-full transition-colors hidden sm:block"
            title={isDark ? "Mode clair" : "Mode sombre"}
          >
            {isDark ? <Sun size={20}/> : <Moon size={20}/>}
          </button>
          <button 
            onClick={() => setShowShortcuts(true)}
            className="p-2 hover:bg-bg rounded-full transition-colors hidden sm:block"
            title="Raccourcis clavier (?)"
          >
            <Keyboard size={20}/>
          </button>
          <button className="p-2 hover:bg-bg rounded-full transition-colors relative">
            <Bell size={20}/>
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
          </button>
          <button className="p-2 hover:bg-bg rounded-full transition-colors">
            <Settings size={20}/>
          </button>
          <div className="h-8 w-px bg-border mx-1 hidden md:block"></div>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-bg p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-border">
            <UserCircle size={32} className="text-accent"/>
            <div className="hidden md:flex flex-col text-sm">
              <span className="font-semibold text-text-main line-clamp-1">{state.user.prenom} {state.user.nom}</span>
              <span className="text-xs text-text-muted">{state.user.role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShortcuts(false)}>
          <div className="bg-surface rounded-xl p-6 max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-text-main mb-4">Raccourcis clavier</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-muted">Jour précédent</span>
                <kbd className="px-2 py-1 bg-bg rounded text-sm font-mono">Ctrl + ←</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Jour suivant</span>
                <kbd className="px-2 py-1 bg-bg rounded text-sm font-mono">Ctrl + →</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Revenir à aujourd'hui</span>
                <kbd className="px-2 py-1 bg-bg rounded text-sm font-mono">Ctrl + T</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Afficher cette aide</span>
                <kbd className="px-2 py-1 bg-bg rounded text-sm font-mono">?</kbd>
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