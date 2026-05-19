import { Card } from "./ui/card";
import type { DailyForecast as DailyForecastType } from "../types";
import { WEATHER_ICONS } from "../utils/constants";
import { formatDate, formatWeekday } from "../utils/formatters";

interface WeatherForecastProps {
  daily: DailyForecastType[];
  summary: string;
  destination: string;
}

export function WeatherForecast({
  daily,
  summary,
  destination,
}: WeatherForecastProps) {
  if (!daily.length) return null;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📍</span>
        <h3 className="font-semibold">{destination} · 天气预报</h3>
      </div>

      <div className="space-y-2 mb-3">
        {daily.map((day) => (
          <div
            key={day.date}
            className="flex items-center gap-3 text-sm py-1"
          >
            <span className="w-16 text-text-secondary">
              {formatDate(day.date)} {formatWeekday(day.date)}
            </span>
            <span className="w-6 text-center">
              {WEATHER_ICONS[day.text_day] || "🌤️"}
            </span>
            <span className="w-16">{day.text_day}</span>
            <span className="w-24">
              {day.temp_min}°C - {day.temp_max}°C
            </span>
            {day.precip > 0 && (
              <span className="text-blue-500 text-xs">
                降水 {day.precip}mm
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-text-secondary bg-surface-alt rounded-lg p-2">
        📊 {summary}
      </p>
    </Card>
  );
}
