/**
 * Settings Page
 * Manage application settings and data
 */

import { useState } from 'react';
import { Settings as SettingsIcon, Trash2, Globe, Moon, Sun, Zap, Plus, Edit2, Save, X, ChevronDown } from 'lucide-react';
import { deleteCookie } from '../lib/cookieStorage';
import { useRouter } from 'next/router';
import { useLanguage } from '../context/LanguageContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useSecretSettings } from '../context/SecretSettingsContext';
import { useSidebar } from '../context/SidebarContext';
import { useIsMobile } from '../hooks/useIsMobile';
import PageHeader from '../components/PageHeader';
import Image from 'next/image';

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', name: 'English', icon: '/icon-e-192.png' },
  { code: 'nl', flag: '🇳🇱', name: 'Dutch', icon: '/icon-n-192.png' },
  { code: 'ru', flag: '🇷🇺', name: 'Russian', icon: '/icon-r-192.png' },
  { code: 'tr', flag: '🇹🇷', name: 'Turkish', icon: '/icon-t-192.png' },
];

const ICON_MAP = {
  en: 'e',
  nl: 'n',
  ru: 'r',
  tr: 't',
};

export default function SettingsPage() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const router = useRouter();
  const { t, language, changeLanguage } = useLanguage();
  const { isDarkMode, toggleDarkMode, isAutoMode, toggleAutoMode } = useDarkMode();
  const { openSecretSettings } = useSecretSettings();
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  // Default heatpumps function
  const getDefaultHeatpumps = () => ({
    hybrid: [
      { id: 'h1', brand: 'Quatt', model: 'Hybrid 4 kW', price: 4400, subsidy: 2625, cop: 4.8 },
      { id: 'h2', brand: 'Atlantic', model: 'Aurea 5 kW', price: 4550, subsidy: 2100, cop: 4.5 },
      { id: 'h3', brand: 'Remeha', model: 'Elga Ace 4 kW', price: 5000, subsidy: 1900, cop: 4.5 },
      { id: 'h4', brand: 'Nefit Bosch', model: 'Compress 3400i 4 kW', price: 5200, subsidy: 2125, cop: 4.5 },
      { id: 'h5', brand: 'Intergas', model: 'Xtend 5 kW', price: 5100, subsidy: 2100, cop: 4.7 },
      { id: 'h6', brand: 'Itho Daalderop', model: 'HP-S 54 5 kW', price: 5400, subsidy: 2400, cop: 4.6 },
      { id: 'h7', brand: 'Daikin', model: 'Altherma 3 H 4 kW', price: 6400, subsidy: 2200, cop: 4.6 },
      { id: 'h8', brand: 'Panasonic', model: 'Aquarea 5 kW (L-serie)', price: 7250, subsidy: 2350, cop: 4.9 },
      { id: 'h9', brand: 'Mitsubishi Electric', model: 'Ecodan 4 kW', price: 8500, subsidy: 2100, cop: 4.7 },
      { id: 'h10', brand: 'Vaillant', model: 'aroTHERM plus 5 kW', price: 6700, subsidy: 2125, cop: 4.8 },
    ],
    electric: [
      { id: 'e1', brand: 'Remeha', model: 'Mercuria 8 kW', price: 11250, subsidy: 3025, cop: 4.6 },
      { id: 'e2', brand: 'Itho Daalderop', model: 'Amber 6.5 kW', price: 10500, subsidy: 2675, cop: 5.0 },
      { id: 'e3', brand: 'Panasonic', model: 'Aquarea K-serie 7 kW', price: 12250, subsidy: 2800, cop: 5.1 },
      { id: 'e4', brand: 'Vaillant', model: 'aroTHERM plus 7 kW', price: 12750, subsidy: 2800, cop: 4.9 },
      { id: 'e5', brand: 'Mitsubishi Electric', model: 'Ecodan 8 kW', price: 14250, subsidy: 3025, cop: 4.7 },
      { id: 'e6', brand: 'Daikin', model: 'Altherma 3 R 8 kW', price: 13250, subsidy: 3025, cop: 4.8 },
      { id: 'e7', brand: 'Nefit Bosch', model: 'Compress 7400i 7 kW', price: 13750, subsidy: 2800, cop: 4.9 },
      { id: 'e8', brand: 'Alpha Innotec', model: 'Alira 7 kW', price: 14750, subsidy: 3000, cop: 4.8 },
      { id: 'e9', brand: 'NIBE', model: 'S2125 8 kW', price: 16500, subsidy: 3225, cop: 5.2 },
      { id: 'e10', brand: 'Viessmann', model: 'Vitocal 250-A 8 kW', price: 17750, subsidy: 3225, cop: 5.1 },
    ],
  });

  // Heatpump management state
  const [heatpumps, setHeatpumpsState] = useState(() => getDefaultHeatpumps());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [newHeatpump, setNewHeatpump] = useState({ type: 'hybrid', brand: '', model: '', price: '', subsidy: '', cop: '' });
  const [expandedType, setExpandedType] = useState(null);

  // Save heatpumps
  const saveHeatpumps = (updated) => {
    setHeatpumpsState(updated);
  };

  // Edit handlers
  const handleEdit = (type, id, hp) => {
    setEditingId(`${type}-${id}`);
    setEditForm({ ...hp, type });
  };

  const handleSaveEdit = () => {
    if (editForm) {
      const updated = { ...heatpumps };
      const idx = updated[editForm.type].findIndex(h => h.id === editForm.id);
      if (idx >= 0) {
        updated[editForm.type][idx] = editForm;
        saveHeatpumps(updated);
      }
      setEditingId(null);
      setEditForm(null);
    }
  };

  // Delete handler
  const handleDelete = (type, id) => {
    const updated = { ...heatpumps };
    updated[type] = updated[type].filter(h => h.id !== id);
    saveHeatpumps(updated);
  };

  // Add new heatpump
  const handleAddHeatpump = () => {
    if (newHeatpump.brand && newHeatpump.model && newHeatpump.price && newHeatpump.subsidy && newHeatpump.cop) {
      const updated = { ...heatpumps };
      const type = newHeatpump.type;
      const newId = updated[type].length + 1;
      updated[type].push({
        id: `${type.charAt(0)}${newId}`,
        brand: newHeatpump.brand,
        model: newHeatpump.model,
        price: parseInt(newHeatpump.price),
        subsidy: parseInt(newHeatpump.subsidy),
        cop: parseFloat(newHeatpump.cop),
      });
      saveHeatpumps(updated);
      setNewHeatpump({ type: 'hybrid', brand: '', model: '', price: '', subsidy: '', cop: '' });
    }
  };

  const handleResetData = () => {
    setShowConfirmation(true);
  };

  const handleIconClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 3) {
      openSecretSettings();
      setClickCount(0);
    } else {
      setTimeout(() => {
        setClickCount(0);
      }, 1000);
    }
  };

  const confirmReset = () => {
    try {
      deleteCookie('AUDIT_DASHBOARD_DATA');
      deleteCookie('AUDIT_RETIREMENT_DATA');
      setResetMessage(t('settings.success'));
      setShowConfirmation(false);
      
      // Refresh the page after 1.5 seconds
      setTimeout(() => {
        router.reload();
      }, 1500);
    } catch (error) {
      setResetMessage(t('settings.error'));
    }
  };

  const cancelReset = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="min-h-screen bg-white pb-40 lg:ml-64 md:pb-0">
      <PageHeader icon={SettingsIcon} titleKey="settings.title" />

      <div className="max-w-7xl mx-auto space-y-6 px-4 py-8 md:px-8">
        {/* Language Selection Section */}
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Globe size={28} className="text-brand-primary" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings.language')}</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{t('settings.languageDesc')}</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex flex-col items-center gap-3 rounded-lg p-6 transition-all ${
                  language === lang.code
                    ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-3xl font-semibold">{lang.flag}</span>
                <span className="text-xs font-medium text-center">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dark Mode Toggle Section */}
        <div className="card p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              {isDarkMode ? (
                <Moon size={28} className="text-brand-primary flex-shrink-0" />
              ) : (
                <Sun size={28} className="text-brand-primary flex-shrink-0" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings.darkMode')}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('settings.darkModeDesc')}</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              disabled={isAutoMode}
              className={`relative flex-shrink-0 h-8 w-14 items-center rounded-full transition-colors inline-flex ${
                isAutoMode ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                isDarkMode
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary'
                  : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Auto Dark Mode Toggle Section */}
        <div className="card p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Globe size={28} className="text-brand-primary flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings.autoDarkMode')}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('settings.autoDarkModeDesc')}</p>
              </div>
            </div>
            <button
              onClick={toggleAutoMode}
              className={`relative flex-shrink-0 h-8 w-14 items-center rounded-full transition-colors inline-flex ${
                isAutoMode
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary'
                  : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isAutoMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Heatpump Management Section */}
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Zap size={28} className="text-brand-primary" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Heatpump Management</h2>
          </div>

          <div className="space-y-8">
            {/* Hybrid Heatpumps - Collapsible */}
            <div>
              <button
                onClick={() => setExpandedType(expandedType === 'hybrid' ? null : 'hybrid')}
                className="w-full flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Hybrid Heatpumps ({heatpumps.hybrid.length})</span>
                <ChevronDown size={20} className={`text-gray-600 dark:text-gray-300 transition-transform ${expandedType === 'hybrid' ? 'rotate-180' : ''}`} />
              </button>
              {expandedType === 'hybrid' && (
                <div className="space-y-2 mt-3">
                  {heatpumps.hybrid.map((hp) => (
                    <div key={hp.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {editingId === `hybrid-${hp.id}` ? (
                        <div className="flex-1 flex gap-2">
                          <input type="text" placeholder="Brand" value={editForm.brand} onChange={(e) => setEditForm({...editForm, brand: e.target.value})} className="flex-1 px-2 py-1 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white" />
                          <input type="text" placeholder="Model" value={editForm.model} onChange={(e) => setEditForm({...editForm, model: e.target.value})} className="flex-1 px-2 py-1 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white" />
                          <input type="number" placeholder="Price" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} className="w-24 px-2 py-1 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white" />
                          <input type="number" placeholder="Subsidy" value={editForm.subsidy} onChange={(e) => setEditForm({...editForm, subsidy: e.target.value})} className="w-24 px-2 py-1 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white" />
                          <input type="number" placeholder="COP" value={editForm.cop} onChange={(e) => setEditForm({...editForm, cop: e.target.value})} className="w-20 px-2 py-1 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white" />
                          <button onClick={handleSaveEdit} className="p-1 hover:bg-green-500 rounded"><Save size={18} className="text-green-600" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 hover:bg-red-500 rounded"><X size={18} className="text-red-600" /></button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{hp.brand} {hp.model} (€{hp.price - hp.subsidy} | COP: {hp.cop})</span>
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit('hybrid', hp.id, hp)} className="p-1 hover:bg-blue-500 rounded"><Edit2 size={16} className="text-blue-600" /></button>
                            <button onClick={() => handleDelete('hybrid', hp.id)} className="p-1 hover:bg-red-500 rounded"><Trash2 size={16} className="text-red-600" /></button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Electric Heatpumps - Collapsible */}
            <div>
              <button
                onClick={() => setExpandedType(expandedType === 'electric' ? null : 'electric')}
                className="w-full flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Electric Heatpumps ({heatpumps.electric.length})</span>
                <ChevronDown size={20} className={`text-gray-600 dark:text-gray-300 transition-transform ${expandedType === 'electric' ? 'rotate-180' : ''}`} />
              </button>
              {expandedType === 'electric' && (
                <div className="space-y-2 mt-3">
                  {heatpumps.electric.map((hp) => (
                    <div key={hp.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {editingId === `electric-${hp.id}` ? (
                        <div className="flex-1 flex gap-2">
                          <input type="text" placeholder="Brand" value={editForm.brand} onChange={(e) => setEditForm({...editForm, brand: e.target.value})} className="flex-1 px-2 py-1 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white" />
                          <input type="text" placeholder="Model" value={editForm.model} onChange={(e) => setEditForm({...editForm, model: e.target.value})} className="flex-1 px-2 py-1 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white" />
                          <input type="number" placeholder="Price" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} className="w-24 px-2 py-1 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white" />
                          <input type="number" placeholder="Subsidy" value={editForm.subsidy} onChange={(e) => setEditForm({...editForm, subsidy: e.target.value})} className="w-24 px-2 py-1 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white" />
                          <input type="number" placeholder="COP" value={editForm.cop} onChange={(e) => setEditForm({...editForm, cop: e.target.value})} className="w-20 px-2 py-1 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white" />
                          <button onClick={handleSaveEdit} className="p-1 hover:bg-green-500 rounded"><Save size={18} className="text-green-600" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 hover:bg-red-500 rounded"><X size={18} className="text-red-600" /></button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{hp.brand} {hp.model} (€{hp.price - hp.subsidy} | COP: {hp.cop})</span>
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit('electric', hp.id, hp)} className="p-1 hover:bg-blue-500 rounded"><Edit2 size={16} className="text-blue-600" /></button>
                            <button onClick={() => handleDelete('electric', hp.id)} className="p-1 hover:bg-red-500 rounded"><Trash2 size={16} className="text-red-600" /></button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Heatpump */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add New Heatpump</h3>
              <div className="flex flex-col gap-3">
                <select value={newHeatpump.type} onChange={(e) => setNewHeatpump({...newHeatpump, type: e.target.value})} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                </select>
                <input type="text" placeholder="Brand" value={newHeatpump.brand} onChange={(e) => setNewHeatpump({...newHeatpump, brand: e.target.value})} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                <input type="text" placeholder="Model" value={newHeatpump.model} onChange={(e) => setNewHeatpump({...newHeatpump, model: e.target.value})} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                <div className="flex gap-2">
                  <input type="number" placeholder="Price (€)" value={newHeatpump.price} onChange={(e) => setNewHeatpump({...newHeatpump, price: e.target.value})} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                  <input type="number" placeholder="Subsidy (€)" value={newHeatpump.subsidy} onChange={(e) => setNewHeatpump({...newHeatpump, subsidy: e.target.value})} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                  <input type="number" placeholder="COP" value={newHeatpump.cop} onChange={(e) => setNewHeatpump({...newHeatpump, cop: e.target.value})} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
                <button onClick={handleAddHeatpump} className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg hover:shadow-lg transition-all">
                  <Plus size={20} />
                  Add Heatpump
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reset Data Section */}
        <div className="card p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('settings.resetData')}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('settings.resetDesc')}
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 dark:text-red-300">
                  <strong>{t('settings.warning')}</strong>
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleResetData}
            className="inline-flex items-center space-x-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-all hover:bg-red-700 active:scale-95"
          >
            <Trash2 size={20} />
            <span>{t('settings.clearButton')}</span>
          </button>

          {/* Success Message */}
          {resetMessage && (
            <div className={`mt-6 rounded-lg p-4 ${resetMessage.includes('successfully') || resetMessage.includes('успешно') || resetMessage.includes('başarı') ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'}`}>
              <p className="font-medium">{resetMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99]">
          <div className="card p-8 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4 dark:text-gray-100">{t('settings.confirm')}</h3>
            <p className="text-gray-600 mb-6 dark:text-gray-300">
              {t('settings.confirmDesc')}
            </p>
            <div className="flex gap-4">
              <button
                onClick={cancelReset}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {t('settings.cancel')}
              </button>
              <button
                onClick={confirmReset}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-all hover:bg-red-700"
              >
                {t('settings.clearButton')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile App Icon Footer */}
      <div className="md:hidden mt-4 flex justify-center pb-2">
        <button
          onClick={handleIconClick}
          className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
          title={clickCount > 0 ? `${3 - clickCount} clicks left to unlock secret settings` : ''}
        >
          <Image
            src={`/icon-${ICON_MAP[language]}-192.png`}
            alt="Aap-IC"
            width={120}
            height={120}
            className="rounded-xl"
          />
        </button>
      </div>
    </div>
  );
}
