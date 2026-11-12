import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-gradient-to-r from-[#ba54f5] to-[#e14eca] text-white shadow-sm shadow-purple-500/25',
        secondary:
          'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10',
        destructive:
          'border-rose-500/30 bg-rose-500/15 text-rose-300 shadow-sm shadow-rose-500/20',
        outline:
          'border-white/20 text-slate-200 bg-transparent',
        success:
          'border-emerald-500/30 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-500/20',
        warning:
          'border-amber-500/30 bg-amber-500/15 text-amber-300 shadow-sm shadow-amber-500/20',
        info:
          'border-sky-500/30 bg-sky-500/15 text-sky-300 shadow-sm shadow-sky-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
