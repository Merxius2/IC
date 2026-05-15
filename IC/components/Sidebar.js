/**
 * Desktop Sidebar Navigation Component
 * Displays logo, age bracket selector, and main navigation links
 */

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Zap, Settings, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSecretSettings } from '../context/SecretSettingsContext';
import { useSidebar } from '../context/SidebarContext';
import { useState, useRef, useEffect } from 'react';

export default function Sidebar() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { openSecretSettings } = useSecretSettings();
  const { isSidebarOpen, toggleSidebar, closeSidebar, isLargeScreen } = useSidebar();
  const [clickCount, setClickCount] = useState(0);
  const clickTimeout = useRef(null);

  const isActive = (path) => router.pathname === path;

  // Close sidebar when navigating to a new page on mobile/tablet
  useEffect(() => {
    const handleRouteChange = () => {
      if (!isLargeScreen) {
        closeSidebar();
      }
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router.events, isLargeScreen, closeSidebar]);

  const handleLogoClick = () => {
    setClickCount(prev => prev + 1);
    
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
    }
    
    if (clickCount + 1 === 3) {
      openSecretSettings();
      setClickCount(0);
    } else {
      clickTimeout.current = setTimeout(() => {
        setClickCount(0);
      }, 1000);
    }
  };

  const getLanguageIcon = (lang) => {
    const iconMap = {
      en: '/icon-e-192.png',
      nl: '/icon-n-192.png',
      ru: '/icon-r-192.png',
      tr: '/icon-t-192.png',
    };
    return iconMap[lang] || '/icon-e-192.png';
  };

  const navItems = [
    { path: '/calculator', labelKey: 'navigation.calculator', icon: Zap },
  ];

  const settingsItem = { path: '/settings', labelKey: 'navigation.settings', icon: Settings };

  return (
    <>
      {/* Overlay for mobile/tablet when sidebar is open */}
      {!isLargeScreen && isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 max-md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white p-6 shadow-soft transition-transform duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 max-md:hidden ${
          isLargeScreen 
            ? 'translate-x-0 lg:flex' 
            : isSidebarOpen 
              ? 'translate-x-0 flex' 
              : '-translate-x-full hidden'
        }`}
      >
      {/* Logo */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex flex-col items-center gap-3 mb-2 flex-1">
          <button
            onClick={handleLogoClick}
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
            title={clickCount > 0 ? `${3 - clickCount} clicks left to unlock secret settings` : ''}
          >
            <Image src={getLanguageIcon(language)} alt="Audit Logo" width={80} height={80} className="rounded-lg" />
          </button>
          <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-3xl font-bold text-transparent text-center">
            Aap-IC
          </h1>
        </div>
        {/* Close button for mobile/tablet */}
        {!isLargeScreen && (
          <button
            onClick={closeSidebar}
            className="max-md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center space-x-3 rounded-lg px-4 py-3 font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-gray-100 text-brand-primary dark:bg-gray-800 dark:text-brand-secondary'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                <span>{t(item.labelKey)}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="border-t border-gray-200 pt-4 dark:border-gray-800 space-y-4">
        <Link href={settingsItem.path}>
          <div
            className={`flex items-center space-x-3 rounded-lg px-4 py-3 font-medium transition-all ${
              isActive(settingsItem.path)
                ? 'bg-gray-100 text-brand-primary'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings size={20} />
            <span>{t(settingsItem.labelKey)}</span>
          </div>
        </Link>

        {/* Footer */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>© 2026 Aap Financial Tools</p>
        </div>
      </div>
      </div>
    </>
  );
}

