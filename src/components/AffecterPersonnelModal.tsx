import React from 'react';
import { useAppState, Besoin, Personnel } from '@/store/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, X, Check, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface AffecterPersonnelModalProps {
  besoin: Besoin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const quartLabels = {
  'matin': 'Matin (06h-14h)',
  'apres-midi': 'Après-midi (14h-22h)',
  'nuit': 'Nuit (22h-06h)',
};

export const AffecterPersonnelModal: React.FC<AffecterPersonnelModalProps> = ({
  besoin,
  open,
  onOpenChange,
}) => {
  const { state, dispatch } = useAppState();
  const { personnel } = state;

  if (!besoin) return null;

  // Personnel déjà affecté à ce besoin
  const affectes = personnel.filter(p => besoin.personnelAffecte.includes(p.id));
  
  // Personnel disponible (non déjà affecté à ce besoin)
  const disponibles = personnel.filter(
    p => p.statut === 'disponible' && !besoin.personnelAffecte.includes(p.id)
  );

  const handleAffecter = (personnelId: string) => {
    dispatch({
      type: 'AFFECTER_PERSONNEL',
      payload: { besoinId: besoin.id, personnelId },
    });
    const p = personnel.find(p => p.id === personnelId);
    toast.success(`${p?.prenom} ${p?.nom} affecté(e) à ${besoin.service}`);
  };

  const handleDesaffecter = (personnelId: string) => {
    dispatch({
      type: 'DESAFFECTER_PERSONNEL',
      payload: { besoinId: besoin.id, personnelId },
    });
    const p = personnel.find(p => p.id === personnelId);
    toast.info(`${p?.prenom} ${p?.nom} désaffecté(e) de ${besoin.service}`);
  };

  const placesRestantes = besoin.personnelRequis - besoin.personnelAffecte.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin size={20} className="text-accent" />
            Affecter du personnel
          </DialogTitle>
          <DialogDescription>
            {besoin.service} • {quartLabels[besoin.quart]}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Résumé */}
          <div className="flex items-center justify-between p-4 bg-bg rounded-lg">
            <div>
              <p className="text-sm text-text-muted">Personnel affecté</p>
              <p className="text-2xl font-bold text-text-main">
                {besoin.personnelAffecte.length} / {besoin.personnelRequis}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted">Places restantes</p>
              <p className={`text-2xl font-bold ${placesRestantes > 0 ? 'text-warning' : 'text-success'}`}>
                {placesRestantes}
              </p>
            </div>
          </div>

          {/* Personnel déjà affecté */}
          {affectes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-text-muted mb-2">Déjà affecté</h4>
              <div className="space-y-2">
                {affectes.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <User size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-text-main">{p.prenom} {p.nom}</p>
                        <p className="text-xs text-text-muted">{p.qualification.nom}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDesaffecter(p.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personnel disponible */}
          {disponibles.length > 0 ? (
            <div>
              <h4 className="text-sm font-medium text-text-muted mb-2">Personnel disponible</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {disponibles.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg hover:border-accent cursor-pointer transition-colors"
                    onClick={() => handleAffecter(p.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <User size={16} className="text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-text-main">{p.prenom} {p.nom}</p>
                        <p className="text-xs text-text-muted">{p.qualification.nom}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-accent text-accent hover:bg-accent hover:text-white"
                    >
                      <Check size={16} className="mr-1" />
                      Affecter
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted">
              <p>Aucun personnel disponible</p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};