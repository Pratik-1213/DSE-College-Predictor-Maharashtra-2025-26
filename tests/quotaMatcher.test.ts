import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAdmissionChance } from '../src/utils/quotaMatcher.ts';
import type { PredictionMatchResult } from '../src/utils/quotaMatcher.ts';

test('evaluateAdmissionChance assigns HIGH_CHANCE for percentiles well above cutoff', () => {
  const result: PredictionMatchResult = evaluateAdmissionChance(
    95.5,
    92.0,
    'Savitribai Phule Pune University',
    'Savitribai Phule Pune University'
  );
  assert.equal(result.chance, 'HIGH_CHANCE');
  assert.equal(result.difference, 3.5);
  assert.equal(result.isHomeUniversityEligible, true);
  assert.ok(result.recommendationNote.includes('Safe choice'));
});

test('evaluateAdmissionChance assigns MODERATE_CHANCE for percentiles near cutoff', () => {
  const result = evaluateAdmissionChance(
    91.5,
    92.0,
    'Mumbai University',
    'Savitribai Phule Pune University'
  );
  assert.equal(result.chance, 'MODERATE_CHANCE');
  assert.equal(result.difference, -0.5);
  assert.equal(result.isHomeUniversityEligible, false);
});

test('evaluateAdmissionChance assigns DREAM_AMBITIOUS for reach percentiles', () => {
  const result = evaluateAdmissionChance(
    89.0,
    92.0,
    'SPPU',
    'SPPU'
  );
  assert.equal(result.chance, 'DREAM_AMBITIOUS');
  assert.equal(result.difference, -3.0);
  assert.equal(result.isHomeUniversityEligible, true);
});

test('evaluateAdmissionChance assigns LOW_CHANCE when cutoff is too far ahead', () => {
  const result = evaluateAdmissionChance(
    82.0,
    92.0,
    'BATU',
    'SPPU'
  );
  assert.equal(result.chance, 'LOW_CHANCE');
  assert.equal(result.difference, -10.0);
  assert.equal(result.isHomeUniversityEligible, false);
});

test('evaluateAdmissionChance throws RangeError for invalid percentiles', () => {
  assert.throws(() => evaluateAdmissionChance(-1.0, 90.0, 'A', 'A'), RangeError);
  assert.throws(() => evaluateAdmissionChance(95.0, 105.0, 'A', 'A'), RangeError);
});
