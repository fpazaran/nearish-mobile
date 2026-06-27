export interface Memory {
  id: number;
  visit_id?: number;
  note?: string;
  created_at: string;
  media: MemoryMedia[];
}

export interface MemoryMedia {
  id: number;
  memory_id: number;
  url: string;
  media_type: 'photo' | 'video';
}

export interface CreateMemory {
  visit_id?: number;
  note?: string;
}
