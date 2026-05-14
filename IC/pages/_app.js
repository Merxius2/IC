/**
 * App Component
 * Root wrapper with global context provider and navigation
 */

import '../styles/globals.css';
import { LanguageProvider } from '../context/LanguageContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { DarkModeProvider } from '../context/DarkModeContext';
import { SecretSettingsProvider } from '../context/SecretSettingsContext';
import { SidebarProvider } from '../context/SidebarContext';
import { TaxProvider } from '../context/TaxContext';
import Sidebar from '../components/Sidebar';
import ErrorBoundary from '../components/ErrorBoundary';
import MobileNav from '../components/MobileNav';
import SecretSettingsModal from '../components/SecretSettingsModal';
import { useRouter } from 'next/router';
import { useLanguage } from '../context/LanguageContext';
import { useEffect, useState } from 'react';

function AppContent({ Component, pageProps }) {
  const router = useRouter();
  const { language } = useLanguage();
  const [isDesktop, setIsDesktop] = useState(false);
  const isHomePage = router.pathname === '/' || router.pathname === '/index';

  useEffect(() => {
    const checkDesktop = () => {
      const desktop = typeof window !== 'undefined' && window.innerWidth >= 768;
      setIsDesktop(desktop);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Dynamically update favicon based on language selection
  useEffect(() => {
    const iconMap = {
      en: '/icon-e-192.png',
      nl: '/icon-n-192.png',
      ru: '/icon-r-192.png',
      tr: '/icon-t-192.png',
    };
    
    const iconPath = iconMap[language] || '/icon-e-192.png';
    
    // Update favicon in browser tab
    let faviconLink = document.querySelector("link[rel='icon'][type='image/png']");
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      faviconLink.type = 'image/png';
      document.head.appendChild(faviconLink);
    }
    faviconLink.href = iconPath;
    
    // Update Apple touch icon (for iOS home screen)
    let appleTouchIcon = document.querySelector("link[rel='apple-touch-icon']");
    if (appleTouchIcon) {
      appleTouchIcon.href = iconPath;
    }
  }, [language]);

  return (
    <>
      {!isHomePage && (
        <>
          <Sidebar />
          <MobileNav />
        </>
      )}
      <Component {...pageProps} />
    </>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <DarkModeProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <TaxProvider>
              <SidebarProvider>
                <SecretSettingsProvider>
                  <SecretSettingsModal />
                  <AppContent Component={Component} pageProps={pageProps} />
                </SecretSettingsProvider>
              </SidebarProvider>
            </TaxProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </DarkModeProvider>
    </ErrorBoundary>
  );
}

export default MyApp;

