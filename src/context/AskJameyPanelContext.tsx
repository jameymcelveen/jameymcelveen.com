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
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const AskJameyChatPanelLazy = dynamic(
  () => import('@/components/AskJameyChatPanel').then((m) => ({ default: m.AskJameyChatPanel })),
  { ssr: false, loading: () => null }
);

const ASK_JAMEY_AVATAR = '/images/ask-jamey.webp';

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
        <AskJameyChatPanelLazy onClose={onClose} />
      </>
    );
  }

  return (
    <div
      className="group fixed right-6 bottom-6 z-50 flex flex-col items-end gap-1"
      style={{ willChange: 'transform' }}
    >
      <span className="text-[var(--text-muted)] pointer-events-none max-w-[7rem] text-right font-mono text-[10px] tracking-wide opacity-0 transition-opacity duration-200 sm:opacity-100 group-hover:opacity-100">
        Ask Jamey
      </span>
      <button
        type="button"
        onClick={openAskJamey}
        className={
          'ask-jamey-fab flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[rgba(255,255,255,0.15)] shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-transform hover:scale-105' +
          (fabPulse ? ' ask-jamey-fab-pulse-once' : '')
        }
        aria-label="Open Ask Jamey — AI trained on Jamey’s professional background"
        onAnimationEnd={() => setFabPulse(false)}
      >
        <Image
          src={ASK_JAMEY_AVATAR}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 object-cover"
          sizes="56px"
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
