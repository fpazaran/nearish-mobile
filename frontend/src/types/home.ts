import { Visit, VisitState } from './visits';

export interface Home {
  state: VisitState;
  visit: Visit | null;
  days_till: number | null;
  today_schedule: number[] | null;
}
