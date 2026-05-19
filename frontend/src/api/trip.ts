import client from "./client";
import type {
  ExtractedTrip,
  CreateTripResponse,
  TripResponse,
  ChecklistItem,
  ProgressData,
} from "../types";

export async function extractTripInfo(input: string): Promise<ExtractedTrip> {
  const res = await client.post("/api/trips/extract", { input });
  return res.data;
}

export async function createTrip(trip: {
  user_input: string;
  destination: string;
  country?: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  purpose: string;
  special_scenarios: string[];
  group_size: number;
  group_description: string;
}): Promise<CreateTripResponse> {
  const res = await client.post("/api/trips", trip);
  return res.data;
}

export async function getTrip(tripId: number): Promise<{
  trip: TripResponse;
  checklist: ChecklistItem[];
  progress: ProgressData;
}> {
  const res = await client.get(`/api/trips/${tripId}`);
  return res.data;
}

export async function listTrips(): Promise<
  { id: number; destination: string; start_date: string; end_date: string }[]
> {
  const res = await client.get("/api/trips");
  return res.data;
}
