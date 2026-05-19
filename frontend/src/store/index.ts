import { create } from "zustand";
import type {
  ExtractedTrip,
  DailyForecast,
  ChecklistItem,
  DestinationAlert,
  TripResponse,
  ProgressData,
} from "../types";
import * as tripApi from "../api/trip";
import * as checklistApi from "../api/checklist";

type FlowStep = "input" | "confirm" | "result";

interface AppState {
  step: FlowStep;
  loading: boolean;
  error: string | null;

  // Trip extraction
  tripInput: string;
  extractedTrip: ExtractedTrip | null;

  // Result data
  trip: TripResponse | null;
  weather: { daily: DailyForecast[]; summary: string } | null;
  checklist: ChecklistItem[];
  alerts: DestinationAlert[];
  progress: ProgressData | null;

  // Actions
  setTripInput: (input: string) => void;
  submitTripInput: () => Promise<void>;
  confirmTrip: (edited: ExtractedTrip) => Promise<void>;
  toggleItem: (itemId: number) => Promise<void>;
  addCustomItem: (item: {
    category: string;
    name: string;
    quantity: number;
    priority: string;
  }) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  reset: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  step: "input",
  loading: false,
  error: null,
  tripInput: "",
  extractedTrip: null,
  trip: null,
  weather: null,
  checklist: [],
  alerts: [],
  progress: null,

  setTripInput: (input) => set({ tripInput: input }),

  submitTripInput: async () => {
    const { tripInput } = get();
    set({ loading: true, error: null });
    try {
      const extracted = await tripApi.extractTripInfo(tripInput);
      set({ extractedTrip: extracted, step: "confirm", loading: false });
    } catch (e: any) {
      set({
        error: e.response?.data?.detail || "AI 提取失败，请重试",
        loading: false,
      });
    }
  },

  confirmTrip: async (edited) => {
    const { tripInput } = get();
    set({ loading: true, error: null });
    try {
      const result = await tripApi.createTrip({
        user_input: tripInput,
        destination: edited.destination,
        country: edited.destination_country,
        start_date: edited.start_date,
        end_date: edited.end_date,
        duration_days: edited.duration_days,
        purpose: edited.purpose,
        special_scenarios: edited.special_scenarios,
        group_size: edited.group_size,
        group_description: edited.group_description,
      });
      set({
        trip: result.trip,
        weather: result.weather,
        checklist: result.checklist,
        alerts: result.alerts,
        step: "result",
        loading: false,
      });
    } catch (e: any) {
      set({
        error: e.response?.data?.detail || "生成清单失败，请重试",
        loading: false,
      });
    }
  },

  toggleItem: async (itemId) => {
    const item = get().checklist.find((i) => i.id === itemId);
    if (!item) return;
    const newChecked = !item.checked;

    // Optimistic update
    set((state) => ({
      checklist: state.checklist.map((i) =>
        i.id === itemId ? { ...i, checked: newChecked } : i
      ),
    }));

    try {
      await checklistApi.updateItem(itemId, { checked: newChecked });
    } catch {
      // Revert on failure
      set((state) => ({
        checklist: state.checklist.map((i) =>
          i.id === itemId ? { ...i, checked: !newChecked } : i
        ),
      }));
    }
  },

  addCustomItem: async (itemData) => {
    const trip = get().trip;
    if (!trip) return;
    try {
      const newItem = await checklistApi.addCustomItem(trip.id, itemData);
      set((state) => ({ checklist: [...state.checklist, newItem] }));
    } catch {
      // Silently fail for now
    }
  },

  removeItem: async (itemId) => {
    set((state) => ({
      checklist: state.checklist.filter((i) => i.id !== itemId),
    }));
    try {
      await checklistApi.deleteItem(itemId);
    } catch {
      // Could revert here
    }
  },

  reset: () =>
    set({
      step: "input",
      loading: false,
      error: null,
      tripInput: "",
      extractedTrip: null,
      trip: null,
      weather: null,
      checklist: [],
      alerts: [],
      progress: null,
    }),
}));
