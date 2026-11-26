'use client';

import Link from 'next/link';
import { useSyncExternalStore, type ReactNode } from 'react';
import { Moon, Sun } from 'lucide-react';
import '../home/home-chat.css';
import './blog.css';

const THEME_KEY = 'jm:theme';
const THEME_EVENT = 'jm:theme-change';

function currentTheme(): 'light' | 'dark' {
  const set = document.documentElement.dataset.theme;
  if (set === 'light' || set === 'dark') return set;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function subscribeTheme(onChange: () => void) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', onChange);
  window.addEventListener(THEME_EVENT, onChange);
  return () => {
    mq.removeEventListener('change', onChange);
    window.removeEventListener(THEME_EVENT, onChange);
  };
}

/** Top bar and footer for the blog, in the same paper style as the home page. */
export function BlogShell({ children }: { children: ReactNode }) {
  // null on the server, so the first paint matches; the real theme arrives on the client.
  const theme = useSyncExternalStore<'light' | 'dark' | null>(
    subscribeTheme,
    currentTheme,
    () => null
  );

  const toggleTheme = () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* not saved; still applied */
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <div className="hc">
      <header className="hc-top">
        <Link href="/" className="hc-brand" aria-label="Jamey McElveen, home">
          <svg className="hc-cube" viewBox="0 0 32 32" width="24" height="24" aria-hidden="true">
            <path className="t" d="M16 3 L28 9.5 L16 16 L4 9.5 Z" />
            <path className="l" d="M4 9.5 L16 16 L16 29 L4 22.5 Z" />
            <path className="r" d="M28 9.5 L16 16 L16 29 L28 22.5 Z" />
          </svg>
          <span>
            Jamey <b>McElveen</b>
          </span>
        </Link>
        <nav className="hc-nav" aria-label="Site">
          <Link href="/blog">Blog</Link>
          <Link href="/resume">Resume</Link>
          <a href="mailto:jamey@mcelveen.us">Contact</a>
        </nav>
        <div className="hc-right">
          <Link href="/" className="hc-status bl-ask">
            <i className="hc-dot" aria-hidden />
            Ask Jamey
          </Link>
          <button
            type="button"
            className="hc-iconbtn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun aria-hidden /> : <Moon aria-hidden />}
          </button>
        </div>
      </header>

      <main className="hc-col bl-col">{children}</main>

      <footer className="hc-foot">
        <span>jameymcelveen.com</span>
        <span>Written by Jamey</span>
      </footer>
    </div>
  );
}
