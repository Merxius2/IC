/**
 * Heatpump ROI Calculator Page
 * Calculate ROI for hybrid and full electric heatpumps
 */

import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Scatter, ScatterChart } from 'recharts';
import { Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useIsMobile } from '../hooks/useIsMobile';
import PageHeader from '../components/PageHeader';

// Heatpump data: 10 options per type with real brands and models
const HEATPUMPS = {
  hybrid: [
    { brand: 'Quatt', model: 'Hybrid 4 kW', price: 3600, subsidy: 2400, cop: 4.8 },
    { brand: 'Atlantic', model: 'Aurea 5 kW', price: 4400, subsidy: 2550, cop: 4.5 },
    { brand: 'Remeha', model: 'Elga Ace 4 kW', price: 4500, subsidy: 2400, cop: 4.5 },
    { brand: 'Nefit Bosch', model: 'Compress 3400i AWS 4 kW', price: 4700, subsidy: 2400, cop: 4.5 },
    { brand: 'Intergas', model: 'Xtend 5 kW', price: 4800, subsidy: 2400, cop: 4.7 },
    { brand: 'Itho Daalderop', model: 'HP-S 54 5 kW', price: 4900, subsidy: 2550, cop: 4.6 },
    { brand: 'Daikin', model: 'Altherma 3 H 4 kW', price: 5000, subsidy: 2400, cop: 4.6 },
    { brand: 'Panasonic', model: 'Aquarea 5 kW', price: 5000, subsidy: 2550, cop: 4.9 },
    { brand: 'Mitsubishi Electric', model: 'Ecodan 4 kW', price: 5100, subsidy: 2400, cop: 4.7 },
    { brand: 'Vaillant', model: 'aroTHERM plus 5 kW', price: 5200, subsidy: 2550, cop: 4.8 },
  ],
  electric: [
    { brand: 'Remeha', model: 'Mercuria 8 kW', price: 9500, subsidy: 3150, cop: 4.6 },
    { brand: 'Itho Daalderop', model: 'Amber 6.5 kW', price: 9800, subsidy: 2925, cop: 5.0 },
    { brand: 'Panasonic', model: 'Aquarea K-serie 7 kW', price: 10200, subsidy: 3000, cop: 5.1 },
    { brand: 'Vaillant', model: 'aroTHERM plus 7 kW', price: 10500, subsidy: 3000, cop: 4.9 },
    { brand: 'Mitsubishi Electric', model: 'Ecodan 8 kW', price: 10800, subsidy: 3150, cop: 4.7 },
    { brand: 'Daikin', model: 'Altherma 3 R 8 kW', price: 11000, subsidy: 3150, cop: 4.8 },
    { brand: 'Nefit Bosch', model: 'Compress 7400i 7 kW', price: 11500, subsidy: 3000, cop: 4.9 },
    { brand: 'Alpha Innotec', model: 'Alira 7 kW', price: 12000, subsidy: 3000, cop: 4.8 },
    { brand: 'NIBE', model: 'S2125 8 kW', price: 12500, subsidy: 3150, cop: 5.2 },
    { brand: 'Viessmann', model: 'Vitocal 250-A 8 kW', price: 13000, subsidy: 3150, cop: 5.1 },
  ],
};

// Default values
const DEFAULTS = {
  electricity: 0.25,
  gas: 1.30,
  connection: 1.00,
  consumption: 1000,
};

export default function CalculatorPage() {
  const { t } = useLanguage();
  const { isDarkMode } = useDarkMode();
  const isMobile = useIsMobile();

  // State
  const [comparisonMode, setComparisonMode] = useState(false);
  const [electricity, setElectricity] = useState(String(DEFAULTS.electricity));
  const [gas, setGas] = useState(String(DEFAULTS.gas));
  const [connection, setConnection] = useState(String(DEFAULTS.connection));
  const [consumption, setConsumption] = useState(String(DEFAULTS.consumption));
  const [selectedHeatpump1Type, setSelectedHeatpump1Type] = useState('hybrid');
  const [selectedHeatpump1Index, setSelectedHeatpump1Index] = useState(0);
  const [selectedHeatpump2Type, setSelectedHeatpump2Type] = useState('electric');
  const [selectedHeatpump2Index, setSelectedHeatpump2Index] = useState(0);

  const elecNum = parseFloat(electricity) || 0;
  const gasNum = parseFloat(gas) || 0;
  const connNum = parseFloat(connection) || 0;
  const consNum = parseFloat(consumption) || 0;

  // Calculate annual costs
  const currentGasCost = (gasNum * consNum) + (connNum * 365);
  const gasCostPerKwh = gasNum * 0.0107; // 1 m³ gas ≈ 10.7 kWh equivalent

  // Get heatpump data - always use selected types
  const hp1Type = selectedHeatpump1Type;
  const hp2Type = selectedHeatpump2Type;
  
  const hp1 = HEATPUMPS[hp1Type][selectedHeatpump1Index];
  const hp2 = comparisonMode ? HEATPUMPS[hp2Type][selectedHeatpump2Index] : null;

  // Calculate ROI data for one heatpump
  const calculateROI = (heatpump, hpType = 'hybrid', yearRange = 25) => {
    if (!heatpump) return [];
    
    const data = [];
    const hpCost = heatpump.price - heatpump.subsidy; // Use net price after subsidy
    const cop = heatpump.cop;
    
    // Annual heating demand in kWh
    const annualHeatingDemandKwh = consNum * 10.7;
    
    // For hybrid: some heating via gas, some via heatpump
    // For electric: all via heatpump (but lower COP typically)
    const heatingViaHeatpump = hpType === 'hybrid' 
      ? annualHeatingDemandKwh * 0.7  // 70% via heatpump in hybrid mode
      : annualHeatingDemandKwh;       // 100% via heatpump in electric mode
    
    const annualElecCost = (heatingViaHeatpump / cop) * elecNum;
    const annualGasCostReduction = hpType === 'hybrid' 
      ? currentGasCost * 0.3  // 30% gas reduction with hybrid
      : currentGasCost;       // All gas eliminated with electric
    const annualSavings = annualGasCostReduction - annualElecCost;
    
    for (let year = 0; year <= yearRange; year++) {
      const cumSavings = (annualSavings * year) - hpCost;
      data.push({
        year,
        savings: Math.max(0, cumSavings),
        cumulative: cumSavings,
        investmentRemaining: Math.max(0, hpCost - (annualSavings * year)),
      });
    }
    
    return data;
  };

  // Generate chart data
  const chartData = useMemo(() => {
    if (!hp1) return [];
    
    const roi1 = calculateROI(hp1, hp1Type);
    
    if (!comparisonMode) {
      // For single mode, show cumulative ROI (includes investment cost)
      return roi1.map(item => ({
        year: item.year,
        roi: item.cumulative,
      }));
    }
    
    // For comparison, merge both heatpumps
    const roi2 = calculateROI(hp2, hp2Type);
    const maxLen = Math.max(roi1.length, roi2.length);
    
    return Array.from({ length: maxLen }, (_, i) => ({
      year: i,
      hp1: roi1[i]?.cumulative || 0,
      hp2: roi2[i]?.cumulative || 0,
    }));
  }, [hp1, hp2, comparisonMode, hp1Type, hp2Type, elecNum, gasNum, connNum, consNum]);

  // Calculate statistics for display
  const calculateStats = (heatpump, hpType = 'hybrid') => {
    if (!heatpump) return null;
    
    const heatingViaHeatpump = hpType === 'hybrid' 
      ? (consNum * 10.7 * 0.7)
      : (consNum * 10.7);
    
    const annualElecCost = (heatingViaHeatpump / heatpump.cop) * elecNum;
    const gasSavings = hpType === 'hybrid' 
      ? currentGasCost * 0.3
      : currentGasCost;
    const gasSavingsPercent = (gasSavings / currentGasCost) * 100;
    const annualSavings = gasSavings - annualElecCost;
    
    // Find break-even year
    let breakEvenYear = 0;
    const roi = calculateROI(heatpump, hpType);
    for (let i = 0; i < roi.length; i++) {
      if (roi[i].cumulative >= 0) {
        breakEvenYear = roi[i].year;
        break;
      }
    }
    
    // Total 20-year savings (based on net price after subsidy)
    const netPrice = heatpump.price - heatpump.subsidy;
    const totalSavings20yr = Math.max(0, (annualSavings * 20) - netPrice);
    
    // ROI percentage
    const roiPercent = ((totalSavings20yr / netPrice) * 100);
    
    return {
      cop: heatpump.cop,
      price: heatpump.price,
      subsidy: heatpump.subsidy,
      netPrice: netPrice,
      gasSavingsPercent: Math.round(gasSavingsPercent),
      gasSavings: Math.round(gasSavings),
      electricityCost: Math.round(annualElecCost),
      annualSavings: Math.max(0, Math.round(annualSavings)),
      breakEvenYear,
      totalSavings: totalSavings20yr,
      roi: roiPercent,
    };
  };

  const stats1 = calculateStats(hp1, hp1Type);
  const stats2 = comparisonMode ? calculateStats(hp2, hp2Type) : null;

  // Create break-even points for chart highlighting
  const breakEvenPoints = useMemo(() => {
    const points = [];
    if (stats1) {
      points.push({ year: stats1.breakEvenYear, value: 0, type: 'hp1' });
    }
    if (stats2 && comparisonMode) {
      points.push({ year: stats2.breakEvenYear, value: 0, type: 'hp2' });
    }
    return points;
  }, [stats1, stats2, comparisonMode]);

  return (
    <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0 dark:bg-gray-900">
      <PageHeader icon={Zap} titleKey="calculator.title" />

      <div className="max-w-7xl mx-auto space-y-6 px-4 py-8 md:px-8">
        {/* Input Parameters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: t('calculator.electricity'), value: electricity, setValue: setElectricity, placeholder: '0.25' },
            { label: t('calculator.gas'), value: gas, setValue: setGas, placeholder: '1.30' },
            { label: t('calculator.connection'), value: connection, setValue: setConnection, placeholder: '1.00' },
            { label: t('calculator.consumption'), value: consumption, setValue: setConsumption, placeholder: '1000' },
          ].map((field, idx) => (
            <div key={idx} className="card p-4 dark:bg-gray-800">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                {field.label}
              </label>
              <input
                type="number"
                value={field.value}
                onChange={(e) => field.setValue(e.target.value)}
                placeholder={field.placeholder}
                className="w-full border-0 bg-transparent text-lg font-semibold text-gray-900 dark:text-gray-100 focus:ring-0"
              />
            </div>
          ))}
        </div>

        {/* Comparison Toggle */}
        <div className="card p-6 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">{t('calculator.view')}</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setComparisonMode(false)}
              className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
                !comparisonMode
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-soft'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('calculator.single')}
            </button>
            <button
              onClick={() => setComparisonMode(true)}
              className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
                comparisonMode
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-soft'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('calculator.comparison')}
            </button>
          </div>
        </div>

        {/* Heatpump Selection */}
        <div className={`grid grid-cols-1 gap-4 ${comparisonMode ? 'sm:grid-cols-2' : 'sm:grid-cols-2'}`}>
          <div className="card p-6 dark:bg-gray-800">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              {comparisonMode ? t('calculator.heatpump1') : t('calculator.heatpump')}
            </label>
            <div className="mb-3">
              <select
                value={selectedHeatpump1Type}
                onChange={(e) => setSelectedHeatpump1Type(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-gray-100 text-sm mb-2 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
              >
                <option value="hybrid">{t('calculator.hybrid')}</option>
                <option value="electric">{t('calculator.electric')}</option>
              </select>
            </div>
            <select
              value={selectedHeatpump1Index}
              onChange={(e) => setSelectedHeatpump1Index(parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
            >
              {HEATPUMPS[selectedHeatpump1Type].map((hp, idx) => (
                <option key={idx} value={idx}>
                  {hp.brand} {hp.model} (COP: {hp.cop})
                </option>
              ))}
            </select>
            {stats1 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Price:</span>
                  <span className="font-semibold">€{stats1.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subsidy:</span>
                  <span className="font-semibold text-green-600">-€{stats1.subsidy}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1 mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Net Price:</span>
                  <span className="font-semibold">€{stats1.netPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">COP:</span>
                  <span className="font-semibold">{stats1.cop}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Gas savings:</span>
                  <span className="font-semibold">{stats1.gasSavingsPercent}%</span>
                </div>
              </div>
            )}
          </div>

          {comparisonMode && (
            <div className="card p-6 dark:bg-gray-800">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                {t('calculator.heatpump2')}
              </label>
              <div className="mb-3">
                <select
                  value={selectedHeatpump2Type}
                  onChange={(e) => setSelectedHeatpump2Type(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-gray-100 text-sm mb-2 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                >
                  <option value="hybrid">{t('calculator.hybrid')}</option>
                  <option value="electric">{t('calculator.electric')}</option>
                </select>
              </div>
              <select
                value={selectedHeatpump2Index}
                onChange={(e) => setSelectedHeatpump2Index(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
              >
                {HEATPUMPS[selectedHeatpump2Type].map((hp, idx) => (
                  <option key={idx} value={idx}>
                    {hp.brand} {hp.model} (COP: {hp.cop})
                  </option>
                ))}
              </select>
              {stats2 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                    <span className="font-semibold">€{stats2.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subsidy:</span>
                    <span className="font-semibold text-green-600">-€{stats2.subsidy}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1 mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Net Price:</span>
                    <span className="font-semibold">€{stats2.netPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">COP:</span>
                    <span className="font-semibold">{stats2.cop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Gas savings:</span>
                    <span className="font-semibold">{stats2.gasSavingsPercent}%</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {stats1 && (
          <div className="space-y-6">
            {comparisonMode ? (
              <>
                {/* Comparison View - Side by Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="card p-6 dark:bg-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">{hp1?.brand} {hp1?.model}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Gas Savings:</span>
                        <span className="font-bold">€{stats1.gasSavings}/yr ({stats1.gasSavingsPercent}%)</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Electric Cost:</span>
                        <span className="font-bold">€{stats1.electricityCost}/yr</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Annual Savings:</span>
                        <span className="font-bold text-brand-primary">€{stats1.annualSavings}/yr</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Break-even:</span>
                        <span className="font-bold">{stats1.breakEvenYear} years</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">20-year Savings:</span>
                        <span className="font-bold text-green-600">€{Math.round(stats1.totalSavings)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ROI:</span>
                        <span className="font-bold text-green-600">{stats1.roi.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  {stats2 && (
                    <div className="card p-6 dark:bg-gray-800">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">{hp2?.brand} {hp2?.model}</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Gas Savings:</span>
                          <span className="font-bold">€{stats2.gasSavings}/yr ({stats2.gasSavingsPercent}%)</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Electric Cost:</span>
                          <span className="font-bold">€{stats2.electricityCost}/yr</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Annual Savings:</span>
                          <span className="font-bold text-brand-primary">€{stats2.annualSavings}/yr</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Break-even:</span>
                          <span className="font-bold">{stats2.breakEvenYear} years</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">20-year Savings:</span>
                          <span className="font-bold text-green-600">€{Math.round(stats2.totalSavings)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">ROI:</span>
                          <span className="font-bold text-green-600">{stats2.roi.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Single View */}
                <div className="card p-6 dark:bg-gray-800">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg">{hp1?.brand} {hp1?.model}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm">Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Gas Savings:</span>
                          <span className="font-bold">€{stats1.gasSavings}/yr ({stats1.gasSavingsPercent}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Electric Cost:</span>
                          <span className="font-bold">€{stats1.electricityCost}/yr</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm">Returns</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Annual Savings:</span>
                          <span className="font-bold text-brand-primary">€{stats1.annualSavings}/yr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Break-even:</span>
                          <span className="font-bold">{stats1.breakEvenYear} years</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">20-year Savings</p>
                      <p className="text-2xl font-bold text-green-600">€{Math.round(stats1.totalSavings)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">ROI %</p>
                      <p className="text-2xl font-bold text-green-600">{stats1.roi.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="card p-8 dark:bg-gray-800">
            <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculator.roiProjection')}</h2>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSavings1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSavings2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"} 
                />
                <XAxis
                  dataKey="year"
                  stroke={isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"}
                  label={{ value: t('calculator.years'), position: 'insideBottomRight', offset: -5 }}
                />
                <YAxis
                  stroke={isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"}
                  label={{ value: 'Net ROI (€)', angle: -90, position: 'insideLeft' }}
                />
                <ReferenceLine 
                  y={0} 
                  stroke={isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"} 
                  strokeDasharray="5,5"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#fff' : '#000',
                  }}
                  formatter={(value) => `€${value.toFixed(0)}`}
                />
                {/* Area curves */}
                {comparisonMode ? (
                  <>
                    <Area
                      type="monotone"
                      dataKey="hp1"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorSavings1)"
                      name={`${hp1?.brand} ${hp1?.model}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="hp2"
                      stroke="#8B5CF6"
                      fillOpacity={1}
                      fill="url(#colorSavings2)"
                      name={`${hp2?.brand} ${hp2?.model}`}
                    />
                  </>
                ) : (
                  <Area
                    type="monotone"
                    dataKey="roi"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorSavings1)"
                  />
                )}
                {/* Break-even points as circles */}
                {breakEvenPoints.map((point, idx) => (
                  <Scatter
                    key={idx}
                    data={[point]}
                    dataKey="value"
                    fill="#FBBF24"
                    shape="circle"
                    isAnimationActive={false}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
