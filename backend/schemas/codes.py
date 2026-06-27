from sqlalchemy import Column, DateTime, Integer, ForeignKey
from datetime import datetime, timedelta
from db.db import Base

class invite_code(Base):
    __tablename__ = "invite_codes"
    code = Column(Integer, nullable=False, primary_key=True)
    couple_id = Column(Integer, ForeignKey("couples.id", ondelete="CASCADE"), nullable=False, unique=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    expires_at = Column(DateTime, nullable=False, default=lambda: datetime.now() + timedelta(days=1))