import React from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './views/Dashboard/Dashboard';
import { Home, Calendar, Users, Settings } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const MockSidebar: React.FC = () => (
  <nav className="p-4 space-y-2">
    <div className="px-3 py-2 bg-accent/10 text-accent rounded-lg flex items-center gap-3 font-medium cursor-pointer">
      <Home size={20}/> Accueil
    </div>
    <div className="px-3 py-2 text-text-muted hover:bg-bg hover:text-text-main rounded-lg flex items-center gap-3 font-medium cursor-pointer transition-colors">
      <Calendar size={20}/> Planning
    </div>
    <div className="px-3 py-2 text-text-muted hover:bg-bg hover:text-text-main rounded-lg flex items-center gap-3 font-medium cursor-pointer transition-colors">
      <Users size={20}/> Personnel
    </div>
    <div className="px-3 py-2 text-text-muted hover:bg-bg hover:text-text-main rounded-lg flex items-center gap-3 font-medium cursor-pointer transition-colors">
      <Settings size={20}/> Paramètres
    </div>
  </nav>
);

const AmbuplanApp = () => {
  return (
    <AppLayout sidebar={<MockSidebar/>}>
      <Dashboard/>
    </AppLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AmbuplanApp />} />
          <Route path="/index" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;