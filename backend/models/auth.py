from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class PartnerResponse(BaseModel):
    uid: str
    name: str

class CoupleResponse(BaseModel):
    id: int
    partner: Optional[PartnerResponse] = None

class MeResponse(BaseModel):
    uid: str
    name: str
    couple: Optional[CoupleResponse] = None

class UpdateNameRequest(BaseModel):
    name: str

class CreateCodeResponse(BaseModel):
    code: int
    expires_at: datetime

class JoinCoupleRequest(BaseModel):
    invite_code: int
