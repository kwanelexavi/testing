import React, { useState, useEffect } from 'react';
import { Menu, X, HeartHandshake, Sun, Moon, Server, WifiOff } from 'lucide-react';
import { PageView } from '../types';
import { ChatBot } from './ChatBot';
import { PanicButton } from './PanicButton';
import { db } from '../services/db';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate, isDarkMode, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Check backend connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await db.checkHealth();
      setIsBackendConnected(connected);
    };
    checkConnection();
    
    // Optional: Poll every 30 seconds to update status
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const NavLink = ({ page, label }: { page: PageView; label: string }) => (
    <button
      onClick={() => {
        onNavigate(page);
        setIsMobileMenuOpen(false);
      }}
      className={`px-4 py-2 rounded-md font-medium transition-colors ${
        currentPage === page
          ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400'
          : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-white dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => onNavigate('landing')} className="flex items-center gap-2 group">
            <HeartHandshake className="text-indigo-600 dark:text-indigo-500 group-hover:scale-110 transition-transform" size={28} />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              SafeHaven
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink page="landing" label="Home" />
            <NavLink page="about" label="About Us" />
            <NavLink page="blog" label="Community Blog" />
            <NavLink page="learn" label="Learn" />
            
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </nav>

          {/* Mobile Menu Controls */}
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              className="p-2 text-gray-600 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-lg p-4 flex flex-col gap-2">
            <NavLink page="landing" label="Home" />
            <NavLink page="about" label="About Us" />
            <NavLink page="blog" label="Community Blog" />
            <NavLink page="learn" label="Learn" />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-300 py-12 border-t dark:border-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <HeartHandshake className="text-indigo-400" size={24} />
                <span className="text-xl font-bold text-white">SafeHaven</span>
              </div>
              <p className="text-gray-400 max-w-sm mb-4">
                Empowering survivors, educating communities, and fostering a world free from gender-based violence.
              </p>
              
              {/* Connection Status Indicator */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${isBackendConnected ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-orange-900/30 border-orange-800 text-orange-400'}`}>
                 {isBackendConnected ? <Server size={14} /> : <WifiOff size={14} />}
                 <span>Backend: {isBackendConnected ? 'Connected (Django)' : 'Offline (LocalStorage)'}</span>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => onNavigate('about')} className="hover:text-indigo-400">About Us</button></li>
                <li><button onClick={() => onNavigate('blog')} className="hover:text-indigo-400">Blog</button></li>
                <li><button onClick={() => onNavigate('learn')} className="hover:text-indigo-400">Resources</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Emergency</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded">HOTLINE</span>
                  <span className="font-mono">911</span>
                </li>
                <li>Helpline: 1-800-SAFE-HELP</li>
                <li className="text-xs text-gray-500 mt-2">Available 24/7. Anonymous.</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SafeHaven. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ChatBot is always available */}
      <ChatBot />
      {/* Panic Button is always available */}
      <PanicButton />
    </div>
  );
};
