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
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { InterviewConsole } from '@/components/InterviewConsole';

const ASK_JAMEY_AVATAR = '/ask-jamey.png';

type AskJameyPanelContextValue = {
  openAskJamey: () => void;
  closeAskJamey: () => void;
  /** @deprecated Use openAskJamey */
  openBill: () => void;
  /** @deprecated Use closeAskJamey */
  closeBill: () => void;
};

const AskJameyPanelContext = createContext<AskJameyPanelContextValue | null>(null);

export function useAskJameyPanel(): AskJameyPanelContextValue {
  const ctx = useContext(AskJameyPanelContext);
  if (!ctx) throw new Error('useAskJameyPanel must be used within AskJameyPanelProvider');
  return ctx;
}

/** @deprecated Use useAskJameyPanel */
export const useBillPanel = useAskJameyPanel;

function AskJameyBubbleHost({
  open,
  openAskJamey,
  onClose,
}: {
  open: boolean;
  openAskJamey: () => void;
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
          className="fixed inset-0 z-[49] bg-black/45 backdrop-blur-[2px] sm:hidden"
          onClick={onClose}
          aria-label="Close chat"
        />
        <div
          className="ask-jamey-panel-enter glass-panel-strong fixed inset-x-0 bottom-0 z-50 flex h-[min(70dvh,580px)] max-h-[580px] w-full flex-col overflow-hidden rounded-t-[var(--radius-card)] border border-[var(--glass-border)] sm:inset-auto sm:bottom-6 sm:right-6 sm:left-auto sm:h-[min(580px,calc(100dvh-8rem))] sm:max-h-[580px] sm:w-[min(420px,calc(100vw-3rem))] sm:rounded-[var(--radius-card)]"
          style={{ willChange: 'transform' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ask-jamey-panel-title"
        >
          <span id="ask-jamey-panel-title" className="sr-only">
            Ask Jamey
          </span>
          <InterviewConsole variant="bubble" onClose={onClose} />
        </div>
      </>
    );
  }

  return (
    <div
      className="group fixed right-6 bottom-6 z-50 flex flex-col items-end gap-1"
      style={{ willChange: 'transform' }}
    >
      <span className="text-foreground-muted pointer-events-none max-w-[7rem] text-right font-mono text-[10px] tracking-wide opacity-0 transition-opacity duration-200 sm:opacity-100 group-hover:opacity-100">
        Ask Jamey
      </span>
      <button
        type="button"
        onClick={openAskJamey}
        className={
          'glass-panel-strong flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--glass-border)] shadow-[var(--glass-shadow)] ring-1 ring-[var(--clemson-orange)]/20 transition-[transform,box-shadow] hover:ring-[var(--clemson-orange)]/35' +
          (fabPulse ? ' bill-fab-pulse-once' : '')
        }
        aria-label="Open Ask Jamey — AI trained on Jamey’s professional background"
        onAnimationEnd={() => setFabPulse(false)}
      >
        <Image
          src={ASK_JAMEY_AVATAR}
          alt=""
          width={52}
          height={52}
          className="h-[52px] w-[52px] object-cover"
          priority
        />
      </button>
    </div>
  );
}

export function AskJameyPanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openAskJamey = useCallback(() => setOpen(true), []);
  const closeAskJamey = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({
      openAskJamey,
      closeAskJamey,
      openBill: openAskJamey,
      closeBill: closeAskJamey,
    }),
    [openAskJamey, closeAskJamey]
  );

  return (
    <AskJameyPanelContext.Provider value={value}>
      {children}
      <AskJameyBubbleHost open={open} openAskJamey={openAskJamey} onClose={closeAskJamey} />
    </AskJameyPanelContext.Provider>
  );
}

/** @deprecated Use AskJameyPanelProvider */
export const BillPanelProvider = AskJameyPanelProvider;
