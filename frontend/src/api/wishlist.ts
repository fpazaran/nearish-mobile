import { apiClient } from './client';
import { WishlistItem, CreateWishlistItem } from '../types/wishlist';

export async function getWishlist(): Promise<WishlistItem[]> {
  const response = await apiClient('/wishes', { method: 'GET' });
  if (!response.ok) throw new Error('Failed to fetch wishlist');
  return response.json();
}

export async function createWishlistItem(
  item: CreateWishlistItem,
): Promise<WishlistItem> {
  const response = await apiClient('/wishes', {
    method: 'POST',
    body: JSON.stringify(item),
  });
  if (!response.ok) throw new Error('Failed to create wishlist item');
  return response.json();
}

export async function fulfillWishlistItem(id: number): Promise<void> {
  const response = await apiClient(`/wishes/${id}/fulfill`, { method: 'PATCH' });
  if (!response.ok) throw new Error('Failed to fulfill wishlist item');
}

export async function deleteWishlistItem(id: number): Promise<void> {
  const response = await apiClient(`/wishes/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete wishlist item');
}
