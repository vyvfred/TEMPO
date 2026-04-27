import React, { useState } from 'react';
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
  
  const [nom, setNom] = useState(personnelToEdit?.nom || '');
  const [prenom, setPrenom] = useState(personnelToEdit?.prenom || '');
  const [dateNaissance, setDateNaissance] = useState(personnelToEdit?.dateNaissance || '');
  const [telephone, setTelephone] = useState(personnelToEdit?.telephone || '');
  const [email, setEmail] = useState(personnelToEdit?.email || '');
  const [qualificationId, setQualificationId] = useState(personnelToEdit?.qualificationId || state.qualifications[0]?.id || '');
  const [bureauId, setBureauId] = useState(personnelToEdit?.bureauId || state.bureaux[0]?.id || '');
  const [preferenciasNuit, setPreferenciasNuit] = useState(personnelToEdit?.preferenciasNuit || false);
  const [preferenciasWE, setPreferenciasWE] = useState(personnelToEdit?.preferenciasWE || false);
  const [restrictions, setRestrictions] = useState(personnelToEdit?.restrictions.join(', ') || '');

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
              ? `Modifier les informations de ${personnelToEdit.prenom} ${personnelToEdit.nom}` 
              : 'Ajouter un nouveau membre au personnel'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-main mb-1 block">Prénom *</label>
              <Input
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Prénom"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-main mb-1 block">Nom *</label>
              <Input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-main mb-1 block">Date de naissance</label>
              <Input
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-main mb-1 block">Téléphone</label>
              <Input
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="06 XX XX XX XX"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-main mb-1 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.fr"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-main mb-1 block">Qualification *</label>
              <Select value={qualificationId} onValueChange={setQualificationId}>
                <SelectTrigger>
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
            <label className="text-sm font-medium text-text-main mb-1 block">Restrictions médicales</label>
            <Input
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              placeholder="Ex: Dos, Cardiaque (séparées par des virgules)"
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
              <label htmlFor="preferenciasNuit" className="text-sm text-text-main cursor-pointer">
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
              <label htmlFor="preferenciasWE" className="text-sm text-text-main cursor-pointer">
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