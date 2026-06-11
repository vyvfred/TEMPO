import React, { useState } from 'react';
import { useAppState } from '@/store/AppContext';
import type { Personnel as PersonnelType } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  User, Search, Award, Phone, Mail, MapPin, Calendar,
  Moon, Sun, AlertTriangle, Plus, FileSpreadsheet, ShieldAlert,
  CheckCircle2, Gauge, HardDriveDownload, Sparkles, Clock, TrendingUp
} from 'lucide-react';
import { PersonnelFormModal } from '@/components/PersonnelFormModal';
import { toast } from 'sonner';

const statutConfig = {
  'disponible': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Disponible' },
  'en-poste': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'En poste' },
  'conge': { color: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Congé' },
  'absent': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Absent' },
  'formation': { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Formation' },
};

export const PersonnelList: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { personnel, bureaux, besoins } = state;
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterBureau, setFilterBureau] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [personnelToEdit, setPersonnelToEdit] = useState<PersonnelType | null>(null);

  const filteredPersonnel = personnel.filter(p => {
    if (!showInactive && !p.actif) return false;
    if (filterStatut !== 'all' && p.statut !== filterStatut) return false;
    if (filterBureau !== 'all' && p.bureauId !== filterBureau) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        p.nom.toLowerCase().includes(searchLower) ||
        p.prenom.toLowerCase().includes(searchLower) ||
        p.email.toLowerCase().includes(searchLower) ||
        (p.qualification?.nom || '').toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const stats = {
    total: personnel.filter(p => p.actif).length,
    disponible: personnel.filter(p => p.statut === 'disponible' && p.actif).length,
    enPoste: personnel.filter(p => p.statut === 'en-poste' && p.actif).length,
    autre: personnel.filter(p => p.statut !== 'disponible' && p.statut !== 'en-poste' && p.actif).length,
  };

  // Calculate weekly hours and days for a personnel
  const getWeeklyStats = (person: PersonnelType) => {
    const weekStart = new Date(state.selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const weekBesoins = besoins.filter(b => 
      b.personnelAffecte.includes(person.id) && 
      b.date >= weekStartStr && 
      b.date <= weekEndStr
    );

    const hours = weekBesoins.length * 8;
    const days = new Set(weekBesoins.map(b => b.date)).size;

    return { hours, days };
  };

  // Get contract compliance status
  const getContractStatus = (person: PersonnelType) => {
    const { hours, days } = getWeeklyStats(person);
    const contractHours = person.weeklyContractHours || 35;
    const expectedDays = person.weeklyExpectedDays || 5;

    const hoursPercent = (hours / contractHours) * 100;
    const daysPercent = (days / expectedDays) * 100;

    // Status based on percentage of contract fulfilled
    if (hoursPercent >= 100 && daysPercent >= 100) {
      return { status: 'complete', label: 'Contrat atteint', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    }
    if (hoursPercent >= 80 || daysPercent >= 80) {
      return { status: 'good', label: 'En bonne voie', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    }
    if (hoursPercent >= 50 || daysPercent >= 50) {
      return { status: 'partial', label: 'Partiel', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    }
    return { status: 'deficit', label: 'Sous-charge', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
  };

  const handleOpenModal = (person?: PersonnelType) => {
    setPersonnelToEdit(person || null);
    setModalOpen(true);
  };

  const handleToggleActif = (personnelId: string) => {
    const p = personnel.find(p => p.id === personnelId);
    if (p) {
      dispatch({
        type: 'UPDATE_PERSONNEL',
        payload: { ...p, actif: !p.actif }
      });
      toast.success(p.actif ? `${p.prenom} ${p.nom} désactivé(e)` : `${p.prenom} ${p.nom} activé(e)`);
    }
  };

  // Inspect license compliance
  const getLicenseCompliance = (person: PersonnelType) => {
    const isAde = person.qualification.abreviation === 'ADE';
    const hasRestrictions = person.restrictions.length > 0;
    
    if (hasRestrictions && isAde) {
      return { 
        status: 'warning', 
        label: 'Aptitude Préfectorale Conditionnelle', 
        desc: 'Restriction médicale active' 
      };
    }
    return { 
      status: 'compliant', 
      label: 'DEA & Agrément Valide', 
      desc: 'Licence préfectorale à jour' 
    };
  };

  const handleExportStaff = () => {
    const headers = ['Nom', 'Prénom', 'Téléphone', 'Email', 'Qualification', 'Statut', 'Bureaux', 'Équité Score', 'Heures contrat/sem', 'Jours attendus/sem'];
    const rows = filteredPersonnel.map(p => {
      const b = bureaux.find(bureau => bureau.id === p.bureauId);
      return [
        p.nom,
        p.prenom,
        p.telephone,
        p.email,
        p.qualification.abreviation,
        p.statut,
        b?.nom || '',
        p.equidadScore,
        p.weeklyContractHours || 35,
        p.weeklyExpectedDays || 5,
      ];
    });
    const csvStr = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `registre_personnel_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Registre du personnel exporté en CSV');
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <User size={28} className="text-accent" />
            Registre Général du Personnel
          </h2>
          <p className="text-text-muted mt-1">Contrôle des habilitations médicales, DEA/AA et aptitude préfectorale pour {stats.total} équipiers actifs.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportStaff} variant="outline" size="sm" className="h-9 text-xs">
            <FileSpreadsheet size={16} className="mr-1.5" />
            Exporter Registre
          </Button>
          <Button onClick={() => handleOpenModal()} className="bg-accent hover:bg-accent/90 font-bold text-xs h-9">
            <Plus size={16} className="mr-1.5" />
            Ajouter un ambulancier
          </Button>
        </div>
      </div>

      {/* Grid de KPIs de forces */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-100 border-slate-200 text-center cursor-pointer"
          onClick={() => { setFilterStatut('all'); setSearch(''); }}>
          <p className="text-3xl font-extrabold text-slate-800">{stats.total}</p>
          <p className="text-xs font-bold text-slate-500 uppercase mt-1">Total Actifs</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200 text-center cursor-pointer"
          onClick={() => setFilterStatut('disponible')}>
          <p className="text-3xl font-extrabold text-green-700">{stats.disponible}</p>
          <p className="text-xs font-bold text-green-600 uppercase mt-1">Disponibles</p>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200 text-center cursor-pointer"
          onClick={() => setFilterStatut('en-poste')}>
          <p className="text-3xl font-extrabold text-blue-700">{stats.enPoste}</p>
          <p className="text-xs font-bold text-blue-600 uppercase mt-1">En Postes</p>
        </Card>
        <Card className="p-4 bg-amber-50 border-amber-200 text-center cursor-pointer"
          onClick={() => setFilterStatut('all')}>
          <p className="text-3xl font-extrabold text-amber-700">{stats.autre}</p>
          <p className="text-xs font-bold text-amber-600 uppercase mt-1">Formations / Congés</p>
        </Card>
      </div>

      {/* Filtres de recherche avancée */}
      <Card className="p-4 bg-surface border-border rounded-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Rechercher par nom, qualification ou matricule..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-bg border-border text-xs focus:ring-1 focus:ring-accent"
            />
          </div>
          
          <select
            value={filterBureau}
            onChange={(e) => setFilterBureau(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-text-main text-xs font-semibold"
          >
            <option value="all">Tous les bureaux / Antennes</option>
            {bureaux.map(bureau => (
              <option key={bureau.id} value={bureau.id}>{bureau.nom}</option>
            ))}
          </select>
          
          <Button 
            variant={showInactive ? "default" : "outline"}
            onClick={() => setShowInactive(!showInactive)}
            className={`text-xs ${showInactive ? 'bg-slate-700 text-white' : ''}`}
          >
            {showInactive ? 'Avec archivés / inactifs' : 'Actifs uniquement'}
          </Button>
        </div>
      </Card>

      {/* Grille du personnel */}
      {filteredPersonnel.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPersonnel.map((person) => {
            const statutInfo = statutConfig[person.statut as keyof typeof statutConfig] || statutConfig['disponible'];
            const bureau = bureaux.find(b => b.id === person.bureauId);
            const licenseInfo = getLicenseCompliance(person);
            const contractStatus = getContractStatus(person);
            const { hours, days } = getWeeklyStats(person);
            
            return (
              <Card 
                key={person.id} 
                className={`p-5 bg-surface border border-slate-100 rounded-xl hover:shadow-lg transition-all flex flex-col justify-between ${
                  !person.actif ? 'opacity-55 bg-slate-50/50' : ''
                }`}
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-base ${
                      person.statut === 'disponible' ? 'bg-green-600' :
                      person.statut === 'en-poste' ? 'bg-blue-600' :
                      person.statut === 'conge' ? 'bg-slate-500' :
                      person.statut === 'formation' ? 'bg-purple-600' : 'bg-red-600'
                    }`}>
                      {person.prenom?.[0]}{person.nom?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-text-main truncate text-sm">
                          {person.prenom} {person.nom}
                        </h4>
                        <Badge className={`${statutInfo.color} uppercase text-[9px] font-bold border`}>
                          {statutInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1 font-bold">
                        <Award size={14} className="text-accent" />
                        <span>{person.qualification?.nom}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contract Compliance Indicator */}
                  <div className={`p-3 rounded-lg border mb-4 ${contractStatus.bg} ${contractStatus.border}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1">
                        <Clock size={12} className={contractStatus.color} />
                        Contrat semaine
                      </span>
                      <Badge className={`${contractStatus.color} bg-white border text-[9px] font-bold uppercase`}>
                        {contractStatus.label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-white/50 rounded">
                        <p className="text-lg font-extrabold text-text-main">{hours}h</p>
                        <p className="text-[9px] text-text-muted">/ {person.weeklyContractHours || 35}h contrat</p>
                      </div>
                      <div className="text-center p-2 bg-white/50 rounded">
                        <p className="text-lg font-extrabold text-text-main">{days}j</p>
                        <p className="text-[9px] text-text-muted">/ {person.weeklyExpectedDays || 5}j attendus</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress 
                        value={Math.min(100, (hours / (person.weeklyContractHours || 35)) * 100)} 
                        className="h-1.5 bg-slate-200" 
                      />
                    </div>
                  </div>

                  {/* Sentinelle Habilitation DEA Compliant */}
                  <div className={`p-3 rounded-lg border mb-4 text-xs ${
                    licenseInfo.status === 'compliant' ? 'bg-green-50/50 border-green-100' : 'bg-amber-50/50 border-amber-100'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold">
                      {licenseInfo.status === 'compliant' ? (
                        <CheckCircle2 size={15} className="text-green-600" />
                      ) : (
                        <ShieldAlert size={15} className="text-amber-600" />
                      )}
                      <span className={licenseInfo.status === 'compliant' ? 'text-green-800' : 'text-amber-800'}>
                        {licenseInfo.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-0.5 leading-tight">{licenseInfo.desc}</p>
                  </div>

                  {/* Compteur d'équité en jauge */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-text-muted uppercase flex items-center gap-1">
                        <Gauge size={13} className="text-accent" /> Équité planning
                      </span>
                      <span className="text-teal-700">{person.equidadScore}%</span>
                    </div>
                    <Progress value={person.equidadScore} className="h-1.5 bg-slate-100 text-teal-600" />
                  </div>

                  {/* Coordonnées */}
                  <div className="space-y-2 text-xs border-t border-slate-100 pt-3 mb-4">
                    <div className="flex items-center gap-2 text-text-muted font-semibold">
                      <MapPin size={13} className="text-accent" />
                      <span>{bureau?.nom}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted font-semibold">
                      <Phone size={13} className="text-accent" />
                      <span>{person.telephone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted font-semibold">
                      <Mail size={13} className="text-accent" />
                      <span className="truncate">{person.email}</span>
                    </div>
                  </div>

                  {/* Appétences/Préférences */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {person.preferenciasNuit && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] font-bold uppercase">
                        <Moon size={11} className="mr-1" />
                        Pref. Nuit
                      </Badge>
                    )}
                    {person.preferenciasWE && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[9px] font-bold uppercase">
                        <Sun size={11} className="mr-1" />
                        Pref. WE
                      </Badge>
                    )}
                    {person.restrictions?.length > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[9px] font-bold uppercase">
                        <AlertTriangle size={11} className="mr-1" />
                        {person.restrictions.length} Restrictions
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions du dispatch */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs font-bold h-8"
                    onClick={() => handleOpenModal(person)}
                  >
                    Fiche Profil
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs h-8 hover:bg-slate-100"
                    onClick={() => handleToggleActif(person.id)}
                  >
                    {person.actif ? 'Désactiver' : 'Réactiver'}
                  </Button>
                </div>

              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center bg-surface border-border rounded-xl">
          <User size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-text-main mb-2">Aucun ambulancier trouvé</h3>
          <p className="text-text-muted text-xs">Modifiez vos critères ou ajoutez un nouveau membre.</p>
        </Card>
      )}

      {/* Modal d'édition/création */}
      <PersonnelFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        personnelToEdit={personnelToEdit}
      />

    </div>
  );
};

export { PersonnelList as Personnel };