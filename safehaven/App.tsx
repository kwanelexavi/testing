import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Landing, About, Learn } from './pages/Views';
import { Blog } from './pages/Blog';
import { ReportModal } from './components/ReportModal';
import { PageView } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('landing');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <Landing 
            onNavigate={setCurrentPage} 
            onOpenReport={() => setIsReportModalOpen(true)} 
          />
        );
      case 'about':
        return <About />;
      case 'blog':
        return <Blog />;
      case 'learn':
        return <Learn />;
      default:
        return (
          <Landing 
            onNavigate={setCurrentPage} 
            onOpenReport={() => setIsReportModalOpen(true)} 
          />
        );
    }
  };

  return (
    <>
      <Layout 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      >
        {renderPage()}
      </Layout>
      
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </>
  );
}

export default App;
