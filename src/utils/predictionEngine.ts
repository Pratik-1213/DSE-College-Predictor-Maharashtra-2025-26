import { CollegeRecord, CutoffEntry, StudentProfile, PredictionResult, DashboardStats } from '../types';

/**
 * Extracts the percentile value from a CutoffEntry, returning null if missing or null.
 */
function getPercentile(entry: CutoffEntry | undefined): number | null {
  if (!entry || entry.percentile === null || entry.percentile === undefined) return null;
  return entry.percentile;
}

/**
 * Gets the applicable cutoff percentile and key from the college's cutoffs map
 * based on the student's category, gender, and merit fallback rules.
 */
export function getStudentCutoffForCourse(
  cutoffs: Record<string, CutoffEntry>,
  category: string,
  gender: 'Male' | 'Female' | 'Other'
): { matchedKey: string; cutoffValue: number } | null {
  // Build category suffix — handles NT-A → NTA, SEBC stays SEBC, OPEN stays OPEN
  const suffix = category === 'OPEN' ? 'OPEN' : category.replace('-', '');

  const keysToCheck: string[] = [];

  if (category === 'TFWS') {
    keysToCheck.push('TFWS');
  } else if (category === 'EWS') {
    keysToCheck.push('EWS');
  } else {
    const gKey = 'G' + suffix; // e.g. GOBC, GSC, GOPEN, GSEBC
    const lKey = 'L' + suffix; // e.g. LOBC, LSC, LOPEN, LSEBC

    if (gender === 'Female') {
      keysToCheck.push(lKey, gKey);
    } else {
      keysToCheck.push(gKey);
    }
  }

  // Fallback: Maharashtra DSE rules allow category candidates to fill open seats
  if (gender === 'Female') {
    keysToCheck.push('LOPEN', 'GOPEN');
  } else {
    keysToCheck.push('GOPEN');
  }

  // Level 1: Check category-specific keys (find the lowest/most-accessible cutoff)
  let bestKey = '';
  let minCutoff = Infinity;

  const categoryKeys = keysToCheck.filter(k => !k.endsWith('OPEN'));
  for (const key of categoryKeys) {
    const val = getPercentile(cutoffs[key]);
    if (val !== null && val < minCutoff) {
      minCutoff = val;
      bestKey = key;
    }
  }

  // Level 2: Fallback to open seats if no category-specific cutoff found
  if (minCutoff === Infinity) {
    const openKeys = keysToCheck.filter(k => k.endsWith('OPEN'));
    for (const key of openKeys) {
      const val = getPercentile(cutoffs[key]);
      if (val !== null && val < minCutoff) {
        minCutoff = val;
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
        if (t === 'Government Only' && (record.type === 'Government' || record.type === 'Government Autonomous' || record.type === 'University Department')) {
          typeMatch = true;
        } else if (t === 'Autonomous Preferred' && record.autonomous) {
          typeMatch = true;
        } else if (t === 'Private Included' && (record.type === 'Un-Aided' || record.type === 'Private')) {
          typeMatch = true;
        } else if (t === 'Aided Only' && record.type === 'Aided') {
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
          recordBranchLower.includes('data engineering') ||
          recordBranchLower.includes('iot') ||
          recordBranchLower.includes('internet of') ||
          recordBranchLower.includes('industrial iot') ||
          recordBranchLower.includes('software') ||
          recordBranchLower.includes('robotics and artificial') ||
          recordBranchLower.includes('5g') ||
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
          recordBranchLower.includes('power') ||
          recordBranchLower.includes('instrumentation') ||
          recordBranchLower.includes('vlsi') ||
          recordBranchLower.includes('automation and robotics') ||
          recordBranchLower.includes('robotics and automation')
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
          recordBranchLower.includes('mechatronics') ||
          recordBranchLower.includes('additive manufacturing') ||
          recordBranchLower.includes('manufacturing science')
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

  const govtCount = results.filter(r => r.college.type.includes('Government') || r.college.type === 'University Department').length;
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
 *
 * CAP Rule: The system processes options top-to-bottom and FREEZES the student
 * at the first allotment. So the correct strategy is:
 *   1. Dream colleges first (hardest to get — you want to try these first)
 *   2. Low Chance next (still aspirational — worth trying before safer ones)
 *   3. Moderate Chance in the middle
 *   4. High Chance after that
 *   5. Safe backups at the bottom (guaranteed seats — listed last as fallback)
 *
 * Within each tier, sorted by cutoff descending (highest-prestige first).
 */
export function generateCapStrategy(results: PredictionResult[]): PredictionResult[] {
  // Within each bucket sort by cutoff desc (most prestigious first)
  const byCutoff = (a: PredictionResult, b: PredictionResult) => b.cutoffPercent - a.cutoffPercent;

  const dream    = [...results].filter(r => r.chanceStatus === 'Dream').sort(byCutoff);
  const low      = [...results].filter(r => r.chanceStatus === 'Low Chance').sort(byCutoff);
  const moderate = [...results].filter(r => r.chanceStatus === 'Moderate Chance').sort(byCutoff);
  const high     = [...results].filter(r => r.chanceStatus === 'High Chance').sort(byCutoff);
  const safe     = [...results].filter(r => r.chanceStatus === 'Safe').sort(byCutoff);

  const strategyList: PredictionResult[] = [
    ...dream.slice(0, 3),      // up to 3 dream colleges at the top
    ...low.slice(0, 3),        // up to 3 low-chance (aspirational)
    ...moderate.slice(0, 3),   // up to 3 moderate
    ...high.slice(0, 3),       // up to 3 high chance
    ...safe.slice(0, 3),       // up to 3 safe backups at the bottom
  ];

  // Deduplicate (shouldn't be needed but just in case)
  const seen = new Set<string>();
  const deduped = strategyList.filter(r => {
    if (seen.has(r.college.choiceCode)) return false;
    seen.add(r.college.choiceCode);
    return true;
  });

  // If we have fewer than 10, fill remaining from all results (maintaining order: hardest → easiest)
  if (deduped.length < 10) {
    const allSorted = [
      ...dream, ...low, ...moderate, ...high, ...safe
    ];
    for (const r of allSorted) {
      if (deduped.length >= 15) break;
      if (!seen.has(r.college.choiceCode)) {
        deduped.push(r);
        seen.add(r.college.choiceCode);
      }
    }
  }

  return deduped;
}

/**
 * Gets list of branch names corresponding to selected Career Groups.
 */
export function getBranchesFromGroups(groups: string[]): string[] {
  const branchMap: Record<string, string[]> = {
    'Computer Group': [
      'Computer Engineering',
      'Computer Engineering (Software Engineering)',
      'Computer Science',
      'Computer Science and Engineering',
      'Computer Science and Engineering (Artificial Intelligence and Data Science)',
      'Computer Science and Engineering (Artificial Intelligence)',
      'Computer Science and Engineering (Cyber Security)',
      'Computer Science and Engineering (Internet of Things and Cyber Security Including Block Chain Technology)',
      'Computer Science and Engineering (IoT)',
      'Computer Science and Engineering(Artificial Intelligence and Machine Learning)',
      'Computer Science and Engineering(Cyber Security)',
      'Computer Science and Engineering(Data Science)',
      'Computer Science and Information Technology',
      'Computer Science and Technology',
      'Computer Science and Business Systems',
      'Computer Science and Design',
      'Computer Technology',
      'Information Technology',
      'Artificial Intelligence',
      'Artificial Intelligence (AI) and Data Science',
      'Artificial Intelligence and Data Science',
      'Artificial Intelligence and Machine Learning',
      'Cyber Security',
      'Data Science',
      'Data Engineering',
      'Internet of Things (IoT)',
      'Industrial IoT',
      'Robotics and Artificial Intelligence',
      '5G'
    ],
    'Electronics Group': [
      'Electronics Engineering',
      'Electronics Engineering ( VLSI Design and Technology)',
      'Electronics and Telecommunication Engg',
      'Electronics and Communication Engineering',
      'Electronics and Communication (Advanced Communication Technology)',
      'Electronics and Communication(Advanced Communication Technology)',
      'Electronics and Computer Engineering',
      'Electronics and Computer Science',
      'Electronics and BiomedicalÂ Engineering',
      'Electrical Engineering',
      'Electrical Engg[Electronics and Power]',
      'Electrical and Computer Engineering',
      'Electrical and Electronics Engineering',
      'Electrical, Electronics and Power',
      'Instrumentation Engineering',
      'Instrumentation and Control Engineering',
      'Automation and Robotics',
      'Robotics and Automation'
    ],
    'Mechanical Group': [
      'Mechanical Engineering',
      'Mechanical Engineering Automobile',
      'Mechanical Engineering[Sandwich]',
      'Mechanical & Automation Engineering',
      'Mechanical and Mechatronics Engineering (Additive Manufacturing)',
      'Production Engineering',
      'Production Engineering[Sandwich]',
      'Manufacturing Science and Engineering',
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
