'use client';

export function ResumePrintButton() {
  return (
    <div className="resume-print__actions no-print">
      <button type="button" className="resume-print__print-btn" onClick={() => window.print()}>
        Print
      </button>
    </div>
  );
}
