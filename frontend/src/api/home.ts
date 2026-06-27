import { apiClient } from './client';
import { Home } from '../types/home';

export async function getHome(): Promise<Home> {
  const response = await apiClient('/home', { method: 'GET' });
  if (!response.ok) throw new Error('Failed to fetch home data');
  return response.json();
}
