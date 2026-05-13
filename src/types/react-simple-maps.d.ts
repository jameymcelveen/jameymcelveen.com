declare module 'react-simple-maps' {
  import type { FC, ReactNode } from 'react';

  export interface GeographyRenderProps {
    geographies: Array<{
      rsmKey: string;
      properties: Record<string, string | number | undefined>;
      [key: string]: unknown;
    }>;
  }

  export const ComposableMap: FC<{
    children?: ReactNode;
    projection?: string;
    projectionConfig?: Record<string, number | number[]>;
    className?: string;
    width?: number;
    height?: number;
  }>;

  export const Geographies: FC<{
    geography: string;
    children?: (arg: GeographyRenderProps) => ReactNode;
  }>;

  export const Geography: FC<Record<string, unknown>>;
}
