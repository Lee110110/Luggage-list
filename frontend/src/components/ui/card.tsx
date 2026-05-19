import { type HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        "rounded-xl border border-border bg-surface p-4 shadow-sm",
        className
      )}
      {...props}
    />
  )
);

Card.displayName = "Card";
