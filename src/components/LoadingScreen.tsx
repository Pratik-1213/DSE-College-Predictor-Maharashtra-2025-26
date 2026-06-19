import React, { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [step, setStep] = useState(0);

  const steps = [
    'Filtering Colleges matching preferences...',
    'Matching candidate Category & Quota seats...',
    'Calculating admission probability thresholds...',
    'Ranking Colleges and generating options strategy...'
  ];

  useEffect(() => {
    const timers: number[] = [];

    // Trigger steps sequentially
    steps.forEach((_, index) => {
      const timer = window.setTimeout(() => {
        setStep(index + 1);
      }, (index + 1) * 600); // 600ms per step
      timers.push(timer);
    });

    // Complete loading after the last step
    const finalTimer = window.setTimeout(() => {
      onComplete();
    }, (steps.length + 0.4) * 600);
    timers.push(finalTimer);

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-lg my-12 text-center flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
      
      {/* Animated Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-primary to-secondary animate-pulse" />

      {/* Spinner / Circle Loader */}
      <div className="relative w-20 h-20 flex items-center justify-center mb-8">
        <Loader2 className="w-14 h-14 text-primary animate-spin" />
        <div className="absolute w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 animate-ping" />
      </div>

      <div className="space-y-2 mb-8">
        <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
          Analyzing CAP Cutoffs...
        </h3>
        <p className="text-[12px] text-text-muted font-medium">
          Processing 50,000+ cutoff records from direct second year data
        </p>
      </div>

      {/* Progress checklist */}
      <div className="w-full max-w-sm space-y-4">
        {steps.map((text, idx) => {
          const isDone = step > idx;
          const isCurrent = step === idx;

          return (
            <div 
              key={idx} 
              className={`flex items-center space-x-3.5 text-left transition-all duration-300 ${
                isDone 
                  ? 'text-slate-900 dark:text-slate-100 font-semibold' 
                  : isCurrent 
                    ? 'text-primary dark:text-secondary font-semibold' 
                    : 'text-slate-400 dark:text-slate-600 font-medium'
              }`}
            >
              <div 
                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  isDone 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20' 
                    : isCurrent 
                      ? 'border-primary text-primary animate-pulse' 
                      : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <div className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-primary' : 'bg-transparent'}`} />
                )}
              </div>
              <span className="text-xs sm:text-sm leading-tight transition-all">
                {text}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-text-muted mt-8 italic font-semibold">
        Generating your strategic report...
      </p>

    </div>
  );
}
