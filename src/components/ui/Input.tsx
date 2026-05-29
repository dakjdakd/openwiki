import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from './Button';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full h-24 bg-transparent border-b-4 border-[#52525B] px-0 py-2 text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tighter text-[#FAFAFA] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#71717A] focus-visible:outline-none focus-visible:border-[#DFE104] caret-[#DFE104] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
