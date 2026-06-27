from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey
from datetime import datetime
from db.db import Base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, nullable=False, unique=True, primary_key=True)
    couple_id = Column(Integer, ForeignKey("couples.id"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)

class ActivitySnapshot(Base):
    __tablename__ = "activity_snapshots"
    
    id = Column(Integer, nullable=False, unique=True, primary_key=True)
    visit_id = Column(Integer, ForeignKey("visits.id", ondelete="CASCADE"), nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id", ondelete="SET NULL"), nullable=True)
    date = Column(Date, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    order_index = Column(Integer, nullable=False)
