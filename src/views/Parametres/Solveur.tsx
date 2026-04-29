import React, { useState, useEffect } from 'react';
import { useAppState } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, Shield, Clock, Moon, Sun, Users, 
  AlertTriangle, CheckCircle, Info, Save, RotateCcw,
  Scale, Calendar, Lock, Unlock, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  SolverConfig, 
  DEFAULT_SOLVER_CONFIG, 
  saveSolverConfig, 
  loadSolverConfig 
} from '@/utils/solverConfig';

export const ParametresSolveur: React.FC = () => {
  const { state } = useAppState();
  
  const [config, setConfig] = useState<SolverConfig>(() => loadSolverConfig());
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Charger la config au montage
  useEffect(() => {
    setConfig(loadSolverConfig());
  }, []);

  const updateConfig = <K extends keyof SolverConfig>(
    section: K,
    key: keyof SolverConfig[K],
    value: any
  ) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSolverConfig(config);
    setHasChanges(false);
    setLastSaved(new Date());
    toast.success('Paramètres du solveur enregistrés', {
      description: `Sauvegardés à ${new Date().toLocaleTimeString('fr-FR')}`,
    });
  };

  const handleReset = () => {
    if (confirm('Réinitialiser tous les paramètres aux valeurs par défaut ?')) {
      setConfig(DEFAULT_SOLVER_CONFIG);
      setHasChanges(true);
      toast.info('Paramètres réinitialisés - cliquez sur Enregistrer pour appliquer');
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
          <TabsTrigger value="contraintes">
            <Shield size={14} className="mr-2" />
            Contraintes
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Moon size={14} className="mr-2" />
            Préférences
          </TabsTrigger>
          <TabsTrigger value="equite">
            <Scale size={14} className="mr-2" />
            Équité
          </TabsTrigger>
          <TabsTrigger value="verrouillage">
            <Lock size={14} className="mr-2" />
            Verrouillage
          </TabsTrigger>
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
              <Badge variant="destructive" className="ml-auto">Prioritaires</Badge>
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
                    value={config.legal.maxHoursPerDay}
                    onChange={(e) => updateConfig('legal', 'maxHoursPerDay', parseInt(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-text-muted">heures</span>
                </div>
                <p className="text-xs text-text-muted">Limite quotidienne de travail</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxHoursWeek">Heures max par semaine</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="maxHoursWeek"
                    type="number"
                    min="1"
                    max="60"
                    value={config.legal.maxHoursPerWeek}
                    onChange={(e) => updateConfig('legal', 'maxHoursPerWeek', parseInt(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-text-muted">heures</span>
                </div>
                <p className="text-xs text-text-muted">Limite hebdomadaire</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minRest">Repos minimum entre postes</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="minRest"
                    type="number"
                    min="0"
                    max="24"
                    value={config.legal.minRestBetweenShifts}
                    onChange={(e) => updateConfig('legal', 'minRestBetweenShifts', parseInt(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-text-muted">heures</span>
                </div>
                <p className="text-xs text-text-muted">Temps de repos obligatoire (convention collective)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxNights">Nuits consécutives max</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="maxNights"
                    type="number"
                    min="1"
                    max="7"
                    value={config.legal.maxConsecutiveNights}
                    onChange={(e) => updateConfig('legal', 'maxConsecutiveNights', parseInt(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-text-muted">nuits</span>
                </div>
                <p className="text-xs text-text-muted">Limite de nuits consécutives</p>
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
                  checked={config.preferences.respectPreferences}
                  onCheckedChange={(v) => updateConfig('preferences', 'respectPreferences', v)}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nightBonus" className="flex items-center gap-2">
                    <Moon size={14} className="text-blue-600" />
                    Bonus préférence nuit
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="nightBonus"
                      type="number"
                      min="0"
                      max="50"
                      value={config.preferences.nightPreferenceBonus}
                      onChange={(e) => updateConfig('preferences', 'nightPreferenceBonus', parseInt(e.target.value))}
                      className="w-24"
                      disabled={!config.preferences.respectPreferences}
                    />
                    <span className="text-text-muted">points</span>
                  </div>
                  <p className="text-xs text-text-muted">Score bonus si préférence nuit respectée</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weBonus" className="flex items-center gap-2">
                    <Sun size={14} className="text-purple-600" />
                    Bonus préférence week-end
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="weBonus"
                      type="number"
                      min="0"
                      max="50"
                      value={config.preferences.wePreferenceBonus}
                      onChange={(e) => updateConfig('preferences', 'wePreferenceBonus', parseInt(e.target.value))}
                      className="w-24"
                      disabled={!config.preferences.respectPreferences}
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
                  checked={config.equity.enableEquityScoring}
                  onCheckedChange={(v) => updateConfig('equity', 'enableEquityScoring', v)}
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
                    value={config.equity.equityWeight}
                    onChange={(e) => updateConfig('equity', 'equityWeight', parseInt(e.target.value))}
                    className="flex-1"
                    disabled={!config.equity.enableEquityScoring}
                  />
                  <span className="w-16 text-center font-bold text-text-main bg-bg py-2 rounded-lg">
                    {config.equity.equityWeight}%
                  </span>
                </div>
                <p className="text-xs text-text-muted">Importance de l'équité vs autres critères (0-100%)</p>
                
                {/* Barre visuelle */}
                <div className="h-2 bg-bg rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${config.equity.equityWeight}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxGap">Écart max d'affectations</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="maxGap"
                    type="number"
                    min="1"
                    max="20"
                    value={config.equity.maxAffectationGap}
                    onChange={(e) => updateConfig('equity', 'maxAffectationGap', parseInt(e.target.value))}
                    className="w-24"
                    disabled={!config.equity.enableEquityScoring}
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
                  checked={config.locking.allowManualOverride}
                  onCheckedChange={(v) => updateConfig('locking', 'allowManualOverride', v)}
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
                  checked={config.locking.lockGeneratedAssignments}
                  onCheckedChange={(v) => updateConfig('locking', 'lockGeneratedAssignments', v)}
                  disabled={!config.locking.allowManualOverride}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center justify-between mt-8 p-4 bg-surface border border-border rounded-xl">
        <div className="text-sm text-text-muted">
          {lastSaved && (
            <span className="flex items-center gap-1">
              <CheckCircle size={14} className="text-success" />
              Dernière sauvegarde: {lastSaved.toLocaleTimeString('fr-FR')}
            </span>
          )}
        </div>
        <div className="flex gap-3">
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

      {/* Info Box */}
      <Card className="mt-6 p-4 bg-blue-50 border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-text-main mb-1">À propos du solveur multi-objectifs</h4>
            <ul className="text-sm text-text-muted space-y-1">
              <li>• Le solveur optimise simultanément : équité, préférences, contraintes légales et qualification</li>
              <li>• Les contraintes légales sont TOUJOURS respectées (priorité absolue)</li>
              <li>• L'équité garantit une répartition équilibrée de la charge de travail</li>
              <li>• Les préférences sont un bonus, pas une obligation (sauf si configuré)</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};