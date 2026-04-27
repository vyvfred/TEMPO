import React, { useState } from 'react';
import { useAppState } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Building2, 
  User, 
  Bell, 
  Moon, 
  Database, 
  Download, 
  Trash2,
  Save,
  RotateCcw
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
      personnel: state.personnel,
      besoins: state.besoins,
      currentAgence: state.currentAgence,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ambuplan_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Données exportées avec succès');
  };

  const handleClearData = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.')) {
      localStorage.removeItem('ambuplan_data');
      toast.success('Données supprimées. Rechargez la page pour réinitialiser.');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleResetDemo = () => {
    if (confirm('Voulez-vous réinitialiser les données de démonstration ?')) {
      localStorage.removeItem('ambuplan_data');
      toast.success('Données réinitialisées. Rechargez la page.');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-main">Paramètres</h2>
        <p className="text-text-muted mt-1">Configuration de l'application</p>
      </div>

      <div className="space-y-6">
        {/* Agence */}
        <Card className="p-6 bg-surface border-border rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={20} className="text-accent" />
            <h3 className="text-lg font-semibold text-text-main">Agence</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <Button onClick={handleSaveAgence} className="mt-4 bg-accent hover:bg-accent/90">
            <Save size={16} className="mr-2" />
            Enregistrer
          </Button>
        </Card>

        {/* Utilisateur */}
        <Card className="p-6 bg-surface border-border rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <User size={20} className="text-accent" />
            <h3 className="text-lg font-semibold text-text-main">Utilisateur connecté</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Apparence */}
        <Card className="p-6 bg-surface border-border rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Moon size={20} className="text-accent" />
            <h3 className="text-lg font-semibold text-text-main">Apparence</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-main">Mode sombre</p>
              <p className="text-sm text-text-muted">Activer le thème sombre</p>
            </div>
            <Switch
              checked={isDark}
              onCheckedChange={toggleDarkMode}
            />
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6 bg-surface border-border rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} className="text-accent" />
            <h3 className="text-lg font-semibold text-text-main">Notifications</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-main">Notifications système</p>
              <p className="text-sm text-text-muted">Afficher les notifications de succès/erreur</p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
        </Card>

        {/* Données */}
        <Card className="p-6 bg-surface border-border rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Database size={20} className="text-accent" />
            <h3 className="text-lg font-semibold text-text-main">Gestion des données</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-text-main">Exporter les données</p>
                <p className="text-sm text-text-muted">Télécharger une sauvegarde JSON</p>
              </div>
              <Button onClick={handleExportData} variant="outline">
                <Download size={16} className="mr-2" />
                Exporter
              </Button>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-text-main">Réinitialiser les données</p>
                <p className="text-sm text-text-muted">Charger les données de démonstration</p>
              </div>
              <Button onClick={handleResetDemo} variant="outline">
                <RotateCcw size={16} className="mr-2" />
                Réinitialiser
              </Button>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-border">
              <div>
                <p className="font-medium text-danger">Supprimer toutes les données</p>
                <p className="text-sm text-text-muted">Effacer définitivement les données</p>
              </div>
              <Button onClick={handleClearData} variant="destructive">
                <Trash2 size={16} className="mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </Card>

        {/* Statistiques */}
        <Card className="p-6 bg-surface border-border rounded-xl">
          <h3 className="text-lg font-semibold text-text-main mb-4">Statistiques</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-bg rounded-lg">
              <p className="text-2xl font-bold text-text-main">{state.personnel.length}</p>
              <p className="text-sm text-text-muted">Personnel</p>
            </div>
            <div className="text-center p-4 bg-bg rounded-lg">
              <p className="text-2xl font-bold text-text-main">{state.besoins.length}</p>
              <p className="text-sm text-text-muted">Besoins</p>
            </div>
            <div className="text-center p-4 bg-bg rounded-lg">
              <p className="text-2xl font-bold text-success">
                {state.besoins.filter(b => b.statut === 'complete').length}
              </p>
              <p className="text-sm text-text-muted">Complets</p>
            </div>
            <div className="text-center p-4 bg-bg rounded-lg">
              <p className="text-2xl font-bold text-danger">
                {state.besoins.filter(b => b.statut === 'non-couvert').length}
              </p>
              <p className="text-sm text-text-muted">Non couverts</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};