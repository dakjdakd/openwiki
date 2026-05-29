import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Simple polyfill for cn avoiding extra config, using clsx and twMerge
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center uppercase font-bold tracking-tighter transition-all duration-300 rounded-none disabled:opacity-50 disabled:pointer-events-none active:scale-95",
          
          // Variants
          variant === 'primary' && "bg-[#DFE104] text-black hover:scale-105 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] focus-visible:ring-[#DFE104]",
          variant === 'outline' && "border-2 border-[#3F3F46] bg-transparent text-[#FAFAFA] hover:bg-[#FAFAFA] hover:text-black",
          variant === 'ghost' && "bg-transparent text-[#FAFAFA] hover:text-[#DFE104]",
          
          // Sizes
          size === 'default' && "h-14 px-8",
          size === 'sm' && "h-10 px-4 text-sm",
          size === 'lg' && "h-20 px-12 text-xl",
          
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
