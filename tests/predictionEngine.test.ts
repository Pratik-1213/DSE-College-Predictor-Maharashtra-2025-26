import test from 'node:test';
import assert from 'node:assert/strict';
import { getStudentCutoffForCourse, predictColleges } from '../src/utils/predictionEngine.ts';
import type { CollegeRecord, StudentProfile } from '../src/types.ts';

test('getStudentCutoffForCourse matches GOPEN for Male Open category', () => {
  const cutoffs = {
    GOPEN: { rank: 1200, percentile: 92.5 },
    LOPEN: { rank: 1400, percentile: 90.0 },
    GOBC: { rank: 2500, percentile: 85.0 },
  };
  const result = getStudentCutoffForCourse(cutoffs, 'OPEN', 'Male');
  assert.ok(result);
  assert.equal(result!.matchedKey, 'GOPEN');
  assert.equal(result!.cutoffValue, 92.5);
});

test('getStudentCutoffForCourse prefers female category LOBC over GOBC for Female OBC student', () => {
  const cutoffs = {
    GOPEN: { rank: 1200, percentile: 95.0 },
    GOBC: { rank: 2500, percentile: 88.0 },
    LOBC: { rank: 3000, percentile: 84.0 },
  };
  const result = getStudentCutoffForCourse(cutoffs, 'OBC', 'Female');
  assert.ok(result);
  assert.equal(result!.matchedKey, 'LOBC');
  assert.equal(result!.cutoffValue, 84.0);
});

test('getStudentCutoffForCourse falls back to GOPEN when category cutoff is not present', () => {
  const cutoffs = {
    GOPEN: { rank: 1500, percentile: 91.0 },
  };
  const result = getStudentCutoffForCourse(cutoffs, 'SC', 'Male');
  assert.ok(result);
  assert.equal(result!.matchedKey, 'GOPEN');
  assert.equal(result!.cutoffValue, 91.0);
});

test('getStudentCutoffForCourse handles TFWS category directly', () => {
  const cutoffs = {
    GOPEN: { rank: 1000, percentile: 96.0 },
    TFWS: { rank: 800, percentile: 97.5 },
  };
  const result = getStudentCutoffForCourse(cutoffs, 'TFWS', 'Male');
  assert.ok(result);
  assert.equal(result!.matchedKey, 'TFWS');
  assert.equal(result!.cutoffValue, 97.5);
});

test('predictColleges correctly filters by region and college type', () => {
  const mockColleges: CollegeRecord[] = [
    {
      choiceCode: '600619110',
      code: '6006',
      collegeName: 'COEP Technological University',
      branch: 'Computer Engineering',
      type: 'Government Autonomous',
      autonomous: true,
      region: 'Pune',
      district: 'Pune',
      location: 'Pune',
      university: 'COEP Tech',
      cutoffs: {
        GOPEN: { rank: 150, percentile: 99.4 },
      },
    },
    {
      choiceCode: '301219110',
      code: '3012',
      collegeName: 'VJTI Mumbai',
      branch: 'Computer Engineering',
      type: 'Government Autonomous',
      autonomous: true,
      region: 'Mumbai',
      district: 'Mumbai',
      location: 'Mumbai',
      university: 'Mumbai University',
      cutoffs: {
        GOPEN: { rank: 200, percentile: 99.1 },
      },
    },
  ];

  const profile: StudentProfile = {
    name: 'Test Student',
    percentage: 99.5,
    category: 'OPEN',
    gender: 'Male',
    branches: ['Computer Engineering'],
    regions: ['Pune'],
    collegeTypes: ['Government Only'],
  };

  const results = predictColleges(profile, mockColleges);
  assert.equal(results.length, 1);
  assert.equal(results[0].college.code, '6006');
  assert.equal(results[0].matchedCutoffCategory, 'GOPEN');
});
