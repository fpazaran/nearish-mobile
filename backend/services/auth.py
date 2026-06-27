from schemas.user import User
from db.db import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from sqlalchemy import select, or_
from models.auth import MeResponse, CoupleResponse, PartnerResponse
from schemas.user import Couple
from schemas.codes import invite_code
import random
from datetime import datetime, timedelta

def me(uid: str, db: Session = Depends(get_db)):
  """
  Returns the user's information and their couple's information if they have one.
  If the user is not found, it initializes the user and returns the user's information.
  """
  try:
    user = db.execute(select(User).where(User.id == uid)).scalar_one_or_none()

    if user is None:
      return init_user(uid, db)

    couple = db.execute(select(Couple).where(or_(Couple.partner1_uid == user.id, Couple.partner2_uid == user.id))).scalar_one_or_none()

    if couple is None:
      return MeResponse(uid=user.id, name=user.name)

    partner_id = couple.partner2_uid if couple.partner2_uid != user.id else couple.partner1_uid
    partner = db.execute(select(User).where(User.id == partner_id)).scalar_one_or_none()

    partner_response = PartnerResponse(uid=partner_id, name=partner.name) if partner is not None else None
    couple_response = CoupleResponse(id=couple.id, partner=partner_response)
    
    return MeResponse(uid=user.id, 
                      name=user.name, 
                      couple=couple_response)
  except Exception as e:
    db.rollback()
    raise Exception(f"Database error: {str(e)}")

def update_name(name: str, uid: str, db: Session = Depends(get_db)):
  """
  Updates the user's name in the database.
  """
  try:
    user = db.execute(select(User).where(User.id == uid)).scalar_one_or_none()
    if user is None:
      raise Exception("User not found")
    user.name = name
    db.commit()
    return True
  except Exception as e:
    db.rollback()
    raise Exception(f"Failed to update name: {str(e)}")

def create_code(uid: str, db: Session = Depends(get_db)):
  """
  Creates a new code for the user.
  """
  try:
    # check if user already has an existing code
    couple = db.execute(select(Couple).where(or_(Couple.partner1_uid == uid, Couple.partner2_uid == uid))).scalar_one_or_none()
    if couple is not None:
      if couple.partner2_uid is not None:
        raise Exception("User is already in a couple")

      existing_code = db.execute(select(invite_code).where(invite_code.couple_id == couple.id)).scalar_one_or_none()
      
      # if code is not expired, return the code
      if existing_code is not None and not is_expired(existing_code):
        return existing_code
    
      # if code is expired, delete the code and create a new one
      if (existing_code is not None and is_expired(existing_code)):
        db.delete(existing_code)
        db.commit()
    else:
      couple = create_couple(uid, db)
      db.commit()  # Commit the couple so we have an ID
      db.refresh(couple)  # Refresh to get the ID
    
    new_code = random.randint(100000, 999999)
    
    code = db.execute(select(invite_code).where(invite_code.code == new_code)).scalar_one_or_none()
    while code is not None:
      if not is_expired(code):
        code.code = new_code
        code.couple_id = couple.id
        code.expires_at = datetime.now() + timedelta(minutes=30)
        db.commit()
        return code
      new_code = random.randint(100000, 999999)
      code = db.execute(select(invite_code).where(invite_code.code == new_code)).scalar_one_or_none()
    
    code = invite_code(code=new_code, couple_id=couple.id, expires_at=datetime.now() + timedelta(minutes=30))
    db.add(code)
    db.commit()
    return code
    
  except Exception as e:
    db.rollback()
    raise Exception(f"Failed to create code: {str(e)}")

def join_couple(inv_code: int, uid: str, db: Session = Depends(get_db)) -> CoupleResponse | None:
  """
  Joins a couple using an invite code.
  Returns the couple.
  """
  try:
    code = db.execute(select(invite_code).where(invite_code.code == inv_code)).scalar_one_or_none()
    if code is None:
      return None
    if is_expired(code):    
      return None
    couple = db.execute(select(Couple).where(Couple.id == code.couple_id)).scalar_one_or_none()
    couple.partner2_uid = uid
    partner = db.execute(select(User).where(User.id == couple.partner1_uid)).scalar_one_or_none()
    db.delete(code)  # Delete the code after successful join
    db.commit()
    return CoupleResponse(id=couple.id, partner=PartnerResponse(uid=partner.id, name=partner.name))
  except Exception as e:
    db.rollback()
    raise Exception(f"Failed to join couple: {str(e)}")

"""
HELPER FUNCTIONS
"""
def init_user(uid: str, db: Session = Depends(get_db)):
  """
  Initializes a new user in the database.
  """
  try:
    user = User(id=uid, name="")
    db.add(user)
    db.commit()
    return MeResponse(uid=user.id, name=user.name)
  except Exception as e:
    db.rollback()
    raise Exception(f"Failed to create user: {str(e)}")

def create_couple(uid: str, db: Session = Depends(get_db)):
  """
  Creates a new couple in the database.
  Returns the couple.
  """
  try:
    couple = Couple(partner1_uid=uid, partner2_uid=None)
    db.add(couple)
    return couple
  except Exception as e:
    db.rollback()
    raise Exception(f"Failed to create couple: {str(e)}")

def is_expired(code: invite_code):
  """
  Checks if the code is expired.
  """
  return code.expires_at < datetime.now()