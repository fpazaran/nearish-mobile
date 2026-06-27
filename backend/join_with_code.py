"""
join_with_code.py — Creates a mock partner user and joins your couple using an invite code.

Usage:
  docker compose -f compose.mobile.yaml exec backend python join_with_code.py
"""

from datetime import datetime
from sqlalchemy import select
from db.db import Session as SessionLocal
from schemas.user import User, Couple
from schemas.codes import invite_code

CODE = 599523
MOCK_UID = "mock_partner_uid"
MOCK_NAME = "Jordan"

def main():
    db = SessionLocal()
    try:
        # Look up the invite code
        code = db.execute(select(invite_code).where(invite_code.code == CODE)).scalar_one_or_none()
        if code is None:
            print(f"❌ Code {CODE} not found. Generate a fresh one in the app first.")
            return
        if code.expires_at < datetime.now():
            print(f"❌ Code {CODE} has expired. Generate a fresh one in the app.")
            return

        # Look up the couple
        couple = db.execute(select(Couple).where(Couple.id == code.couple_id)).scalar_one_or_none()
        if couple is None:
            print("❌ No couple found for this code.")
            return
        if couple.partner2_uid is not None:
            print(f"❌ Couple already has a partner2: {couple.partner2_uid}")
            return

        # Create mock partner user (skip if already exists)
        existing = db.execute(select(User).where(User.id == MOCK_UID)).scalar_one_or_none()
        if existing is None:
            partner = User(id=MOCK_UID, name=MOCK_NAME)
            db.add(partner)
            db.flush()
        else:
            partner = existing
            print(f"ℹ️  Mock user already exists: {partner.name}")

        # Join the couple
        couple.partner2_uid = MOCK_UID
        db.delete(code)
        db.commit()

        print(f"✅ Done!")
        print(f"   Partner created: {MOCK_NAME} (uid: {MOCK_UID})")
        print(f"   Joined couple id: {couple.id}")
        print(f"   partner1: {couple.partner1_uid}")
        print(f"   partner2: {couple.partner2_uid}")

    except Exception as e:
        db.rollback()
        print(f"❌ Failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
