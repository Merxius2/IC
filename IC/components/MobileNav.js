/**
 * Mobile Bottom Navigation Component
 * Displays icon-based navigation for mobile devices
 * Matches modern mobile app patterns with centered action button
 */

import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Zap, Settings } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function MobileNav() {
  const router = useRouter();
  const { t } = useLanguage();

  const isActive = (path) => router.pathname === path;

  // Navigation items for heatpump calculator
  const navItems = [
    { path: '/', icon: Home, labelKey: 'navigation.home' },
    { path: '/calculator', icon: Zap, labelKey: 'navigation.calculator', isPrimary: true },
    { path: '/settings', icon: Settings, labelKey: 'navigation.settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] border-t border-gray-200 bg-white md:hidden dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-center px-2 py-3">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={item.path} className="flex-1 flex justify-center">
              <Link href={item.path}>
                {item.isPrimary ? (
                  <button className="relative -top-8 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/30 transition-transform hover:scale-110">
                    <Icon size={20} />
                  </button>
                ) : (
                  <div
                    className={`flex flex-col items-center space-y-0.5 px-0.5 py-2 transition-colors ${
                      isActive(item.path)
                        ? 'text-brand-primary'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-[9px] font-medium w-14 leading-tight text-center break-words">{t(item.labelKey)}</span>
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
