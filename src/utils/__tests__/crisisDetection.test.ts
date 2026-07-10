// src/utils/__tests__/crisisDetection.test.ts

import { evaluateCrisis } from '../../utils/crisisDetection';

// Mock the environment variable for VITE_AI_BACKEND_URL
// @ts-ignore
process.env.VITE_AI_BACKEND_URL = 'http://localhost:3000';

describe('evaluateCrisis', () => {
  const originalFetch = global.fetch as any;

  afterEach(() => {
    (global.fetch as any) = originalFetch;
  });

  test('classifier triggers high risk when keyword scan is low', async () => {
    (global.fetch as any) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ risk_level: 'high' })
    });

    const text = "I don't feel like waking up tomorrow"; // no explicit keywords
    const result = await evaluateCrisis(text);
    expect(result.assessment.level).toBe('high');
    expect(result.triggeredBy).toBe('classifier');
  });

  test('keyword triggers without classifier', async () => {
    (global.fetch as any) = jest.fn().mockRejectedValue(new Error('Network error'));
    const text = 'I feel hopeless and alone forever'; // contains high‑risk keyword
    const result = await evaluateCrisis(text);
    expect(['high', 'severe']).toContain(result.assessment.level);
    expect(result.triggeredBy).toBe('keyword');
  });
});
