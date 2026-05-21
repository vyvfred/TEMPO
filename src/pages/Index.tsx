import { Link, useNavigate } from 'react-router-dom';
import { useAppState } from '@/store/AppContext';
import { useSolver } from '@/hooks/useSolver';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, Users, Calendar, Settings, Activity, ClipboardList, 
  FileText, Briefcase, Building2, Shield, Book, Sparkles, Cpu,
  CheckCircle, AlertTriangle, Clock, Truck, ShieldAlert, Zap
} from 'lucide-react';
import { toast } from 'sonner';

export default function Index() {
  const { state } = useAppState();
  const navigate = useNavigate();
  const { isSolving, runSolver } = useSolver();

  const today = state.selectedDate;
  const besoinsDuJour = state.besoins.filter(b => b.date === today);
  const totalBesoins = besoinsDuJour.length;
  const nonCouverts = besoinsDuJour.filter(b => b.statut === 'non-couvert').length;
  const partiels = besoinsDuJour.filter(b => b.statut === 'partiel').length;
  const complets = besoinsDuJour.filter(b => b.statut === 'complete').length;

  const fleetActive = state.personnel.filter(p => p.statut === 'en-poste').length;
  const fleetAvailable = state.personnel.filter(p => p.statut === 'disponible').length;
  const totalStaff = state.personnel.filter(p => p.actif).length;

  const handleQuickOptimize = async () => {
    toast.promise(runSolver({ showToasts: false }), {
      loading: 'Optimisation automatique par le solveur intelligent Vyv...',
      success: (res) => `Planning optimisé ! ${res?.stats.totalAssignments || 0} affectations générées.`,
      error: 'Erreur lors de l’optimisation'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner principal Command Center */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-800 to-emerald-900 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Zap size={12} className="animate-pulse" /> Command Center Actif
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Vyv Ambulance Ambuplan Pro
            </h1>
            <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
              Cockpit d'optimisation multi-objectifs pour la gestion des plannings de transport, des absences et des affectations d'équipages en temps réel.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button 
                onClick={() => navigate('/planning')} 
                className="bg-white hover:bg-emerald-50 text-teal-900 font-bold shadow-md transition-all text-xs h-9 px-4"
              >
                Ouvrir le Planning Mensuel
              </Button>
              <Button 
                onClick={handleQuickOptimize} 
                disabled={isSolving}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-0 shadow-md transition-all text-xs h-9 px-4"
              >
                <Cpu size={14} className="mr-1.5" />
                {isSolving ? 'Optimisation...' : 'Solveur Instantané'}
              </Button>
            </div>
          </div>
          {/* background design element */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-700/20 via-transparent to-transparent opacity-50 hidden md:block"></div>
        </div>

        {/* Télemétrie temps réel des forces et véhicules */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <Card className="p-5 bg-white border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ambulances en poste</span>
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg group-hover:scale-105 transition-transform">
                <Truck size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-teal-900">{fleetActive}</span>
              <span className="text-xs text-slate-500 font-medium">/{totalStaff} équipages actifs</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-teal-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(fleetActive / totalStaff) * 100}%` }}
              ></div>
            </div>
          </Card>

          <Card className="p-5 bg-white border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Disponibilités en réserve</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-105 transition-transform">
                <Users size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700">{fleetAvailable}</span>
              <span className="text-xs text-slate-500 font-medium"> DEA/AA dispo</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(fleetAvailable / totalStaff) * 100}%` }}
              ></div>
            </div>
          </Card>

          <Card className="p-5 bg-white border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Couverture des Transports</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-105 transition-transform">
                <CheckCircle size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-800">
                {totalBesoins > 0 ? Math.round((complets / totalBesoins) * 100) : 100}%
              </span>
              <span className="text-xs text-slate-500 font-medium">{complets}/{totalBesoins} missions</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                style={{ width: totalBesoins > 0 ? `${(complets / totalBesoins) * 100}%` : '100%' }}
              ></div>
            </div>
          </Card>

          <Card className="p-5 bg-white border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Forces sous-tension</span>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:scale-105 transition-transform">
                <ShieldAlert size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-red-700">{nonCouverts}</span>
              <span className="text-xs text-slate-500 font-medium"> besoins critiques</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-red-500 h-full rounded-full transition-all duration-500" 
                style={{ width: totalBesoins > 0 ? `${(nonCouverts / totalBesoins) * 100}%` : '0%' }}
              ></div>
            </div>
          </Card>

        </div>

        {/* Accès rapide aux sections du dispatch */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Modules d'exploitation du réseau d'ambulance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <Link to="/planning">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mb-2">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base font-bold text-slate-800">Planning Mensuel</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Chrono-planning matriciel et tampons d'affectation.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/personnel">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                    <Users className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base font-bold text-slate-800">Équipages & DEA</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Salariés DEA, AA et gestion de leurs licences.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/besoins">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base font-bold text-slate-800">Besoins Roulants</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Services d'urgences, dialyses et VSL.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/absences">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-2">
                    <FileText className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base font-bold text-slate-800">Absences & CP</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Congés payés, maladies et soldes RTT restants.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/taches">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-2">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base font-bold text-slate-800">Tâches Hors-Rôle</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Formations PSC1, réunions et régulation SAMU.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/equite">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-150 flex items-center justify-center text-indigo-600 mb-2 bg-indigo-50">
                    <Shield className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base font-bold text-slate-800">Équité des Équipes</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Pondération des tours de nuits, gardes et week-ends.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/agences">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 mb-2">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base font-bold text-slate-800">Bureaux et Sites</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Antennes locales et configurateurs d'antennes.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/guide">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-2">
                    <Book className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base font-bold text-slate-800">Notice d'utilisation</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Support opérationnel pour les directeurs de d'agence.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}