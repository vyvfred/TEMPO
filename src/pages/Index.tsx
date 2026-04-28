import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChartContainer, ChartConfig, ChartTooltip } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Download, Calculator, Zap, Route, Leaf, TrendingDown, Info, Car, Fuel, ZapIcon, LeafIcon } from 'lucide-react';

// Emission factors based on ADEME Base Carbone
const FACTORS_M1 = {
  vslDiesel: 0.16,    // kg CO2e per km
  vslElec: 0.02,       // kg CO2e per km
  vslHybride: 0.10,    // kg CO2e per km
  vslColza: 0.06,      // kg CO2e per km
  ambuDiesel: 0.22,    // kg CO2e per km
};

const FACTORS_M3 = {
  dieselLiters: 3.16,  // kg CO2e per liter
  colzaLiters: 1.05,    // kg CO2e per liter
  elecKwh: 0.06,        // kg CO2e per kWh
};

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

interface EmissionData {
  label: string;
  value: number;
  color: string;
}

export default function CarbonCalculator() {
  const currentYear = new Date().getFullYear();
  
  // Period selection
  const [startMonth, setStartMonth] = useState('Janvier');
  const [startYear, setStartYear] = useState(currentYear.toString());
  const [endMonth, setEndMonth] = useState(MONTHS[new Date().getMonth()]);
  const [endYear, setEndYear] = useState(currentYear.toString());

  // Method 1 inputs (kilometers)
  const [m1VslD, setM1VslD] = useState('');
  const [m1VslE, setM1VslE] = useState('');
  const [m1VslH, setM1VslH] = useState('');
  const [m1VslC, setM1VslC] = useState('');
  const [m1AmbuD, setM1AmbuD] = useState('');

  // Method 3 inputs (consumption)
  const [m3Diesel, setM3Diesel] = useState('');
  const [m3Colza, setM3Colza] = useState('');
  const [m3Elec, setM3Elec] = useState('');

  // Results
  const [results, setResults] = useState<EmissionData[]>([]);
  const [totalKg, setTotalKg] = useState(0);
  const [methodUsed, setMethodUsed] = useState('');
  const [hasCalculated, setHasCalculated] = useState(false);

  const formatNumber = (num: number, decimals = 0) => {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(num);
  };

  const getPeriodText = () => {
    if (startMonth === endMonth && startYear === endYear) {
      return `${startMonth} ${startYear}`;
    }
    return `De ${startMonth} ${startYear} à ${endMonth} ${endYear}`;
  };

  const calculateM1 = () => {
    const vslD = parseFloat(m1VslD) || 0;
    const vslE = parseFloat(m1VslE) || 0;
    const vslH = parseFloat(m1VslH) || 0;
    const vslC = parseFloat(m1VslC) || 0;
    const ambuD = parseFloat(m1AmbuD) || 0;

    const data: EmissionData[] = [
      { label: 'VSL/Taxi Thermique', value: vslD * FACTORS_M1.vslDiesel, color: '#004C8C' },
      { label: 'VSL/Taxi Électrique', value: vslE * FACTORS_M1.vslElec, color: '#78BE20' },
      { label: 'VSL/Taxi Hybride', value: vslH * FACTORS_M1.vslHybride, color: '#00A3E0' },
      { label: 'VSL/Taxi Colza (B100)', value: vslC * FACTORS_M1.vslColza, color: '#A3D977' },
      { label: 'Ambulance Thermique', value: ambuD * FACTORS_M1.ambuDiesel, color: '#F59E0B' },
    ].filter(item => item.value > 0);

    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    setResults(data);
    setTotalKg(total);
    setMethodUsed('Méthode 1 (Kilométrage)');
    setHasCalculated(true);
  };

  const calculateM3 = () => {
    const diesel = parseFloat(m3Diesel) || 0;
    const colza = parseFloat(m3Colza) || 0;
    const elec = parseFloat(m3Elec) || 0;

    const data: EmissionData[] = [
      { label: 'Diesel/Essence', value: diesel * FACTORS_M3.dieselLiters, color: '#004C8C' },
      { label: 'Colza (B100)', value: colza * FACTORS_M3.colzaLiters, color: '#A3D977' },
      { label: 'Électricité', value: elec * FACTORS_M3.elecKwh, color: '#78BE20' },
    ].filter(item => item.value > 0);

    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    setResults(data);
    setTotalKg(total);
    setMethodUsed('Méthode 3 (Consommation)');
    setHasCalculated(true);
  };

  const exportPDF = () => {
    window.print();
  };

  const chartConfig: ChartConfig = {
    emissions: {
      label: 'Émissions CO₂e',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#004C8C] to-[#00A3E0] flex items-center justify-center shadow-lg">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#004C8C] to-[#00A3E0] bg-clip-text text-transparent">
                Calculateur Empreinte Carbone
              </h1>
              <p className="text-slate-600 font-medium">Agences Vyv Ambulance</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="bg-[#004C8C]/10 text-[#004C8C] border-[#004C8C]/30">
              <Info className="w-3 h-3 mr-1" />
              Outil interne d'évaluation GES
            </Badge>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <LeafIcon className="w-3 h-3 mr-1" />
              Référentiel ADEME
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Section */}
          <Card className="lg:col-span-7 border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
            {/* Period Selector */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-semibold text-slate-700">Période d'évaluation :</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">De</span>
                  <Select value={startMonth} onValueChange={setStartMonth}>
                    <SelectTrigger className="w-[140px] h-9 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                    className="w-20 h-9"
                    min={2020}
                    max={2050}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">à</span>
                  <Select value={endMonth} onValueChange={setEndMonth}>
                    <SelectTrigger className="w-[140px] h-9 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    className="w-20 h-9"
                    min={2020}
                    max={2050}
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="method1" className="w-full">
              <TabsList className="w-full grid grid-cols-2 bg-slate-100 p-1 rounded-none h-auto">
                <TabsTrigger 
                  value="method1" 
                  className="flex flex-col items-center py-3 px-4 gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Route className="w-4 h-4" />
                  <span className="font-bold text-xs">Méthode 1</span>
                  <span className="text-[10px] text-slate-500 font-normal">Par Kilométrage</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="method3" 
                  className="flex flex-col items-center py-3 px-4 gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Fuel className="w-4 h-4" />
                  <span className="font-bold text-xs">Méthode 3</span>
                  <span className="text-[10px] text-slate-500 font-normal">Par Consommation</span>
                </TabsTrigger>
              </TabsList>

              {/* Method 1: By Kilometers */}
              <TabsContent value="method1" className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-[#00A3E0] p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#00A3E0] mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#004C8C]">Facteurs d'émission (ADEME)</p>
                      <p className="text-sm text-slate-600 mt-1">
                        Estimations moyennes basées sur la distance parcourue pour votre flotte d'ambulances et VSL/Taxis.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* VSL Diesel */}
                  <div className="space-y-2">
                    <Label htmlFor="m1-vsl-d" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Car className="w-4 h-4 text-[#004C8C]" />
                      VSL/Taxi Thermique (Diesel/Ess)
                    </Label>
                    <div className="relative">
                      <Input
                        id="m1-vsl-d"
                        type="number"
                        value={m1VslD}
                        onChange={(e) => setM1VslD(e.target.value)}
                        placeholder="Ex: 4500"
                        className="pr-16 h-12 bg-white border-slate-200 focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                        km total
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#004C8C]"></span>
                      0.16 kg CO₂e / km
                    </p>
                  </div>

                  {/* VSL Electric */}
                  <div className="space-y-2">
                    <Label htmlFor="m1-vsl-e" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <ZapIcon className="w-4 h-4 text-[#78BE20]" />
                      VSL/Taxi 100% Électrique
                    </Label>
                    <div className="relative">
                      <Input
                        id="m1-vsl-e"
                        type="number"
                        value={m1VslE}
                        onChange={(e) => setM1VslE(e.target.value)}
                        placeholder="Ex: 5000"
                        className="pr-16 h-12 bg-white border-slate-200 focus:border-[#78BE20] focus:ring-2 focus:ring-[#78BE20]/20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                        km total
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#78BE20]"></span>
                      0.02 kg CO₂e / km
                    </p>
                  </div>

                  {/* VSL Hybrid */}
                  <div className="space-y-2">
                    <Label htmlFor="m1-vsl-h" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#00A3E0]" />
                      VSL/Taxi Hybride
                    </Label>
                    <div className="relative">
                      <Input
                        id="m1-vsl-h"
                        type="number"
                        value={m1VslH}
                        onChange={(e) => setM1VslH(e.target.value)}
                        placeholder="Ex: 2000"
                        className="pr-16 h-12 bg-white border-slate-200 focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                        km total
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#00A3E0]"></span>
                      0.10 kg CO₂e / km
                    </p>
                  </div>

                  {/* VSL Colza */}
                  <div className="space-y-2">
                    <Label htmlFor="m1-vsl-c" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <LeafIcon className="w-4 h-4 text-[#A3D977]" />
                      VSL/Taxi Colza (B100)
                    </Label>
                    <div className="relative">
                      <Input
                        id="m1-vsl-c"
                        type="number"
                        value={m1VslC}
                        onChange={(e) => setM1VslC(e.target.value)}
                        placeholder="Ex: 1500"
                        className="pr-16 h-12 bg-white border-slate-200 focus:border-[#A3D977] focus:ring-2 focus:ring-[#A3D977]/20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                        km total
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#A3D977]"></span>
                      0.06 kg CO₂e / km
                    </p>
                  </div>

                  {/* Ambulance Diesel */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="m1-ambu-d" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Car className="w-4 h-4 text-[#F59E0B]" />
                      Ambulance Thermique
                    </Label>
                    <div className="relative max-w-md">
                      <Input
                        id="m1-ambu-d"
                        type="number"
                        value={m1AmbuD}
                        onChange={(e) => setM1AmbuD(e.target.value)}
                        placeholder="Ex: 6000"
                        className="pr-16 h-12 bg-white border-slate-200 focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                        km total
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                      0.22 kg CO₂e / km
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={calculateM1} 
                  className="w-full h-12 bg-gradient-to-r from-[#004C8C] to-[#00A3E0] hover:opacity-90 text-white font-bold shadow-lg shadow-[#004C8C]/20 transition-all"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculer (Méthode 1)
                </Button>
              </TabsContent>

              {/* Method 3: By Consumption */}
              <TabsContent value="method3" className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-[#78BE20] p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#78BE20] mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#004C8C]">Méthode Recommandée</p>
                      <p className="text-sm text-slate-600 mt-1">
                        Saisissez les volumes globaux issus de vos cartes carburant et factures d'électricité de recharge pour une mesure réelle.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Diesel */}
                  <div className="space-y-2">
                    <Label htmlFor="m3-diesel" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-[#004C8C]" />
                      Consommation Diesel/Essence
                    </Label>
                    <div className="relative">
                      <Input
                        id="m3-diesel"
                        type="number"
                        value={m3Diesel}
                        onChange={(e) => setM3Diesel(e.target.value)}
                        placeholder="Ex: 850"
                        className="pr-20 h-12 bg-white border-slate-200 focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                        Litres total
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#004C8C]"></span>
                      Facteur: 3.16 kg CO₂e / L
                    </p>
                  </div>

                  {/* Colza */}
                  <div className="space-y-2">
                    <Label htmlFor="m3-colza" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <LeafIcon className="w-4 h-4 text-[#A3D977]" />
                      Consommation Colza (B100)
                    </Label>
                    <div className="relative">
                      <Input
                        id="m3-colza"
                        type="number"
                        value={m3Colza}
                        onChange={(e) => setM3Colza(e.target.value)}
                        placeholder="Ex: 200"
                        className="pr-20 h-12 bg-white border-slate-200 focus:border-[#A3D977] focus:ring-2 focus:ring-[#A3D977]/20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                        Litres total
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#A3D977]"></span>
                      Facteur: 1.05 kg CO₂e / L
                    </p>
                  </div>

                  {/* Electricity */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="m3-elec" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <ZapIcon className="w-4 h-4 text-[#78BE20]" />
                      Recharge Électrique Flotte
                    </Label>
                    <div className="relative max-w-md">
                      <Input
                        id="m3-elec"
                        type="number"
                        value={m3Elec}
                        onChange={(e) => setM3Elec(e.target.value)}
                        placeholder="Ex: 1200"
                        className="pr-20 h-12 bg-white border-slate-200 focus:border-[#78BE20] focus:ring-2 focus:ring-[#78BE20]/20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                        kWh total
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#78BE20]"></span>
                      Facteur: 0.06 kg CO₂e / kWh
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={calculateM3} 
                  className="w-full h-12 bg-gradient-to-r from-[#78BE20] to-emerald-500 hover:opacity-90 text-white font-bold shadow-lg shadow-[#78BE20]/20 transition-all"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculer (Méthode 3)
                </Button>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Results Section */}
          <Card className="lg:col-span-5 border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#78BE20]/10 to-emerald-50 p-4 border-b border-[#78BE20]/20">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-[#78BE20]" />
                Bilan d'Émissions
              </h2>
              {hasCalculated && (
                <p className="text-sm text-[#00A3E0] font-medium mt-1">{getPeriodText()}</p>
              )}
            </div>

            <CardContent className="p-6">
              {/* Main Result */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-2xl text-center border border-slate-100 shadow-inner mb-6">
                <div className="text-5xl font-extrabold text-[#004C8C] mb-2">
                  {formatNumber(totalKg / 1000, 2)}
                  <span className="text-2xl text-[#00A3E0] ml-2">tCO₂e</span>
                </div>
                <div className="text-sm text-slate-500">
                  Soit <span className="font-bold text-slate-700">{formatNumber(totalKg, 0)}</span> kg CO₂e
                </div>
                {methodUsed && (
                  <Badge className="mt-3 bg-slate-100 text-slate-600 hover:bg-slate-100">
                    {methodUsed}
                  </Badge>
                )}
              </div>

              {/* Chart */}
              <div className="h-[280px] relative">
                {!hasCalculated ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-center p-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <Leaf className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm">Remplissez un formulaire pour visualiser les données</p>
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="w-full h-full">
                    <PieChart>
                      <Pie
                        data={results}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                      >
                        {results.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-100">
                                <p className="font-semibold text-sm">{data.label}</p>
                                <p className="text-[#004C8C] font-bold">
                                  {formatNumber(data.value, 0)} kg CO₂e
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ChartContainer>
                )}
              </div>

              {/* Legend */}
              {hasCalculated && (
                <div className="mt-4 space-y-2">
                  {results.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-slate-600">{item.label}</span>
                      </div>
                      <span className="font-semibold text-slate-700">
                        {formatNumber(item.value, 0)} kg
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <Separator className="my-6" />

              {/* Export Button */}
              <Button 
                onClick={exportPDF} 
                disabled={!hasCalculated}
                className="w-full h-12 bg-gradient-to-r from-[#78BE20] to-emerald-500 hover:opacity-90 text-white font-bold shadow-lg shadow-[#78BE20]/20 transition-all disabled:opacity-50"
              >
                <Download className="w-5 h-5 mr-2" />
                Exporter en PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#004C8C] text-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-medium opacity-90">Outil d'estimation destiné aux responsables d'agence Vyv Ambulance</p>
          <p className="text-sm opacity-70 mt-1">Les facteurs d'émission sont basés sur les méthodologies de l'ADEME (Base Carbone)</p>
        </div>
      </footer>
    </div>
  );
}
