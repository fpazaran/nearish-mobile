import { apiClient } from './client';
import { Activity } from '../types/activities';

export async function getActivities(): Promise<Activity[]> {
  const response = await apiClient('/activities', { method: 'GET' });
  if (!response.ok) throw new Error('Failed to fetch activities');
  return response.json();
}

export async function createActivity(
  activity: Omit<Activity, 'id'>,
): Promise<Activity> {
  const response = await apiClient('/activities', {
    method: 'POST',
    body: JSON.stringify(activity),
  });
  if (!response.ok) throw new Error('Failed to create activity');
  return response.json();
}

export async function deleteActivity(id: number): Promise<void> {
  const response = await apiClient(`/activities/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete activity');
}

export async function getRandomActivity(category?: string): Promise<Activity> {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  const response = await apiClient(`/activities/random${query}`, { method: 'GET' });
  if (!response.ok) throw new Error('Failed to fetch random activity');
  return response.json();
}
