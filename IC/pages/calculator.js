/**
 * Heatpump ROI Calculator Page
 * Calculate ROI for hybrid and full electric heatpumps
 */

import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useIsMobile } from '../hooks/useIsMobile';
import PageHeader from '../components/PageHeader';

// Heatpump data: 10 options per type
const HEATPUMPS = {
  hybrid: [
    { name: 'Daikin Altherma 3', price: 12500, cop: 4.2 },
    { name: 'Viessmann Vitocal 200S', price: 13000, cop: 4.1 },
    { name: 'Mitsubishi Electric PUHZ', price: 14000, cop: 4.3 },
    { name: 'Bosch Compress 3000', price: 12000, cop: 4.0 },
    { name: 'Vaillant aroTHERM hybrid', price: 13500, cop: 4.2 },
    { name: 'Stiebel Eltron WPL 14E', price: 15000, cop: 4.4 },
    { name: 'IVT CompAct S+ Hybrid', price: 13200, cop: 4.1 },
    { name: 'Wolf CSZ 300-3 Hybrid', price: 12800, cop: 4.0 },
    { name: 'Ochsner OCHSNER 570 hybrid', price: 14500, cop: 4.3 },
    { name: 'Stiebel Eltron WPL 13E', price: 14200, cop: 4.2 },
  ],
  electric: [
    { name: 'Daikin Altherma 3', price: 11000, cop: 3.5 },
    { name: 'Viessmann Vitocal 200A', price: 10500, cop: 3.4 },
    { name: 'Mitsubishi Electric PUHZ-W', price: 12000, cop: 3.6 },
    { name: 'Bosch Compress 6000', price: 9800, cop: 3.3 },
    { name: 'Vaillant aroTHERM split', price: 11200, cop: 3.5 },
    { name: 'Stiebel Eltron WPL 7S', price: 10800, cop: 3.4 },
    { name: 'IVT CompAct S+', price: 10200, cop: 3.3 },
    { name: 'Wolf CSZ 300-3 Air', price: 11500, cop: 3.5 },
    { name: 'Ochsner OCHSNER 570', price: 12500, cop: 3.6 },
    { name: 'Stiebel Eltron WPL 6S', price: 10000, cop: 3.4 },
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
  const [mode, setMode] = useState('hybrid');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [electricity, setElectricity] = useState(String(DEFAULTS.electricity));
  const [gas, setGas] = useState(String(DEFAULTS.gas));
  const [connection, setConnection] = useState(String(DEFAULTS.connection));
  const [consumption, setConsumption] = useState(String(DEFAULTS.consumption));
  const [selectedHeatpump1, setSelectedHeatpump1] = useState(0);
  const [selectedHeatpump2, setSelectedHeatpump2] = useState(0);

  const elecNum = parseFloat(electricity) || 0;
  const gasNum = parseFloat(gas) || 0;
  const connNum = parseFloat(connection) || 0;
  const consNum = parseFloat(consumption) || 0;

  // Calculate annual costs
  const currentGasCost = (gasNum * consNum) + (connNum * 365);
  const gasCostPerKwh = gasNum * 0.0107; // 1 m³ gas ≈ 10.7 kWh equivalent

  // Get heatpump data
  const heatpumps = HEATPUMPS[mode];
  const hp1 = heatpumps[selectedHeatpump1];
  const hp2 = comparisonMode ? HEATPUMPS[mode === 'hybrid' ? 'electric' : 'hybrid'][selectedHeatpump2] : null;

  // Calculate ROI data for one heatpump
  const calculateROI = (heatpump, yearRange = 25) => {
    if (!heatpump) return [];
    
    const data = [];
    const hpCost = heatpump.price;
    const cop = heatpump.cop;
    
    // Annual heating demand in kWh
    const annualHeatingDemandKwh = consNum * 10.7;
    
    // For hybrid: some heating via gas, some via heatpump
    // For electric: all via heatpump (but lower COP typically)
    const heatingViaHeatpump = mode === 'hybrid' 
      ? annualHeatingDemandKwh * 0.7  // 70% via heatpump in hybrid mode
      : annualHeatingDemandKwh;       // 100% via heatpump in electric mode
    
    const annualElecCost = (heatingViaHeatpump / cop) * elecNum;
    const annualGasCostReduction = currentGasCost - (currentGasCost * (mode === 'hybrid' ? 0.3 : 0));
    const annualSavings = annualGasCostReduction - annualElecCost;
    
    for (let year = 0; year <= yearRange; year++) {
      const cumSavings = (annualSavings * year) - hpCost;
      data.push({
        year,
        savings: Math.max(0, cumSavings),
        cumulative: cumSavings,
      });
    }
    
    return data;
  };

  // Generate chart data
  const chartData = useMemo(() => {
    if (!hp1) return [];
    
    const roi1 = calculateROI(hp1);
    
    if (!comparisonMode) {
      return roi1;
    }
    
    // For comparison, merge both heatpumps
    const roi2 = calculateROI(hp2);
    const maxLen = Math.max(roi1.length, roi2.length);
    
    return Array.from({ length: maxLen }, (_, i) => ({
      year: i,
      hp1: roi1[i]?.cumulative || 0,
      hp2: roi2[i]?.cumulative || 0,
    }));
  }, [hp1, hp2, comparisonMode, mode, elecNum, gasNum, connNum, consNum]);

  // Calculate statistics for display
  const calculateStats = (heatpump) => {
    if (!heatpump) return null;
    
    const heatingViaHeatpump = mode === 'hybrid' 
      ? (consNum * 10.7 * 0.7)
      : (consNum * 10.7);
    
    const annualElecCost = (heatingViaHeatpump / heatpump.cop) * elecNum;
    const annualGasCostReduction = currentGasCost - (currentGasCost * (mode === 'hybrid' ? 0.3 : 0));
    const annualSavings = annualGasCostReduction - annualElecCost;
    
    // Find break-even year
    let breakEvenYear = 0;
    const roi = calculateROI(heatpump);
    for (let i = 0; i < roi.length; i++) {
      if (roi[i].cumulative >= 0) {
        breakEvenYear = roi[i].year;
        break;
      }
    }
    
    // Total 20-year savings
    const totalSavings20yr = Math.max(0, (annualSavings * 20) - heatpump.price);
    
    // ROI percentage
    const roiPercent = ((totalSavings20yr / heatpump.price) * 100);
    
    return {
      annualSavings: Math.max(0, annualSavings),
      breakEvenYear,
      totalSavings: totalSavings20yr,
      roi: roiPercent,
    };
  };

  const stats1 = calculateStats(hp1);
  const stats2 = comparisonMode ? calculateStats(hp2) : null;

  return (
    <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0 dark:bg-gray-900">
      <PageHeader icon={Zap} titleKey="calculator.title" />

      <div className="max-w-7xl mx-auto space-y-6 px-4 py-8 md:px-8">
        {/* Mode Toggle */}
        <div className="card p-6 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">{t('calculator.heatpumpType')}</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setMode('hybrid')}
              className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
                mode === 'hybrid'
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-soft'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('calculator.hybrid')}
            </button>
            <button
              onClick={() => setMode('electric')}
              className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
                mode === 'electric'
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-soft'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('calculator.electric')}
            </button>
          </div>
        </div>

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
            <select
              value={selectedHeatpump1}
              onChange={(e) => setSelectedHeatpump1(parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
            >
              {heatpumps.map((hp, idx) => (
                <option key={idx} value={idx}>
                  {hp.name} (COP: {hp.cop})
                </option>
              ))}
            </select>
          </div>

          {comparisonMode && (
            <div className="card p-6 dark:bg-gray-800">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                {t('calculator.heatpump2')}
              </label>
              <select
                value={selectedHeatpump2}
                onChange={(e) => setSelectedHeatpump2(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
              >
                {HEATPUMPS[mode === 'hybrid' ? 'electric' : 'hybrid'].map((hp, idx) => (
                  <option key={idx} value={idx}>
                    {hp.name} (COP: {hp.cop})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {stats1 && (
          <div className={`grid grid-cols-1 gap-4 ${comparisonMode ? 'sm:grid-cols-2' : 'sm:grid-cols-4'}`}>
            {comparisonMode ? (
              <>
                <div className="sm:col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="card p-4 dark:bg-gray-800">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('calculator.annualSavings')}</p>
                      <p className="text-2xl font-bold text-brand-primary">€{stats1.annualSavings.toFixed(0)}</p>
                    </div>
                    <div className="card p-4 dark:bg-gray-800">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('calculator.breakEven')}</p>
                      <p className="text-2xl font-bold text-brand-secondary">{stats1.breakEvenYear} yr</p>
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="card p-4 dark:bg-gray-800">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('calculator.roi20y')}</p>
                      <p className="text-2xl font-bold text-green-600">€{stats1.totalSavings.toFixed(0)}</p>
                    </div>
                    <div className="card p-4 dark:bg-gray-800">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('calculator.roiPercent')}</p>
                      <p className="text-2xl font-bold text-green-600">{stats1.roi.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
                {stats2 && (
                  <>
                    <div className="sm:col-span-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="card p-4 dark:bg-gray-800">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('calculator.annualSavings')}</p>
                          <p className="text-2xl font-bold text-brand-primary">€{stats2.annualSavings.toFixed(0)}</p>
                        </div>
                        <div className="card p-4 dark:bg-gray-800">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('calculator.breakEven')}</p>
                          <p className="text-2xl font-bold text-brand-secondary">{stats2.breakEvenYear} yr</p>
                        </div>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="card p-4 dark:bg-gray-800">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('calculator.roi20y')}</p>
                          <p className="text-2xl font-bold text-green-600">€{stats2.totalSavings.toFixed(0)}</p>
                        </div>
                        <div className="card p-4 dark:bg-gray-800">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('calculator.roiPercent')}</p>
                          <p className="text-2xl font-bold text-green-600">{stats2.roi.toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="card p-4 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('calculator.annualSavings')}</p>
                  <p className="text-2xl font-bold text-brand-primary">€{stats1.annualSavings.toFixed(0)}</p>
                </div>
                <div className="card p-4 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('calculator.breakEven')}</p>
                  <p className="text-2xl font-bold text-brand-secondary">{stats1.breakEvenYear} yr</p>
                </div>
                <div className="card p-4 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('calculator.roi20y')}</p>
                  <p className="text-2xl font-bold text-green-600">€{stats1.totalSavings.toFixed(0)}</p>
                </div>
                <div className="card p-4 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('calculator.roiPercent')}</p>
                  <p className="text-2xl font-bold text-green-600">{stats1.roi.toFixed(0)}%</p>
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
                  label={{ value: t('calculator.savings'), angle: -90, position: 'insideLeft' }}
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
                {comparisonMode ? (
                  <>
                    <Area
                      type="monotone"
                      dataKey="hp1"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorSavings1)"
                      name={hp1?.name}
                    />
                    <Area
                      type="monotone"
                      dataKey="hp2"
                      stroke="#8B5CF6"
                      fillOpacity={1}
                      fill="url(#colorSavings2)"
                      name={hp2?.name}
                    />
                  </>
                ) : (
                  <Area
                    type="monotone"
                    dataKey="savings"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorSavings1)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
