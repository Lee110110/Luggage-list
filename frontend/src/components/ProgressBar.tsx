import { clsx } from "clsx";

interface ProgressBarProps {
  checked: number;
  total: number;
}

export function ProgressBar({ checked, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-300",
            percentage === 100 ? "bg-success" : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-text-secondary whitespace-nowrap">
        已打包 {checked}/{total} ({percentage}%)
      </span>
    </div>
  );
}
