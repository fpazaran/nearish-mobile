from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from datetime import datetime
from db.db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, nullable=False, unique=True, primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)

class Couple(Base):
    __tablename__ = "couples"
    id = Column(Integer, nullable=False, unique=True, primary_key=True)
    partner1_uid = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    partner2_uid = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
