import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Calendar, Settings, Activity, ClipboardList, FileText, Briefcase, Building2, Shield, Book } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Tableau de Bord</h1>
          <p className="text-slate-600">Bienvenue dans votre application de gestion Vyv Ambulance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/dashboard">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>Vue d'ensemble de l'activité</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/planning">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle>Planning</CardTitle>
                <CardDescription>Gestion des plannings</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/personnel">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Personnel</CardTitle>
                <CardDescription>Gestion des employés</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/besoins">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Besoins</CardTitle>
                <CardDescription>Gestion des besoins</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/activites">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center mb-4">
                  <ClipboardList className="w-6 h-6 text-cyan-600" />
                </div>
                <CardTitle>Activités</CardTitle>
                <CardDescription>Activités planifiées</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/taches">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-amber-600" />
                </div>
                <CardTitle>Tâches</CardTitle>
                <CardDescription>Tâches non roulantes</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/absences">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-rose-600" />
                </div>
                <CardTitle>Absences</CardTitle>
                <CardDescription>Gestion des absences</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/agences">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Agences</CardTitle>
                <CardDescription>Agences & Bureaux</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/equite">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-teal-600" />
                </div>
                <CardTitle>Équité</CardTitle>
                <CardDescription>Équité & Préférences</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/guide">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                  <Book className="w-6 h-6 text-slate-600" />
                </div>
                <CardTitle>Guide</CardTitle>
                <CardDescription>Guide d'utilisation</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/parametres">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6 text-gray-600" />
                </div>
                <CardTitle>Paramètres</CardTitle>
                <CardDescription>Configuration</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}