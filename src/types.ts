export interface CutoffEntry {
  rank: number | null;
  percentile: number | null;
}

export interface CollegeRecord {
  collegeName: string;
  code: string;
  region: string;
  district?: string;
  type: string; // "Government", "Government Autonomous", "Aided", "Autonomous", "Private"
  branch: string;
  cutoffs: Record<string, CutoffEntry>;
  autonomous: boolean;
  location: string;
  choiceCode: string;
  university: string;
}

export interface StudentProfile {
  name: string;
  mobile?: string;
  percentage: number;
  gender: 'Male' | 'Female' | 'Other';
  category: string; // "OPEN", "OBC", "EWS", "SC", "ST", "NT-A", "NT-B", "NT-C", "NT-D", "SBC", "TFWS"
  regions: string[]; // selected regions or ["Entire Maharashtra"]
  branches: string[]; // e.g. ["Computer Engineering", "Information Technology", ...]
  collegeTypes: string[]; // e.g. ["Government", "Government Autonomous", "Aided", "Autonomous", "Private"]
}

export interface PredictionResult {
  college: CollegeRecord;
  matchedCutoffCategory: string; // the specific code in PDF, e.g., "GOBC" or "LOPEN"
  cutoffPercent: number;
  difference: number; // studentPercentage - cutoffPercent
  probability: number; // 0 - 100 percentage
  chanceStatus: 'Safe' | 'High Chance' | 'Moderate Chance' | 'Low Chance' | 'Dream';
}

export interface DashboardStats {
  totalMatched: number;
  highestProbability: number;
  governmentCount: number;
  autonomousCount: number;
  bestRecommended: {
    collegeName: string;
    branch: string;
    probability: number;
    chanceStatus: string;
    cutoffPercent: number;
  } | null;
}
