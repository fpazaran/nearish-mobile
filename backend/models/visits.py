from pydantic import BaseModel
from datetime import date
from models.activities import CreateActivitySnapshot

class Visit(BaseModel):
    id: int
    start: date
    end: date
    description: str

class CreateVisit(BaseModel):
    description: str
    start: date
    end: date

class CreateVisitRequest(BaseModel):
    visit: CreateVisit
    schedule: list[CreateActivitySnapshot] = []

class SaveVisitScheduleRequest(BaseModel):
    add: list[CreateActivitySnapshot]
    delete: list[int]