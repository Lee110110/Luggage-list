export interface ExtractedTrip {
  destination: string;
  destination_country: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  purpose: string;
  special_scenarios: string[];
  group_size: number;
  group_description: string;
}

export interface DailyForecast {
  date: string;
  text_day: string;
  temp_min: number;
  temp_max: number;
  humidity: number;
  precip: number;
  uv_index: number;
  wind_scale_day: string;
}

export interface WeatherResponse {
  daily: DailyForecast[];
  summary: string;
}

export interface ChecklistItem {
  id: number;
  trip_id: number;
  category: string;
  name: string;
  quantity: number;
  priority: "必带" | "建议带" | "选带";
  reason: string | null;
  checked: boolean;
  is_custom: boolean;
}

export interface DestinationAlert {
  type: "plug" | "culture" | "visa" | "health" | "currency";
  title: string;
  description: string;
  icon: string;
}

export interface TripResponse {
  id: number;
  user_input: string;
  destination: string;
  country: string | null;
  start_date: string;
  end_date: string;
  duration_days: number;
  purpose: string;
  special_scenarios: string[];
  group_size: number;
  group_description: string | null;
  status: string;
}

export interface CreateTripResponse {
  trip_id: number;
  trip: TripResponse;
  weather: WeatherResponse;
  checklist: ChecklistItem[];
  alerts: DestinationAlert[];
}

export interface ProgressData {
  total: number;
  checked: number;
  percentage: number;
  by_category: Record<string, { total: number; checked: number }>;
}
