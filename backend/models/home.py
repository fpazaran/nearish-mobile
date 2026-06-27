from enum import Enum
from pydantic import BaseModel
from models.visits import Visit

class VisitState(Enum):
    PLANNED = "planned"
    UNPLANNED = "unplanned"
    ACTIVE = "active"

class HomeResponse(BaseModel):
    state: VisitState
    visit: Visit | None # None if visit is not planned
    days_till: int | None # None if visit is active or not planned
    today_schedule: list[int] | None # None if visit is planned or not planned