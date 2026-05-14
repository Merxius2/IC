/**
 * Overview Page - Financial Summary Dashboard
 * Displays key metrics from all pages in a unified view
 */

import { useState, useEffect, useMemo } from 'react';
import { Wallet, TrendingUp, Eye } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { EXPENSE_CATEGORIES, CHART_COLORS } from '../lib/constants';
import { loadFromCookie } from '../lib/cookieStorage';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { generateForwardProjection, generateBackwardProjection } from '../lib/retirementCalculator';
import PageHeader from '../components/PageHeader';

export default function Overview() {
  const [data, setData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    savingsAmount: 0,
    includeSavingsInCalculations: true,
    expenses: {},
    retirementProjection: 0,
    retirementBreakdown: { contributions: 0, gains: 0 },
    monthlyInvestment: 0,
  });
  const { getSymbol } = useCurrency();
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  // Memoize retirement projection calculation - expensive operation
  const retirementMetrics = useMemo(() => {
    const retirementData = loadFromCookie('AUDIT_RETIREMENT_DATA');
    if (!retirementData) return { retirementProjection: 0, retirementBreakdown: { contributions: 0, gains: 0 }, monthlyInvestment: 0 };

    const isBackward = retirementData.calculationType === 'backward';
    const projectionArray = isBackward
      ? generateBackwardProjection(
          retirementData.currentAge || '30',
          retirementData.retirementAge || '65',
          retirementData.goalBalance || '500000',
          retirementData.annualReturn || '7'
        )
      : generateForwardProjection(
          retirementData.currentAge || '30',
          retirementData.retirementAge || '65',
          retirementData.monthlyInvestment || '1000',
          retirementData.annualReturn || '7'
        );
    
    // Extract final breakdown from projection array
    const finalProjection = projectionArray[projectionArray.length - 1];
    let retirementBreakdown = { contributions: 0, gains: 0 };
    
    if (finalProjection) {
      retirementBreakdown = {
        contributions: finalProjection.contributions,
        gains: finalProjection.gains,
      };
    }
    
    // Calculate monthly investment
    let monthlyInvest = 0;
    if (isBackward) {
      const current = parseInt(retirementData.currentAge) || 0;
      const retirement = parseInt(retirementData.retirementAge) || 65;
      const goal = parseFloat(retirementData.goalBalance) || 500000;
      const rate = (parseFloat(retirementData.annualReturn) || 7) / 100 / 12;
      const months = (retirement - current) * 12;
      if (rate === 0) {
        monthlyInvest = months > 0 ? Math.floor(goal / months) : 0;
      } else {
        const factor = (Math.pow(1 + rate, months) - 1) / rate;
        monthlyInvest = factor > 0 ? Math.floor(goal / factor) : 0;
      }
    } else {
      monthlyInvest = Math.floor(parseFloat(retirementData.monthlyInvestment) || 0);
    }

    return {
      retirementProjection: finalProjection?.balance || 0,
      retirementBreakdown,
      monthlyInvestment: monthlyInvest,
    };
  }, []);

  useEffect(() => {
    // Load dashboard data from cookies
    const dashboardData = loadFromCookie('AUDIT_DASHBOARD_DATA');

    if (dashboardData) {
      let totalIncome = 0;
      let savingsAmount = 0;
      let expenses = {};

      // Check if using separate mode
      if (dashboardData.calculationType === 'separate') {
        // Combine data from both persons
        const person1Incomes = dashboardData.person1Incomes || [];
        const person2Incomes = dashboardData.person2Incomes || [];
        const allIncomes = [...person1Incomes, ...person2Incomes];
        
        totalIncome = allIncomes.reduce((sum, income) => sum + (parseFloat(income.amount) || 0), 0);
        
        const person1Savings = parseFloat(dashboardData.person1Savings) || 0;
        const person2Savings = parseFloat(dashboardData.person2Savings) || 0;
        savingsAmount = person1Savings + person2Savings;
        
        // Combine personal expenses from both persons
        const person1Expenses = dashboardData.person1Expenses || {};
        const person2Expenses = dashboardData.person2Expenses || {};
        const sharedExpenses = dashboardData.sharedExpenses || {};
        
        // Merge all expenses
        EXPENSE_CATEGORIES.forEach(cat => {
          const p1 = parseFloat(person1Expenses[cat]) || 0;
          const p2 = parseFloat(person2Expenses[cat]) || 0;
          const shared = parseFloat(sharedExpenses[cat]) || 0;
          expenses[cat] = p1 + p2 + shared;
        });
      } else {
        // Shared mode - use original structure
        const incomes = dashboardData.incomes || [];
        totalIncome = incomes.reduce((sum, income) => sum + (parseFloat(income.amount) || 0), 0);
        savingsAmount = parseFloat(dashboardData.savings) || 0;
        expenses = dashboardData.expenses || {};
      }

      const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

      setData({
        totalIncome,
        totalExpenses,
        savingsAmount,
        includeSavingsInCalculations: dashboardData.includeSavingsInCalculations !== false,
        expenses,
        retirementProjection: retirementMetrics.retirementProjection,
        retirementBreakdown: retirementMetrics.retirementBreakdown,
        monthlyInvestment: retirementMetrics.monthlyInvestment,
      });
    }
  }, [retirementMetrics]);

  const savingsRate = data.totalIncome > 0 
    ? ((data.savingsAmount / data.totalIncome) * 100).toFixed(1)
    : 0;

  const expenseRatio = data.totalIncome > 0
    ? ((data.totalExpenses / data.totalIncome) * 100).toFixed(1)
    : 0;

  const leftover = data.totalIncome - (data.includeSavingsInCalculations ? data.savingsAmount : 0) - data.totalExpenses;

  const pieData = [
    ...EXPENSE_CATEGORIES.map((cat) => ({
      name: cat,
      value: parseFloat(data.expenses[cat]) || 0
    })).filter(item => item.value > 0),
    { name: 'Remaining', value: Math.max(leftover, 0) }
  ];

  const totalPieValue = pieData.reduce((sum, item) => sum + item.value, 0);

  const renderCustomLabel = ({ name, value }) => {
    const percentage = totalPieValue > 0 ? ((value / totalPieValue) * 100).toFixed(1) : 0;
    const displayName = name === 'Remaining' ? t('dashboard.remaining') : t(`dashboard.expenseCategories.${name}`);
    return `${displayName}: ${getSymbol()}${Math.floor(value).toLocaleString('en-US', { minimumFractionDigits: 0 })} (${percentage}%)`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-32 lg:ml-64 md:pb-0">
      <PageHeader icon={Eye} titleKey="overview.title" />

      <div className="max-w-7xl mx-auto space-y-6 px-4 py-8 md:px-8">
        {/* Retirement Breakdown */}
        {data.retirementProjection > 0 && (
          <div className="card p-6 md:p-8">
            <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">{t('overview.retirementProjectionBreakdown')}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              <div className="rounded-2xl border border-gray-100 p-3 sm:p-4 md:p-4 lg:p-5 shadow-soft bg-gradient-to-br from-blue-50 to-white dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('overview.breakdown.contributions')}</p>
                <p className="amount-large mt-3 text-gray-900 dark:text-gray-100">
                  {getSymbol()}{Math.floor(data.retirementBreakdown.contributions).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 p-3 sm:p-4 md:p-4 lg:p-5 shadow-soft bg-gradient-to-br from-green-50 to-white dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('overview.breakdown.investmentGains')}</p>
                <p className="amount-large mt-3 text-green-600 dark:text-green-400">
                  {getSymbol()}{Math.floor(data.retirementBreakdown.gains).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 p-3 sm:p-4 md:p-4 lg:p-5 shadow-soft bg-gradient-to-br from-purple-50 to-white dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('overview.monthlyInvestment')}</p>
                <p className="amount-large mt-3 text-purple-600 dark:text-purple-400">
                  {getSymbol()}{Math.floor(data.monthlyInvestment).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 p-3 sm:p-4 md:p-4 lg:p-5 shadow-soft bg-gradient-to-br from-brand-secondary/10 to-white dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('overview.totalProjectedBalance')}</p>
                <p className="amount-large mt-3 text-brand-secondary dark:text-brand-secondary">
                  {getSymbol()}{Math.floor(data.retirementProjection).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-100">{t('overview.breakdown.contributions')}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{((data.retirementBreakdown.contributions / data.retirementProjection) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(data.retirementBreakdown.contributions / data.retirementProjection) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-100">{t('overview.breakdown.investmentGains')}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{((data.retirementBreakdown.gains / data.retirementProjection) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(data.retirementBreakdown.gains / data.retirementProjection) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card-income p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('overview.cards.totalIncome')}</p>
            <p className="amount-large mt-3 text-gray-900 dark:text-gray-100">
              {getSymbol()}{Math.floor(data.totalIncome).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>

          <div className="card-expenses p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('overview.cards.totalExpenses')}</p>
            <p className="amount-large mt-3 text-gray-900 dark:text-gray-100">
              {getSymbol()}{Math.floor(data.totalExpenses).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>

          <div className="card-savings p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('overview.cards.savingsAmount')}</p>
            <p className="amount-large mt-3 text-gray-900 dark:text-gray-100">
              {getSymbol()}{Math.floor(data.savingsAmount).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 p-6 shadow-soft dark:border-gray-700"
            style={{
              background: leftover >= 0
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(255, 255, 255, 0.5) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(255, 255, 255, 0.5) 100%)'
            }}>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('overview.cards.netLeftover')}</p>
            <p className={`amount-large mt-3 ${leftover >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {getSymbol()}{Math.floor(leftover).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Expense Ratio</p>
            <p className="amount-large mt-3 text-gray-900 dark:text-gray-100">{expenseRatio}%</p>
          </div>

          <div className="card p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">{t('overview.savingsRate')}</p>
            <p className="amount-large mt-3 text-gray-900 dark:text-gray-100">{savingsRate}%</p>
          </div>

          <div className="card p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">{t('overview.retirementBalance')}</p>
            <p className="amount-large mt-3 text-brand-secondary">
              {getSymbol()}{Math.floor(data.retirementProjection || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Expense Breakdown Chart */}
        {data.totalIncome > 0 && (
          <div className="card p-8">
            <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">{t('overview.expenseBreakdown')}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={!isMobile ? renderCustomLabel : false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${getSymbol()}${Math.floor(value).toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
                  labelFormatter={(label) => {
                    const item = pieData.find(p => p.name === label);
                    const percentage = totalPieValue > 0 ? ((item.value / totalPieValue) * 100).toFixed(1) : 0;
                    let displayLabel = label;
                    if (label === 'Remaining') {
                      displayLabel = t('dashboard.remaining');
                    } else {
                      displayLabel = t(`dashboard.expenseCategories.${label}`);
                    }
                    return `${displayLabel}: ${percentage}%`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {isMobile && (
              <div className="mt-6 space-y-2">
                {pieData.map((entry, index) => {
                  const percentage = totalPieValue > 0 ? ((entry.value / totalPieValue) * 100).toFixed(1) : 0;
                  const displayName = entry.name === 'Remaining' ? t('dashboard.remaining') : t(`dashboard.expenseCategories.${entry.name}`);
                  return (
                    <div key={`legend-${index}`} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: CHART_COLORS[index % CHART_COLORS.length]}} />
                      <span>{displayName}: {getSymbol()}{Math.floor(entry.value).toLocaleString('en-US', { minimumFractionDigits: 0 })} ({percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Information Card */}
        <div className="card p-6 border-brand-primary/20 bg-brand-primary/5">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">💡 Tip:</span> {t('overview.tip')}
          </p>
        </div>
      </div>
    </div>
  );
}
