import React, { useState } from 'react';
import { useAppState, Besoin } from '@/store/AppContext';
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

interface BesoinFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  besoinToEdit?: Besoin | null;
}

export const BesoinFormModal: React.FC<BesoinFormModalProps> = ({
  open,
  onOpenChange,
  besoinToEdit,
}) => {
  const { state, dispatch } = useAppState();
  
  const [service, setService] = useState(besoinToEdit?.service || '');
  const [typePoste, setTypePoste] = useState<Besoin['typePoste']>(besoinToEdit?.typePoste || 'ambulance');
  const [quart, setQuart] = useState<Besoin['quart']>(besoinToEdit?.quart || 'matin');
  const [personnelRequis, setPersonnelRequis] = useState(besoinToEdit?.personnelRequis?.toString() || '1');
  const [recurrente, setRecurrente] = useState(besoinToEdit?.recurrente || false);
  const [beneficiaire, setBeneficiaire] = useState(besoinToEdit?.beneficiaire || '');
  const [bureauId, setBureauId] = useState(besoinToEdit?.bureauId || state.bureaux[0]?.id || '');

  const isEditing = !!besoinToEdit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!service.trim()) {
      toast.error('Le nom du service est requis');
      return;
    }

    const needData = {
      service: service.trim(),
      typePoste,
      quart,
      personnelRequis: parseInt(personnelRequis, 10) || 1,
      recurrente,
      beneficiaire: beneficiaire.trim() || undefined,
      bureauId,
    };

    if (isEditing) {
      const updatedBesoins = state.besoins.map(b => 
        b.id === besoinToEdit.id 
          ? { ...b, ...needData }
          : b
      );
      dispatch({ type: 'SET_BESOINS', payload: updatedBesoins });
      toast.success(`Besoin "${service}" modifié avec succès`);
    } else {
      const newBesoin: Besoin = {
        id: `b${Date.now()}`,
        date: state.selectedDate,
        personnelAffecte: [],
        statut: 'non-couvert',
        ...needData,
      };
      dispatch({ type: 'SET_BESOINS', payload: [...state.besoins, newBesoin] });
      toast.success(`Besoin "${service}" créé avec succès`);
    }

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setService('');
    setTypePoste('ambulance');
    setQuart('matin');
    setPersonnelRequis('1');
    setRecurrente(false);
    setBeneficiaire('');
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
            {isEditing ? 'Modifier le besoin' : 'Créer un besoin'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? `Modifier le besoin pour ${besoinToEdit.service}` 
              : 'Créer un nouveau besoin de personnel'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium text-text-main mb-1 block">Service *</label>
            <Input
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="Ex: Urgences, Radiologie..."
              required
            />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-main mb-1 block">Type de poste *</label>
              <Select value={typePoste} onValueChange={(v) => setTypePoste(v as Besoin['typePoste'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ambulance">Ambulance</SelectItem>
                  <SelectItem value="VSL">VSL</SelectItem>
                  <SelectItem value="taxi">Taxi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-text-main mb-1 block">Quart *</label>
              <Select value={quart} onValueChange={(v) => setQuart(v as Besoin['quart'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matin">Matin (06h-14h)</SelectItem>
                  <SelectItem value="apres-midi">Après-midi (14h-22h)</SelectItem>
                  <SelectItem value="nuit">Nuit (22h-06h)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-main mb-1 block">Personnel requis *</label>
            <Input
              type="number"
              min="1"
              max="10"
              value={personnelRequis}
              onChange={(e) => setPersonnelRequis(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-text-main mb-1 block">Bénéficiaire</label>
            <Input
              value={beneficiaire}
              onChange={(e) => setBeneficiaire(e.target.value)}
              placeholder="Ex: Hôpital Central"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurrente"
              checked={recurrente}
              onChange={(e) => setRecurrente(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="recurrente" className="text-sm text-text-main cursor-pointer">
              Besoin récurrent (quotidien)
            </label>
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