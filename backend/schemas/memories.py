from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from db.db import Base

class Memory(Base):
    __tablename__ = "memories"

    id = Column(Integer, nullable=False, primary_key=True)
    visit_id = Column(Integer, ForeignKey("visits.id", ondelete="CASCADE"), nullable=False)
    created_by = Column(String, nullable=False)
    created_by_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=False)
    note = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)

class MemoryMedia(Base):
    __tablename__ = "memory_media"

    id = Column(Integer, nullable=False, primary_key=True)
    memory_id = Column(Integer, ForeignKey("memories.id", ondelete="CASCADE"), nullable=False)
    media_url = Column(String, nullable=False)
    media_type = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)

