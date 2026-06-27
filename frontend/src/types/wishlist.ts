export interface WishlistItem {
  id: number;
  owner_uid: string;
  title: string;
  description?: string;
  fulfilled: boolean;
  created_at: string;
}

export interface CreateWishlistItem {
  title: string;
  description?: string;
}
