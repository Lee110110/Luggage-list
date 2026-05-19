import { Card } from "./ui/card";
import type { DestinationAlert as AlertType } from "../types";

interface DestinationAlertsProps {
  alerts: AlertType[];
}

const ALERT_COLORS: Record<string, string> = {
  plug: "bg-blue-50 border-blue-200",
  visa: "bg-orange-50 border-orange-200",
  culture: "bg-purple-50 border-purple-200",
  health: "bg-green-50 border-green-200",
  currency: "bg-amber-50 border-amber-200",
};

export function DestinationAlerts({ alerts }: DestinationAlertsProps) {
  if (!alerts.length) return null;

  return (
    <Card>
      <h3 className="font-semibold mb-3">⚠️ 目的地提醒</h3>
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className={`rounded-lg border p-3 text-sm ${
              ALERT_COLORS[alert.type] || "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span>{alert.icon}</span>
              <span className="font-medium">{alert.title}</span>
            </div>
            <p className="text-text-secondary">{alert.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
