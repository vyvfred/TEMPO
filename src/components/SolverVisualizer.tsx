import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cpu, CheckCircle, AlertTriangle, Clock, Users, 
  Sparkles, Info, ArrowRight
} from 'lucide-react';

interface SolverVisualizerProps {
  onComplete?: () => void;
}

export const SolverVisualizer: React.FC<SolverVisualizerProps> = ({ onComplete }) => {
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-blue-50 border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Solveur Multi-Objectifs</p>
            <p>Le solveur optimise simultanément : équité, préférences, contraintes légales et qualification.</p>
          </div>
        </div>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={onComplete} className="bg-accent hover:bg-accent/90">
          Fermer
        </Button>
      </div>
    </div>
  );
};

export default SolverVisualizer;