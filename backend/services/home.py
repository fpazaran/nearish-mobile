from models.home import HomeResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, select
from schemas.visits import Visit
from schemas.user import Couple
from datetime import datetime
from models.home import VisitState, Visit as VisitModel

def get_home(uid: str, db: Session) -> HomeResponse:
    """
    Get the home page for the user
    gets visit closest to today
    """
    try:
        # get couple for couple id
        couple = db.execute(select(Couple).where(or_(Couple.partner1_uid == uid, Couple.partner2_uid == uid))).scalar_one_or_none()
        if couple is None:
            raise Exception("Couple not found")
        
        # get visits for couple id, ordered by start date ascending
        visits = db.execute(
            select(Visit)
            .where(and_(Visit.couple_id == couple.id, Visit.end >= datetime.now().date()))
            .order_by(Visit.start)
        ).scalars().all()
        
        if len(visits) == 0:
            return HomeResponse(state=VisitState.UNPLANNED, visit=None, days_till=None, today_schedule=None)
        
        visit = VisitModel(id=visits[0].id, start=visits[0].start, end=visits[0].end, description=visits[0].description)
        
        # visit is active
        if visit.start <= datetime.now().date():
            return HomeResponse(state=VisitState.ACTIVE, visit=visit, days_till=None, today_schedule=None)
        
        # visit is planned
        return HomeResponse(state=VisitState.PLANNED, visit=visit, days_till=get_days_till(visit), today_schedule=None)
    except Exception as e:
        raise Exception(f"Database error: {str(e)}")

def get_days_till(visit: Visit) -> int:
    """
    Get the number of days until the next visit given the next visit
    """
    return (visit.start - datetime.now().date()).days