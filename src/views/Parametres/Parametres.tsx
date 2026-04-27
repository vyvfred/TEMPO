import React, { useState } from 'react';
import { useAppState } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, User, Bell, Moon, Database, Download, 
  Trash2, Save, RotateCcw, Upload, Settings, Globe,
  Calendar, Users, Shield
} from 'lucide-react';
import { toast } from 'sonner';

export const Parametres: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [agenceNom, setAgenceNom] = useState(state.currentAgence.nom);
  const [agenceCode, setAgenceCode] = useState(state.currentAgence.code);

  const handleSaveAgence = () => {
    dispatch({
      type: 'LOAD_FROM_STORAGE',
      payload: {
        currentAgence: { ...state.currentAgence, nom: agenceNom, code: agenceCode }
      }
    });
    toast.success('Paramètres de l\'agence enregistrés');
  };

  const handleExportData = () => {
    const data = {
      currentAgence: state.currentAgence,
      bureaux: state.bureaux,
      qualifications: state.qualifications,
      personnel: state.personnel,
      besoins: state.besoins,
      activites: state.activites,
      taches: state.taches,
      absences: state.absences,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ambuplan_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Données exportées avec succès');
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            dispatch({ type: 'LOAD_FROM_STORAGE', payload: data });
            toast.success('Données importées avec succès');
            setTimeout(() => window.location.reload(), 1000);
          } catch {
            toast.error('Erreur lors de l\'importation');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.')) {
      localStorage.removeItem('ambuplan_data');
      toast.success('Données supprimées. Rechargement...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleResetDemo = () => {
    if (confirm('Voulez-vous réinitialiser les données de démonstration ?')) {
      localStorage.removeItem('ambuplan_data');
      toast.success('Données réinitialisées. Rechargement...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const stats = {
    personnel: state.personnel.length,
    besoins: state.besoins.length,
    activites: state.activites.length,
    taches: state.taches.length,
    complets: state.besoins.filter(b => b.statut === 'complete').length,
    nonCouverts: state.besoins.filter(b => b.statut === 'non-couvert').length,
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-main">Paramètres</h2>
        <p className="text-text-muted mt-1">Configuration de l'application</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="agence">Agence</TabsTrigger>
          <TabsTrigger value="apparence">Apparence</TabsTrigger>
          <TabsTrigger value="donnees">Données</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general">
          <div className="grid gap-6">
            <Card className="p-6 bg-surface border-border rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <User size={24} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">Utilisateur connecté</h3>
                  <p className="text-sm text-text-muted">Informations du compte</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Nom</Label>
                  <p className="mt-1 text-text-main font-medium">{state.user.nom}</p>
                </div>
                <div>
                  <Label>Prénom</Label>
                  <p className="mt-1 text-text-main font-medium">{state.user.prenom}</p>
                </div>
                <div>
                  <Label>Rôle</Label>
                  <p className="mt-1 text-text-main font-medium">{state.user.role}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-surface border-border rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Bell size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">Notifications</h3>
                  <p className="text-sm text-text-muted">Configuration des alertes</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-border">
                <div>
                  <p className="font-medium text-text-main">Notifications système</p>
                  <p className="text-sm text-text-muted">Afficher les notifications de succès/erreur</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </Card>

            <Card className="p-6 bg-surface border-border rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-50 rounded-xl">
                  <Shield size={24} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">Sécurité</h3>
                  <p className="text-sm text-text-muted">Gestion des accès</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-bg rounded-lg">
                  <p className="text-sm text-text-muted">Dernier accès</p>
                  <p className="font-medium text-text-main">{new Date().toLocaleString('fr-FR')}</p>
                </div>
                <div className="p-4 bg-bg rounded-lg">
                  <p className="text-sm text-text-muted">Session actuelle</p>
                  <p className="font-medium text-text-main">Active</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Agence */}
        <TabsContent value="agence">
          <div className="grid gap-6">
            <Card className="p-6 bg-surface border-border rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <Building2 size={24} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">Informations de l'agence</h3>
                  <p className="text-sm text-text-muted">Configuration de base</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="agence-nom">Nom de l'agence</Label>
                  <Input
                    id="agence-nom"
                    value={agenceNom}
                    onChange={(e) => setAgenceNom(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="agence-code">Code agence</Label>
                  <Input
                    id="agence-code"
                    value={agenceCode}
                    onChange={(e) => setAgenceCode(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <Button onClick={handleSaveAgence} className="bg-accent hover:bg-accent/90">
                <Save size={16} className="mr-2" />
                Enregistrer
              </Button>
            </Card>

            <Card className="p-6 bg-surface border-border rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Globe size={24} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">Sites / Bureaux</h3>
                  <p className="text-sm text-text-muted">{state.bureaux.length} bureaux configurés</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {state.bureaux.map(bureau => (
                  <div key={bureau.id} className="flex items-center justify-between p-4 bg-bg rounded-lg">
                    <div>
                      <p className="font-medium text-text-main">{bureau.nom}</p>
                      <p className="text-sm text-text-muted">{bureau.adresse}</p>
                    </div>
                    <Badge variant="outline">{bureau.responsable}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Apparence */}
        <TabsContent value="apparence">
          <div className="grid gap-6">
            <Card className="p-6 bg-surface border-border rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Moon size={24} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">Thème</h3>
                  <p className="text-sm text-text-muted">Personnalisation de l'interface</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-border">
                <div>
                  <p className="font-medium text-text-main">Mode sombre</p>
                  <p className="text-sm text-text-muted">Activer le thème sombre</p>
                </div>
                <Switch checked={isDark} onCheckedChange={toggleDarkMode} />
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Données */}
        <TabsContent value="donnees">
          <div className="grid gap-6">
            <Card className="p-6 bg-surface border-border rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-50 rounded-xl">
                  <Database size={24} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">Statistiques</h3>
                  <p className="text-sm text-text-muted">Vue d'ensemble des données</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-bg rounded-lg">
                  <p className="text-3xl font-bold text-text-main">{stats.personnel}</p>
                  <p className="text-sm text-text-muted">Personnel</p>
                </div>
                <div className="text-center p-4 bg-bg rounded-lg">
                  <p className="text-3xl font-bold text-text-main">{stats.besoins}</p>
                  <p className="text-sm text-text-muted">Besoins</p>
                </div>
                <div className="text-center p-4 bg-bg rounded-lg">
                  <p className="text-3xl font-bold text-text-main">{stats.activites}</p>
                  <p className="text-sm text-text-muted">Activités</p>
                </div>
                <div className="text-center p-4 bg-bg rounded-lg">
                  <p className="text-3xl font-bold text-text-main">{stats.taches}</p>
                  <p className="text-sm text-text-muted">Tâches</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-surface border-border rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Download size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">Import / Export</h3>
                  <p className="text-sm text-text-muted">Sauvegarde et restauration des données</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-bg rounded-lg">
                  <div>
                    <p className="font-medium text-text-main">Exporter les données</p>
                    <p className="text-sm text-text-muted">Télécharger une sauvegarde JSON complète</p>
                  </div>
                  <Button onClick={handleExportData} variant="outline">
                    <Download size={16} className="mr-2" />
                    Exporter
                  </Button>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-bg rounded-lg">
                  <div>
                    <p className="font-medium text-text-main">Importer des données</p>
                    <p className="text-sm text-text-muted">Restaurer depuis un fichier JSON</p>
                  </div>
                  <Button onClick={handleImportData} variant="outline">
                    <Upload size={16} className="mr-2" />
                    Importer
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-surface border-border rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-50 rounded-xl">
                  <RotateCcw size={24} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">Maintenance</h3>
                  <p className="text-sm text-text-muted">Gestion des données</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-bg rounded-lg">
                  <div>
                    <p className="font-medium text-text-main">Réinitialiser les données</p>
                    <p className="text-sm text-text-muted">Charger les données de démonstration</p>
                  </div>
                  <Button onClick={handleResetDemo} variant="outline">
                    <RotateCcw size={16} className="mr-2" />
                    Réinitialiser
                  </Button>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <p className="font-medium text-danger">Supprimer toutes les données</p>
                    <p className="text-sm text-text-muted">Effacer définitivement toutes les données</p>
                  </div>
                  <Button onClick={handleClearData} variant="destructive">
                    <Trash2 size={16} className="mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};