import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChartContainer, ChartConfig, ChartTooltip } from '@/components/ui/chart';
import { Cell, PieChart, Pie } from 'recharts';
import { Download, Calculator, Info, Car, Fuel, Zap, Leaf, TrendingDown } from 'lucide-react';

// Facteurs d'émission ADEME Base Carbone
const EMISSION_FACTORS = {
  km: {
    vslDiesel: 0.16,
    vslElectric: 0.02,
    vslHybride: 0.10,
    vslColza: 0.06,
    ambuDiesel: 0.22,
  },
  fuel: {
    diesel: 3.16,
    colza: 1.05,
    electric: 0.06,
  }
};

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

interface EmissionResult {
  label: string;
  value: number;
  color: string;
}

export default function CarbonCalculator() {
  const currentYear = new Date().getFullYear();
  
  const [activeMethod, setActiveMethod] = useState<'km' | 'fuel'>('km');
  const [startMonth, setStartMonth] = useState(MONTHS[0]);
  const [startYear, setStartYear] = useState(currentYear.toString());
  const [endMonth, setEndMonth] = useState(MONTHS[new Date().getMonth()]);
  const [endYear, setEndYear] = useState(currentYear.toString());
  
  const [kmVslDiesel, setKmVslDiesel] = useState('');
  const [kmVslElectric, setKmVslElectric] = useState('');
  const [kmVslHybride, setKmVslHybride] = useState('');
  const [kmVslColza, setKmVslColza] = useState('');
  const [kmAmbuDiesel, setKmAmbuDiesel] = useState('');
  
  const [fuelDiesel, setFuelDiesel] = useState('');
  const [fuelColza, setFuelColza] = useState('');
  const [fuelElectric, setFuelElectric] = useState('');

  const [results, setResults] = useState<EmissionResult[]>([]);
  const [totalKg, setTotalKg] = useState(0);
  const [hasCalculated, setHasCalculated] = useState(false);

  const calculateByKm = () => {
    const data: EmissionResult[] = [
      { label: 'VSL/Taxi Diesel', value: (parseFloat(kmVslDiesel) || 0) * EMISSION_FACTORS.km.vslDiesel, color: '#004C8C' },
      { label: 'VSL/Taxi Électrique', value: (parseFloat(kmVslElectric) || 0) * EMISSION_FACTORS.km.vslElectric, color: '#78BE20' },
      { label: 'VSL/Taxi Hybride', value: (parseFloat(kmVslHybride) || 0) * EMISSION_FACTORS.km.vslHybride, color: '#00A3E0' },
      { label: 'VSL/Taxi B100', value: (parseFloat(kmVslColza) || 0) * EMISSION_FACTORS.km.vslColza, color: '#A3D977' },
      { label: 'Ambulance Diesel', value: (parseFloat(kmAmbuDiesel) || 0) * EMISSION_FACTORS.km.ambuDiesel, color: '#F59E0B' },
    ].filter(d => d.value > 0);

    setResults(data);
    setTotalKg(data.reduce((acc, curr) => acc + curr.value, 0));
    setHasCalculated(true);
  };

  const calculateByFuel = () => {
    const data: EmissionResult[] = [
      { label: 'Diesel', value: (parseFloat(fuelDiesel) || 0) * EMISSION_FACTORS.fuel.diesel, color: '#004C8C' },
      { label: 'Colza B100', value: (parseFloat(fuelColza) || 0) * EMISSION_FACTORS.fuel.colza, color: '#A3D977' },
      { label: 'Électricité', value: (parseFloat(fuelElectric) || 0) * EMISSION_FACTORS.fuel.electric, color: '#78BE20' },
    ].filter(d => d.value > 0);

    setResults(data);
    setTotalKg(data.reduce((acc, curr) => acc + curr.value, 0));
    setHasCalculated(true);
  };

  const chartConfig: ChartConfig = { emissions: { label: 'Émissions CO₂e' } };

  const periode = startMonth === endMonth && startYear === endYear 
    ? `${startMonth} ${startYear}`
    : `De ${startMonth} ${startYear} à ${endMonth} ${endYear}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
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
              Outil interne GES
            </Badge>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <Leaf className="w-3 h-3 mr-1" />
              Référentiel ADEME
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-7 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-semibold text-slate-700">Période :</span>
                <div className="flex items-center gap-2">
                  <Select value={startMonth} onValueChange={setStartMonth}>
                    <SelectTrigger className="w-[140px] h-9 bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="number" value={startYear} onChange={(e) => setStartYear(e.target.value)} className="w-20 h-9" />
                </div>
                <span className="text-sm text-slate-500">à</span>
                <div className="flex items-center gap-2">
                  <Select value={endMonth} onValueChange={setEndMonth}>
                    <SelectTrigger className="w-[140px] h-9 bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="number" value={endYear} onChange={(e) => setEndYear(e.target.value)} className="w-20 h-9" />
                </div>
              </div>
            </div>

            <Tabs defaultValue="km" onValueChange={(v) => setActiveMethod(v as 'km' | 'fuel')} className="w-full">
              <TabsList className="w-full grid grid-cols-2 bg-slate-100 p-1 h-auto">
                <TabsTrigger value="km" className="flex flex-col items-center py-3 gap-1 data-[state=active]:bg-white">
                  <Car className="w-4 h-4" />
                  <span className="font-bold text-xs">Kilométrage</span>
                </TabsTrigger>
                <TabsTrigger value="fuel" className="flex flex-col items-center py-3 gap-1 data-[state=active]:bg-white">
                  <Fuel className="w-4 h-4" />
                  <span className="font-bold text-xs">Consommation</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="km" className="p-6 space-y-6">
                <div className="bg-blue-50 border-l-4 border-[#00A3E0] p-4 rounded-r-lg">
                  <p className="font-semibold text-[#004C8C]">Facteurs d'émission (ADEME)</p>
                  <p className="text-sm text-slate-600 mt-1">Estimation basée sur la distance parcourue</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputGroup label="VSL/Taxi Diesel" icon={<Car className="w-4 h-4 text-[#004C8C]" />} value={kmVslDiesel} onChange={setKmVslDiesel} unit="km" factor={EMISSION_FACTORS.km.vslDiesel} />
                  <InputGroup label="VSL/Taxi Électrique" icon={<Zap className="w-4 h-4 text-[#78BE20]" />} value={kmVslElectric} onChange={setKmVslElectric} unit="km" factor={EMISSION_FACTORS.km.vslElectric} />
                  <InputGroup label="VSL/Taxi Hybride" icon={<Zap className="w-4 h-4 text-[#00A3E0]" />} value={kmVslHybride} onChange={setKmVslHybride} unit="km" factor={EMISSION_FACTORS.km.vslHybride} />
                  <InputGroup label="VSL/Taxi B100" icon={<Leaf className="w-4 h-4 text-[#A3D977]" />} value={kmVslColza} onChange={setKmVslColza} unit="km" factor={EMISSION_FACTORS.km.vslColza} />
                  <div className="md:col-span-2">
                    <InputGroup label="Ambulance Diesel" icon={<Car className="w-4 h-4 text-[#F59E0B]" />} value={kmAmbuDiesel} onChange={setKmAmbuDiesel} unit="km" factor={EMISSION_FACTORS.km.ambuDiesel} />
                  </div>
                </div>

                <Button onClick={calculateByKm} className="w-full h-12 bg-gradient-to-r from-[#004C8C] to-[#00A3E0] hover:opacity-90 text-white font-bold">
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculer
                </Button>
              </TabsContent>

              <TabsContent value="fuel" className="p-6 space-y-6">
                <div className="bg-emerald-50 border-l-4 border-[#78BE20] p-4 rounded-r-lg">
                  <p className="font-semibold text-[#004C8C]">Méthode recommandée</p>
                  <p className="text-sm text-slate-600 mt-1">Basée sur les volumes réels des cartes carburant et factures électriques</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputGroup label="Diesel/Essence" icon={<Fuel className="w-4 h-4 text-[#004C8C]" />} value={fuelDiesel} onChange={setFuelDiesel} unit="L" factor={EMISSION_FACTORS.fuel.diesel} />
                  <InputGroup label="Colza B100" icon={<Leaf className="w-4 h-4 text-[#A3D977]" />} value={fuelColza} onChange={setFuelColza} unit="L" factor={EMISSION_FACTORS.fuel.colza} />
                  <div className="md:col-span-2">
                    <InputGroup label="Recharge Électrique" icon={<Zap className="w-4 h-4 text-[#78BE20]" />} value={fuelElectric} onChange={setFuelElectric} unit="kWh" factor={EMISSION_FACTORS.fuel.electric} />
                  </div>
                </div>

                <Button onClick={calculateByFuel} className="w-full h-12 bg-gradient-to-r from-[#78BE20] to-emerald-500 hover:opacity-90 text-white font-bold">
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculer
                </Button>
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="lg:col-span-5 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-[#78BE20]/10 to-emerald-50 p-4 border-b border-[#78BE20]/20">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-[#78BE20]" />
                Bilan d'Émissions
              </h2>
              {hasCalculated && <p className="text-sm text-[#00A3E0] font-medium mt-1">{periode}</p>}
            </div>

            <CardContent className="p-6">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-2xl text-center border border-slate-100 shadow-inner mb-6">
                <div className="text-5xl font-extrabold text-[#004C8C] mb-2">
                  {(totalKg / 1000).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-2xl text-[#00A3E0] ml-2">tCO₂e</span>
                </div>
                <div className="text-sm text-slate-500">
                  Soit <span className="font-bold text-slate-700">{totalKg.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</span> kg CO₂e
                </div>
                <Badge className="mt-3 bg-slate-100 text-slate-600">
                  Méthode {activeMethod === 'km' ? '1 (Kilométrage)' : '3 (Consommation)'}
                </Badge>
              </div>

              <div className="h-[280px]">
                {hasCalculated && results.length > 0 ? (
                  <ChartContainer config={chartConfig} className="w-full h-full">
                    <PieChart>
                      <Pie data={results} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
                        {results.map((_, i) => <Cell key={i} fill={results[i].color} />)}
                      </Pie>
                      <ChartTooltip content={({ active, payload }) => active && payload?.[0] ? (
                        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-100">
                          <p className="font-semibold text-sm">{payload[0].name}</p>
                          <p className="text-[#004C8C] font-bold">{(payload[0].value as number).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} kg CO₂e</p>
                        </div>
                      ) : null} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                    <Leaf className="w-16 h-16 text-slate-200 mb-4" />
                    <p className="text-sm">Saisissez vos données pour voir les résultats</p>
                  </div>
                )}
              </div>

              {hasCalculated && results.length > 0 && (
                <div className="mt-4 space-y-2">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                        <span className="text-slate-600">{r.label}</span>
                      </div>
                      <span className="font-semibold text-slate-700">{r.value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} kg</span>
                    </div>
                  ))}
                </div>
              )}

              <Separator className="my-6" />

              <Button onClick={() => window.print()} disabled={!hasCalculated} className="w-full h-12 bg-gradient-to-r from-[#78BE20] to-emerald-500 hover:opacity-90 text-white font-bold disabled:opacity-50">
                <Download className="w-5 h-5 mr-2" />
                Exporter PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-[#004C8C] text-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-medium opacity-90">Outil d'estimation pour responsables d'agence Vyv Ambulance</p>
          <p className="text-sm opacity-70 mt-1">Facteurs basés sur l'ADEME (Base Carbone)</p>
        </div>
      </footer>
    </div>
  );
}

function InputGroup({ label, icon, value, onChange, unit, factor }: { label: string; icon: React.ReactNode; value: string; onChange: (v: string) => void; unit: string; factor: number }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">{icon}{label}</Label>
      <div className="relative">
        <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" className="pr-16 h-12 bg-white border-slate-200 focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">{unit}</span>
      </div>
      <p className="text-xs text-slate-500 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-[#004C8C]"></span>
        {factor} kg CO₂e/{unit}
      </p>
    </div>
  );
}