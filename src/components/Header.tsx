import React, { useState, useEffect } from 'react';
import { Sun, Moon, GraduationCap, Download, Menu, X } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onNavigate: (view: 'landing' | 'predict' | 'results') => void;
  activeView: string;
}

export default function Header({ darkMode, setDarkMode, onNavigate, activeView }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDownloadGuide = () => {
    // Generate simple guide or trigger standard action
    alert("DSE 2025-26 CAP Admission Option Form Filling Guide will start downloading shortly!");
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-slate-900/80 shadow-md backdrop-blur-md border-b border-slate-200 dark:border-slate-800' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="w-6.5 h-6.5" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-base sm:text-lg leading-tight tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DSE Predictor
            </h1>
            <p className="text-[10px] sm:text-[11px] text-text-muted font-medium font-sans">
              Maharashtra 2025-26
            </p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 font-sans font-semibold text-[13.5px]">
          <button 
            onClick={() => onNavigate('landing')}
            className={`transition-colors duration-200 ${
              activeView === 'landing' 
                ? 'text-primary dark:text-secondary' 
                : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-secondary'
            }`}
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate('predict')}
            className={`transition-colors duration-200 ${
              activeView === 'predict' || activeView === 'results' 
                ? 'text-primary dark:text-secondary' 
                : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-secondary'
            }`}
          >
            Predict
          </button>
          <a 
            href="#features" 
            onClick={() => onNavigate('landing')}
            className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-secondary transition-colors duration-200"
          >
            Features
          </a>
          <a 
            href="#stats" 
            onClick={() => onNavigate('landing')}
            className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-secondary transition-colors duration-200"
          >
            Statistics
          </a>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Theme Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-10 h-10 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Guide Download Button */}
          <button 
            onClick={handleDownloadGuide}
            className="flex items-center space-x-2 text-[12px] bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-4 py-2.5 rounded-lg font-semibold shadow-sm transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            <span>Download Guide</span>
          </button>
        </div>

        {/* Mobile Actions (Menu & Theme) */}
        <div className="flex md:hidden items-center space-x-2">
          {/* Mobile Theme toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
          >
            {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* Hamburger menu */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3 flex flex-col font-semibold text-sm">
          <button 
            onClick={() => {
              onNavigate('landing');
              setMobileMenuOpen(false);
            }}
            className="text-left py-2 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-secondary"
          >
            Home
          </button>
          <button 
            onClick={() => {
              onNavigate('predict');
              setMobileMenuOpen(false);
            }}
            className="text-left py-2 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-secondary"
          >
            Predict
          </button>
          <button 
            onClick={() => {
              onNavigate('landing');
              setMobileMenuOpen(false);
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-left py-2 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-secondary"
          >
            Features
          </button>
          <button 
            onClick={() => {
              onNavigate('landing');
              setMobileMenuOpen(false);
              const el = document.getElementById('stats');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-left py-2 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-secondary"
          >
            Statistics
          </button>

          <button 
            onClick={() => {
              handleDownloadGuide();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center space-x-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 py-2.5 rounded-lg text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Guide</span>
          </button>
        </div>
      )}
    </header>
  );
}
