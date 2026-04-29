/**
 * SolverVisualizer - Composant de visualisation du solveur
 * Affiche les étapes de résolution et les résultats
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAppState } from '@/store/AppContext';
import { useSolver, useEquityAnalysis } from '@/hooks/useSolver';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cpu, Play, Pause, SkipForward, RotateCcw, 
  CheckCircle, AlertCircle, XCircle, Clock, 
  Users, Scale, Sparkles, TrendingUp, ArrowRight,
  Info, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface SolverVisualizerProps {
  onComplete?: () => void;
  compact?: boolean;
}

export const SolverVisualizer: React.FC<SolverVisualizerProps> = ({
  onComplete,
  compact = false,
}) => {
  const { state } = useAppState();
  const { isSolving, result, runSolver, config, refreshConfig } = useSolver();
  const { analyze: analyzeEquity } = useEquityAnalysis();
  
  const [mode, setMode] = useState<'quick' | 'step'>('quick');
  const [equityAnalysis, setEquityAnalysis] = useState<ReturnType<typeof analyzeEquity>>(null);
  
  // Analyser l'équité avant exécution
  useEffect(() => {
    setEquityAnalysis(analyzeEquity());
  }, [state.besoins, state.personnel, analyzeEquity]);
  
  const handleRunSolver = async () => {
    refreshConfig();
    const res = await runSolver({
      showToasts: true,
      onComplete: () => {
        setEquityAnalysis(analyzeEquity());
        onComplete?.();
      },
    });
  };
  
  const coverageRate = result 
    ? Math.round((result.stats.coveredNeeds / result.stats.totalNeeds) * 100) 
    : 0;
  
  if (compact) {
    return (
      <Card className="bg-gradient-to-r from-accent/5 to-accent-light/10 border-accent/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Sparkles size={20} className="text-accent" />
              </div>
              <div>
                <p className="font-semibold text-text-main">Solveur de Planning</p>
                <p className="text-sm text-text-muted">
                  {result 
                    ? `${result.stats.totalAssignments} affectations`
                    : `${state.besoins.filter(b => b.date === state.selectedDate && b.statut !== 'complete').length} besoins à couvrir`
                  }
                </p>
              </div>
            </div>
            <Button 
              onClick={handleRunSolver}
              disabled={isSolving}
              className="bg-accent hover:bg-accent/90"
              size="sm"
            >
              {isSolving ? (
                <RotateCcw size={16} className="mr-2 animate-spin" />
              ) : (
                <Sparkles size={16} className="mr-2" />
              )}
              {isSolving ? 'Calcul...' : 'Lancer'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card className="bg-surface border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-xl">
                <Cpu size={28} className="text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Solveur de Planning
                  <Badge variant="secondary" className="bg-accent/10 text-accent">
                    Multi-Objectifs
                  </Badge>
                </CardTitle>
                <p className="text-sm text-text-muted">
                  Optimisation basée sur l'équité, les préférences et les contraintes légales
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Tabs value={mode} onValueChange={(v) => setMode(v as 'quick' | 'step')}>
                <TabsList>
                  <TabsTrigger value="quick">Rapide</TabsTrigger>
                  <TabsTrigger value="step">Pas à pas</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Bouton d'exécution */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleRunSolver}
              disabled={isSolving}
              className="bg-accent hover:bg-accent/90"
              size="lg"
            >
              {isSolving ? (
                <>
                  <RotateCcw size={20} className="mr-2 animate-spin" />
                  Calcul en cours...
                </>
              ) : (
                <>
                  <Sparkles size={20} className="mr-2" />
                  Exécuter le Solveur
                </>
              )}
            </Button>
            
            {result && (
              <Button 
                variant="outline"
                onClick={() => runSolver()}
                disabled={isSolving}
              >
                <RotateCcw size={16} className="mr-2" />
                Relancer
              </Button>
            )}
          </div>
          
          {/* Barre de progression */}
          {isSolving && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Optimisation en cours...</span>
                <span className="text-text-main font-medium">{Math.round(coverageRate)}%</span>
              </div>
              <Progress value={coverageRate} className="h-2" />
            </div>
          )}
          
          {/* Résultats */}
          {result && (
            <>
              {/* Stats principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                  <CheckCircle size={24} className="mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">{result.stats.coveredNeeds}</p>
                  <p className="text-xs text-green-600">Besoins couverts</p>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                  <AlertCircle size={24} className="mx-auto mb-2 text-yellow-600" />
                  <p className="text-2xl font-bold text-yellow-600">{result.stats.partialNeeds}</p>
                  <p className="text-xs text-yellow-600">Partiellement couverts</p>
                </div>
                
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                  <XCircle size={24} className="mx-auto mb-2 text-red-600" />
                  <p className="text-2xl font-bold text-red-600">{result.stats.uncoveredNeeds}</p>
                  <p className="text-xs text-red-600">Non couverts</p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                  <Users size={24} className="mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-600">{result.stats.totalAssignments}</p>
                  <p className="text-xs text-blue-600">Affectations</p>
                </div>
              </div>
              
              {/* Performance */}
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  Exécuté en {result.stats.executionTime.toFixed(1)}ms
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp size={14} />
                  Score: {coverageRate}%
                </span>
              </div>
              
              {/* Alertes */}
              {result.warnings.length > 0 && (
                <div className="space-y-2">
                  {result.warnings.map((warning, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle size={16} className="text-yellow-600 flex-shrink-0" />
                      <span className="text-sm text-text-main">{warning}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Analyse d'équité */}
          {equityAnalysis && equityAnalysis.totalAffectations > 0 && (
            <div className="border-t border-border pt-6">
              <h4 className="font-semibold text-text-main mb-4 flex items-center gap-2">
                <Scale size={18} className="text-accent" />
                Analyse d'Équité
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-bg rounded-lg text-center">
                  <p className="text-2xl font-bold text-text-main">{equityAnalysis.totalAffectations}</p>
                  <p className="text-xs text-text-muted">Total affectations</p>
                </div>
                <div className="p-3 bg-bg rounded-lg text-center">
                  <p className="text-2xl font-bold text-text-main">{equityAnalysis.moyenne}</p>
                  <p className="text-xs text-text-muted">Moyenne</p>
                </div>
                <div className="p-3 bg-bg rounded-lg text-center">
                  <p className="text-2xl font-bold text-text-main">{equityAnalysis.max}</p>
                  <p className="text-xs text-text-muted">Max</p>
                </div>
                <div className="p-3 bg-bg rounded-lg text-center">
                  <p className={`text-2xl font-bold ${equityAnalysis.ecart > config.equity.maxAffectationGap ? 'text-danger' : 'text-success'}`}>
                    {equityAnalysis.ecart}
                  </p>
                  <p className="text-xs text-text-muted">Écart</p>
                </div>
              </div>
              
              {equityAnalysis.plusCharge && equityAnalysis.moinsCharge && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                      <AlertCircle size={16} />
                      <span className="font-medium">Plus chargé</span>
                    </div>
                    <p className="font-semibold text-text-main">
                      {equityAnalysis.plusCharge.prenom} {equityAnalysis.plusCharge.nom}
                    </p>
                    <p className="text-sm text-text-muted">
                      {equityAnalysis.personneCounts[equityAnalysis.plusCharge.id]} affectations
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <CheckCircle size={16} />
                      <span className="font-medium">Moins chargé</span>
                    </div>
                    <p className="font-semibold text-text-main">
                      {equityAnalysis.moinsCharge.prenom} {equityAnalysis.moinsCharge.nom}
                    </p>
                    <p className="text-sm text-text-muted">
                      {equityAnalysis.personneCounts[equityAnalysis.moinsCharge.id]} affectations
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Info */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-text-muted">
              <p className="font-medium text-text-main mb-1">Comment fonctionne le solveur ?</p>
              <ul className="space-y-1">
                <li>• <strong>Équité :</strong> Priorise le personnel avec moins d'affectations</li>
                <li>• <strong>Préférences :</strong> Respecte les préférences nuit/week-end (+{config.preferences.nightPreferenceBonus}/+{config.preferences.wePreferenceBonus} pts)</li>
                <li>• <strong>Contraintes :</strong> Respecte les limites légales (max {config.legal.maxConsecutiveNights} nuits, repos {config.legal.minRestBetweenShifts}h)</li>
                <li>• <strong>Qualification :</strong> Adapte le тип de poste à la qualification</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SolverVisualizer;