import React, { useState } from 'react';
import { useAppState } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, Shield, Clock, Moon, Sun, Users, 
  AlertTriangle, CheckCircle, Info, Save, RotateCcw,
  Scale, Calendar, Lock, Unlock, Coffee, Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

interface SolverConfig {
  // Contraintes légales
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  minRestBetweenShifts: number;
  maxConsecutiveNights: number;
  
  // Préférences
  respectPreferences: boolean;
  nightPreferenceBonus: number;
  wePreferenceBonus: number;
  
  // Équité
  enableEquityScoring: boolean;
  equityWeight: number;
  maxAffectationGap: number;
  
  // Priorités
  priorityCompletOverPartial: boolean;
  priorityWeekendOverWeekday: boolean;
  
  // Verrouillage
  allowManualOverride: boolean;
  lockGeneratedAssignments: boolean;
}

export const ParametresSolveur: React.FC = () => {
  const { state, dispatch } = useAppState();
  
  const [config, setConfig] = useState<SolverConfig>({
    // Contraintes légales
    maxHoursPerDay: 10,
    maxHoursPerWeek: 48,
    minRestBetweenShifts: 11,
    maxConsecutiveNights: 3,
    
    // Préférences
    respectPreferences: true,
    nightPreferenceBonus: 15,
    wePreferenceBonus: 10,
    
    // Équité
    enableEquityScoring: true,
    equityWeight: 30,
    maxAffectationGap: 5,
    
    // Priorités
    priorityCompletOverPartial: true,
    priorityWeekendOverWeekday: false,
    
    // Verrouillage
    allowManualOverride: true,
    lockGeneratedAssignments: false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const updateConfig = (key: keyof SolverConfig, value: any) => {
    setConfig({ ...config, [key]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    // Sauvegarder dans localStorage
    localStorage.setItem('solver_config', JSON.stringify(config));
    toast.success('Paramètres du solveur enregistrés');
    setHasChanges(false);
  };

  const handleReset = () => {
    if (confirm('Réinitialiser tous les paramètres aux valeurs par défaut ?')) {
      setConfig({
        maxHoursPerDay: 10,
        maxHoursPerWeek: 48,
        minRestBetweenShifts: 11,
        maxConsecutiveNights: 3,
        respectPreferences: true,
        nightPreferenceBonus: 15,
        wePreferenceBonus: 10,
        enableEquityScoring: true,
        equityWeight: 30,
        maxAffectationGap: 5,
        priorityCompletOverPartial: true,
        priorityWeekendOverWeekday: false,
        allowManualOverride: true,
        lockGeneratedAssignments: false,
      });
      setHasChanges(true);
      toast.info('Paramètres réinitialisés');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
          <Settings size={28} className="text-accent" />
          Paramètres du Solveur
        </h2>
        <p className="text-text-muted mt-1">Configuration des règles de génération automatique du planning</p>
      </div>

      <Tabs defaultValue="contraintes" className="w-full">
        <TabsList className="mb-6 grid grid-cols-4 w-full">
          <TabsTrigger value="contraintes">Contraintes Légales</TabsTrigger>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
          <TabsTrigger value="equite">Équité</TabsTrigger>
          <TabsTrigger value="verrouillage">Verrouillage</TabsTrigger>
        </TabsList>

        {/* Contraintes Légales */}
        <TabsContent value="contraintes">
          <Card className="p-6 bg-surface border-border rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-50 rounded-xl">
                <Shield size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-main">Contraintes Légales</h3>
                <p className="text-sm text-text-muted">Règles imposées par la législation du travail</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maxHoursDay">Heures max par jour</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="maxHoursDay"
                    type="number"
                    min="1"
                    max="24"
                    value={config.maxHoursPerDay}
                    onChange={(e) => updateConfig('maxHoursPerDay', parseInt(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-text-muted">heures</span>
                </div>
                <p className="text-xs text-text-muted">Limite quotidienne de travail (default: 10h)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxHoursWeek">Heures max par semaine</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="maxHoursWeek"
                    type="number"
                    min="1"
                    max="60"
                    value={config.maxHoursPerWeek}
                    onChange={(e) => updateConfig('maxHoursPerWeek', parseInt(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-text-muted">heures</span>
                </div>
                <p className="text-xs text-text-muted">Limite hebdomadaire (default: 48h)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minRest">Repos minimum entre postes</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="minRest"
                    type="number"
                    min="0"
                    max="24"
                    value={config.minRestBetweenShifts}
                    onChange={(e) => updateConfig('minRestBetweenShifts', parseInt(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-text-muted">heures</span>
                </div>
                <p className="text-xs text-text-muted">Temps de repos obligatoire (default: 11h)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxNights">Nuits consécutives max</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="maxNights"
                    type="number"
                    min="1"
                    max="7"
                    value={config.maxConsecutiveNights}
                    onChange={(e) => updateConfig('maxConsecutiveNights', parseInt(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-text-muted">nuits</span>
                </div>
                <p className="text-xs text-text-muted">Limite de nuits consécutives (default: 3)</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-text-main">Important</p>
                  <p className="text-sm text-text-muted">Ces contraintes sont prioritaires sur les préférences et l'équité. Le solveur refusera toute solution les violant.</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Préférences */}
        <TabsContent value="preferences">
          <Card className="p-6 bg-surface border-border rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Moon size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-main">Préférences du Personnel</h3>
                <p className="text-sm text-text-muted">Gestion des appétences et bonus associés</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-bg rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-accent" />
                  <div>
                    <p className="font-medium text-text-main">Respecter les préférences</p>
                    <p className="text-sm text-text-muted">Prioriser les préférences de nuit/week-end</p>
                  </div>
                </div>
                <Switch 
                  checked={config.respectPreferences}
                  onCheckedChange={(v) => updateConfig('respectPreferences', v)}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nightBonus">Bonus préférence nuit</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="nightBonus"
                      type="number"
                      min="0"
                      max="50"
                      value={config.nightPreferenceBonus}
                      onChange={(e) => updateConfig('nightPreferenceBonus', parseInt(e.target.value))}
                      className="w-24"
                      disabled={!config.respectPreferences}
                    />
                    <span className="text-text-muted">points</span>
                  </div>
                  <p className="text-xs text-text-muted">Score bonus si préférence nuit respectée</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weBonus">Bonus préférence week-end</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="weBonus"
                      type="number"
                      min="0"
                      max="50"
                      value={config.wePreferenceBonus}
                      onChange={(e) => updateConfig('wePreferenceBonus', parseInt(e.target.value))}
                      className="w-24"
                      disabled={!config.respectPreferences}
                    />
                    <span className="text-text-muted">points</span>
                  </div>
                  <p className="text-xs text-text-muted">Score bonus si préférence WE respectée</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Équité */}
        <TabsContent value="equite">
          <Card className="p-6 bg-surface border-border rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-50 rounded-xl">
                <Scale size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-main">Répartition Équitable</h3>
                <p className="text-sm text-text-muted">Paramètres d'équilibrage de la charge de travail</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-bg rounded-lg">
                <div className="flex items-center gap-3">
                  <Scale size={20} className="text-accent" />
                  <div>
                    <p className="font-medium text-text-main">Activer le scoring d'équité</p>
                    <p className="text-sm text-text-muted">Calculer et utiliser les scores d'équité</p>
                  </div>
                </div>
                <Switch 
                  checked={config.enableEquityScoring}
                  onCheckedChange={(v) => updateConfig('enableEquityScoring', v)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="equityWeight">Pondération équité</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="equityWeight"
                    type="range"
                    min="0"
                    max="100"
                    value={config.equityWeight}
                    onChange={(e) => updateConfig('equityWeight', parseInt(e.target.value))}
                    className="flex-1"
                    disabled={!config.enableEquityScoring}
                  />
                  <span className="w-12 text-center font-bold text-text-main">{config.equityWeight}%</span>
                </div>
                <p className="text-xs text-text-muted">Importance de l'équité vs autres critères (0-100%)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxGap">Écart max d'affectations</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="maxGap"
                    type="number"
                    min="1"
                    max="20"
                    value={config.maxAffectationGap}
                    onChange={(e) => updateConfig('maxAffectationGap', parseInt(e.target.value))}
                    className="w-24"
                    disabled={!config.enableEquityScoring}
                  />
                  <span className="text-text-muted">affectations</span>
                </div>
                <p className="text-xs text-text-muted">Écart maximum autorisé entre le plus et moins chargé</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Verrouillage */}
        <TabsContent value="verrouillage">
          <Card className="p-6 bg-surface border-border rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Lock size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-main">Verrouillage & Override</h3>
                <p className="text-sm text-text-muted">Gestion des modifications manuelles post-génération</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-bg rounded-lg">
                <div className="flex items-center gap-3">
                  <Unlock size={20} className="text-accent" />
                  <div>
                    <p className="font-medium text-text-main">Autoriser les overrides manuels</p>
                    <p className="text-sm text-text-muted">Permettre de modifier les affectations générées</p>
                  </div>
                </div>
                <Switch 
                  checked={config.allowManualOverride}
                  onCheckedChange={(v) => updateConfig('allowManualOverride', v)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-bg rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock size={20} className="text-accent" />
                  <div>
                    <p className="font-medium text-text-main">Verrouiller après génération</p>
                    <p className="text-sm text-text-muted">Empêcher toute modification après solveur</p>
                  </div>
                </div>
                <Switch 
                  checked={config.lockGeneratedAssignments}
                  onCheckedChange={(v) => updateConfig('lockGeneratedAssignments', v)}
                  disabled={!config.allowManualOverride}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-4 mt-8">
        <Button 
          variant="outline"
          onClick={handleReset}
        >
          <RotateCcw size={16} className="mr-2" />
          Réinitialiser
        </Button>
        <Button 
          onClick={handleSave}
          disabled={!hasChanges}
          className="bg-accent hover:bg-accent/90"
        >
          <Save size={16} className="mr-2" />
          Enregistrer
        </Button>
      </div>
    </div>
  );
};