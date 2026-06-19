import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PredictionForm from './components/PredictionForm';
import LoadingScreen from './components/LoadingScreen';
import ResultsDashboard from './components/ResultsDashboard';
import { StudentProfile, PredictionResult } from './types';
import { predictColleges } from './utils/predictionEngine';

// Import local JSON cutoff data
import cutoffDataRaw from './data/cutoff_data.json';
import { CollegeRecord } from './types';

// Cast the JSON import to our CollegeRecord array
const cutoffDataset = cutoffDataRaw as CollegeRecord[];

export default function App() {
  const [view, setView] = useState<'landing' | 'predict' | 'loading' | 'results'>('landing');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Check localStorage or system preferences
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [predictionResults, setPredictionResults] = useState<PredictionResult[]>([]);

  // Synchronize theme class with DOM
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Handle form submission
  const handleFormSubmit = (profile: StudentProfile) => {
    setStudentProfile(profile);
    
    // Execute prediction calculations
    const results = predictColleges(profile, cutoffDataset);
    setPredictionResults(results);
    
    // Move to loading animation screen
    setView('loading');
  };

  // Handle loading animation completion
  const handleLoadingComplete = () => {
    setView('results');
    // Scroll to top of results dashboard
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle direct navigation from header links
  const handleNavigate = (targetView: 'landing' | 'predict' | 'results') => {
    if (targetView === 'results' && predictionResults.length === 0) {
      setView('predict');
    } else if (targetView === 'results') {
      setView('results');
    } else {
      setView(targetView);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-custom text-card-foreground transition-colors duration-300">
      {/* Navigation Header */}
      <Header 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        onNavigate={handleNavigate}
        activeView={view === 'loading' ? 'predict' : view}
      />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center">
        {view === 'landing' && (
          <HeroSection onStartPredicting={() => setView('predict')} />
        )}
        
        {view === 'predict' && (
          <PredictionForm 
            onSubmit={handleFormSubmit} 
            onBackToHome={() => setView('landing')} 
          />
        )}

        {view === 'loading' && (
          <LoadingScreen onComplete={handleLoadingComplete} />
        )}

        {view === 'results' && studentProfile && (
          <ResultsDashboard 
            results={predictionResults} 
            profile={studentProfile} 
            onBack={() => setView('predict')} 
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="w-full bg-slate-900 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800 font-sans text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-1.5">
            <span className="font-display font-extrabold text-sm text-white tracking-wider">DSE College Predictor Maharashtra</span>
            <p className="font-semibold text-slate-400">
              Made with ❤️ for Diploma Students seeking Engineering Admissions.
            </p>
          </div>
          <div className="text-left md:text-right font-medium text-[11px] space-y-1">
            <p>&copy; {new Date().getFullYear()} DSE Predictor Portal. All Rights Reserved.</p>
            <p className="text-slate-500">
              Disclaimer: Predictor results are advisory. Verify choices with the official CET Cell handbook.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
