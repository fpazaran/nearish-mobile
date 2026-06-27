from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from datetime import datetime
from db.db import Base

class Wish(Base):
  __tablename__ = "wishes"

  id = Column(Integer, nullable=False, primary_key=True)
  uid = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  description = Column(String, nullable=False)
  category = Column(String, nullable=False)
  link = Column(String, nullable=True)
  fulfilled = Column(Boolean, nullable=False, default=False)
  fulfilled_at = Column(DateTime, nullable=True)
  created_at = Column(DateTime, nullable=False, default=datetime.now)
