import { Besoin, Personnel, Activite, Tache } from '@/store/AppContext';

// Types pour le résultat de l'algorithme
export interface AffectationResult {
  success: boolean;
  besoinId: string;
  personnelId: string;
  reason?: string;
}

export interface PlanningResult {
  affectations: AffectationResult[];
  nonCouverts: Besoin[];
  alerts: string[];
}

// Vérifier les contraintes légales
export function checkConstraints(
  personnel: Personnel,
  allBesoins: Besoin[],
  newQuart: Besoin['quart']
): { valid: boolean; reason?: string } {
  
  // 1. Vérifier le statut
  if (personnel.statut !== 'disponible') {
    return { valid: false, reason: `${personnel.prenom} n'est pas disponible` };
  }

  if (!personnel.actif) {
    return { valid: false, reason: `${personnel.prenom} n'est plus actif` };
  }

  // 2. Vérifier les restrictions médicales
  if (personnel.restrictions.length > 0) {
    // Simplifié - dans la vraie app, on vérifierait les services autorisés
  }

  // 3. Vérifier les nuits consécutives (simplifié)
  const recentNights = allBesoins.filter(b => b.quart === 'nuit' && b.personnelAffecte.includes(personnel.id));
  if (newQuart === 'nuit' && recentNights.length >= 2) {
    return { valid: false, reason: `${personnel.prenom} a déjà fait beaucoup de nuits` };
  }

  // 4. Vérifier les préférences
  if (newQuart === 'nuit' && !personnel.preferenciasNuit) {
    // Warning mais on permet quand même
  }

  return { valid: true };
}

// Calculer le score d'adéquation pour un personnel sur un besoin
export function calculateAdequacyScore(
  personnel: Personnel,
  besoin: Besoin,
  allPersonnel: Personnel[],
  allBesoins: Besoin[]
): number {
  let score = 50; // Score de base

  // 1. Score d'équité (plus bas = mieux pour répartir)
  score += (100 - personnel.equidadScore) * 0.3;

  // 2. Matching qualification (simplifié)
  if (besoin.typePoste === 'VSL' && personnel.qualification.abreviation === 'VSL') {
    score += 20;
  }

  // 3. Préférences quart
  if (besoin.quart === 'nuit' && personnel.preferenciasNuit) {
    score += 15;
  }

  // 4. Préférences week-end
  const isWeekend = new Date(besoin.date).getDay() === 0 || new Date(besoin.date).getDay() === 6;
  if (isWeekend && personnel.preferenciasWE) {
    score += 10;
  }

  // 5. Restrictions
  if (personnel.restrictions.length > 0) {
    score -= personnel.restrictions.length * 5;
  }

  // 6. Expérience (affectations count)
  score += Math.min(personnel.affectationsCount * 0.1, 10);

  return Math.max(0, Math.min(100, score));
}

// Algorithme principal de génération de planning
export function generatePlanning(
  besoins: Besoin[],
  personnel: Personnel[],
  date: string
): PlanningResult {
  const result: PlanningResult = {
    affectations: [],
    nonCouverts: [],
    alerts: [],
  };

  // Filtrer les besoins non couverts ou partiels pour cette date
  const besoinsToFill = besoins.filter(
    b => b.date === date && b.statut !== 'complete'
  );

  // Personnel disponible trié par score d'équité (ceux avec score le plus bas en priorité)
  const availablePersonnel = [...personnel]
    .filter(p => p.statut === 'disponible' && p.actif)
    .sort((a, b) => a.equidadScore - b.equidadScore);

  for (const besoin of besoinsToFill) {
    const needed = besoin.personnelRequis - besoin.personnelAffecte.length;
    
    for (let i = 0; i < needed; i++) {
      // Trouver le meilleur candidat
      let bestCandidate: Personnel | null = null;
      let bestScore = -1;

      for (const p of availablePersonnel) {
        // Ne pas ré-affecter déjà affecté
        if (besoin.personnelAffecte.includes(p.id)) continue;

        // Vérifier les contraintes
        const constraints = checkConstraints(p, besoins, besoin.quart);
        if (!constraints.valid) continue;

        // Calculer le score d'adéquation
        const adequacyScore = calculateAdequacyScore(p, besoin, personnel, besoins);
        
        if (adequacyScore > bestScore) {
          bestScore = adequacyScore;
          bestCandidate = p;
        }
      }

      if (bestCandidate) {
        result.affectations.push({
          success: true,
          besoinId: besoin.id,
          personnelId: bestCandidate.id,
        });
        
        // Retirer de la liste des disponibles
        const index = availablePersonnel.findIndex(p => p.id === bestCandidate!.id);
        if (index > -1) {
          availablePersonnel.splice(index, 1);
        }
      } else {
        result.alerts.push(`Plus de personnel disponible pour ${besoin.service}`);
      }
    }

    // Vérifier si le besoin est maintenant complet
    const currentAffectes = besoins.find(b => b.id === besoin.id)?.personnelAffecte.length || 0;
    if (currentAffectes + result.affectations.filter(a => a.besoinId === besoin.id).length < besoin.personnelRequis) {
      result.nonCouverts.push(besoin);
    }
  }

  return result;
}

// Générer les besoins récurrents pour une semaine
export function generateWeeklyRecurringBesoins(
  recurringBesoins: Besoin[],
  startDate: Date
): Besoin[] {
  const newBesoins: Besoin[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    for (const template of recurringBesoins.filter(b => b.recurrente)) {
      newBesoins.push({
        ...template,
        id: `${template.id}-${dateStr}`,
        date: dateStr,
        personnelAffecte: [],
        statut: 'non-couvert' as const,
      });
    }
  }

  return newBesoins;
}