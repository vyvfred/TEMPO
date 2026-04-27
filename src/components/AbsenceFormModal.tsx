import React, { useState } from 'react';
import { useAppState, Absence, Personnel } from '@/store/AppContext';
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

interface AbsenceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AbsenceFormModal: React.FC<AbsenceFormModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { state, dispatch } = useAppState();
  const { personnel } = state;
  
  const [personnelId, setPersonnelId] = useState('');
  const [type, setType] = useState<Absence['type']>('CP');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [observations, setObservations] = useState('');

  const selectedPerson = personnel.find(p => p.id === personnelId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!personnelId || !dateDebut || !dateFin) {
      toast.error('Tous les champs obligatoires doivent être remplis');
      return;
    }

    const newAbsence: Absence = {
      id: `abs${Date.now()}`,
      personnelId,
      dateDebut,
      dateFin,
      type,
      statut: 'planifie',
      observations: observations.trim() || undefined,
    };

    dispatch({ type: 'ADD_ABSENCE', payload: newAbsence });
    
    const person = personnel.find(p => p.id === personnelId);
    toast.success(`Absence ajoutée pour ${person?.prenom} ${person?.nom}`);

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setPersonnelId('');
    setType('CP');
    setDateDebut('');
    setDateFin('');
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
          <DialogTitle>Nouvelle absence</DialogTitle>
          <DialogDescription>
            Déclarer une absence pour un membre du personnel
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium text-text-main mb-1 block">Personnel *</label>
            <Select value={personnelId} onValueChange={setPersonnelId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un membre..." />
              </SelectTrigger>
              <SelectContent>
                {personnel.filter(p => p.actif).map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.prenom} {p.nom} ({p.qualification.abreviation})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-text-main mb-1 block">Type d'absence *</label>
            <Select value={type} onValueChange={(v) => setType(v as Absence['type'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CP">Congés Payés</SelectItem>
                <SelectItem value="RTT">RTT</SelectItem>
                <SelectItem value="RC">Récupération</SelectItem>
                <SelectItem value="maladie">Maladie</SelectItem>
                <SelectItem value="formation">Formation</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-main mb-1 block">Date début *</label>
              <Input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-main mb-1 block">Date fin *</label>
              <Input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                required
              />
            </div>
          </div>

          {selectedPerson && (
            <div className="p-3 bg-bg rounded-lg text-sm">
              <p className="text-text-muted">Soldes disponibles:</p>
              <div className="flex gap-4 mt-1">
                <span className="text-blue-600">CP: {selectedPerson.cpRestants}</span>
                <span className="text-purple-600">RTT: {selectedPerson.rttRestants}</span>
                <span className="text-green-600">RC: {selectedPerson.rcRestants}</span>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-text-main mb-1 block">Observations</label>
            <Input
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Motif ou notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90">
              Créer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};