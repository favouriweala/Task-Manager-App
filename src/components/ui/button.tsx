import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background touch-manipulation',
  {
    variants: {
      variant: {
        default: 'bg-zyra-primary text-white hover:bg-zyra-primary/90 focus-visible:ring-zyra-primary/50 shadow-sm hover:shadow-md',
        destructive: 'bg-zyra-danger text-white hover:bg-zyra-danger/90 focus-visible:ring-zyra-danger/50 shadow-sm hover:shadow-md',
        outline: 'border border-zyra-border bg-zyra-card text-zyra-text-primary hover:bg-zyra-background focus-visible:ring-zyra-primary/50',
        secondary: 'bg-zyra-secondary text-white hover:bg-zyra-secondary/90 focus-visible:ring-zyra-secondary/50 shadow-sm hover:shadow-md',
        ghost: 'text-zyra-text-primary hover:bg-zyra-background focus-visible:ring-zyra-primary/50',
        link: 'underline-offset-4 hover:underline text-zyra-primary focus-visible:ring-zyra-primary/50',
        success: 'bg-zyra-success text-white hover:bg-zyra-success/90 focus-visible:ring-zyra-success/50 shadow-sm hover:shadow-md',
        warning: 'bg-zyra-warning text-white hover:bg-zyra-warning/90 focus-visible:ring-zyra-warning/50 shadow-sm hover:shadow-md',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
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
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };