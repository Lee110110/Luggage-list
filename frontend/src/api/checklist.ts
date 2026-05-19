import client from "./client";
import type { ChecklistItem, ProgressData } from "../types";

export async function getChecklist(
  tripId: number
): Promise<{ items: ChecklistItem[]; progress: ProgressData }> {
  const res = await client.get(`/api/checklists/trips/${tripId}/items`);
  return res.data;
}

export async function updateItem(
  itemId: number,
  updates: { checked?: boolean; quantity?: number; name?: string }
): Promise<ChecklistItem> {
  const res = await client.patch(`/api/checklists/items/${itemId}`, updates);
  return res.data;
}

export async function addCustomItem(
  tripId: number,
  item: { category: string; name: string; quantity: number; priority: string }
): Promise<ChecklistItem> {
  const res = await client.post(`/api/checklists/trips/${tripId}/items`, item);
  return res.data;
}

export async function deleteItem(itemId: number): Promise<void> {
  await client.delete(`/api/checklists/items/${itemId}`);
}
