import { type InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm text-text-secondary">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={clsx(
          "h-10 rounded-lg border border-border bg-surface px-3 text-sm",
          "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          "placeholder:text-text-secondary/50",
          className
        )}
        {...props}
      />
    </div>
  )
);

Input.displayName = "Input";
