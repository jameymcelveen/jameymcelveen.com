import type { ReactNode } from 'react';

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
};

/** Frosted-glass surface — styling lives in globals `.glass`. */
export function GlassCard({ children, className = '', as: Tag = 'div' }: GlassCardProps) {
  return <Tag className={`glass ${className}`.trim()}>{children}</Tag>;
}
