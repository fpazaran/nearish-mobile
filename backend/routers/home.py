from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.db import get_db
from models.home import HomeResponse
from auth.firebase import get_current_firebase_uid
from services import home as home_service
from fastapi import HTTPException

router = APIRouter()

@router.get("/home", response_model=HomeResponse)
async def get_home(uid: str = Depends(get_current_firebase_uid), db: Session = Depends(get_db)):
    try:
        home = home_service.get_home(uid, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    if not home:
        raise HTTPException(status_code=404, detail="No home found")
    return home