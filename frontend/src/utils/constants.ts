export const CATEGORIES = ["证件", "衣物", "电子设备", "洗护用品", "药品", "其他"] as const;

export const PRIORITY_CONFIG = {
  必带: { color: "bg-red-100 text-red-700", dot: "bg-red-500" },
  建议带: { color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  选带: { color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
} as const;

export const WEATHER_ICONS: Record<string, string> = {
  晴: "☀️",
  多云: "⛅",
  阴: "☁️",
  小雨: "🌧️",
  中雨: "🌧️",
  大雨: "🌧️",
  暴雨: "⛈️",
  雷阵雨: "⛈️",
  雨夹雪: "🌨️",
  小雪: "🌨️",
  中雪: "❄️",
  大雪: "❄️",
  雾: "🌫️",
};
