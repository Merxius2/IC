/**
 * Debt Calculator Page - Loan Amortization & Interest Breakdown
 * Calculate monthly payments, generate amortization schedule, visualize balance over time
 */

import { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useCookieStorage } from '../hooks/useCookieStorage';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { useIsMobile } from '../hooks/useIsMobile';
import PageHeader from '../components/PageHeader';
import { RotateCcw, CreditCard } from 'lucide-react';
import { MONTHS_PER_YEAR } from '../lib/appConstants';

export default function Debt() {
  // Hooks
  const { getSymbol } = useCurrency();
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  // Cookie storage with automatic loading and debounced saving
  const { data: debtData, isLoading, updateData } = useCookieStorage('AUDIT_DEBT_DATA', {
    loanAmount: '',
    interestRate: '',
    durationMonths: '',
  });

  // Destructure for easier access
  const { loanAmount, interestRate, durationMonths } = debtData;

  // Memoize debt metrics calculation - expensive amortization loop
  const { schedule, monthlyPayment, totalInterest, totalPayment } = useMemo(() => {
    const principal = parseFloat(loanAmount) || 0;
    const annualRate = parseFloat(interestRate) || 0;
    const months = parseInt(durationMonths) || 0;

    if (principal <= 0 || annualRate < 0 || months <= 0) {
      return { schedule: [], monthlyPayment: 0, totalInterest: 0, totalPayment: 0 };
    }

    const monthlyRate = annualRate / 100 / MONTHS_PER_YEAR;
    
    // Handle 0% interest
    if (monthlyRate === 0) {
      const monthlyPayment = principal / months;
      const schedule = [];
      let balance = principal;
      let cumulativeInterest = 0;
      
      for (let i = 1; i <= months; i++) {
        const interest = 0;
        const principalPayment = monthlyPayment;
        balance -= principalPayment;
        cumulativeInterest += interest;
        
        schedule.push({
          month: i,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interest,
          balance: Math.max(balance, 0),
          cumulativeInterest: cumulativeInterest,
        });
      }
      
      return {
        schedule,
        monthlyPayment,
        totalInterest: 0,
        totalPayment: principal,
      };
    }

    // Standard amortization formula: M = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);

    const schedule = [];
    let balance = principal;
    let totalInterest = 0;

    for (let i = 1; i <= months; i++) {
      const interest = balance * monthlyRate;
      const principalPayment = monthlyPayment - interest;
      balance -= principalPayment;
      totalInterest += interest;

      schedule.push({
        month: i,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interest,
        balance: Math.max(balance, 0),
        cumulativeInterest: totalInterest,
      });
    }

    return {
      schedule,
      monthlyPayment,
      totalInterest,
      totalPayment: principal + totalInterest,
    };
  }, [loanAmount, interestRate, durationMonths]);

  // Format for chart (show every 12 months or all if less than 24 months)
  const chartData = schedule.length <= 24 ? schedule : schedule.filter((item) => item.month % MONTHS_PER_YEAR === 0);

  const handleReset = () => {
    updateData('loanAmount', '');
    updateData('interestRate', '');
    updateData('durationMonths', '');
  };

  // Custom tooltip for balance chart to show total interest paid
  const CustomBalanceTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-gray-200">
            {t('debt.month')}: {data.month}
          </p>
          <p className="text-sm text-blue-400">
            {t('debt.remainingBalance')}: {getSymbol()}{Math.floor(data.balance).toLocaleString('en-US')}
          </p>
          <p className="text-sm text-red-400">
            {t('debt.interest')} ({t('debt.title')}): {getSymbol()}{Math.floor(data.cumulativeInterest).toLocaleString('en-US')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-0 lg:ml-64">
      {/* Header */}
      <PageHeader icon={CreditCard} titleKey="debt.title" />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">

      {/* Input Form */}
      <div className="card p-6 md:p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('debt.inputs')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Loan Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
              {t('debt.loanAmount')} ({getSymbol()})
            </label>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => updateData('loanAmount', e.target.value)}
              placeholder="0"
              min="0"
              step="1000"
              className="amount w-full"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
              {t('debt.interestRate')}
            </label>
            <div className="relative">
              <input
                type="number"
                value={interestRate}
                onChange={(e) => updateData('interestRate', e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className="amount w-full"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">%</span>
            </div>
          </div>

          {/* Duration in Months */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
              {t('debt.duration')} ({t('debt.months')})
            </label>
            <input
              type="number"
              value={durationMonths}
              onChange={(e) => updateData('durationMonths', e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className="amount w-full"
            />
          </div>
        </div>

        <button
          onClick={handleReset}
          className="mt-6 flex items-center gap-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <RotateCcw size={18} />
          {t('debt.reset')}
        </button>
      </div>

      {/* Metrics Cards */}
      {schedule.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
          <div className="card p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{t('debt.monthlyPayment')}</p>
            <p className="font-mono text-2xl font-bold text-brand-primary">
              {getSymbol()}{Math.floor(monthlyPayment).toLocaleString('en-US')}
            </p>
          </div>

          <div className="card p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{t('debt.totalInterest')}</p>
            <p className="font-mono text-2xl font-bold text-red-600 dark:text-red-400">
              {getSymbol()}{Math.floor(totalInterest).toLocaleString('en-US')}
            </p>
          </div>

          <div className="card p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{t('debt.totalPayment')}</p>
            <p className="font-mono text-2xl font-bold text-green-600 dark:text-green-400">
              {getSymbol()}{Math.floor(totalPayment).toLocaleString('en-US')}
            </p>
          </div>
        </div>
      )}

      {/* Breakdown Chart */}
      {schedule.length > 0 && (
        <div className="card p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('debt.paymentBreakdown')}</h2>
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 280}>
            <BarChart
              data={[
                {
                  name: 'Payment Breakdown',
                  principal: totalPayment - totalInterest,
                  interest: totalInterest,
                },
              ]}
              layout="vertical"
              margin={isMobile ? { top: 10, right: 10, left: 20, bottom: 10 } : { top: 15, right: 20, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="name" type="category" stroke="#6b7280" tick={false} width={0} />
              <Tooltip
                formatter={(value) => `${getSymbol()}${Math.floor(value).toLocaleString('en-US')}`}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#f3f4f6',
                }}
              />
              <Bar dataKey="principal" stackId="a" fill="#10b981" name={t('debt.principal')} />
              <Bar dataKey="interest" stackId="a" fill="#ef4444" name={t('debt.interest')} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('debt.principal')}: {getSymbol()}{Math.floor(totalPayment - totalInterest).toLocaleString('en-US')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('debt.interest')}: {getSymbol()}{Math.floor(totalInterest).toLocaleString('en-US')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('debt.balanceOverTime')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                label={{ value: t('debt.month'), position: 'insideBottomRight', offset: -5 }}
                stroke="#6b7280"
              />
              <YAxis 
                label={{ value: t('debt.remainingBalance'), angle: -90, position: 'insideLeft' }}
                stroke="#6b7280"
              />
              <Tooltip content={<CustomBalanceTooltip />} />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Empty State */}
      {schedule.length === 0 && !isLoading && (
        <div className="card p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">{t('debt.noData')}</p>
        </div>
      )}
      </div>
    </div>
  );
}
