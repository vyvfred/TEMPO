import React from 'react';
import { Header } from './Header';

interface AppLayoutProps {
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ sidebar, children, rightPanel }) => {
  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      <Header/>
      
      <div className={`flex-1 grid ${rightPanel ? 'grid-cols-layout' : 'grid-cols-[260px_1fr]'} overflow-hidden`}>
        <aside className="bg-surface border-r border-border overflow-y-auto">
          {sidebar}
        </aside>
        
        <main className="overflow-y-auto overflow-x-hidden relative">
          {children}
        </main>
        
        {rightPanel && (
          <aside className="bg-surface border-l border-border overflow-y-auto">
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
};