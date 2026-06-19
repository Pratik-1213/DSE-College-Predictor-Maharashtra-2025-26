import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, User, Percent, HelpCircle, Layers, Check, MapPin, Building } from 'lucide-react';
import { StudentProfile } from '../types';
import { getBranchesFromGroups } from '../utils/predictionEngine';

interface PredictionFormProps {
  onSubmit: (profile: StudentProfile) => void;
  onBackToHome: () => void;
}

export default function PredictionForm({ onSubmit, onBackToHome }: PredictionFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [percentage, setPercentage] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [category, setCategory] = useState('OPEN');
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['Entire Maharashtra']);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['Computer Group']);
  const [collegePreferences, setCollegePreferences] = useState<string[]>(['All Colleges']);
  
  const [validationError, setValidationError] = useState('');

  const stepsList = [
    { num: 1, label: 'Student Details', desc: 'Name, marks & gender' },
    { num: 2, label: 'Category', desc: 'Select CAP category' },
    { num: 3, label: 'Region', desc: 'Filter by locations' },
    { num: 4, label: 'Branch Selection', desc: 'Career group pathways' },
    { num: 5, label: 'College Preference', desc: 'Select college type criteria' }
  ];

  const categoriesList = ['OPEN', 'OBC', 'SEBC', 'EWS', 'SC', 'ST', 'NT-A', 'NT-B', 'NT-C', 'NT-D', 'TFWS'];
  const regionsList = ['Pune', 'Mumbai', 'Nashik', 'Nagpur', 'Amravati', 'Aurangabad', 'Konkan', 'Entire Maharashtra'];
  
  const branchGroups = [
    {
      id: 'Computer Group',
      title: 'Computer Group',
      desc: 'Computer Engg, CSE, IT, AI & DS, AI & ML, Cyber Security, IoT, Data Science',
      branches: ['Computer Engg', 'CSE', 'IT', 'AI & DS', 'AI & ML', 'Cyber Security', 'IoT']
    },
    {
      id: 'Electronics Group',
      title: 'Electronics Group',
      desc: 'Electronics, Electronics & Telecommunication (EXTC), Electronics & Computer Engg',
      branches: ['EXTC', 'Electronics', 'Electronics & Computer']
    },
    {
      id: 'Mechanical Group',
      title: 'Mechanical Group',
      desc: 'Mechanical Engineering, Production Engineering, Manufacturing Engineering',
      branches: ['Mechanical', 'Production', 'Manufacturing']
    }
  ];

  const collegePrefsList = [
    { id: 'Government Only', label: 'Government / University Dept. Only' },
    { id: 'Autonomous Preferred', label: 'Autonomous Colleges Preferred' },
    { id: 'Aided Only', label: 'Aided Colleges Only' },
    { id: 'Private Included', label: 'Un-Aided / Private Included' },
    { id: 'All Colleges', label: 'All Colleges (No filter)' }
  ];

  // Quick Tips based on steps
  const getQuickTip = () => {
    switch (currentStep) {
      case 1:
        return "Enter your Diploma aggregate percentage out of 100. Be accurate as predictions depend directly on previous years' cutoffs.";
      case 2:
        return "Select your official CAP admission category. TFWS is for Tuition Fee Waiver Scheme (only merit-based, requires income certificate).";
      case 3:
        return "You can select multiple regions to check opportunities in different cities, or select 'Entire Maharashtra' to browse all colleges.";
      case 4:
        return "Selecting a career group will automatically search for all related branches (e.g. computer group includes IT & AI-DS) to increase your chance of admission.";
      case 5:
        return "Choose your college management types. Government colleges have lower fees, and autonomous colleges have custom curriculum.";
      default:
        return "Fill out each step carefully to get the best prediction report.";
    }
  };

  const handleNext = () => {
    setValidationError('');
    
    if (currentStep === 1) {
      if (!name.trim()) {
        setValidationError('Please enter your name.');
        return;
      }
      const score = parseFloat(percentage);
      if (isNaN(score) || score < 35 || score > 100) {
        setValidationError('Please enter a valid Diploma percentage between 35.00% and 100.00%.');
        return;
      }
    }

    if (currentStep === 3) {
      if (selectedRegions.length === 0) {
        setValidationError('Please select at least one region or Entire Maharashtra.');
        return;
      }
    }

    if (currentStep === 4) {
      if (selectedGroups.length === 0) {
        setValidationError('Please select at least one career branch group.');
        return;
      }
    }

    if (currentStep === 5) {
      // Form Submission
      const profileBranches = getBranchesFromGroups(selectedGroups);
      onSubmit({
        name,
        mobile: mobile.trim() ? mobile : undefined,
        percentage: parseFloat(percentage),
        gender,
        category,
        regions: selectedRegions,
        branches: profileBranches,
        collegeTypes: collegePreferences
      });
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setValidationError('');
    if (currentStep === 1) {
      onBackToHome();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSelectRegion = (region: string) => {
    if (region === 'Entire Maharashtra') {
      setSelectedRegions(['Entire Maharashtra']);
    } else {
      const filtered = selectedRegions.filter(r => r !== 'Entire Maharashtra');
      if (filtered.includes(region)) {
        const next = filtered.filter(r => r !== region);
        setSelectedRegions(next.length === 0 ? ['Entire Maharashtra'] : next);
      } else {
        setSelectedRegions([...filtered, region]);
      }
    }
  };

  const handleSelectGroup = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(g => g !== groupId));
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };

  const handleSelectPref = (prefId: string) => {
    if (prefId === 'All Colleges') {
      setCollegePreferences(['All Colleges']);
    } else {
      const filtered = collegePreferences.filter(p => p !== 'All Colleges');
      if (filtered.includes(prefId)) {
        const next = filtered.filter(p => p !== prefId);
        setCollegePreferences(next.length === 0 ? ['All Colleges'] : next);
      } else {
        setCollegePreferences([...filtered, prefId]);
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Progress Sidebar */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="font-display font-bold text-lg text-slate-900 text-left">
              Prediction Process
            </h3>

            {/* Vertical Progress Bar */}
            <div className="relative flex flex-col space-y-5">
              <div className="absolute left-[17px] top-[15px] bottom-[15px] w-0.5 bg-slate-200 pointer-events-none" />
              
              {stepsList.map((step) => {
                const isActive = step.num === currentStep;
                const isCompleted = step.num < currentStep;
                return (
                  <div key={step.num} className="flex items-start space-x-3.5 text-left relative z-10">
                    <div 
                      className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center border transition-all duration-300 ${
                        isActive 
                          ? 'bg-primary border-primary text-white ring-4 ring-primary/15' 
                          : isCompleted 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : step.num}
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className={`font-semibold text-[13.5px] leading-tight ${isActive ? 'text-primary' : 'text-slate-800'}`}>
                        {step.label}
                      </span>
                      <span className="text-[11px] text-text-muted mt-0.5">
                        {step.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Tip Box */}
          <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl shadow-sm text-left flex items-start space-x-3">
            <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-display font-bold text-[13px] text-amber-800">
                Quick Tip
              </h4>
              <p className="text-amber-800/80 font-sans text-xs font-semibold leading-relaxed">
                {getQuickTip()}
              </p>
            </div>
          </div>
        </div>

        {/* Right Step Card Container */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col justify-between min-h-[460px]">
          
          <div className="space-y-6 text-left">
            {/* Header */}
            <div>
              <span className="font-display font-bold text-xs text-primary uppercase tracking-widest">
                Step {currentStep} of 5
              </span>
              <h2 className="font-display font-extrabold text-2xl text-slate-900 mt-1">
                {stepsList[currentStep - 1].label}
              </h2>
              <div className="h-1 w-12 bg-primary rounded-full mt-2" />
            </div>

            {/* Validation Error Alert */}
            {validationError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg p-3.5 text-xs font-semibold font-sans">
                {validationError}
              </div>
            )}

            {/* --- STEP 1: Candidate Details --- */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="flex flex-col space-y-2 text-left">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Student Full Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-150"
                  />
                </div>

                <div className="flex flex-col space-y-2 text-left">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <Percent className="w-4 h-4 text-slate-400" />
                    <span>Diploma Percentage / Marks</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 89.45"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-150"
                  />
                </div>

                <div className="flex flex-col space-y-2 text-left">
                  <label className="text-xs font-bold text-slate-700">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-150"
                  />
                </div>

                <div className="flex flex-col space-y-2 text-left">
                  <label className="text-xs font-bold text-slate-700">
                    Gender
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <label 
                        key={g} 
                        className={`flex items-center justify-center space-x-2 border rounded-xl p-3 cursor-pointer select-none transition-all duration-200 ${
                          gender === g 
                            ? 'bg-primary/10 border-primary text-primary font-bold' 
                            : 'border-slate-200 hover:bg-slate-50 font-semibold text-slate-600'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="gender" 
                          value={g} 
                          checked={gender === g} 
                          onChange={() => setGender(g as any)}
                          className="hidden" 
                        />
                        <span className="text-xs">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 2: Category Selector --- */}
            {currentStep === 2 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
                {categoriesList.map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => setCategory(cat)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                      category === cat 
                        ? 'bg-primary/10 border-primary shadow-sm text-primary ring-2 ring-primary/10' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-display font-extrabold text-sm tracking-wide">
                        {cat}
                      </span>
                      {category === cat && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-text-muted mt-2 font-semibold">
                      {cat === 'OPEN' ? 'General Merit' : cat === 'TFWS' ? 'Merit Fee Waiver' : cat === 'SEBC' ? 'Socially & Educationally BC' : cat === 'EWS' ? 'Economically Weaker Section' : `${cat} Category`}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* --- STEP 3: Region Selector --- */}
            {currentStep === 3 && (
              <div className="space-y-4 pt-2">
                <p className="text-[12px] text-text-muted font-semibold">
                  Click on the regions to select or deselect. You can choose multiple.
                </p>
                <div className="flex flex-wrap gap-3">
                  {regionsList.map((region) => {
                    const isSelected = selectedRegions.includes(region);
                    return (
                      <button 
                        key={region} 
                        onClick={() => handleSelectRegion(region)}
                        className={`inline-flex items-center space-x-2 px-4 py-3 rounded-xl border text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                          isSelected 
                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/10' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{region}</span>
                        {isSelected && <Check className="w-3 h-3 ml-1 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- STEP 4: Career Groups selector --- */}
            {currentStep === 4 && (
              <div className="flex flex-col space-y-4 pt-2">
                {branchGroups.map((group) => {
                  const isSelected = selectedGroups.includes(group.id);
                  return (
                    <button 
                      key={group.id} 
                      onClick={() => handleSelectGroup(group.id)}
                      className={`p-5 rounded-2xl border text-left flex items-start space-x-4 transition-all duration-200 hover:shadow-sm cursor-pointer ${
                        isSelected 
                          ? 'bg-primary/5 border-primary ring-1 ring-primary/5 shadow-inner' 
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isSelected ? 'bg-primary border-primary text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <div className="flex flex-col text-left space-y-1">
                        <span className="font-display font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                          <Layers className="w-4 h-4 text-slate-400" />
                          <span>{group.title}</span>
                        </span>
                        <p className="text-[11.5px] text-text-muted font-medium leading-relaxed mt-0.5">
                          {group.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* --- STEP 5: College Preferences --- */}
            {currentStep === 5 && (
              <div className="flex flex-col space-y-4 pt-2">
                {collegePrefsList.map((pref) => {
                  const isSelected = collegePreferences.includes(pref.id);
                  return (
                    <button 
                      key={pref.id} 
                      onClick={() => handleSelectPref(pref.id)}
                      className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all duration-200 hover:bg-slate-50 cursor-pointer ${
                        isSelected
                          ? 'bg-primary/5 border-primary ring-1 ring-primary/5 font-semibold text-primary'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="font-sans font-semibold text-xs sm:text-sm flex items-center space-x-3">
                        <Building className="w-4.5 h-4.5 text-slate-400" />
                        <span>{pref.label}</span>
                      </span>
                      <div className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-primary border-primary text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-6 mt-8">
            <button 
              onClick={handleBack}
              className="flex items-center space-x-2 border border-slate-200 hover:bg-slate-100 px-4 sm:px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-600 cursor-pointer transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentStep === 1 ? 'Home' : 'Back'}</span>
            </button>

            <button 
              onClick={handleNext}
              className="btn-primary flex items-center space-x-2 text-xs sm:text-sm px-6 py-3.5 cursor-pointer"
            >
              <span>{currentStep === 5 ? 'Predict Colleges' : 'Continue'}</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
