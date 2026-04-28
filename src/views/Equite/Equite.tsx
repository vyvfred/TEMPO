import React, { useState, useMemo } from 'react';
import { useAppState, Personnel } from '@/store/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, Users, TrendingUp, Star, Award, Moon, Sun, 
  AlertTriangle, Filter, Search, ChevronDown, ChevronUp,
  Info, RefreshCw, Lock, Unlock
} from 'lucide-react';
import { toast } from 'sonner';

const Equite = () => {
  const { state, dispatch } = useAppState();
  const { personnel, besoins } = state;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'equidadScore' | 'affectationsCount' | 'name'>('equidadScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterBureau, setFilterBureau] = useState<string>('all');
  const [showPreferencesOnly, setShowPreferencesOnly] = useState(false);

  // Calculate equity scores for all personnel
  const personnelWithScores = useMemo(() => {
    const today = state.selectedDate;
    const besoinsDuJour = besoins.filter(b => b.date === today);
    
    return personnel.map(p => {
      // Calculate total affectations history
      const totalAffectations = p.affectationsCount;
      
      // Calculate recent activity (last 7 days)
      const recentAffectations = besoins
        .filter(b => b.personnelAffecte.includes(p.id))
        .length;
      
      // Calculate average score based on multiple factors
      let score = 100;
      
      // Penalize based on total affectations (more = lower score)
      score -= Math.min(totalAffectations * 0.5, 20);
      
      // Penalize based on preferences not respected
      const lastNightQuart = besoinsDuJour.filter(b => b.quart === 'nuit').length;
      if (lastNightQuart > 0 && !p.preferenciasNuit) {
        score -= 10;
      }
      
      // Bonus for preferences respected
      if (p.preferenciasNuit) score += 5;
      if (p.preferenciasWE) score += 5;
      
      // Penalize for restrictions
      score -= p.restrictions.length * 5;
      
      // Ensure score is between 0 and 100
      score = Math.max(0, Math.min(100, Math.round(score)));
      
      return {
        ...p,
        equityScore: score,
        totalAffectations,
        recentAffectations,
      };
    });
  }, [personnel, besoins, state.selectedDate]);

  // Filter and sort personnel
  const filteredPersonnel = useMemo(() => {
    let filtered = [...personnelWithScores];
    
    // Apply filters
    if (filterBureau !== 'all') {
      filtered = filtered.filter(p => p.bureauId === filterBureau);
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.nom.toLowerCase().includes(search) ||
        p.prenom.toLowerCase().includes(search)
      );
    }
    
    if (showPreferencesOnly) {
      filtered = filtered.filter(p => p.preferenciasNuit || p.preferenciasWE);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'equidadScore':
          comparison = a.equityScore - b.equityScore;
          break;
        case 'affectationsCount':
          comparison = a.totalAffectations - b.totalAffectations;
          break;
        case 'name':
          comparison = `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [personnelWithScores, filterBureau, searchTerm, sortBy, sortOrder, showPreferencesOnly]);

  // Global stats
  const stats = useMemo(() => {
    const avgScore = filteredPersonnel.length > 0
      ? Math.round(filteredPersonnel.reduce((sum, p) => sum + p.equityScore, 0) / filteredPersonnel.length)
      : 100;
    
    const mostLoaded = filteredPersonnel.reduce((max, p) => 
      p.totalAffectations > (max?.totalAffectations || 0) ? p : max
    , filteredPersonnel[0]);
    
    const leastLoaded = filteredPersonnel.reduce((min, p) => 
      p.totalAffectations < (min?.totalAffectations || Infinity) ? p : min
    , filteredPersonnel[0]);
    
    const withPreferences = filteredPersonnel.filter(p => p.preferenciasNuit || p.preferenciasWE).length;
    
    return {
      avgScore,
      totalPersonnel: filteredPersonnel.length,
      mostLoaded,
      leastLoaded,
      withPreferences,
      nightPreferences: filteredPersonnel.filter(p => p.preferenciasNuit).length,
      wePreferences: filteredPersonnel.filter(p => p.preferenciasWE).length,
    };
  }, [filteredPersonnel]);

  const handleToggleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <Shield size={28} className="text-accent" />
            Équité & Préférences
          </h2>
          <p className="text-text-muted mt-1">
            Gestion des scores d'équité et des appétences du personnel
          </p>
        </div>
      </div>

      {/* Global Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-surface border-border rounded-xl text-center">
          <div className="text-3xl font-bold text-accent mb-1">{stats.avgScore}</div>
          <p className="text-sm text-text-muted">Score moyen</p>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200 rounded-xl text-center">
          <Moon size={24} className="mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold text-blue-600">{stats.nightPreferences}</div>
          <p className="text-xs text-blue-600">Préfs nuit</p>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-200 rounded-xl text-center">
          <Sun size={24} className="mx-auto mb-2 text-purple-600" />
          <div className="text-2xl font-bold text-purple-600">{stats.wePreferences}</div>
          <p className="text-xs text-purple-600">Préfs WE</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200 rounded-xl text-center">
          <TrendingUp size={24} className="mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold text-green-600">{stats.totalPersonnel}</div>
          <p className="text-xs text-green-600">Personnel</p>
        </Card>
      </div>

      {/* Most/Least Loaded */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {stats.mostLoaded && (
          <Card className="p-4 bg-red-50 border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-600 font-medium">Personnel le plus chargé</p>
                <p className="font-bold text-text-main">
                  {stats.mostLoaded.prenom} {stats.mostLoaded.nom}
                </p>
                <p className="text-sm text-text-muted">
                  {stats.mostLoaded.totalAffectations} affectations totales
                </p>
              </div>
            </div>
          </Card>
        )}
        {stats.leastLoaded && (
          <Card className="p-4 bg-green-50 border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Award size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Personnel le moins chargé</p>
                <p className="font-bold text-text-main">
                  {stats.leastLoaded.prenom} {stats.leastLoaded.nom}
                </p>
                <p className="text-sm text-text-muted">
                  {stats.leastLoaded.totalAffectations} affectations totales
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4 bg-surface border-border rounded-xl mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-bg border-border"
            />
          </div>
          
          <select
            value={filterBureau}
            onChange={(e) => setFilterBureau(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-text-main text-sm"
          >
            <option value="all">Tous les bureaux</option>
            {state.bureaux.map(bureau => (
              <option key={bureau.id} value={bureau.id}>{bureau.nom}</option>
            ))}
          </select>

          <Button 
            variant={showPreferencesOnly ? "default" : "outline"}
            onClick={() => setShowPreferencesOnly(!showPreferencesOnly)}
            size="sm"
          >
            <Filter size={14} className="mr-2" />
            Avec préfs
          </Button>
        </div>
      </Card>

      {/* Personnel List */}
      <Card className="bg-surface border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg border-b border-border">
              <tr>
                <th className="text-left p-4 font-medium text-text-muted">
                  <button 
                    onClick={() => handleToggleSort('name')}
                    className="flex items-center gap-1 hover:text-text-main"
                  >
                    Personnel
                    {sortBy === 'name' && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </button>
                </th>
                <th className="text-left p-4 font-medium text-text-muted hide-mobile">Bureau</th>
                <th className="text-center p-4 font-medium text-text-muted">
                  <button 
                    onClick={() => handleToggleSort('equidadScore')}
                    className="flex items-center gap-1 hover:text-text-main mx-auto"
                  >
                    Score
                    {sortBy === 'equidadScore' && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </button>
                </th>
                <th className="text-center p-4 font-medium text-text-muted hide-mobile">
                  <button 
                    onClick={() => handleToggleSort('affectationsCount')}
                    className="flex items-center gap-1 hover:text-text-main mx-auto"
                  >
                    Affectations
                    {sortBy === 'affectationsCount' && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </button>
                </th>
                <th className="text-center p-4 font-medium text-text-muted">Préférences</th>
                <th className="text-center p-4 font-medium text-text-muted hide-mobile">Restrictions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPersonnel.map((person) => {
                const bureau = state.bureaux.find(b => b.id === person.bureauId);
                
                return (
                  <tr key={person.id} className="border-b border-border hover:bg-bg transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          person.equityScore >= 80 ? 'bg-green-500' :
                          person.equityScore >= 60 ? 'bg-yellow-500' :
                          person.equityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                        }`}>
                          {person.prenom[0]}{person.nom[0]}
                        </div>
                        <div>
                          <p className="font-medium text-text-main">{person.prenom} {person.nom}</p>
                          <p className="text-sm text-text-muted">{person.qualification.abreviation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hide-mobile">
                      <Badge variant="outline">{bureau?.nom || 'N/A'}</Badge>
                    </td>
                    <td className="p-4 text-center">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getScoreBg(person.equityScore)}`}>
                        <Star size={14} className={getScoreColor(person.equityScore)} />
                        <span className={`font-bold ${getScoreColor(person.equityScore)}`}>
                          {person.equityScore}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center hide-mobile">
                      <span className="text-lg font-bold text-text-main">{person.totalAffectations}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {person.preferenciasNuit && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                            <Moon size={12} className="mr-1" />
                            Nuit
                          </Badge>
                        )}
                        {person.preferenciasWE && (
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                            <Sun size={12} className="mr-1" />
                            WE
                          </Badge>
                        )}
                        {!person.preferenciasNuit && !person.preferenciasWE && (
                          <span className="text-text-muted text-sm">Aucune</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center hide-mobile">
                      {person.restrictions.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-1">
                          {person.restrictions.map((rest, i) => (
                            <Badge key={i} variant="destructive" className="text-xs">
                              {rest}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-success text-sm flex items-center justify-center gap-1">
                          <Unlock size={14} /> Aucune
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredPersonnel.length === 0 && (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-text-muted">Aucun personnel ne correspond aux critères</p>
          </div>
        )}
      </Card>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200 rounded-xl mt-6">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-text-main mb-1">Comment est calculé le score d'équité ?</h4>
            <ul className="text-sm text-text-muted space-y-1">
              <li>• Le score est basé sur 100 et diminue avec le nombre d'affectations</li>
              <li>• Les préférences de nuit/week-end ajoutent un bonus de +5 points chacune</li>
              <li>• Chaque restriction médicale réduit le score de 5 points</li>
              <li>• Le solveur de planning utilise ce score pour répartir équitablement la charge</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Equite;