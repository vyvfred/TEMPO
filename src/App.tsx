import React from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { AppProvider } from './store/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './views/Dashboard/Dashboard';
import { Planning } from './views/Planning/Planning';
import { Personnel } from './views/Personnel/Personnel';
import { Besoins } from './views/Besoins/Besoins';
import { Parametres } from './views/Parametres/Parametres';
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
        <Route path="/planning" element={<Planning />} />
        <Route path="/personnel" element={<Personnel />} />
        <Route path="/besoins" element={<Besoins />} />
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