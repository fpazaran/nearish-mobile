export interface ActivitySnapshot {
  id: number;
  visit_id: number;
  date: string;
  title: string;
  description?: string;
  order: number;
}

export interface CreateActivitySnapshot {
  date: string;
  title: string;
  description?: string;
  order: number;
}

export interface Activity {
  id: number;
  title: string;
  description?: string;
  category?: string;
}
