import { HTMLAttributes, forwardRef } from 'react';
import { cn } from './Button';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "border-2 border-[#3F3F46] bg-[#09090B] rounded-none p-8 md:p-12 transition-colors duration-300",
          hoverable && "group hover:bg-[#DFE104] hover:border-[#DFE104]",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export { Card };
