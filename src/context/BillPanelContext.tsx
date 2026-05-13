'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { InterviewConsole } from '@/components/InterviewConsole';

type BillPanelContextValue = {
  openBill: () => void;
  closeBill: () => void;
};

const BillPanelContext = createContext<BillPanelContextValue | null>(null);

export function useBillPanel(): BillPanelContextValue {
  const ctx = useContext(BillPanelContext);
  if (!ctx) throw new Error('useBillPanel must be used within BillPanelProvider');
  return ctx;
}

function BillBubbleHost({
  open,
  openBill,
  onClose,
}: {
  open: boolean;
  openBill: () => void;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [fabPulse, setFabPulse] = useState(true);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (pathname === '/ai') return null;

  if (open) {
    return (
      <>
        <button
          type="button"
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[1px] sm:hidden"
          onClick={onClose}
          aria-label="Close chat"
        />
        <div
          className="fixed inset-x-0 bottom-0 z-[61] flex max-h-[min(85dvh,560px)] w-full flex-col overflow-hidden rounded-t-2xl border border-steel bg-[var(--background)] shadow-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:left-auto sm:h-[520px] sm:max-h-[520px] sm:w-[380px] sm:rounded-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bill-bubble-title"
        >
          <span id="bill-bubble-title" className="sr-only">
            Ask Bill
          </span>
          <InterviewConsole variant="bubble" onClose={onClose} />
        </div>
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={openBill}
      className={
        'border-accent/40 bg-surface hover:border-accent/60 fixed right-6 bottom-6 z-[62] flex h-14 w-14 items-center justify-center rounded-full border-2 text-xl shadow-lg transition-colors hover:bg-surface/90 sm:right-6 sm:bottom-6' +
        (fabPulse ? ' bill-fab-pulse-once' : '')
      }
      aria-label="Open Ask Bill — AI Q&A about Jamey’s experience"
      onAnimationEnd={() => setFabPulse(false)}
    >
      <span aria-hidden className="select-none font-mono text-lg font-bold text-accent">
        B
      </span>
    </button>
  );
}

export function BillPanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openBill = useCallback(() => setOpen(true), []);
  const closeBill = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ openBill, closeBill }), [openBill, closeBill]);

  return (
    <BillPanelContext.Provider value={value}>
      {children}
      <BillBubbleHost open={open} openBill={openBill} onClose={closeBill} />
    </BillPanelContext.Provider>
  );
}
