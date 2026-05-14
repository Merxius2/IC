import { Menu } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { useLanguage } from '../context/LanguageContext';

/**
 * PageHeader Component
 * Reusable header for all pages with icon, title, and menu button
 * @param {React.Component} icon - Icon component from lucide-react
 * @param {string} titleKey - Translation key for page title (e.g., 'tax.title')
 */
export default function PageHeader({ icon: IconComponent, titleKey }) {
  const { toggleSidebar } = useSidebar();
  const { t } = useLanguage();

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-6 md:px-8 dark:border-gray-800 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={toggleSidebar}
            className="max-md:hidden lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
          <IconComponent size={36} className="text-brand-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 md:text-4xl">
            {t(titleKey)}
          </h1>
        </div>
      </div>
    </div>
  );
}
