import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ChecklistItem } from "../types";
import { Checkbox } from "./ui/checkbox";
import { useAppStore } from "../store";
import { PRIORITY_CONFIG } from "../utils/constants";
import { clsx } from "clsx";

interface ChecklistCategoryProps {
  category: string;
  items: ChecklistItem[];
}

export function ChecklistCategory({ category, items }: ChecklistCategoryProps) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleItem = useAppStore((s) => s.toggleItem);

  const checkedCount = items.filter((i) => i.checked).length;
  const total = items.length;
  const allDone = checkedCount === total;

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between p-4 hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-text-secondary" />
          ) : (
            <ChevronDown className="h-4 w-4 text-text-secondary" />
          )}
          <span className="font-medium">{category}</span>
          <span
            className={clsx(
              "text-sm",
              allDone ? "text-success" : "text-text-secondary"
            )}
          >
            {checkedCount}/{total} {allDone && "✅"}
          </span>
        </div>
      </button>

      {!collapsed && (
        <div className="border-t border-border">
          {items.map((item) => {
            const priorityCfg = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG["选带"];
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-hover/50"
              >
                <Checkbox
                  checked={item.checked}
                  onChange={() => toggleItem(item.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        "text-sm",
                        item.checked && "line-through text-text-secondary"
                      )}
                    >
                      {item.name}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-xs text-text-secondary">
                        ×{item.quantity}
                      </span>
                    )}
                    <span
                      className={clsx(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        priorityCfg.color
                      )}
                    >
                      {item.priority}
                    </span>
                  </div>
                  {item.reason && (
                    <p className="text-xs text-text-secondary mt-0.5">
                      ← {item.reason}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
