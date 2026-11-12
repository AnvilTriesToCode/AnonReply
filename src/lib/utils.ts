import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const HELPER_NAMES = [
  'Helper A', 'Helper B', 'Helper C', 'Helper D', 'Helper E',
  'Helper F', 'Helper G', 'Helper H', 'Helper I', 'Helper J',
  'Helper K', 'Helper L', 'Helper M', 'Helper N', 'Helper O',
  'Helper P', 'Helper Q', 'Helper R', 'Helper S', 'Helper T',
];

export function getHelperAlias(index: number): string {
  if (index < HELPER_NAMES.length) {
    return HELPER_NAMES[index];
  }
  return `Helper #${index + 1}`;
}

export function getTimeRemaining(expiresAt: Date): { hours: number; minutes: number; expired: boolean } {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) {
    return { hours: 0, minutes: 0, expired: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes, expired: false };
}

export const DENIAL_REASONS = [
  'Spam',
  'Violates Rules',
  'Needs Clarity',
  'Duplicate Post',
  'Inappropriate Content',
  'Off-Topic',
] as const;

export type DenialReason = typeof DENIAL_REASONS[number];
