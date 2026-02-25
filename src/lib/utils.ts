// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(navigator.language, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(navigator.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}