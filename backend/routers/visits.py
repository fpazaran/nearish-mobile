from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.db import get_db
from auth.firebase import get_current_firebase_uid
from fastapi import HTTPException
from services import visits as visits_service
from models.visits import CreateVisitRequest, Visit, SaveVisitScheduleRequest
from models.activities import ActivitySnapshot

router = APIRouter()

@router.get("/visits", response_model=list[Visit])
async def get_visits(uid: str = Depends(get_current_firebase_uid), db: Session = Depends(get_db)):
    try:
        visits = visits_service.get_visits(uid, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    if not visits:
        raise HTTPException(status_code=404, detail="No visits found")
    return visits

@router.post("/visits", response_model=Visit)
async def create_visit(body: CreateVisitRequest, uid: str = Depends(get_current_firebase_uid), db: Session = Depends(get_db)):
    try:
        visit = visits_service.create_visit(body.visit, body.schedule, uid, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return visit

@router.delete("/visits/{id}", response_model=Visit)
async def delete_visit(id: int, uid: str = Depends(get_current_firebase_uid), db: Session = Depends(get_db)):
    try:
        visit = visits_service.delete_visit(id, uid, db)
        if visit is None:
            raise HTTPException(status_code=404, detail="Unable to delete visit")
        return visit
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/visits/{id}/schedule", response_model=list[ActivitySnapshot])
async def get_visit_schedule(id: int, uid: str = Depends(get_current_firebase_uid), db: Session = Depends(get_db)):
    try:
        schedule = visits_service.get_visit_schedule(id, uid, db)
        if schedule is None:
            raise HTTPException(status_code=404, detail="Unable to get visit schedule")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return schedule

@router.patch("/visits/{id}/schedule", response_model=int)
async def save_visit_schedule(id: int, body: SaveVisitScheduleRequest, uid: str = Depends(get_current_firebase_uid), db: Session = Depends(get_db)):
    try:
        visit_id = visits_service.save_visit_schedule(id, body.add, body.delete, uid, db)
        if visit_id is None:
            raise HTTPException(status_code=404, detail="Unable to save visit schedule")
        return visit_id
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))