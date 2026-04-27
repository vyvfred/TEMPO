import React from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { AppProvider } from './store/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './views/Dashboard/Dashboard';
import { Planning } from './views/Planning/Planning';
import { Personnel } from './views/Personnel/Personnel';
import { Besoins } from './views/Besoins/Besoins';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  return (
    <AppLayout sidebar={<Sidebar />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/personnel" element={<Personnel />} />
        <Route path="/besoins" element={<Besoins />} />
        <Route path="/parametres" element={<div className="p-8"><h2 className="text-2xl font-bold text-text-main">Paramètres</h2><p className="text-text-muted mt-1">Configuration de l'application</p></div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;