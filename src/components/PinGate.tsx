'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Simple PIN - change this to your desired PIN
// In production, you might want to use an env variable
const CORRECT_PIN = '1889'; // Change this!

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
          <div className="mb-4 text-4xl">🔒</div>
          <h2 className="text-xl font-semibold text-foreground">Protected Content</h2>
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
              className="bg-background/50 text-foreground placeholder:text-foreground-muted focus:border-accent w-full rounded-lg border border-glass-border px-4 py-3 text-center font-mono text-lg tracking-widest outline-none transition-colors"
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
            disabled={pin.length < 4}
            className="bg-accent text-background hover:bg-accent/90 w-full rounded-lg py-3 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Unlock
          </button>
        </form>

        <p className="text-foreground-muted mt-6 text-center text-xs">
          Contact me directly if you need access
        </p>
      </motion.div>
    </div>
  );
}
