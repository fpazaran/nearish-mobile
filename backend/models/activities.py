from pydantic import BaseModel
from datetime import date

class ActivitySnapshot(BaseModel):
  id: int
  visit_id: int
  activity_id: int | None
  date: date
  name: str
  category: str
  order_index: int

class CreateActivitySnapshot(BaseModel):
  activity_id: int | None
  date: date
  name: str
  category: str
  order_index: int