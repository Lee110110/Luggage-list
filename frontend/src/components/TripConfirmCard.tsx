import { useState } from "react";
import { Check, Pencil } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useAppStore } from "../store";
import type { ExtractedTrip } from "../types";

export function TripConfirmCard() {
  const { extractedTrip, confirmTrip, loading } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState<ExtractedTrip | null>(null);

  if (!extractedTrip) return null;

  const display = edited || extractedTrip;

  const fields = [
    { key: "destination" as const, label: "目的地", value: display.destination },
    { key: "start_date" as const, label: "出发日期", value: display.start_date },
    { key: "end_date" as const, label: "返程日期", value: display.end_date },
    { key: "duration_days" as const, label: "出行天数", value: `${display.duration_days}天` },
    { key: "purpose" as const, label: "出行目的", value: display.purpose },
    {
      key: "special_scenarios" as const,
      label: "特殊场景",
      value: display.special_scenarios.length > 0 ? display.special_scenarios.join("、") : "无",
    },
    { key: "group_description" as const, label: "人员", value: display.group_description },
  ];

  const handleConfirm = () => {
    confirmTrip(edited || extractedTrip);
  };

  const handleFieldChange = (key: keyof ExtractedTrip, value: string) => {
    const updated = { ...(edited || extractedTrip) };
    if (key === "duration_days") {
      updated[key] = parseInt(value) || 1;
    } else if (key === "special_scenarios") {
      updated[key] = value ? value.split("、") : [];
    } else {
      (updated as any)[key] = value;
    }
    setEdited(updated);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">确认出行信息</h3>
      <div className="space-y-3">
        {fields.map(({ key, label, value }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-sm text-text-secondary">
              {label}
            </span>
            {editing ? (
              <input
                value={
                  key === "special_scenarios"
                    ? (edited || extractedTrip).special_scenarios.join("、")
                    : key === "duration_days"
                    ? String((edited || extractedTrip).duration_days)
                    : String((edited || extractedTrip)[key])
                }
                onChange={(e) => handleFieldChange(key, e.target.value)}
                className="flex-1 rounded-lg border border-border px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
            ) : (
              <span className="text-sm font-medium">{value}</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-6">
        {editing ? (
          <Button onClick={() => setEditing(false)} size="sm">
            <Check className="mr-1 h-4 w-4" />
            完成编辑
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => setEditing(true)}
            size="sm"
          >
            <Pencil className="mr-1 h-4 w-4" />
            修改信息
          </Button>
        )}
        <Button onClick={handleConfirm} disabled={loading} size="sm">
          {loading ? "生成中..." : "确认生成"}
        </Button>
      </div>
    </Card>
  );
}
