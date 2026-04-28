import React, { useState, useEffect } from 'react';
import { useAppState, Tache } from '@/store/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface TacheFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tacheToEdit?: Tache | null;
}

export const TacheFormModal: React.FC<TacheFormModalProps> = ({
  open,
  onOpenChange,
  tacheToEdit,
}) => {
  const { state, dispatch } = useAppState();
  
  const [nom, setNom] = useState('');
  const [type, setType] = useState<Tache['type']>('regulation');
  const [duree, setDuree] = useState('4');
  const [bureauId, setBureauId] = useState('');

  // Synchroniser les états locaux avec tacheToEdit quand il change
  useEffect(() => {
    if (tacheToEdit) {
      setNom(tacheToEdit.nom || '');
      setType(tacheToEdit.type || 'regulation');
      setDuree(tacheToEdit.duree?.toString() || '4');
      setBureauId(tacheToEdit.bureauId || state.bureaux[0]?.id || '');
    } else {
      // Reset pour une nouvelle tâche
      setNom('');
      setType('regulation');
      setDuree('4');
      setBureauId(state.bureaux[0]?.id || '');
    }
  }, [tacheToEdit, state.bureaux]);

  const isEditing = !!tacheToEdit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nom.trim()) {
      toast.error('Le nom de la tâche est requis');
      return;
    }

    const tacheData = {
      nom: nom.trim(),
      type,
      duree: parseInt(duree, 10) || 4,
      bureauId,
      personnel: tacheToEdit?.personnel || [],
      statut: tacheToEdit?.statut || 'planifie' as const,
    };

    if (isEditing) {
      const updated = state.taches.map(t => 
        t.id === tacheToEdit.id ? { ...t, ...tacheData } : t
      );
      dispatch({ type: 'SET_TACHES', payload: updated });
      toast.success(`Tâche "${nom}" modifiée`);
    } else {
      const newTache: Tache = {
        id: `t${Date.now()}`,
        date: state.selectedDate,
        ...tacheData,
      };
      dispatch({ type: 'ADD_TACHE', payload: newTache });
      toast.success(`Tâche "${nom}" créée`);
    }

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setNom('');
    setType('regulation');
    setDuree('4');
    setBureauId(state.bureaux[0]?.id || '');
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? `Modifier "${tacheToEdit?.nom}"` 
              : 'Créer une nouvelle tâche non roulante'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium text-text-main mb-1 block">Nom *</label>
            <Input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Régulation SAMU"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-main mb-1 block">Type *</label>
              <Select value={type} onValueChange={(v) => setType(v as Tache['type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regulation">Régulation</SelectItem>
                  <SelectItem value="formation">Formation</SelectItem>
                  <SelectItem value="entretien">Entretien</SelectItem>
                  <SelectItem value="reunion">Réunion</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-text-main mb-1 block">Bureau *</label>
              <Select value={bureauId} onValueChange={setBureauId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {state.bureaux.map(bureau => (
                    <SelectItem key={bureau.id} value={bureau.id}>{bureau.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-main mb-1 block">Durée (heures) *</label>
            <Input
              type="number"
              min="1"
              max="12"
              value={duree}
              onChange={(e) => setDuree(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90">
              {isEditing ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};