export interface Visit {
  id: number;
  start: string;
  end: string;
  description: string;
}

export interface CreateVisit {
  description: string;
  start: string;
  end: string;
}

export enum VisitState {
  PLANNED = 'planned',
  UNPLANNED = 'unplanned',
  COMPLETED = 'completed',
  ACTIVE = 'active',
}
