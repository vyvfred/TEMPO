import React, { useState, useEffect } from 'react';
import { useAppState, Personnel } from '@/store/AppContext';
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
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface PersonnelFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personnelToEdit?: Personnel | null;
}

export const PersonnelFormModal: React.FC<PersonnelFormModalProps> = ({
  open,
  onOpenChange,
  personnelToEdit,
}) => {
  const { state, dispatch } = useAppState();
  
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [qualificationId, setQualificationId] = useState('');
  const [bureauId, setBureauId] = useState('');
  const [preferenciasNuit, setPreferenciasNuit] = useState(false);
  const [preferenciasWE, setPreferenciasWE] = useState(false);
  const [restrictions, setRestrictions] = useState('');
  const [weeklyContractHours, setWeeklyContractHours] = useState('35');
  const [weeklyExpectedDays, setWeeklyExpectedDays] = useState('5');

  useEffect(() => {
    if (personnelToEdit) {
      setNom(personnelToEdit.nom || '');
      setPrenom(personnelToEdit.prenom || '');
      setDateNaissance(personnelToEdit.dateNaissance || '');
      setTelephone(personnelToEdit.telephone || '');
      setEmail(personnelToEdit.email || '');
      setQualificationId(personnelToEdit.qualificationId || state.qualifications[0]?.id || '');
      setBureauId(personnelToEdit.bureauId || state.bureaux[0]?.id || '');
      setPreferenciasNuit(personnelToEdit.preferenciasNuit || false);
      setPreferenciasWE(personnelToEdit.preferenciasWE || false);
      setRestrictions(personnelToEdit.restrictions.join(', ') || '');
      setWeeklyContractHours(personnelToEdit.weeklyContractHours?.toString() || '35');
      setWeeklyExpectedDays(personnelToEdit.weeklyExpectedDays?.toString() || '5');
    } else {
      setNom('');
      setPrenom('');
      setDateNaissance('');
      setTelephone('');
      setEmail('');
      setQualificationId(state.qualifications[0]?.id || '');
      setBureauId(state.bureaux[0]?.id || '');
      setPreferenciasNuit(false);
      setPreferenciasWE(false);
      setRestrictions('');
      setWeeklyContractHours('35');
      setWeeklyExpectedDays('5');
    }
  }, [personnelToEdit, state.qualifications, state.bureaux]);

  const isEditing = !!personnelToEdit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nom.trim() || !prenom.trim()) {
      toast.error('Le nom et prénom sont requis');
      return;
    }

    const qualification = state.qualifications.find(q => q.id === qualificationId);
    
    const personnelData = {
      nom: nom.trim(),
      prenom: prenom.trim(),
      dateNaissance: dateNaissance || '1990-01-01',
      telephone: telephone.trim(),
      email: email.trim(),
      qualificationId,
      qualification: qualification || state.qualifications[0],
      bureauId,
      preferenciasNuit,
      preferenciasWE,
      restrictions: restrictions.split(',').map(r => r.trim()).filter(Boolean),
      actif: true,
      cpRestants: personnelToEdit?.cpRestants || 25,
      rttRestants: personnelToEdit?.rttRestants || 10,
      rcRestants: personnelToEdit?.rcRestants || 5,
      affectationsCount: personnelToEdit?.affectationsCount || 0,
      equidadScore: personnelToEdit?.equidadScore || 100,
      statut: personnelToEdit?.statut || 'disponible' as const,
      weeklyContractHours: parseInt(weeklyContractHours, 10) || 35,
      weeklyExpectedDays: parseInt(weeklyExpectedDays, 10) || 5,
    };

    if (isEditing) {
      dispatch({ type: 'UPDATE_PERSONNEL', payload: { ...personnelToEdit, ...personnelData } });
      toast.success(`${prenom} ${nom} modifié(e) avec succès`);
    } else {
      const newPersonnel: Personnel = {
        id: `p${Date.now()}`,
        ...personnelData,
      };
      dispatch({ type: 'ADD_PERSONNEL', payload: newPersonnel });
      toast.success(`${prenom} ${nom} ajouté(e) avec succès`);
    }

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setNom('');
    setPrenom('');
    setDateNaissance('');
    setTelephone('');
    setEmail('');
    setQualificationId(state.qualifications[0]?.id || '');
    setBureauId(state.bureaux[0]?.id || '');
    setPreferenciasNuit(false);
    setPreferenciasWE(false);
    setRestrictions('');
    setWeeklyContractHours('35');
    setWeeklyExpectedDays('5');
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier le personnel' : 'Ajouter du personnel'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? `Modifier les informations de ${personnelToEdit?.prenom} ${personnelToEdit?.nom}` 
              : 'Ajouter un nouveau membre au personnel'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prénom *</Label>
              <Input
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Prénom"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Nom *</Label>
              <Input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom"
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date de naissance</Label>
              <Input
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="06 XX XX XX XX"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.fr"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Qualification *</Label>
              <Select value={qualificationId} onValueChange={setQualificationId}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {state.qualifications.map(qual => (
                    <SelectItem key={qual.id} value={qual.id}>
                      {qual.nom} ({qual.abreviation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bureau *</Label>
              <Select value={bureauId} onValueChange={setBureauId}>
                <SelectTrigger className="mt-1">
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

          {/* Contract fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Heures contrat / semaine</Label>
              <Input
                type="number"
                min="0"
                max="60"
                value={weeklyContractHours}
                onChange={(e) => setWeeklyContractHours(e.target.value)}
                placeholder="35"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Jours attendus / semaine</Label>
              <Input
                type="number"
                min="0"
                max="7"
                value={weeklyExpectedDays}
                onChange={(e) => setWeeklyExpectedDays(e.target.value)}
                placeholder="5"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Restrictions médicales</Label>
            <Input
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              placeholder="Ex: Dos, Cardiaque (séparées par des virgules)"
              className="mt-1"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="preferenciasNuit"
                checked={preferenciasNuit}
                onChange={(e) => setPreferenciasNuit(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="preferenciasNuit" className="text-sm cursor-pointer">
                Prefère les nuits
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="preferenciasWE"
                checked={preferenciasWE}
                onChange={(e) => setPreferenciasWE(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="preferenciasWE" className="text-sm cursor-pointer">
                Prefère les week-ends
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90">
              {isEditing ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};