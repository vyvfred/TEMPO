import React from 'react';
import { UserCircle, Bell, Settings, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 col-span-full z-10">
      <div className="flex items-center gap-3">
        <div className="bg-accent p-2 rounded-lg text-white">
          <Activity size={24}/>
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-main leading-tight">Ambuplan Pro</h1>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">Agence SGXV</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-text-muted">
        <button className="p-2 hover:bg-bg rounded-full transition-colors relative">
          <Bell size={20}/>
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        </button>
        <button className="p-2 hover:bg-bg rounded-full transition-colors">
          <Settings size={20}/>
        </button>
        <div className="h-8 w-px bg-border mx-2"></div>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-bg p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-border">
          <UserCircle size={32} className="text-accent"/>
          <div className="flex flex-col text-sm">
            <span className="font-semibold text-text-main line-clamp-1">Jean Dupont</span>
            <span className="text-xs text-text-muted">Régulateur</span>
          </div>
        </div>
      </div>
    </header>
  );
};