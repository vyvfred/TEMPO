import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  HelpCircle, Search, ChevronDown, ChevronUp, Book,
  Users, Calendar, Activity, Settings, AlertTriangle,
  CheckCircle, ArrowRight, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FaqItem[] = [
  {
    id: '1',
    question: 'Comment fonctionne le solveur de planning ?',
    answer: 'Le solveur analyse les besoins de la journée, vérifie les contraintes légales (repos minimum, heures max), puis attribue le personnel disponible en optimisant l\'équité. Il prend en compte les scores d\'équité individuels et les préférences de nuit/week-end.',
    category: 'Planning'
  },
  {
    id: '2',
    question: 'Comment sont calculés les scores d\'équité ?',
    answer: 'Le score d\'équité est basé sur 100. Il diminue avec le nombre d\'affectations totales (-0.5 par affectation), augmente avec les préférences respectées (+5 points chacune), et diminue avec les restrictions médicales (-5 par restriction).',
    category: 'Équité'
  },
  {
    id: '3',
    question: 'Peut-on modifier les affectations après génération ?',
    answer: 'Oui, si l\'option "Autoriser les overrides manuels" est activée dans les paramètres du solveur. Vous pouvez affecter ou désaffecter du personnel manuellement depuis la modal d\'affectation.',
    category: 'Planning'
  },
  {
    id: '4',
    question: 'Comment gérer les absences ?',
    answer: 'Accédez à la section "Absences" depuis le menu. Cliquez sur "Nouvelle absence", sélectionnez le personnel, le type (CP, RTT, maladie...), et les dates. Les soldes restants sont automatiquement déduits.',
    category: 'Absences'
  },
  {
    id: '5',
    question: 'Comment créer un besoin récurrent ?',
    answer: 'Lors de la création d\'un besoin, cochez l\'option "Besoin récurrent". Le système génèrera automatiquement ce besoin chaque jour. Vous pouvez ensuite utiliser "Générer Planning" pour propager sur plusieurs semaines.',
    category: 'Besoins'
  },
  {
    id: '6',
    question: 'Que faire si un besoin reste non couvert ?',
    answer: 'Si le solveur ne trouve pas de personnel disponible, le besoin reste en statut "Non couvert". Vous pouvez: 1) Vérifier les disponibilités, 2) Modifier les restrictions, 3) Ajouter du personnel, ou 4) Contacter directement un salarié.',
    category: 'Besoins'
  },
  {
    id: '7',
    question: 'Comment exporter les données ?',
    answer: 'Allez dans Paramètres > Données > Exporter. Un fichier JSON complet sera téléchargé. Vous pouvez l\'importer sur un autre navigateur ou après une réinitialisation.',
    category: 'Paramètres'
  },
  {
    id: '8',
    question: 'Comment réinitialiser les données de démonstration ?',
    answer: 'Allez dans Paramètres > Données > Réinitialiser. Cela supprimera toutes vos données et rechargera les données d\'exemple. Utilisez le "Panic Button" sur la page d\'accueil en cas de problème.',
    category: 'Paramètres'
  },
];

const workflowSteps = [
  { step: 1, title: 'Créer les besoins', desc: 'Définissez les services nécessitant du personnel', icon: Activity },
  { step: 2, title: 'Vérifier le personnel', desc: 'Assurez-vous que les salariés sont disponibles', icon: Users },
  { step: 3, title: 'Lancer le solveur', desc: 'Générez automatiquement le planning', icon: Calendar },
  { step: 4, title: 'Ajuster manuellement', desc: 'Modifiez si nécessaire les affectations', icon: Settings },
];

export const Guide: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...new Set(faqs.map(f => f.category))];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
          <Book size={28} className="text-accent" />
          Guide Utilisation
        </h2>
        <p className="text-text-muted mt-1">Documentation et FAQ pour maîtriser Ambuplan Pro</p>
      </div>

      {/* Workflow */}
      <Card className="p-6 bg-gradient-to-r from-accent/5 to-accent-light/10 border-accent/20 rounded-xl mb-8">
        <h3 className="text-lg font-bold text-text-main mb-6 flex items-center gap-2">
          <ArrowRight size={20} className="text-accent" />
          Workflow de création du planning
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {workflowSteps.map((step) => (
            <div key={step.step} className="relative">
              <div className="bg-white p-4 rounded-xl border border-border">
                <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center font-bold mb-3">
                  {step.step}
                </div>
                <step.icon size={24} className="text-accent mb-2" />
                <h4 className="font-semibold text-text-main">{step.title}</h4>
                <p className="text-sm text-text-muted mt-1">{step.desc}</p>
              </div>
              {step.step < 4 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight size={20} className="text-accent" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Search & Filter */}
      <Card className="p-4 bg-surface border-border rounded-xl mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Rechercher dans la FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-bg border-border"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? 'bg-accent' : ''}
              >
                {cat === 'all' ? 'Tous' : cat}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* FAQ */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
          <HelpCircle size={20} className="text-accent" />
          Questions Fréquentes
        </h3>
        
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => (
            <Card 
              key={faq.id}
              className={`p-4 bg-surface border-border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                expandedFaq === faq.id ? 'border-accent shadow-md' : ''
              }`}
              onClick={() => toggleFaq(faq.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expandedFaq === faq.id ? (
                    <ChevronUp size={20} className="text-accent" />
                  ) : (
                    <ChevronDown size={20} className="text-text-muted" />
                  )}
                  <div>
                    <h4 className="font-medium text-text-main">{faq.question}</h4>
                    <Badge variant="secondary" className="mt-1 text-xs">{faq.category}</Badge>
                  </div>
                </div>
              </div>
              
              {expandedFaq === faq.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-text-muted leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center bg-surface border-border rounded-xl">
            <HelpCircle size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-text-main mb-2">Aucune question trouvée</h3>
            <p className="text-text-muted">Modifiez vos critères de recherche.</p>
          </Card>
        )}
      </div>

      {/* Tips */}
      <Card className="p-6 bg-blue-50 border-blue-200 rounded-xl mb-8">
        <div className="flex items-start gap-3">
          <CheckCircle size={24} className="text-blue-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-text-main mb-2">Conseils rapides</h4>
            <ul className="text-sm text-text-muted space-y-2">
              <li>• Utilisez Ctrl+← / Ctrl+→ pour naviguer entre les jours</li>
              <li>• Appuyez sur ? pour voir les raccourcis clavier</li>
              <li>• Les besoins récurrents se génèrent automatiquement via "Générer Planning"</li>
              <li>• Exportez régulièrement vos données en JSON</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Contact */}
      <Card className="p-6 bg-surface border-border rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-accent" />
            <div>
              <h4 className="font-semibold text-text-main">Besoin d'aide supplémentaire ?</h4>
              <p className="text-sm text-text-muted">Contactez votre administrateur ou consultez la documentation complète</p>
            </div>
          </div>
          <Button variant="outline" className="bg-white">
            Contacter le support
            <ExternalLink size={14} className="ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
};