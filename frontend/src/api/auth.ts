import { apiClient } from './client';
import { Couple, Invite, User } from '../types/user';

interface MeResponse {
  uid: string;
  name: string;
  couple: {
    id: number;
    partner: { uid: string; name: string } | null;
  } | null;
}

export async function getMe(): Promise<User> {
  const response = await apiClient('/auth/me');
  if (!response.ok) throw new Error('Failed to fetch user profile');
  const data: MeResponse = await response.json();
  return {
    uid: data.uid,
    name: data.name,
    couple: data.couple
      ? {
          id: data.couple.id,
          partner: data.couple.partner ?? undefined,
        }
      : undefined,
  };
}

export async function updateName(name: string): Promise<void> {
  const response = await apiClient('/auth/update-name', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error('Failed to update name');
}

export async function createCode(): Promise<Invite> {
  const response = await apiClient('/auth/create-code');
  if (!response.ok) throw new Error('Failed to create invite code');
  return response.json();
}

export async function joinCouple(invite_code: number): Promise<Couple> {
  const response = await apiClient('/auth/join-couple', {
    method: 'POST',
    body: JSON.stringify({ invite_code }),
  });
  if (!response.ok) throw new Error('Failed to join couple');
  return response.json();
}
