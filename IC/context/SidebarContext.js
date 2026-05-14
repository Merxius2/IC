import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Detect screen size on mount and on resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 768); // md breakpoint (consistent with Tailwind)
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    setIsLoading(false);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-close sidebar when screen size changes to large
  useEffect(() => {
    if (isLargeScreen) {
      setIsSidebarOpen(false);
    }
  }, [isLargeScreen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        closeSidebar,
        isLargeScreen,
        isLoading,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    // Return safe defaults during SSR or if used outside provider
    return {
      isSidebarOpen: false,
      setIsSidebarOpen: () => {},
      toggleSidebar: () => {},
      closeSidebar: () => {},
      isLargeScreen: false,
      isLoading: true,
    };
  }
  return context;
};
