import React from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { AppProvider } from './store/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './views/Dashboard/Dashboard';
import { Planning } from './views/Planning/Planning';
import { PersonnelList } from './views/Personnel/Personnel';
import { Besoins } from '@/views/Besoins/Besoins';
import { Activites } from '@/views/Activites/Activites';
import { Taches } from '@/views/Taches/Taches';
import { Absences } from '@/views/Absences/Absences';
import { Parametres } from '@/views/Parametres/Parametres';
import { MonthlyPlanner } from '@/views/Planning/MonthlyPlanner';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  return (
    <AppLayout sidebar={<Sidebar />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/planning" element={<MonthlyPlanner />} />
        <Route path="/personnel" element={<PersonnelList />} />
        <Route path="/besoins" element={<Besoins />} />
        <Route path="/activites" element={<Activites />} />
        <Route path="/taches" element={<Taches />} />
        <Route path="/absences" element={<Absences />} />
        <Route path="/parametres" element={<Parametres />} />
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