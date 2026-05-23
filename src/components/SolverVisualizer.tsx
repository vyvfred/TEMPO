import React, { useState, useEffect, useCallback } from "react";
import { useAppState } from "@/store/AppContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Loader2, Sparkles } from "lucide-react";

interface SolverVisualizerProps {
  onComplete?: () => void;
}

interface SolverStep {
  step: number;
  type: "candidate" | "assignment" | "warning" | "complete";
  data: any;
}

export const SolverVisualizer: React.FC<SolverVisualizerProps> = ({ onComplete }) => {
  const { state } = useAppState();
  const [steps, setSteps] = useState<SolverStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const runSolver = useCallback(() => {
    setIsRunning(true);
    setSteps([]);
    setCurrentStep(0);

    import("@/utils/solverEngine").then(({ solvePlanningStepByStep }) => {
      const generator = solvePlanningStepByStep(state);
      let done = false;

      const processStep = () => {
        if (done) return;
        const result = generator.next();
        if (result.done) {
          done = true;
          setIsRunning(false);
          onComplete?.();
        } else {
          const newStep = result.value as SolverStep;
          setSteps((prev) => [...prev, newStep]);
          setCurrentStep((prev) => prev + 1);
          setTimeout(processStep, 500);
        }
      };

      processStep();
    });
  }, [state, onComplete]);

  useEffect(() => {
    runSolver();
  }, []);

  return (
    <Card className="p-6 bg-surface border-border rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-accent" />
          <h3 className="font-semibold text-text-main">Résolution en cours...</h3>
        </div>
        <Badge variant="outline">{steps.length} étapes</Badge>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg text-sm ${
              step.type === "assignment"
                ? "bg-green-50 border border-green-200"
                : step.type === "warning"
                ? "bg-yellow-50 border border-yellow-200"
                : step.type === "complete"
                ? "bg-blue-50 border border-blue-200"
                : "bg-bg border border-border"
            }`}
          >
            <div className="flex items-center gap-2">
              {step.type === "assignment" && <CheckCircle size={16} className="text-green-600" />}
              {step.type === "warning" && <AlertTriangle size={16} className="text-yellow-600" />}
              {step.type === "candidate" && <Loader2 size={16} className="text-blue-600 animate-spin" />}
              {step.type === "complete" && <Sparkles size={16} className="text-blue-600" />}
              <span className="font-mono text-xs text-text-muted">#{step.step}</span>
              <span className="font-medium capitalize">{step.type}</span>
            </div>
            {step.type === "assignment" && (
              <p className="mt-1 text-text-muted">
                {step.data.personnel?.prenom} {step.data.personnel?.nom} → {step.data.besoin?.service}
                {step.data.score && (
                  <span className="ml-2 text-accent">({step.data.score.totalScore?.toFixed(1)} pts)</span>
                )}
              </p>
            )}
          </div>
        ))}
      </div>

      <Button
        onClick={runSolver}
        disabled={isRunning}
        variant="outline"
        className="w-full mt-4"
      >
        {isRunning ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Résolution en cours...
          </>
        ) : (
          <>
            <Sparkles size={16} className="mr-2" />
            Relancer
          </>
        )}
      </Button>
    </Card>
  );
};

export default SolverVisualizer;