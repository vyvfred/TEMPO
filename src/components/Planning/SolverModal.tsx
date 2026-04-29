import React from 'react';
import { Button } from '@/components/ui/button';
import { SolverVisualizer } from '@/components/SolverVisualizer';
import { Cpu } from 'lucide-react';

interface SolverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SolverModal: React.FC<SolverModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
              <Cpu size={24} className="text-accent" />
              Solveur de Planning Multi-Objectifs
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-bg rounded-lg transition-colors text-text-muted hover:text-text-main">
              ✕
            </button>
          </div>
          <SolverVisualizer onComplete={onClose} />
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolverModal;