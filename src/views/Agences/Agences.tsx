import React, { useState } from 'react';
import { useAppState, Bureau, Agence } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, Plus, Edit, Trash2, MapPin, Phone, 
  User, Search, X, Check, Settings, ChevronRight,
  Building, Home, Users, Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface AgenceFormData {
  id?: string;
  nom: string;
  code: string;
  couleur: string;
}

interface BureauFormData {
  id?: string;
  nom: string;
  adresse: string;
  telephone: string;
  responsable: string;
  agenceId: string;
}

export const Agences: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [activeTab, setActiveTab] = useState<'agences' | 'bureaux'>('agences');
  const [showAgenceModal, setShowAgenceModal] = useState(false);
  const [showBureauModal, setShowBureauModal] = useState(false);
  const [editingAgence, setEditingAgence] = useState<Agence | null>(null);
  const [editingBureau, setEditingBureau] = useState<Bureau | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Agence form state
  const [agenceForm, setAgenceForm] = useState<AgenceFormData>({
    nom: '',
    code: '',
    couleur: '#0f766e'
  });

  // Bureau form state
  const [bureauForm, setBureauForm] = useState<BureauFormData>({
    nom: '',
    adresse: '',
    telephone: '',
    responsable: '',
    agenceId: state.currentAgence.id
  });

  // Get personnel count per bureau
  const getPersonnelCount = (bureauId: string) => {
    return state.personnel.filter(p => p.bureauId === bureauId).length;
  };

  // Get besoins count per bureau for today
  const getBesoinsCount = (bureauId: string) => {
    return state.besoins.filter(b => b.bureauId === bureauId && b.date === state.selectedDate).length;
  };

  // Agence CRUD
  const handleSaveAgence = () => {
    if (!agenceForm.nom.trim() || !agenceForm.code.trim()) {
      toast.error('Le nom et le code sont requis');
      return;
    }

    if (editingAgence) {
      dispatch({
        type: 'LOAD_FROM_STORAGE',
        payload: {
          currentAgence: {
            ...state.currentAgence,
            nom: agenceForm.nom,
            code: agenceForm.code,
            couleur: agenceForm.couleur
          }
        }
      });
      toast.success(`Agence "${agenceForm.nom}" modifiée`);
    } else {
      // For now, just update the current agence
      dispatch({
        type: 'LOAD_FROM_STORAGE',
        payload: {
          currentAgence: {
            ...state.currentAgence,
            nom: agenceForm.nom,
            code: agenceForm.code,
            couleur: agenceForm.couleur
          }
        }
      });
      toast.success(`Agence "${agenceForm.nom}" créée`);
    }

    setShowAgenceModal(false);
    resetAgenceForm();
  };

  const resetAgenceForm = () => {
    setAgenceForm({
      nom: state.currentAgence.nom,
      code: state.currentAgence.code,
      couleur: state.currentAgence.couleur
    });
    setEditingAgence(null);
  };

  // Bureau CRUD
  const handleSaveBureau = () => {
    if (!bureauForm.nom.trim()) {
      toast.error('Le nom du bureau est requis');
      return;
    }

    if (editingBureau) {
      const updated = state.bureaux.map(b => 
        b.id === editingBureau.id ? { ...b, ...bureauForm } : b
      );
      dispatch({ type: 'LOAD_FROM_STORAGE', payload: { bureaux: updated } });
      toast.success(`Bureau "${bureauForm.nom}" modifié`);
    } else {
      const newBureau: Bureau = {
        id: `b${Date.now()}`,
        ...bureauForm
      };
      dispatch({ type: 'LOAD_FROM_STORAGE', payload: { bureaux: [...state.bureaux, newBureau] } });
      toast.success(`Bureau "${bureauForm.nom}" créé`);
    }

    setShowBureauModal(false);
    resetBureauForm();
  };

  const resetBureauForm = () => {
    setBureauForm({
      nom: '',
      adresse: '',
      telephone: '',
      responsable: '',
      agenceId: state.currentAgence.id
    });
    setEditingBureau(null);
  };

  const handleDeleteBureau = (bureauId: string) => {
    const bureau = state.bureaux.find(b => b.id === bureauId);
    const personnelCount = getPersonnelCount(bureauId);
    
    if (personnelCount > 0) {
      toast.error(`Impossible de supprimer : ${personnelCount} salarié(s) rattaché(s)`);
      return;
    }

    if (confirm(`Supprimer le bureau "${bureau?.nom}" ?`)) {
      const updated = state.bureaux.filter(b => b.id !== bureauId);
      dispatch({ type: 'LOAD_FROM_STORAGE', payload: { bureaux: updated } });
      toast.success('Bureau supprimé');
    }
  };

  const openEditBureau = (bureau: Bureau) => {
    setEditingBureau(bureau);
    setBureauForm({
      id: bureau.id,
      nom: bureau.nom,
      adresse: bureau.adresse,
      telephone: bureau.telephone,
      responsable: bureau.responsable,
      agenceId: state.currentAgence.id
    });
    setShowBureauModal(true);
  };

  // Filtered bureaux
  const filteredBureaux = state.bureaux.filter(b => 
    b.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.responsable.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <Building2 size={28} className="text-accent" />
            Agences & Bureaux
          </h2>
          <p className="text-text-muted mt-1">
            {state.bureaux.length} bureau(x) • {state.personnel.length} salarié(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => { setEditingAgence(null); setAgenceForm({
              nom: state.currentAgence.nom,
              code: state.currentAgence.code,
              couleur: state.currentAgence.couleur
            }); setShowAgenceModal(true); }}
            variant="outline"
          >
            <Settings size={16} className="mr-2" />
            Configurer Agence
          </Button>
          <Button 
            onClick={() => { resetBureauForm(); setShowBureauModal(true); }}
            className="bg-accent hover:bg-accent/90"
          >
            <Plus size={16} className="mr-2" />
            Nouveau Bureau
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('agences')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'agences' 
              ? 'text-accent border-b-2 border-accent' 
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          <Building className="inline mr-2" size={18} />
          Agence Principale
        </button>
        <button
          onClick={() => setActiveTab('bureaux')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'bureaux' 
              ? 'text-accent border-b-2 border-accent' 
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          <Home className="inline mr-2" size={18} />
          Bureaux / Sites ({state.bureaux.length})
        </button>
      </div>

      {/* Agence Tab */}
      {activeTab === 'agences' && (
        <div className="grid gap-6">
          <Card className="p-6 bg-surface border-border rounded-xl">
            <div className="flex items-start gap-6">
              <div 
                className="w-20 h-20 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: state.currentAgence.couleur }}
              >
                <Building2 size={40} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-text-main">{state.currentAgence.nom}</h3>
                    <Badge variant="outline" className="mt-1">{state.currentAgence.code}</Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingAgence(state.currentAgence);
                      setAgenceForm({
                        nom: state.currentAgence.nom,
                        code: state.currentAgence.code,
                        couleur: state.currentAgence.couleur
                      });
                      setShowAgenceModal(true);
                    }}
                  >
                    <Edit size={14} className="mr-1" />
                    Modifier
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-bg rounded-lg">
                    <div className="flex items-center gap-2 text-text-muted mb-1">
                      <Home size={16} />
                      <span className="text-sm">Bureaux</span>
                    </div>
                    <p className="text-2xl font-bold text-text-main">{state.bureaux.length}</p>
                  </div>
                  <div className="p-4 bg-bg rounded-lg">
                    <div className="flex items-center gap-2 text-text-muted mb-1">
                      <Users size={16} />
                      <span className="text-sm">Salariés</span>
                    </div>
                    <p className="text-2xl font-bold text-text-main">{state.personnel.length}</p>
                  </div>
                  <div className="p-4 bg-bg rounded-lg">
                    <div className="flex items-center gap-2 text-text-muted mb-1">
                      <Activity size={16} />
                      <span className="text-sm">Besoins jour</span>
                    </div>
                    <p className="text-2xl font-bold text-text-main">
                      {state.besoins.filter(b => b.date === state.selectedDate).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Bureaux Tab */}
      {activeTab === 'bureaux' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Rechercher un bureau..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-surface border-border"
            />
          </div>

          {/* Bureaux Grid */}
          {filteredBureaux.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBureaux.map((bureau) => {
                const personnelCount = getPersonnelCount(bureau.id);
                const besoinsCount = getBesoinsCount(bureau.id);
                const disponibles = state.personnel.filter(
                  p => p.bureauId === bureau.id && p.statut === 'disponible'
                ).length;
                
                return (
                  <Card 
                    key={bureau.id}
                    className="p-5 bg-surface border-border rounded-xl hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                          <Home size={24} className="text-accent" />
                        </div>
                        <div>
                          <h4 className="font-bold text-text-main">{bureau.nom}</h4>
                          <Badge variant="secondary" className="text-xs">Site</Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditBureau(bureau)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteBureau(bureau.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2 text-text-muted">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <span className="break-words">{bureau.adresse}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-muted">
                        <Phone size={14} />
                        <span>{bureau.telephone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-muted">
                        <User size={14} />
                        <span>{bureau.responsable}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <p className="text-xl font-bold text-blue-600">{personnelCount}</p>
                        <p className="text-xs text-blue-600">Salariés</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded-lg">
                        <p className="text-xl font-bold text-green-600">{disponibles}</p>
                        <p className="text-xs text-green-600">Dispo</p>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded-lg">
                        <p className="text-xl font-bold text-orange-600">{besoinsCount}</p>
                        <p className="text-xs text-orange-600">Besoins</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center bg-surface border-border rounded-xl">
              <Home size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-text-main mb-2">Aucun bureau trouvé</h3>
              <p className="text-text-muted mb-4">
                {searchTerm ? 'Modifiez vos critères de recherche.' : 'Créez votre premier bureau.'}
              </p>
              <Button 
                onClick={() => { resetBureauForm(); setShowBureauModal(true); }}
                className="bg-accent hover:bg-accent/90"
              >
                <Plus size={16} className="mr-2" />
                Nouveau Bureau
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Agence Modal */}
      {showAgenceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-surface rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-main">
                {editingAgence ? 'Modifier l\'agence' : 'Configurer l\'agence'}
              </h3>
              <button onClick={() => { setShowAgenceModal(false); resetAgenceForm(); }}>
                <X size={20} className="text-text-muted hover:text-text-main" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-main mb-1 block">Nom de l'agence *</label>
                <Input
                  value={agenceForm.nom}
                  onChange={(e) => setAgenceForm({ ...agenceForm, nom: e.target.value })}
                  placeholder="Ex: Ambuplan Pro"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-main mb-1 block">Code agence *</label>
                <Input
                  value={agenceForm.code}
                  onChange={(e) => setAgenceForm({ ...agenceForm, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: SGXV"
                  maxLength={4}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-main mb-1 block">Couleur</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={agenceForm.couleur}
                    onChange={(e) => setAgenceForm({ ...agenceForm, couleur: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0"
                  />
                  <Input
                    value={agenceForm.couleur}
                    onChange={(e) => setAgenceForm({ ...agenceForm, couleur: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="preview p-4 rounded-lg mt-4" style={{ backgroundColor: agenceForm.couleur + '20' }}>
                <p className="text-sm text-text-muted mb-1">Aperçu</p>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: agenceForm.couleur }}
                  >
                    <Building2 size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-text-main">{agenceForm.nom || 'Nom de l\'agence'}</p>
                    <Badge>{agenceForm.code || 'CODE'}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline"
                onClick={() => { setShowAgenceModal(false); resetAgenceForm(); }}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSaveAgence}
                className="bg-accent hover:bg-accent/90"
              >
                <Check size={16} className="mr-2" />
                Enregistrer
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Bureau Modal */}
      {showBureauModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-surface rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-main">
                {editingBureau ? 'Modifier le bureau' : 'Nouveau Bureau'}
              </h3>
              <button onClick={() => { setShowBureauModal(false); resetBureauForm(); }}>
                <X size={20} className="text-text-muted hover:text-text-main" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-main mb-1 block">Nom du bureau *</label>
                <Input
                  value={bureauForm.nom}
                  onChange={(e) => setBureauForm({ ...bureauForm, nom: e.target.value })}
                  placeholder="Ex: Bureau Central"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-main mb-1 block">Adresse</label>
                <Input
                  value={bureauForm.adresse}
                  onChange={(e) => setBureauForm({ ...bureauForm, adresse: e.target.value })}
                  placeholder="Ex: 123 Rue de la Santé, 75001 Paris"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-main mb-1 block">Téléphone</label>
                  <Input
                    value={bureauForm.telephone}
                    onChange={(e) => setBureauForm({ ...bureauForm, telephone: e.target.value })}
                    placeholder="01 XX XX XX XX"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-main mb-1 block">Responsable</label>
                  <Input
                    value={bureauForm.responsable}
                    onChange={(e) => setBureauForm({ ...bureauForm, responsable: e.target.value })}
                    placeholder="Ex: Dr. Martin"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline"
                onClick={() => { setShowBureauModal(false); resetBureauForm(); }}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSaveBureau}
                className="bg-accent hover:bg-accent/90"
              >
                <Check size={16} className="mr-2" />
                {editingBureau ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};