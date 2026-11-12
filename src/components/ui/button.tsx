import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-[#ba54f5] to-[#e14eca] text-white shadow-lg shadow-purple-500/25 hover:opacity-95 hover:shadow-purple-500/40',
        destructive:
          'bg-gradient-to-r from-[#fd5d93] to-[#ff6491] text-white shadow-lg shadow-rose-500/25 hover:opacity-95',
        outline:
          'border border-white/10 bg-[#1e1e2f] text-slate-200 shadow-sm hover:bg-[#27293d] hover:text-white hover:border-purple-500/40',
        secondary:
          'border border-white/10 bg-white/5 text-slate-200 shadow-sm hover:bg-white/10 hover:text-white',
        ghost:
          'text-slate-300 hover:bg-white/5 hover:text-white',
        link:
          'text-purple-400 underline-offset-4 hover:underline hover:text-purple-300',
        success:
          'bg-gradient-to-r from-[#00f2c3] to-[#0098f0] text-slate-950 font-bold shadow-lg shadow-emerald-500/25 hover:opacity-95',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-xl px-7 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
