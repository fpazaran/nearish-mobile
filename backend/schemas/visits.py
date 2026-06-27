from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from datetime import datetime
from db.db import Base

class Visit(Base):
    __tablename__ = "visits"
    id = Column(Integer, unique=True, primary_key=True)
    couple_id = Column(Integer, ForeignKey("couples.id", ondelete="CASCADE"), nullable=False)
    start = Column(Date, nullable=False)
    end = Column(Date, nullable=False)
    description = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
