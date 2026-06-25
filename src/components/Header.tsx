import React, { useState, useEffect } from 'react';
import { GraduationCap, Menu, X, Search } from 'lucide-react';

interface HeaderProps {
  onNavigate: (view: 'landing' | 'predict' | 'results' | 'search') => void;
  activeView: string;
  hasResults?: boolean;
}

export default function Header({ onNavigate, activeView, hasResults }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [activeView]);

  const navItems = [
    { label: 'Home',          view: 'landing' as const },
    { label: 'Predict',       view: 'predict' as const },
    { label: 'College Search',view: 'search'  as const },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${
          isScrolled
            ? 'bg-white/95 shadow-md backdrop-blur-md border-b border-slate-200'
            : 'bg-white/80 backdrop-blur-sm border-b border-slate-200/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">

          {/* Brand */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-2.5 group select-none shrink-0 focus:outline-none"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-display font-extrabold text-sm sm:text-base leading-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                DSE Predictor
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium hidden xs:block">
                Maharashtra 2026‑27
              </p>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 font-sans font-semibold text-[13px]">
            {navItems.map(item => {
              const isActive = activeView === item.view
                || (item.view === 'predict' && activeView === 'results');
              return (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`px-4 py-2 rounded-lg transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Start Predicting CTA — desktop only */}
            <button
              onClick={() => onNavigate('predict')}
              className="hidden md:flex btn-primary text-xs px-4 py-2.5"
            >
              Start Predicting
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-all duration-150 cursor-pointer"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-down Menu */}
      <div
        className={`md:hidden fixed top-14 sm:top-16 left-0 right-0 z-40 transition-all duration-200 overflow-hidden ${
          mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white border-b border-slate-200 shadow-lg px-4 pt-2 pb-4 flex flex-col gap-1">
          {navItems.map(item => {
            const isActive = activeView === item.view
              || (item.view === 'predict' && activeView === 'results');
            return (
              <button
                key={item.view}
                onClick={() => { onNavigate(item.view); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          {hasResults && (
            <button
              onClick={() => { onNavigate('results'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer ${
                activeView === 'results'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              My Results
            </button>
          )}
          <div className="border-t border-slate-100 mt-2 pt-3">
            <button
              onClick={() => { onNavigate('predict'); setMobileMenuOpen(false); }}
              className="btn-primary w-full justify-center py-3 text-sm"
            >
              Start Predicting
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
