import React, { useState, useEffect } from 'react';
import { useAppState, Activite } from '@/store/AppContext';
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

interface ActiviteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activiteToEdit?: Activite | null;
}

export const ActiviteFormModal: React.FC<ActiviteFormModalProps> = ({
  open,
  onOpenChange,
  activiteToEdit,
}) => {
  const { state, dispatch } = useAppState();
  
  const [nom, setNom] = useState('');
  const [type, setType] = useState<Activite['type']>('UPH');
  const [lieu, setLieu] = useState('');
  const [besoins, setBesoins] = useState('2');
  const [bureauId, setBureauId] = useState('');
  const [observations, setObservations] = useState('');

  // Synchroniser les états locaux avec activiteToEdit quand il change
  useEffect(() => {
    if (activiteToEdit) {
      setNom(activiteToEdit.nom || '');
      setType(activiteToEdit.type || 'UPH');
      setLieu(activiteToEdit.lieu || '');
      setBesoins(activiteToEdit.besoins?.toString() || '2');
      setBureauId(activiteToEdit.bureauId || state.bureaux[0]?.id || '');
      setObservations(activiteToEdit.observations || '');
    } else {
      // Reset pour une nouvelle activité
      setNom('');
      setType('UPH');
      setLieu('');
      setBesoins('2');
      setBureauId(state.bureaux[0]?.id || '');
      setObservations('');
    }
  }, [activiteToEdit, state.bureaux]);

  const isEditing = !!activiteToEdit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nom.trim() || !lieu.trim()) {
      toast.error('Le nom et le lieu sont requis');
      return;
    }

    const activiteData = {
      nom: nom.trim(),
      type,
      lieu: lieu.trim(),
      besoins: parseInt(besoins, 10) || 2,
      bureauId,
      observations: observations.trim() || undefined,
      affectes: activiteToEdit?.affectes || [],
      statut: activiteToEdit?.statut || 'planifie' as const,
    };

    if (isEditing) {
      const updated = state.activites.map(a => 
        a.id === activiteToEdit.id ? { ...a, ...activiteData } : a
      );
      dispatch({ type: 'SET_ACTIVITES', payload: updated });
      toast.success(`Activité "${nom}" modifiée`);
    } else {
      const newActivite: Activite = {
        id: `a${Date.now()}`,
        date: state.selectedDate,
        ...activiteData,
      };
      dispatch({ type: 'ADD_ACTIVITE', payload: newActivite });
      toast.success(`Activité "${nom}" créée`);
    }

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setNom('');
    setType('UPH');
    setLieu('');
    setBesoins('2');
    setBureauId(state.bureaux[0]?.id || '');
    setObservations('');
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
            {isEditing ? 'Modifier l\'activité' : 'Nouvelle activité'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? `Modifier "${activiteToEdit?.nom}"` 
              : 'Créer une nouvelle activité planifiée'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium text-text-main mb-1 block">Nom *</label>
            <Input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Marathon de Paris"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-main mb-1 block">Type *</label>
              <Select value={type} onValueChange={(v) => setType(v as Activite['type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPH">UPH</SelectItem>
                  <SelectItem value="manifestation">Manifestation</SelectItem>
                  <SelectItem value="permanence">Permanence</SelectItem>
                  <SelectItem value="evennement">Événement</SelectItem>
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
            <label className="text-sm font-medium text-text-main mb-1 block">Lieu *</label>
            <Input
              value={lieu}
              onChange={(e) => setLieu(e.target.value)}
              placeholder="Ex: Stade de France"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-text-main mb-1 block">Personnel requis *</label>
            <Input
              type="number"
              min="1"
              max="20"
              value={besoins}
              onChange={(e) => setBesoins(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-text-main mb-1 block">Observations</label>
            <Input
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Notes ou observations..."
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