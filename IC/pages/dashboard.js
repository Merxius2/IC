/**
 * Household Budget Page - Income & Expense Tracking
 * Main page for tracking monthly finances with median comparisons
 */

import { useState, useEffect } from 'react';
import { Wallet, Home, Car, UtensilsCrossed, Zap, Heart, Smile, Banknote, PiggyBank, Plus, Trash2, CreditCard, Phone, Shield, MoreHorizontal, BarChart3, Tv, Receipt } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { EXPENSE_CATEGORIES, SHARED_EXPENSE_CATEGORIES, PERSONAL_EXPENSE_CATEGORIES, CHART_COLORS, CATEGORY_ICONS } from '../lib/constants';
import { loadFromCookie, saveToCookie } from '../lib/cookieStorage';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { useDebouncedCookie } from '../hooks/useDebouncedCookie';
import PageHeader from '../components/PageHeader';

export default function Dashboard() {
  // Shared state for both modes
  const [calculationType, setCalculationType] = useState('shared');
  const [isLoading, setIsLoading] = useState(true);
  const { getSymbol } = useCurrency();
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  // Shared mode state (current mode)
  const [incomes, setIncomes] = useState([]);
  const [savings, setSavings] = useState('');
  const [includeSavingsInCalculations, setIncludeSavingsInCalculations] = useState(true);
  const [expenses, setExpenses] = useState(
    EXPENSE_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: '' }), {})
  );

  // Separate mode state (two-person mode)
  const [person1Incomes, setPerson1Incomes] = useState([]);
  const [person1Savings, setPerson1Savings] = useState('');
  const [person1Expenses, setPerson1Expenses] = useState(
    PERSONAL_EXPENSE_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: '' }), {})
  );
  
  const [person2Incomes, setPerson2Incomes] = useState([]);
  const [person2Savings, setPerson2Savings] = useState('');
  const [person2Expenses, setPerson2Expenses] = useState(
    PERSONAL_EXPENSE_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: '' }), {})
  );

  const [sharedExpenses, setSharedExpenses] = useState(
    SHARED_EXPENSE_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: '' }), {})
  );

  // Custom names for person 1 and 2
  const [person1Name, setPerson1Name] = useState('Person 1');
  const [person2Name, setPerson2Name] = useState('Person 2');


  // Load data from cookies on mount
  useEffect(() => {
    const savedData = loadFromCookie('AUDIT_DASHBOARD_DATA');
    if (savedData) {
      if (savedData.calculationType) setCalculationType(savedData.calculationType);
      
      // Load shared mode data (backward compatible)
      if (savedData.incomes) setIncomes(savedData.incomes);
      if (savedData.savings) setSavings(savedData.savings);
      if (savedData.includeSavingsInCalculations !== undefined) {
        setIncludeSavingsInCalculations(savedData.includeSavingsInCalculations);
      }
      if (savedData.expenses) setExpenses(savedData.expenses);

      // Load separate mode data
      if (savedData.person1Incomes) setPerson1Incomes(savedData.person1Incomes);
      if (savedData.person1Savings) setPerson1Savings(savedData.person1Savings);
      if (savedData.person1Expenses) setPerson1Expenses(savedData.person1Expenses);
      
      if (savedData.person2Incomes) setPerson2Incomes(savedData.person2Incomes);
      if (savedData.person2Savings) setPerson2Savings(savedData.person2Savings);
      if (savedData.person2Expenses) setPerson2Expenses(savedData.person2Expenses);

      if (savedData.sharedExpenses) setSharedExpenses(savedData.sharedExpenses);

      // Load custom names
      if (savedData.person1Name) setPerson1Name(savedData.person1Name);
      if (savedData.person2Name) setPerson2Name(savedData.person2Name);
    }
    setIsLoading(false);
  }, []);

  // Debounced cookie save
  const debouncedSave = useDebouncedCookie('AUDIT_DASHBOARD_DATA', {
    calculationType,
    // Shared mode
    incomes,
    savings,
    includeSavingsInCalculations,
    expenses,
    // Separate mode
    person1Incomes,
    person1Savings,
    person1Expenses,
    person2Incomes,
    person2Savings,
    person2Expenses,
    sharedExpenses,
    person1Name,
    person2Name,
  });

  useEffect(() => {
    if (!isLoading) {
      debouncedSave();
    }
  }, [
    calculationType,
    incomes, savings, includeSavingsInCalculations, expenses,
    person1Incomes, person1Savings, person1Expenses,
    person2Incomes, person2Savings, person2Expenses,
    sharedExpenses,
    person1Name, person2Name,
    isLoading
  ]);

  // Calculate totals
  const totalIncome = incomes.reduce((sum, income) => sum + (parseFloat(income.amount) || 0), 0);
  const savingsNum = parseFloat(savings) || 0;
  const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

  const leftover = totalIncome - (includeSavingsInCalculations ? savingsNum : 0) - totalExpenses;

  // Pie chart data and custom label
  const pieData = [
    ...EXPENSE_CATEGORIES.map((cat) => ({
      name: cat,
      value: parseFloat(expenses[cat]) || 0
    })).filter(item => item.value > 0),
    ...(includeSavingsInCalculations && savingsNum > 0 ? [{ name: 'Savings', value: savingsNum }] : []),
    { name: 'Remaining', value: Math.max(leftover, 0) }
  ];

  const totalPieValue = pieData.reduce((sum, item) => sum + item.value, 0);

  const renderCustomLabel = ({ name, value }) => {
    const percentage = totalPieValue > 0 ? ((value / totalPieValue) * 100).toFixed(1) : 0;
    let displayName = name;
    if (name === 'Savings') {
      displayName = t('dashboard.savings');
    } else if (name === 'Remaining') {
      displayName = t('dashboard.remaining');
    } else {
      displayName = t(`dashboard.expenseCategories.${name}`);
    }
    return `${displayName}: ${getSymbol()}${Math.floor(value).toLocaleString('en-US', { minimumFractionDigits: 0 })} (${percentage}%)`;
  };

  // Income management functions
  const addIncome = () => {
    const newId = Date.now().toString();
    setIncomes([...incomes, { id: newId, label: `Income ${incomes.length + 1}`, amount: '' }]);
  };

  const updateIncome = (id, field, value) => {
    setIncomes(incomes.map(income =>
      income.id === id ? { ...income, [field]: value } : income
    ));
  };

  const removeIncome = (id) => {
    setIncomes(incomes.filter(income => income.id !== id));
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0" />;
  }

  return (
    <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0">
      <PageHeader icon={BarChart3} titleKey="dashboard.title" />

      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        {/* Calculation Type Toggle */}
        <div className="card p-6 mb-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">{t('dashboard.calculationType')}</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setCalculationType('shared')}
              className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
                calculationType === 'shared'
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-soft'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('dashboard.mode.shared')}
            </button>
            <button
              onClick={() => setCalculationType('separate')}
              className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
                calculationType === 'separate'
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-soft'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('dashboard.mode.separate')}
            </button>
          </div>
        </div>
      </div>

      {/* Shared Mode Content */}
      {calculationType === 'shared' && (
      <div className="max-w-7xl mx-auto space-y-6 px-4 py-8 md:px-8">
        {/* Income Sources Card */}
        <div className="card-income p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.incomeHeader')}</h2>
            <button
              onClick={addIncome}
              className="flex items-center gap-2 rounded-lg bg-brand-primary text-white px-4 py-2 font-medium hover:bg-brand-primary/90 transition-colors w-full sm:w-auto justify-center sm:justify-start"
            >
              <Plus size={18} />
              {t('dashboard.addIncomeBtn')}
            </button>
          </div>

          <div className="space-y-4">
            {incomes.map((income) => (
              <div key={income.id} className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                    {t('dashboard.sourceLabel')}
                  </label>
                  <input
                    type="text"
                    value={income.label}
                    onChange={(e) => updateIncome(income.id, 'label', e.target.value)}
                    placeholder={t('dashboard.placeholder.salaryFreelance')}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                    {t('dashboard.amount')} ({getSymbol()})
                  </label>
                  <input
                    type="number"
                    value={income.amount}
                    onChange={(e) => updateIncome(income.id, 'amount', e.target.value)}
                    placeholder={t('dashboard.placeholder.amount')}
                    className="amount w-full"
                  />
                </div>
                <button
                  onClick={() => removeIncome(income.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t('dashboard.removeIncome')}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          {incomes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">{t('dashboard.noIncomeSources')}</p>
            </div>
          )}
        </div>

        {/* Savings Card with Toggle */}
        <div className="card-savings p-6">
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSavingsInCalculations}
                onChange={(e) => setIncludeSavingsInCalculations(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-100">{t('dashboard.includeSavingsInCalc')}</span>
            </label>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-100 mb-3">
              <PiggyBank size={18} className="text-brand-primary" />
              {t('dashboard.savingsAmount')}
            </label>
            <input
              type="number"
              value={savings}
              onChange={(e) => setSavings(e.target.value)}
              placeholder={t('dashboard.placeholder.amount')}
              className="mt-3 amount-large w-full border-0 bg-transparent text-gray-900 focus:ring-0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {includeSavingsInCalculations 
                ? t('dashboard.savingsIncluded')
                : t('dashboard.savingsNotIncluded')}
            </p>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="card-expenses p-8">
          <h2 className="mb-6 text-xl font-bold text-gray-900">{t('dashboard.subtitle')}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXPENSE_CATEGORIES.map((category) => {
              const IconComponent = CATEGORY_ICONS[category];
              return (
                <div key={category}>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                    <IconComponent size={18} className="text-brand-primary" />
                    {t(`dashboard.expenseCategories.${category}`)}
                  </label>
                  <input
                    type="number"
                    value={expenses[category]}
                    onChange={(e) =>
                      setExpenses({ ...expenses, [category]: e.target.value })
                    }
                    placeholder="0"
                    className="amount w-full"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card-summary p-3 sm:p-4 md:p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('dashboard.totalIncome')}</p>
            <p className="amount-large mt-2 text-gray-900">
              {getSymbol()}{Math.floor(totalIncome).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>

          <div className="card-summary p-3 sm:p-4 md:p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('dashboard.totalExpenses')}</p>
            <p className="amount-large mt-2 text-gray-900">
              {getSymbol()}{Math.floor(totalExpenses).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 p-3 sm:p-4 md:p-6 shadow-soft"
            style={{
              background: leftover >= 0
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(255, 255, 255, 0.5) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(255, 255, 255, 0.5) 100%)'
            }}>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('dashboard.netLeftover')}</p>
            <p className={`amount-large mt-2 ${leftover >= 0 ? 'glow-green text-green-600' : 'text-red-600'}`}>
              {getSymbol()}{Math.floor(leftover).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Income vs Expenses Pie Chart */}
        {totalIncome > 0 && (
          <div className="card p-8">
            <h2 className="mb-6 text-xl font-bold text-gray-900">{t('dashboard.expenseBreakdown')}</h2>
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
                    if (label === 'Savings') {
                      displayLabel = t('dashboard.savings');
                    } else if (label === 'Remaining') {
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
                  let displayName = entry.name;
                  if (entry.name === 'Savings') {
                    displayName = t('dashboard.savings');
                  } else if (entry.name === 'Remaining') {
                    displayName = t('dashboard.remaining');
                  } else {
                    displayName = t(`dashboard.expenseCategories.${entry.name}`);
                  }
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

        {/* Status Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card p-3 sm:p-4 md:p-6">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">{t('dashboard.expenseRatio')}</p>
            <p className={`font-mono text-3xl font-bold tracking-tight mt-2 ${
              totalIncome > 0 && ((totalExpenses / totalIncome) * 100) <= 70
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : '0'}%
            </p>
          </div>

          <div className="card p-3 sm:p-4 md:p-6">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">{t('dashboard.savingsRate')}</p>
            <p className={`font-mono text-3xl font-bold tracking-tight mt-2 ${
              totalIncome > 0 && ((savingsNum / totalIncome) * 100) >= 20
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {totalIncome > 0 ? ((savingsNum / totalIncome) * 100).toFixed(1) : '0'}%
            </p>
          </div>

          <div className="card p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">{t('dashboard.monthlyStatus')}</p>
            <p className={`font-mono text-3xl font-bold tracking-tight mt-2 ${leftover >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {leftover >= 0 ? t('dashboard.balanced') : t('dashboard.deficit')}
            </p>
          </div>
        </div>
      </div>
      )}

      {/* Separate Mode Content */}
      {calculationType === 'separate' && (
      <SeparateModeContent
        person1Name={person1Name}
        setPerson1Name={setPerson1Name}
        person2Name={person2Name}
        setPerson2Name={setPerson2Name}
        person1Incomes={person1Incomes}
        setPerson1Incomes={setPerson1Incomes}
        person1Savings={person1Savings}
        setPerson1Savings={setPerson1Savings}
        person1Expenses={person1Expenses}
        setPerson1Expenses={setPerson1Expenses}
        person2Incomes={person2Incomes}
        setPerson2Incomes={setPerson2Incomes}
        person2Savings={person2Savings}
        setPerson2Savings={setPerson2Savings}
        person2Expenses={person2Expenses}
        setPerson2Expenses={setPerson2Expenses}
        sharedExpenses={sharedExpenses}
        setSharedExpenses={setSharedExpenses}
        getSymbol={getSymbol}
        t={t}
        isMobile={isMobile}
      />
      )}
    </div>
  );
}

// Helper component for Person Income/Expenses management in separate mode
function PersonSection({ 
  personLabel, 
  incomes, 
  setIncomes, 
  savings, 
  setSavings, 
  expenses, 
  setExpenses,
  getSymbol,
  t,
  isMobile,
  isPersonOne = true,
  contribution = 0,
  showContribution = false
}) {
  const addIncome = () => {
    const newId = Date.now().toString();
    setIncomes([...incomes, { id: newId, label: `${personLabel} Income ${incomes.length + 1}`, amount: '' }]);
  };

  const updateIncome = (id, field, value) => {
    setIncomes(incomes.map(income =>
      income.id === id ? { ...income, [field]: value } : income
    ));
  };

  const removeIncome = (id) => {
    setIncomes(incomes.filter(income => income.id !== id));
  };

  const totalIncome = incomes.reduce((sum, income) => sum + (parseFloat(income.amount) || 0), 0);
  const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const savingsNum = parseFloat(savings) || 0;
  const balance = totalIncome - savingsNum - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Income Card */}
      <div className="card-income p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.income')}</h3>
          <button
            onClick={addIncome}
            className="flex items-center gap-2 rounded-lg bg-brand-primary text-white px-4 py-2 font-medium hover:bg-brand-primary/90 transition-colors w-full sm:w-auto justify-center sm:justify-start"
          >
            <Plus size={18} />
            {t('dashboard.addIncomeBtn')}
          </button>
        </div>

        <div className="space-y-4">
          {incomes.map((income) => (
            <div key={income.id} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                  {t('dashboard.sourceLabel')}
                </label>
                <input
                  type="text"
                  value={income.label}
                  onChange={(e) => updateIncome(income.id, 'label', e.target.value)}
                  placeholder={t('dashboard.placeholder.salaryFreelance')}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                  {t('dashboard.amount')} ({getSymbol()})
                </label>
                <input
                  type="number"
                  value={income.amount}
                  onChange={(e) => updateIncome(income.id, 'amount', e.target.value)}
                  placeholder={t('dashboard.placeholder.amount')}
                  className="amount w-full"
                />
              </div>
              <button
                onClick={() => removeIncome(income.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={t('dashboard.removeIncome')}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {incomes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">{t('dashboard.noIncomeSources')}</p>
          </div>
        )}
      </div>

      {/* Savings Card */}
      <div className="card-savings p-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-100 mb-3">
          <PiggyBank size={18} className="text-brand-primary" />
          {t('dashboard.savingsAmount')}
        </label>
        <input
          type="number"
          value={savings}
          onChange={(e) => setSavings(e.target.value)}
          placeholder={t('dashboard.placeholder.amount')}
          className="mt-3 amount-large w-full border-0 bg-transparent text-gray-900 focus:ring-0"
        />
      </div>

      {/* Personal Expenses */}
      <div className="card-expenses p-8">
        <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.expenses')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {PERSONAL_EXPENSE_CATEGORIES.map((category) => {
            const IconComponent = CATEGORY_ICONS[category];
            return (
              <div key={category} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-100">
                  <IconComponent size={16} className="text-brand-primary" />
                  {t(`dashboard.expenseCategories.${category}`)}
                </label>
                <input
                  type="number"
                  value={expenses[category] || ''}
                  onChange={(e) => setExpenses({ ...expenses, [category]: e.target.value })}
                  placeholder="0"
                  className="amount w-full"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary and Contribution Breakdown Combined */}
      <div className="card p-6 border-l-4 border-brand-primary">
        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t('dashboard.summary')}</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">{t('dashboard.totalIncome')}</span>
            <span className="font-mono font-bold text-brand-primary">{getSymbol()}{Math.floor(totalIncome).toLocaleString('en-US')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">{t('dashboard.totalExpenses')}</span>
            <span className="font-mono font-bold text-red-600 dark:text-red-400">-{getSymbol()}{Math.floor(totalExpenses).toLocaleString('en-US')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">{t('dashboard.savingsAmount')}</span>
            <span className="font-mono font-bold text-gray-900 dark:text-gray-100">-{getSymbol()}{Math.floor(savingsNum).toLocaleString('en-US')}</span>
          </div>
          <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2 flex justify-between items-center text-sm font-medium">
            <span className="text-gray-700 dark:text-gray-300">{t('dashboard.balance')}</span>
            <span className={`font-mono ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{getSymbol()}{Math.floor(balance).toLocaleString('en-US')}</span>
          </div>

          {/* Contribution to Shared Account (shown in separate mode) */}
          {showContribution && (
            <>
              <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2 flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">{t('dashboard.contribution')}</span>
                <span className="font-mono font-bold text-gray-900 dark:text-gray-100">-{getSymbol()}{Math.floor(contribution).toLocaleString('en-US')}</span>
              </div>
              <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2 flex justify-between items-center">
                <span className="font-medium text-gray-900 dark:text-gray-100">{t('dashboard.personalBalance')}</span>
                <span className={`font-mono text-lg font-bold ${(balance - contribution) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {getSymbol()}{Math.floor(balance - contribution).toLocaleString('en-US')}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Separate mode main content component
function SeparateModeContent({
  person1Name,
  setPerson1Name,
  person2Name,
  setPerson2Name,
  person1Incomes,
  setPerson1Incomes,
  person1Savings,
  setPerson1Savings,
  person1Expenses,
  setPerson1Expenses,
  person2Incomes,
  setPerson2Incomes,
  person2Savings,
  setPerson2Savings,
  person2Expenses,
  setPerson2Expenses,
  sharedExpenses,
  setSharedExpenses,
  getSymbol,
  t,
  isMobile,
}) {
  // Calculate totals for both people
  const person1Income = person1Incomes.reduce((sum, income) => sum + (parseFloat(income.amount) || 0), 0);
  const person1PersonalExpenses = Object.values(person1Expenses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const person1SavingsNum = parseFloat(person1Savings) || 0;

  const person2Income = person2Incomes.reduce((sum, income) => sum + (parseFloat(income.amount) || 0), 0);
  const person2PersonalExpenses = Object.values(person2Expenses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const person2SavingsNum = parseFloat(person2Savings) || 0;

  const totalIncome = person1Income + person2Income;
  const sharedExpensesTotal = Object.values(sharedExpenses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

  // Calculate income ratios
  const person1Ratio = totalIncome > 0 ? person1Income / totalIncome : 0.5;
  const person2Ratio = totalIncome > 0 ? person2Income / totalIncome : 0.5;

  // Calculate contributions to shared account
  const person1Contribution = sharedExpensesTotal * person1Ratio;
  const person2Contribution = sharedExpensesTotal * person2Ratio;

  // Calculate final balances
  const person1Balance = person1Income - person1SavingsNum - person1PersonalExpenses - person1Contribution;
  const person2Balance = person2Income - person2SavingsNum - person2PersonalExpenses - person2Contribution;
  const sharedBalance = person1Contribution + person2Contribution - sharedExpensesTotal;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {/* Person 1 Section */}
        <div>
          <input
            type="text"
            value={person1Name}
            onChange={(e) => setPerson1Name(e.target.value)}
            className="w-full text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-brand-primary focus:outline-none px-0 py-2 transition-colors"
          />
          <PersonSection
            personLabel={person1Name}
            incomes={person1Incomes}
            setIncomes={setPerson1Incomes}
            savings={person1Savings}
            setSavings={setPerson1Savings}
            expenses={person1Expenses}
            setExpenses={setPerson1Expenses}
            getSymbol={getSymbol}
            t={t}
            isMobile={isMobile}
            isPersonOne={true}
            contribution={person1Contribution}
            showContribution={true}
          />
        </div>

        {/* Person 2 Section */}
        <div>
          <input
            type="text"
            value={person2Name}
            onChange={(e) => setPerson2Name(e.target.value)}
            className="w-full text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-brand-primary focus:outline-none px-0 py-2 transition-colors"
          />
          <PersonSection
            personLabel={person2Name}
            incomes={person2Incomes}
            setIncomes={setPerson2Incomes}
            savings={person2Savings}
            setSavings={setPerson2Savings}
            expenses={person2Expenses}
            setExpenses={setPerson2Expenses}
            getSymbol={getSymbol}
            t={t}
            isMobile={isMobile}
            isPersonOne={false}
            contribution={person2Contribution}
            showContribution={true}
          />
        </div>
      </div>

      {/* Shared Account Section */}
      <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('dashboard.sharedAccount')}</h2>

        {/* Shared Expenses */}
        <div className="card-expenses p-8 mb-6">
          <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.sharedExpensesBreakdown')}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SHARED_EXPENSE_CATEGORIES.map((category) => {
              const IconComponent = CATEGORY_ICONS[category];
              return (
                <div key={category} className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-100">
                    <IconComponent size={16} className="text-brand-primary" />
                    {t(`dashboard.expenseCategories.${category}`)}
                  </label>
                  <input
                    type="number"
                    value={sharedExpenses[category] || ''}
                    onChange={(e) => setSharedExpenses({ ...sharedExpenses, [category]: e.target.value })}
                    placeholder="0"
                    className="amount w-full"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Contributions Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <div className="card p-3 sm:p-4 md:p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{t('dashboard.incomeRatio')}</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-200 font-medium">{person1Name}:</span>
                <span className="font-mono text-lg font-bold text-brand-primary">{(person1Ratio * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-200 font-medium">{person2Name}:</span>
                <span className="font-mono text-lg font-bold text-brand-primary">{(person2Ratio * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="card p-3 sm:p-4 md:p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{person1Name}: {t('dashboard.contribution')}</p>
            <p className="font-mono text-2xl font-bold text-green-600 dark:text-green-400">{getSymbol()}{Math.floor(person1Contribution).toLocaleString('en-US')}</p>
          </div>

          <div className="card p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{person2Name}: {t('dashboard.contribution')}</p>
            <p className="font-mono text-2xl font-bold text-green-600 dark:text-green-400">{getSymbol()}{Math.floor(person2Contribution).toLocaleString('en-US')}</p>
          </div>
        </div>

        {/* Pie Charts */}
        <div className={`grid gap-6 mt-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {/* Person 1 Pie Chart */}
          <PieChartCard
            title={person1Name}
            data={[
              { name: t('dashboard.totalExpenses'), value: person1PersonalExpenses },
              { name: t('dashboard.contribution'), value: person1Contribution },
              { name: t('dashboard.savingsAmount'), value: person1SavingsNum },
              { name: t('dashboard.remaining'), value: Math.max(person1Income - person1PersonalExpenses - person1SavingsNum - person1Contribution, 0) }
            ]}
            getSymbol={getSymbol}
            isMobile={isMobile}
          />

          {/* Person 2 Pie Chart */}
          <PieChartCard
            title={person2Name}
            data={[
              { name: t('dashboard.totalExpenses'), value: person2PersonalExpenses },
              { name: t('dashboard.contribution'), value: person2Contribution },
              { name: t('dashboard.savingsAmount'), value: person2SavingsNum },
              { name: t('dashboard.remaining'), value: Math.max(person2Income - person2PersonalExpenses - person2SavingsNum - person2Contribution, 0) }
            ]}
            getSymbol={getSymbol}
            isMobile={isMobile}
          />

          {/* Shared Account Pie Chart */}
          <PieChartCard
            title={t('dashboard.sharedAccount')}
            data={Object.entries(sharedExpenses).map(([category, value]) => ({
              name: t(`dashboard.sharedExpenseCategories.${category}`),
              value: parseFloat(value) || 0
            })).filter(item => item.value > 0)}
            getSymbol={getSymbol}
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
}

// Helper component for pie chart display
function PieChartCard({ title, data, getSymbol, isMobile }) {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="card p-6">
      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h4>
      {totalValue > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.filter(item => item.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${getSymbol()}${Math.floor(value).toLocaleString('en-US')}`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {data.map((entry, index) => {
              const percentage = totalValue > 0 ? ((entry.value / totalValue) * 100).toFixed(1) : 0;
              return (
                <div key={`legend-${index}`} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: CHART_COLORS[index % CHART_COLORS.length]}} />
                  <span>{entry.name}: {getSymbol()}{Math.floor(entry.value).toLocaleString('en-US')} ({percentage}%)</span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="h-48 flex items-center justify-center text-gray-500">
          <p className="text-center">No data to display</p>
        </div>
      )}
    </div>
  );
}


