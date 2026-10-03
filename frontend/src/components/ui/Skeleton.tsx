import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'table-row' | 'chart';
}

export function Skeleton({ className, variant = 'text', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200/60',
        variant === 'text' && 'h-4 w-full',
        variant === 'card' && 'h-32 w-full',
        variant === 'table-row' && 'h-12 w-full',
        variant === 'chart' && 'h-64 w-full',
        className
      )}
      {...props}
    />
  );
}
