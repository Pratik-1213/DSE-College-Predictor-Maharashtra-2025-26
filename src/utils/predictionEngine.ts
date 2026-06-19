import { CollegeRecord, StudentProfile, PredictionResult, DashboardStats } from '../types';

/**
 * Gets the applicable cutoff value and key from the college's cutoffs map
 * based on the student's category, gender, and merit fallback rules.
 */
export function getStudentCutoffForCourse(
  cutoffs: Record<string, number>,
  category: string,
  gender: 'Male' | 'Female' | 'Other'
): { matchedKey: string; cutoffValue: number } | null {
  const keysToCheck: string[] = [];
  const suffix = category === 'OPEN' ? 'OPEN' : category.replace('-', '');

  if (category === 'TFWS') {
    keysToCheck.push('TFWS');
  } else if (category === 'EWS') {
    keysToCheck.push('EWS');
  } else {
    const gKey = 'G' + suffix; // e.g. GOBC, GSC, GOPEN
    const lKey = 'L' + suffix; // e.g. LOBC, LSC, LOPEN
    
    if (gender === 'Female') {
      keysToCheck.push(lKey, gKey);
    } else {
      keysToCheck.push(gKey);
    }
  }

  // Fallback: in Maharashtra admissions, category students can always secure open seats
  if (gender === 'Female') {
    keysToCheck.push('LOPEN', 'GOPEN');
  } else {
    keysToCheck.push('GOPEN');
  }

  // Look for the best (lowest) available cutoff from the list of eligible keys
  // Category specific keys are checked first, then open fallbacks.
  let bestKey = '';
  let minCutoff = Infinity;

  // Level 1: Check category specific keys
  const categoryKeys = keysToCheck.filter(k => k.endsWith(suffix) || k === category);
  for (const key of categoryKeys) {
    if (cutoffs[key] !== undefined && cutoffs[key] < minCutoff) {
      minCutoff = cutoffs[key];
      bestKey = key;
    }
  }

  // Level 2: Check open fallbacks if category seats aren't listed
  if (minCutoff === Infinity) {
    const openKeys = keysToCheck.filter(k => k.endsWith('OPEN'));
    for (const key of openKeys) {
      if (cutoffs[key] !== undefined && cutoffs[key] < minCutoff) {
        minCutoff = cutoffs[key];
        bestKey = key;
      }
    }
  }

  if (minCutoff !== Infinity) {
    return { matchedKey: bestKey, cutoffValue: minCutoff };
  }

  return null;
}

/**
 * Predicts admission chances for all colleges in the dataset based on student inputs.
 */
export function predictColleges(
  profile: StudentProfile,
  allRecords: CollegeRecord[]
): PredictionResult[] {
  const results: PredictionResult[] = [];

  for (const record of allRecords) {
    // 1. Region Filter
    if (profile.regions.length > 0 && !profile.regions.includes('Entire Maharashtra')) {
      if (!profile.regions.includes(record.region)) {
        continue;
      }
    }

    // 2. College Type Filter
    if (profile.collegeTypes.length > 0 && !profile.collegeTypes.includes('All Colleges')) {
      let typeMatch = false;
      for (const t of profile.collegeTypes) {
        if (t === 'Government Only' && (record.type === 'Government' || record.type === 'Government Autonomous')) {
          typeMatch = true;
        } else if (t === 'Autonomous Preferred' && record.autonomous) {
          typeMatch = true;
        } else if (t === 'Private Included' && record.type === 'Private') {
          typeMatch = true;
        } else if (t === record.type) {
          typeMatch = true;
        }
      }
      if (!typeMatch) continue;
    }

    // 3. Branch Group Filter
    let branchMatched = false;
    if (profile.branches.length === 0) {
      branchMatched = true;
    } else {
      const recordBranchLower = record.branch.toLowerCase();
      const hasComputer = profile.branches.some(b => b.includes('Computer') || b.includes('Information Technology') || b.includes('Data Science'));
      const hasElectronics = profile.branches.some(b => b.includes('Electronics') || b.includes('Electrical'));
      const hasMechanical = profile.branches.some(b => b.includes('Mechanical') || b.includes('Production'));

      if (hasComputer) {
        if (
          recordBranchLower.includes('computer') ||
          recordBranchLower.includes('information tech') ||
          recordBranchLower.includes('artificial intelligence') ||
          recordBranchLower.includes('ai &') ||
          recordBranchLower.includes('ai-') ||
          recordBranchLower.includes('cyber') ||
          recordBranchLower.includes('data science') ||
          recordBranchLower.includes('iot') ||
          recordBranchLower.includes('internet of') ||
          recordBranchLower.includes('software') ||
          recordBranchLower.includes('systems')
        ) {
          branchMatched = true;
        }
      }
      if (hasElectronics) {
        if (
          recordBranchLower.includes('electronic') ||
          recordBranchLower.includes('telecommunication') ||
          recordBranchLower.includes('communication') ||
          recordBranchLower.includes('extc') ||
          recordBranchLower.includes('electrical') ||
          recordBranchLower.includes('power')
        ) {
          branchMatched = true;
        }
      }
      if (hasMechanical) {
        if (
          recordBranchLower.includes('mechanical') ||
          recordBranchLower.includes('production') ||
          recordBranchLower.includes('manufacturing') ||
          recordBranchLower.includes('automobile') ||
          recordBranchLower.includes('mechatronics')
        ) {
          branchMatched = true;
        }
      }
      
      if (!branchMatched) {
        branchMatched = profile.branches.some(b => {
          const bLower = b.toLowerCase();
          return recordBranchLower.includes(bLower) || bLower.includes(recordBranchLower);
        });
      }
    }

    if (!branchMatched) {
      continue;
    }

    // 4. Cutoff Evaluation
    const matched = getStudentCutoffForCourse(record.cutoffs, profile.category, profile.gender);
    if (!matched) {
      continue;
    }

    const { matchedKey, cutoffValue } = matched;
    const difference = parseFloat((profile.percentage - cutoffValue).toFixed(2));

    // Calculate Chance Category and Admission Probability
    let chanceStatus: PredictionResult['chanceStatus'];
    let probability = 0;

    if (difference >= 0.5) {
      chanceStatus = 'Safe';
      // Range: 90 - 99%
      probability = Math.min(99, Math.round(90 + (difference - 0.5) * 1.5));
    } else if (difference >= 0.0) {
      chanceStatus = 'High Chance';
      // Range: 75 - 89%
      probability = Math.round(75 + (difference / 0.5) * 14.0);
    } else if (difference >= -1.0) {
      chanceStatus = 'Moderate Chance';
      // Range: 50 - 74%
      probability = Math.round(50 + (difference + 1.0) * 24.0);
    } else if (difference >= -2.5) {
      chanceStatus = 'Low Chance';
      // Range: 25 - 49%
      probability = Math.round(25 + ((difference + 2.5) / 1.5) * 24.0);
    } else {
      chanceStatus = 'Dream';
      // Range: 5 - 24%
      probability = Math.max(5, Math.round(24 + (difference + 2.5) * 3.5));
    }

    results.push({
      college: record,
      matchedCutoffCategory: matchedKey,
      cutoffPercent: cutoffValue,
      difference,
      probability,
      chanceStatus
    });
  }

  // Sort by probability desc, then cutoff desc
  return results.sort((a, b) => b.probability - a.probability || b.cutoffPercent - a.cutoffPercent);
}

/**
 * Calculates summary metrics for matched results.
 */
export function getDashboardStats(results: PredictionResult[]): DashboardStats {
  if (results.length === 0) {
    return {
      totalMatched: 0,
      highestProbability: 0,
      governmentCount: 0,
      autonomousCount: 0,
      bestRecommended: null
    };
  }

  const govtCount = results.filter(r => r.college.type.includes('Government')).length;
  const autoCount = results.filter(r => r.college.autonomous).length;
  const highestProb = Math.max(...results.map(r => r.probability));
  
  // Best recommended college: highest probability that is not 99% (if possible, to show a realistic target)
  // or simply the highest-ranked Safe / High Chance college with prestigious cutoff.
  const bestMatch = results[0];

  return {
    totalMatched: results.length,
    highestProbability: highestProb,
    governmentCount: govtCount,
    autonomousCount: autoCount,
    bestRecommended: bestMatch ? {
      collegeName: bestMatch.college.collegeName,
      branch: bestMatch.college.branch,
      probability: bestMatch.probability,
      chanceStatus: bestMatch.chanceStatus,
      cutoffPercent: bestMatch.cutoffPercent
    } : null
  };
}

/**
 * Generates the recommended CAP Form Option Order.
 * CAP Strategy Rules:
 * - 20% Dream Colleges at the top (dream high, no harm trying).
 * - 50% High / Moderate Chance Colleges in the middle (where you are highly competitive).
 * - 30% Safe Colleges at the bottom (guaranteed backups).
 */
export function generateCapStrategy(results: PredictionResult[]): PredictionResult[] {
  // Sort colleges by cutoff percent descending (prestige order)
  const sorted = [...results].sort((a, b) => b.cutoffPercent - a.cutoffPercent);
  
  const dream = sorted.filter(r => r.chanceStatus === 'Dream');
  const highMod = sorted.filter(r => r.chanceStatus === 'High Chance' || r.chanceStatus === 'Moderate Chance');
  const safe = sorted.filter(r => r.chanceStatus === 'Safe' || r.chanceStatus === 'Low Chance'); // Low chance treated as border backup here
  
  const strategyList: PredictionResult[] = [];
  
  // Take top 3 dream colleges
  strategyList.push(...dream.slice(0, 3));
  
  // Take top 6 high/mod chance colleges
  strategyList.push(...highMod.slice(0, 6));
  
  // Take top 4 safe colleges
  strategyList.push(...safe.slice(0, 4));
  
  // If we don't have enough, fill in from what remains
  if (strategyList.length < 10) {
    const ids = new Set(strategyList.map(s => s.college.choiceCode));
    for (const r of sorted) {
      if (strategyList.length >= 12) break;
      if (!ids.has(r.college.choiceCode)) {
        strategyList.push(r);
        ids.add(r.college.choiceCode);
      }
    }
  }
  
  return strategyList;
}

/**
 * Gets list of branch names corresponding to selected Career Groups.
 */
export function getBranchesFromGroups(groups: string[]): string[] {
  const branchMap: Record<string, string[]> = {
    'Computer Group': [
      'Computer Engineering',
      'Computer Science and Engineering',
      'Information Technology',
      'Artificial Intelligence (AI) and Data Science',
      'Artificial Intelligence and Data Science',
      'Artificial Intelligence and Machine Learning',
      'Computer Science and Engineering(Artificial Intelligence and Machine Learning)',
      'Computer Science and Engineering (Artificial Intelligence and Machine Learning)',
      'Computer Science and Engineering (Cyber Security)',
      'Computer Science and Technology',
      'Computer Science and Business Systems',
      'Computer Technology',
      'Cyber Security',
      'Data Science'
    ],
    'Electronics Group': [
      'Electronics Engineering',
      'Electronics and Telecommunication Engg',
      'Electronics and Telecommunication Engineering',
      'Electronics and Communication Engineering',
      'Electronics and Computer Engineering',
      'Electrical Engg[Electronics and Power]',
      'Electrical Engineering'
    ],
    'Mechanical Group': [
      'Mechanical Engineering',
      'Production Engineering',
      'Manufacturing Engineering',
      'Automobile Engineering',
      'Mechatronics Engineering'
    ]
  };

  const selectedBranches: string[] = [];
  for (const group of groups) {
    if (branchMap[group]) {
      selectedBranches.push(...branchMap[group]);
    }
  }
  return selectedBranches;
}
