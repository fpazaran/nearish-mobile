import { apiClient } from './client';
import { Memory, CreateMemory } from '../types/memories';

export async function getMemories(): Promise<Memory[]> {
  const response = await apiClient('/memories', { method: 'GET' });
  if (!response.ok) throw new Error('Failed to fetch memories');
  return response.json();
}

export async function createMemory(memory: CreateMemory): Promise<Memory> {
  const response = await apiClient('/memories', {
    method: 'POST',
    body: JSON.stringify(memory),
  });
  if (!response.ok) throw new Error('Failed to create memory');
  return response.json();
}

export async function deleteMemory(id: number): Promise<void> {
  const response = await apiClient(`/memories/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete memory');
}

export async function uploadMemoryMedia(
  memoryId: number,
  uri: string,
  mediaType: 'photo' | 'video',
): Promise<void> {
  const filename = uri.split('/').pop() ?? 'media';
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeType = mediaType === 'video'
    ? `video/${ext}`
    : `image/${ext === 'jpg' ? 'jpeg' : ext}`;

  const formData = new FormData();
  formData.append('file', { uri, name: filename, type: mimeType } as unknown as Blob);
  formData.append('media_type', mediaType);

  const response = await apiClient(`/memories/${memoryId}/media`, {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (!response.ok) throw new Error('Failed to upload media');
}
