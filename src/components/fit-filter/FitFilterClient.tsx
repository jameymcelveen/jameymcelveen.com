'use client';

import { useEffect, useState } from 'react';
import { LabFooter, LabPageHeader } from '@/components/lab/LabPageHeader';
import { ManualJobForm } from '@/components/lab/ManualJobForm';
import { takeFitFilterDraft } from '@/lib/fit-filter/draft';
import { FIT_FILTER_PARSE_ERROR, FIT_FILTER_UNAVAILABLE_ERROR } from '@/lib/fit-filter/messages';
import type { FitFilterResult } from '@/lib/fit-filter/types';
import { addManualBoardJob, extractJobUrl } from '@/lib/the-board/manual';
import { THE_BOARD_PATH, THE_TRACKER_PATH } from '@/lib/fit-filter/path';
import { upsertFavorite } from '@/lib/tracker/store';

const STATUS_META = {
  pass: { label: 'PASS', color: '#546223' },
  fail: { label: 'FAIL', color: '#B94700' },
  unknown: { label: 'UNKNOWN', color: '#8A8378' },
} as const;

const VERDICT_META = {
  APPLY: { color: '#546223', sub: 'Build the kit.' },
  SKIP: { color: '#B94700', sub: 'Not worth a keystroke.' },
  BORDERLINE: { color: '#8A6D1F', sub: 'Human judgment call.' },
} as const;

type FilterState = 'idle' | 'running' | 'done' | 'error';

export function FitFilterClient() {
  const [jd, setJd] = useState('');
  const [state, setState] = useState<FilterState>('idle');
  const [result, setResult] = useState<FitFilterResult | null>(null);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    const draft = takeFitFilterDraft();
    if (draft) setJd(draft);
  }, []);

  const runFilter = async () => {
    if (!jd.trim() || state === 'running') return;
    setState('running');
    setResult(null);
    setErrMsg('');
    try {
      const response = await fetch('/api/fit-filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd: jd.slice(0, 12_000) }),
      });
      const data = (await response.json()) as { result?: FitFilterResult; error?: string };
      if (!response.ok || !data.result) {
        setErrMsg(
          data.error ||
            (response.status === 422 ? FIT_FILTER_PARSE_ERROR : FIT_FILTER_UNAVAILABLE_ERROR)
        );
        setState('error');
        return;
      }
      setResult(data.result);
      setState('done');
    } catch {
      setErrMsg(FIT_FILTER_PARSE_ERROR);
      setState('error');
    }
  };

  const reset = () => {
    setState('idle');
    setResult(null);
    setJd('');
    setErrMsg('');
  };

  const vMeta = result ? (VERDICT_META[result.verdict] ?? VERDICT_META.BORDERLINE) : null;

  return (
    <div className="lab-page">
      <div className="lab-page__inner">
        <LabPageHeader
          eyebrow="FIELD INSPECTION"
          title="The Fit Filter"
          lede="Titles lie. Requirement lists do not. Paste a job posting and this tool runs it through the same three gates I apply to my own search: comp, load-bearing qualifications, and day shape. Most postings should fail. That is the point."
        />

        {state !== 'done' && (
          <section style={{ padding: '28px 0' }}>
            <label
              htmlFor="jd"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: '#8A8378',
                marginBottom: 8,
              }}
            >
              JOB DESCRIPTION
            </label>
            <textarea
              id="jd"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the posting here. The requirements block matters most."
              rows={10}
              style={{
                width: '100%',
                padding: 14,
                fontSize: 14,
                lineHeight: 1.5,
                fontFamily: 'inherit',
                color: '#2E2A26',
                background: '#FFFFFF',
                border: '1px solid #D9D3CA',
                borderRadius: 6,
                resize: 'vertical',
              }}
            />
            {errMsg && (
              <p style={{ color: '#B94700', fontSize: 14, margin: '10px 0 0' }}>{errMsg}</p>
            )}
            <button
              type="button"
              onClick={() => void runFilter()}
              disabled={!jd.trim() || state === 'running'}
              className="fit-filter-display"
              style={{
                marginTop: 14,
                padding: '12px 28px',
                fontWeight: 600,
                fontSize: 15,
                letterSpacing: '0.04em',
                color: '#FCFAF5',
                background: jd.trim() ? '#B94700' : '#C9BFB4',
                border: 'none',
                borderRadius: 6,
                cursor: jd.trim() && state !== 'running' ? 'pointer' : 'default',
              }}
            >
              {state === 'running' ? 'Stamping...' : 'Run the gates'}
            </button>
            {state === 'running' && (
              <div
                className="fit-filter-pulse"
                style={{ marginTop: 18, fontSize: 13, color: '#8A8378' }}
              >
                Reading the requirements block, not the title.
              </div>
            )}
          </section>
        )}

        {state === 'done' && result && vMeta && (
          <section style={{ padding: '32px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 28px' }}>
              <div
                className="fit-filter-stamp fit-filter-display"
                style={{
                  fontWeight: 800,
                  fontSize: 'clamp(34px, 9vw, 56px)',
                  letterSpacing: '0.08em',
                  color: vMeta.color,
                  border: `4px solid ${vMeta.color}`,
                  borderRadius: 10,
                  padding: '6px 28px',
                  transform: 'rotate(-4deg)',
                  maskImage: 'radial-gradient(circle at 30% 40%, black 92%, transparent 100%)',
                }}
              >
                {result.verdict}
              </div>
            </div>
            <p
              style={{
                textAlign: 'center',
                margin: '0 0 4px',
                fontSize: 17,
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              {result.headline}
            </p>
            <p style={{ textAlign: 'center', margin: '0 0 32px', fontSize: 13, color: '#8A8378' }}>
              {vMeta.sub}
            </p>

            {result.ats && (
              <div style={{ marginBottom: 32 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    color: '#8A8378',
                    marginBottom: 10,
                  }}
                >
                  WHAT THE ROBOTS SEE
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    className="fit-filter-display"
                    style={{ fontWeight: 800, fontSize: 34, minWidth: 88 }}
                  >
                    {result.ats.score}%
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        height: 8,
                        background: '#EAE4DA',
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          borderRadius: 4,
                          width: `${Math.max(0, Math.min(100, result.ats.score))}%`,
                          background: '#2E2A26',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 12, color: '#8A8378', marginTop: 6 }}>
                      Keyword coverage against my resume. A number, not a judgment.
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                  {result.ats.matched.map((k, i) => (
                    <span
                      key={'m' + i}
                      style={{
                        fontSize: 12,
                        padding: '3px 10px',
                        borderRadius: 99,
                        border: '1px solid #546223',
                        color: '#546223',
                      }}
                    >
                      {k}
                    </span>
                  ))}
                  {result.ats.missing.map((k, i) => (
                    <span
                      key={'x' + i}
                      style={{
                        fontSize: 12,
                        padding: '3px 10px',
                        borderRadius: 99,
                        border: '1px dashed #B94700',
                        color: '#B94700',
                        textDecoration: 'line-through',
                      }}
                    >
                      {k}
                    </span>
                  ))}
                </div>
                {result.verdict === 'SKIP' && result.ats.score >= 70 && (
                  <p
                    style={{
                      margin: '12px 0 0',
                      fontSize: 13,
                      fontStyle: 'italic',
                      color: '#57504A',
                    }}
                  >
                    High keyword match, SKIP verdict. This is exactly why keyword scores are not
                    fit. The gates below explain.
                  </p>
                )}
              </div>
            )}

            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: '#8A8378',
                marginBottom: 10,
              }}
            >
              WHAT THE FILTER SEES
            </div>
            <div style={{ borderTop: '1px solid #D9D3CA' }}>
              {result.gates.map((g, i) => {
                const meta = STATUS_META[g.status] ?? STATUS_META.unknown;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 14,
                      padding: '16px 0',
                      borderBottom: '1px solid #D9D3CA',
                      alignItems: 'baseline',
                    }}
                  >
                    <div
                      className="fit-filter-display"
                      style={{
                        fontWeight: 800,
                        fontSize: 13,
                        letterSpacing: '0.08em',
                        color: meta.color,
                        minWidth: 76,
                      }}
                    >
                      {meta.label}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{g.name}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.5, color: '#57504A' }}>
                        {g.note}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {result.gaps.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    color: '#8A8378',
                    marginBottom: 10,
                  }}
                >
                  HONEST GAPS, NAMED UP FRONT
                </div>
                {result.gaps.map((g, i) => (
                  <p key={i} style={{ margin: '0 0 10px', fontSize: 14, lineHeight: 1.55 }}>
                    <strong>{g.gap}:</strong> <span style={{ color: '#57504A' }}>{g.framing}</span>
                  </p>
                ))}
              </div>
            )}

            {result.angle && (
              <div
                style={{
                  marginTop: 24,
                  padding: '16px 18px',
                  background: '#FFFFFF',
                  border: '1px solid #D9D3CA',
                  borderLeft: '4px solid #B94700',
                  borderRadius: 4,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    color: '#B94700',
                    marginBottom: 6,
                  }}
                >
                  {result.verdict === 'SKIP' ? 'WHY WALKING AWAY IS RIGHT' : 'THE OPENING CLAIM'}
                </div>
                <div style={{ fontSize: 15, lineHeight: 1.55 }}>{result.angle}</div>
              </div>
            )}

            <FitFilterCapture jd={jd} />

            <button
              type="button"
              onClick={reset}
              className="fit-filter-display"
              style={{
                marginTop: 32,
                padding: '10px 22px',
                fontWeight: 600,
                fontSize: 14,
                color: '#2E2A26',
                background: 'transparent',
                border: '1px solid #D9D3CA',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Run another posting
            </button>
          </section>
        )}

        <LabFooter>
          A keyword that clears an ATS but collapses in the first technical screen is worse than not
          applying. Adjacencies get surfaced; depth never gets invented.
          <br />
          JAMEY McELVEEN | Principal Software Architect | jameymcelveen.com
        </LabFooter>
      </div>
    </div>
  );
}

function FitFilterCapture({ jd }: { jd: string }) {
  const [open, setOpen] = useState<'board' | 'tracker' | null>(null);
  const [done, setDone] = useState<'board' | 'tracker' | null>(null);
  const defaultUrl = extractJobUrl(jd) ?? '';

  if (done === 'board') {
    return (
      <p className="board-notice" style={{ marginTop: 24 }}>
        Pinned to the <a href={THE_BOARD_PATH}>Board</a>. Only on this browser.
      </p>
    );
  }
  if (done === 'tracker') {
    return (
      <p className="board-notice" style={{ marginTop: 24 }}>
        Saved to <a href={THE_TRACKER_PATH}>Tracker</a> as Favorite.
      </p>
    );
  }

  return (
    <div style={{ marginTop: 28 }}>
      <p className="board-section-label" style={{ marginTop: 0 }}>
        Keep it
      </p>
      <div className="lab-cta-row">
        <button type="button" className="lab-btn lab-btn--solid" onClick={() => setOpen('board')}>
          Add to Board
        </button>
        <button type="button" className="lab-btn" onClick={() => setOpen('tracker')}>
          Add to Tracker
        </button>
      </div>
      {open ? (
        <ManualJobForm
          submitLabel={open === 'board' ? 'Pin to Board' : 'Add to Favorite'}
          defaultUrl={defaultUrl}
          onCancel={() => setOpen(null)}
          onSubmit={(fields) => {
            if (open === 'board') {
              addManualBoardJob({ ...fields, body: jd });
              setDone('board');
            } else {
              upsertFavorite({
                title: fields.title,
                company: fields.company,
                sourceUrl: fields.url || undefined,
                notes: fields.notes,
                isManual: true,
              });
              setDone('tracker');
            }
            setOpen(null);
          }}
        />
      ) : null}
    </div>
  );
}
