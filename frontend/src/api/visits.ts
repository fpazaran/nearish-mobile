import { apiClient } from './client';
import { Visit, CreateVisit } from '../types/visits';
import { ActivitySnapshot, CreateActivitySnapshot } from '../types/activities';

export async function getVisits(): Promise<Visit[]> {
  const response = await apiClient('/visits', { method: 'GET' });
  if (!response.ok) throw new Error('Failed to fetch visits');
  return response.json();
}

export async function createVisit(
  visit: CreateVisit,
  schedule: CreateActivitySnapshot[] = [],
): Promise<Visit> {
  const response = await apiClient('/visits', {
    method: 'POST',
    body: JSON.stringify({ visit, schedule }),
  });
  if (!response.ok) throw new Error('Failed to create visit');
  return response.json();
}

export async function deleteVisit(id: number): Promise<void> {
  const response = await apiClient(`/visits/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete visit');
}

export async function getVisitSchedule(id: number): Promise<ActivitySnapshot[]> {
  const response = await apiClient(`/visits/${id}/schedule`, { method: 'GET' });
  if (!response.ok) throw new Error('Failed to fetch schedule');
  return response.json();
}

export async function saveSchedule(
  id: number,
  toAdd: CreateActivitySnapshot[],
  toDelete: number[],
): Promise<number> {
  const response = await apiClient(`/visits/${id}/schedule`, {
    method: 'PATCH',
    body: JSON.stringify({ add: toAdd, delete: toDelete }),
  });
  if (!response.ok) throw new Error('Failed to save schedule');
  return response.json();
}
