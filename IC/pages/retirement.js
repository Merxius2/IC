/**
 * Retirement Projection Page
 * Plan retirement with compound growth projections
 */

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useCookieStorage } from '../hooks/useCookieStorage';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { generateForwardProjection, generateBackwardProjection } from '../lib/retirementCalculator';
import PageHeader from '../components/PageHeader';
import {
  DEFAULT_CURRENT_AGE,
  DEFAULT_RETIREMENT_AGE,
  DEFAULT_MONTHLY_INVESTMENT,
  DEFAULT_ANNUAL_INVESTMENT_RETURN,
  DEFAULT_RETIREMENT_GOAL,
} from '../lib/appConstants';

export default function RetirementProjection() {
  const { getSymbol } = useCurrency();
  const { t } = useLanguage();
  const { isDarkMode } = useDarkMode();
  const isMobile = useIsMobile();

  // Cookie storage with automatic loading and debounced saving
  const { data: retirementData, isLoading, updateData } = useCookieStorage('AUDIT_RETIREMENT_DATA', {
    calculationType: 'forward',
    currentAge: String(DEFAULT_CURRENT_AGE),
    retirementAge: String(DEFAULT_RETIREMENT_AGE),
    monthlyInvestment: String(DEFAULT_MONTHLY_INVESTMENT),
    annualReturn: String(DEFAULT_ANNUAL_INVESTMENT_RETURN),
    goalBalance: String(DEFAULT_RETIREMENT_GOAL),
  });

  // Destructure for easier access
  const { calculationType, currentAge, retirementAge, monthlyInvestment, annualReturn, goalBalance } = retirementData;

  const isForward = calculationType === 'forward';
  
  // Memoize projection calculation - expensive operation
  const projectionData = useMemo(() => {
    return isForward 
      ? generateForwardProjection(currentAge, retirementAge, monthlyInvestment, annualReturn) 
      : generateBackwardProjection(currentAge, retirementAge, goalBalance, annualReturn);
  }, [isForward, currentAge, retirementAge, monthlyInvestment, annualReturn, goalBalance]);
  
  const finalBalance = projectionData[projectionData.length - 1]?.balance || 0;
  
  const currentAgeNum = parseInt(currentAge) || 0;
  const retirementAgeNum = parseInt(retirementAge) || 65;
  const yearsToRetirement = Math.max(0, retirementAgeNum - currentAgeNum);
  const monthlyForDisplay = isForward ? parseFloat(monthlyInvestment) || 0 : Math.round((parseFloat(goalBalance) || 0) / Math.max(1, (yearsToRetirement * 12)) * 100) / 100;
  // Better calculation for backward
  const backwardMonthly = isForward ? 0 : (() => {
    const months = yearsToRetirement * 12;
    const rate = (parseFloat(annualReturn) || 7) / 100 / 12;
    const goal = parseFloat(goalBalance) || 0;
    if (rate === 0) return months > 0 ? Math.floor(goal / months) : 0;
    const factor = (Math.pow(1 + rate, months) - 1) / rate;
    return factor > 0 ? Math.floor(goal / factor) : 0;
  })();

  if (isLoading) {
    return <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0" />;
  }

  return (
    <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0">
      <PageHeader icon={TrendingUp} titleKey="retirement.title" />

      <div className="max-w-7xl mx-auto space-y-6 px-4 py-8 md:px-8">
        {/* Calculation Type Selector */}
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900">{t('retirement.calculationMode')}</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setCalculationType('forward')}
              className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
                isForward
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-soft'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('retirement.forward')}
            </button>
            <button
              onClick={() => setCalculationType('backward')}
              className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
                !isForward
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-soft'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('retirement.backward')}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(isForward ? [
              { label: t('retirement.currentAge'), value: currentAge, field: 'currentAge', placeholder: '30' },
              { label: t('retirement.retirementAge'), value: retirementAge, field: 'retirementAge', placeholder: '65' },
              { label: t('retirement.monthlyInvestment'), value: monthlyInvestment, field: 'monthlyInvestment', placeholder: '1000' },
              { label: t('retirement.annualReturn'), value: annualReturn, field: 'annualReturn', placeholder: '7' },
            ] : [
              { label: t('retirement.currentAge'), value: currentAge, field: 'currentAge', placeholder: '30' },
              { label: t('retirement.retirementAge'), value: retirementAge, field: 'retirementAge', placeholder: '65' },
              { label: t('retirement.goalBalance'), value: goalBalance, field: 'goalBalance', placeholder: '500000' },
              { label: t('retirement.annualReturn'), value: annualReturn, field: 'annualReturn', placeholder: '7' },
            ]).map((field, idx) => (
            <div key={idx} className="card p-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-3">
                {field.label}
              </label>
              <input
                type="number"
                value={field.value}
                onChange={(e) => updateData(field.field, e.target.value)}
                placeholder={field.placeholder}
                className="amount-large w-full border-0 bg-transparent text-gray-900 focus:ring-0"
              />
            </div>
          ))}\n
        </div>

        {/* Chart Section */}
        <div className="card p-8">
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">{t('retirement.growthProjection')}</h2>
          {projectionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"} />
                <XAxis
                  dataKey="age"
                  stroke={isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"}
                  label={{ value: t('retirement.age'), position: 'insideBottomRight', offset: -5, fill: isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}
                />
                <YAxis
                  stroke={isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"}
                  label={{ value: `Balance (${getSymbol()})`, angle: -90, position: 'insideLeft', fill: isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('retirement.age')} {data.age}</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-300">{t('retirement.yourContributions')}:</span>
                              <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{getSymbol()}{Math.floor(data.contributions).toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-300">{t('retirement.investmentGains')}:</span>
                              <span className="font-mono font-semibold text-green-600 dark:text-green-400">{getSymbol()}{Math.floor(data.gains).toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 flex justify-between items-center">
                              <span className="font-semibold text-gray-900 dark:text-gray-100">{t('retirement.totalBalance')}:</span>
                              <span className="font-mono font-bold text-brand-primary">{getSymbol()}{Math.floor(data.balance).toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorBalance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-20 text-gray-500 dark:text-gray-400">{t('retirement.enterValidAges')}</p>
          )}
        </div>

        {/* Balance Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visual Breakdown */}
          <div className="card p-8">
            <h3 className="mb-6 text-lg font-bold text-gray-900">{t('retirement.balanceComposition')}</h3>
            <div className="space-y-4">
              {/* Contributions Bar */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-100">{t('retirement.yourContributions')}</span>
                  <span className="text-sm font-bold text-gray-900">
                    {getSymbol()}{Math.floor(yearsToRetirement * 12 * (isForward ? (parseFloat(monthlyInvestment) || 0) : backwardMonthly)).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-gray-200">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all"
                    style={{
                      width: finalBalance > 0 
                        ? `${Math.min(100, ((yearsToRetirement * 12 * (isForward ? (parseFloat(monthlyInvestment) || 0) : backwardMonthly)) / finalBalance) * 100)}%`
                        : '0%'
                    }}
                  />
                </div>
              </div>

              {/* Investment Gains Bar */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-100">{t('retirement.investmentGains')}</span>
                  <span className="text-sm font-bold text-green-600">
                    {getSymbol()}{Math.floor(finalBalance - (yearsToRetirement * 12 * (isForward ? (parseFloat(monthlyInvestment) || 0) : backwardMonthly))).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-gray-200">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                    style={{
                      width: finalBalance > 0 
                        ? `${Math.min(100, ((finalBalance - (yearsToRetirement * 12 * (isForward ? (parseFloat(monthlyInvestment) || 0) : backwardMonthly))) / finalBalance) * 100)}%`
                        : '0%'
                    }}
                  />
                </div>
              </div>

              {/* Total Balance */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">{t('retirement.totalBalance')}</span>
                  <span className="amount-large text-brand-primary">
                    {getSymbol()}{Math.floor(finalBalance).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="space-y-4">
            <div className="card p-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('retirement.yearsToRetirement')}</p>
              <p className="amount-large mt-2 text-gray-900">{yearsToRetirement}</p>
            </div>

            <div className="card p-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {isForward ? t('retirement.monthlyInvestment') : t('retirement.requiredMonthlyInvestment')}
              </p>
              <p className="amount-large mt-2 text-gray-900 font-mono">
                {getSymbol()}{Math.floor(isForward ? (parseFloat(monthlyInvestment) || 0) : backwardMonthly).toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </p>
            </div>

            <div className="card p-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('retirement.totalContributions')}</p>
              <p className="amount-large mt-2 text-gray-900 font-mono">
                {getSymbol()}{Math.floor(yearsToRetirement * 12 * (isForward ? (parseFloat(monthlyInvestment) || 0) : backwardMonthly)).toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </p>
            </div>

            <div className="card p-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('retirement.investmentGains')}</p>
              <p className="amount-large mt-2 text-green-600 font-mono">
                {getSymbol()}{Math.floor(finalBalance - (yearsToRetirement * 12 * (isForward ? (parseFloat(monthlyInvestment) || 0) : backwardMonthly))).toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

