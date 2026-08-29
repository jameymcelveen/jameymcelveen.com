export type FitFilterVerdict = 'APPLY' | 'SKIP' | 'BORDERLINE';
export type GateStatus = 'pass' | 'fail' | 'unknown';

export type FitFilterGate = {
  name: string;
  status: GateStatus;
  note: string;
};

export type FitFilterGap = {
  gap: string;
  framing: string;
};

export type FitFilterResult = {
  verdict: FitFilterVerdict;
  headline: string;
  ats: {
    score: number;
    matched: string[];
    missing: string[];
  };
  gates: FitFilterGate[];
  gaps: FitFilterGap[];
  angle: string;
};
