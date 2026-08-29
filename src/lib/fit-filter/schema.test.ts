import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FitFilterParseError, parseFitFilterJson } from './schema.ts';

const valid = {
  verdict: 'SKIP',
  headline: 'Day shape is operations, not building.',
  ats: {
    score: 87,
    matched: ['.NET', 'C#', 'PostgreSQL'],
    missing: ['K8s', 'Terraform'],
  },
  gates: [
    { name: 'Comp', status: 'pass', note: 'clears the bar' },
    { name: 'Load-bearing quals', status: 'fail', note: 'IaC is required.' },
    { name: 'Day shape', status: 'fail', note: 'This is an SRE rotation.' },
  ],
  gaps: [{ gap: 'Terraform', framing: 'None shipped. Do not apply to IaC-gated roles.' }],
  angle: 'Walking away is right because the week is on-call, not shipping.',
};

describe('parseFitFilterJson', () => {
  it('accepts a valid SKIP payload and keeps the thesis fields', () => {
    const result = parseFitFilterJson(JSON.stringify(valid));
    assert.equal(result.verdict, 'SKIP');
    assert.equal(result.ats.score, 87);
    assert.equal(result.gates.length, 3);
    assert.equal(result.gates[0]?.note, 'clears the bar');
  });

  it('rewrites a leaking Comp note to the allowed phrase', () => {
    const leaking = {
      ...valid,
      gates: [
        { name: 'Comp', status: 'fail', note: 'Below $135K so skip.' },
        valid.gates[1],
        valid.gates[2],
      ],
    };
    const result = parseFitFilterJson(JSON.stringify(leaking));
    assert.equal(result.gates[0]?.note, 'below the bar');
    assert.equal(JSON.stringify(result).includes('135'), false);
  });

  it('clamps score and trims keyword lists', () => {
    const oversized = {
      ...valid,
      ats: {
        score: 140.8,
        matched: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
        missing: ['w', 'x', 'y', 'z', 'extra'],
      },
    };
    const result = parseFitFilterJson(JSON.stringify(oversized));
    assert.equal(result.ats.score, 100);
    assert.equal(result.ats.matched.length, 6);
    assert.equal(result.ats.missing.length, 4);
  });

  it('rejects a verdict outside the enum', () => {
    const bad = { ...valid, verdict: 'MAYBE' };
    assert.throws(() => parseFitFilterJson(JSON.stringify(bad)), FitFilterParseError);
  });

  it('rejects a payload that is not JSON', () => {
    assert.throws(() => parseFitFilterJson('not json at all'), FitFilterParseError);
  });
});
