'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

// PIN for cover letters access
const CORRECT_PIN = '072995';

const STORAGE_KEY = 'cover-letters-auth';

export function PinGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-foreground-muted animate-pulse">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-sm p-8"
      >
        <div className="mb-6 text-center">
          <Lock className="text-foreground-muted mx-auto mb-4 h-12 w-12" />
          <h2 className="text-foreground text-xl font-semibold">Protected Content</h2>
          <p className="text-foreground-muted mt-2 text-sm">
            Enter PIN to view cover letter templates
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              placeholder="Enter PIN"
              className="border-glass-border bg-background/50 text-foreground placeholder:text-foreground-muted focus:border-accent w-full rounded-lg border px-4 py-3 text-center font-mono text-lg tracking-widest outline-none transition-colors"
              autoFocus
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={pin.length < 6}
            className="bg-accent hover:bg-accent/90 w-full rounded-lg py-3 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Unlock
          </button>
        </form>

        <p className="text-foreground-muted/50 mt-6 text-center text-xs">
          Contact me directly if you need access
        </p>
      </motion.div>
    </div>
  );
}

// Hook to check authentication status
export function useIsAuthenticated() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    setIsAuthenticated(stored === 'true');
  }, []);

  return isAuthenticated;
}

// Compact lock icon that triggers PIN modal - can also hide cover letters
export function SecretLock({ onUnlock, onLock }: { onUnlock: () => void; onLock?: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    // Check if already unlocked
    const stored = sessionStorage.getItem(STORAGE_KEY);
    setIsUnlocked(stored === 'true');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      if (isUnlocked) {
        // Hide cover letters
        sessionStorage.removeItem(STORAGE_KEY);
        setIsUnlocked(false);
        setShowModal(false);
        setError('');
        onLock?.();
      } else {
        // Show cover letters
        sessionStorage.setItem(STORAGE_KEY, 'true');
        setIsUnlocked(true);
        setShowModal(false);
        setError('');
        onUnlock();
      }
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  return (
    <>
      {/* Lock icon - always visible */}
      <button
        onClick={() => setShowModal(true)}
        className="text-foreground-muted/20 hover:text-foreground-muted/40 fixed bottom-6 right-6 z-40 transition-colors duration-500"
        aria-label={isUnlocked ? 'Hide cover letters' : 'Access restricted content'}
      >
        <Lock className="h-4 w-4" strokeWidth={1.5} />
      </button>

      {/* PIN Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-xs p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-foreground-muted mb-2 text-center text-sm">
                {isUnlocked ? 'Enter PIN to hide cover letters' : 'Enter PIN to unlock'}
              </p>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                placeholder="PIN"
                className="border-glass-border bg-background/50 text-foreground placeholder:text-foreground-muted focus:border-accent w-full rounded-lg border px-4 py-3 text-center font-mono tracking-widest outline-none transition-colors"
                autoFocus
              />

              {error && <p className="text-center text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={pin.length < 6}
                className="bg-accent hover:bg-accent/90 w-full rounded-lg py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
              >
                {isUnlocked ? 'Hide' : 'Unlock'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
