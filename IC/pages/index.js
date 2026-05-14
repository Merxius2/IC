/**
 * Home Page - Landing
 * Modern bright landing page with feature showcase
 */

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { BarChart3, TrendingUp, ArrowRight, CreditCard, Receipt } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDarkMode } from '../context/DarkModeContext';

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'nl', flag: '🇳🇱', name: 'Dutch' },
  { code: 'ru', flag: '🇷🇺', name: 'Russian' },
  { code: 'tr', flag: '🇹🇷', name: 'Turkish' },
];

const getLanguageIcon = (language) => {
  const iconMap = {
    en: '/icon-e-512.png',
    nl: '/icon-n-512.png',
    ru: '/icon-r-512.png',
    tr: '/icon-t-512.png',
  };
  return iconMap[language] || '/icon-e-512.png';
};

export default function Home() {
  const [time, setTime] = useState('');
  const { t, language, changeLanguage, isLoading } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    setTime(new Date().toLocaleString());
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <>
      <Head>
        <title>Aap-FT</title>
      </Head>
      <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-gray-100">
        {/* Gradient Background */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: isDarkMode 
              ? 'linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 15%, rgba(17, 24, 39, 0) 40%)'
              : 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.03) 15%, rgba(255, 255, 255, 0) 40%)',
          }}
        />

        {/* Language Selector */}
        <div className="fixed top-6 right-6 hidden md:block">
          <div className="flex gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                  language === lang.code
                    ? 'bg-gradient-to-r from-brand-primary to-brand-secondary shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title={lang.name}
              >
                <span className="text-2xl">{lang.flag}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
          <div className="max-w-2xl text-center">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <Image src={getLanguageIcon(language)} alt="Aap-FT Logo" width={120} height={120} className="rounded-3xl shadow-lg" />
            </div>
            <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-6xl font-bold text-transparent md:text-7xl">
              {t('landing.title')}
            </h1>
            <p className="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('landing.subtitle')}</p>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
              {t('landing.description')}
            </p>

            {/* Language Selector - Mobile */}
            <div className="mt-8 md:hidden">
              <div className="flex gap-2 justify-center">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                      language === lang.code
                        ? 'bg-gradient-to-r from-brand-primary to-brand-secondary shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    title={lang.name}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Audit Section */}
            <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('landing.financialAuditTitle')}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">{t('landing.financialAuditDesc')}</p>

              {/* CTA Button */}
              <Link href="/dashboard">
                <button className="mt-8 mx-auto block inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-8 py-4 font-semibold text-white shadow-lg shadow-brand-primary/30 transition-all hover:shadow-lg hover:shadow-brand-primary/50 active:scale-95">
                  <span>{t('landing.cta')}</span>
                  <ArrowRight size={20} />
                </button>
              </Link>
            </div>

            {/* Other Tools Section */}
            <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('landing.otherToolsTitle')}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">{t('landing.otherToolsDesc')}</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <Link href="/debt">
                  <div className="card p-4 cursor-pointer hover:shadow-lg transition-shadow">
                    <CreditCard className="mx-auto mb-2 text-brand-primary" size={24} />
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{t('navigation.debtCalculator')}</h3>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t('landing.debtCalcDesc')}</p>
                  </div>
                </Link>

                <Link href="/tax">
                  <div className="card p-4 cursor-pointer hover:shadow-lg transition-shadow">
                    <Receipt className="mx-auto mb-2 text-brand-secondary" size={24} />
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{t('navigation.taxCalculator')}</h3>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t('landing.taxCalcDesc')}</p>
                  </div>
                </Link>
              </div>
            </div>



            {/* Dark Mode Toggle with Label */}
            <div className="mt-16 flex items-center justify-center gap-4 pt-12 border-t border-gray-200 dark:border-gray-700">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{isDarkMode ? t('landing.darkMode') : t('landing.lightMode')}</span>
              <button
                onClick={toggleDarkMode}
                className={`relative h-8 w-14 items-center rounded-full transition-colors inline-flex ${isDarkMode ? 'bg-gradient-to-r from-brand-primary to-brand-secondary' : 'bg-gray-300'}`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

