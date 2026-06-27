"""
seed_db.py — Insert mock data for local development.

Usage (from inside Docker):
  docker compose -f compose.mobile.yaml exec backend python seed_db.py

This creates:
  - 2 users linked as a couple
  - 3 visits (one past, one active/upcoming, one future)
  - Activity snapshots on the upcoming visit
  - 2 activities in the library
  - 2 wishes per user

The users use FAKE Firebase UIDs — they won't match a real
Firebase auth session. To test with your real account, sign in
once through the app first (which auto-creates your user row),
then run this script to add visits/activities/wishes to your couple.
"""

from datetime import date, datetime, timedelta
from db.db import Session as SessionLocal
from schemas.user import User, Couple
from schemas.visits import Visit
from schemas.activities import Activity, ActivitySnapshot
from schemas.wishes import Wish

def seed():
    db = SessionLocal()
    try:
        # ── Check if already seeded ──────────────────────────────────────
        if db.query(User).count() > 0:
            print("Database already has data. Skipping seed.")
            print("To re-seed, run: docker compose -f compose.mobile.yaml exec backend python db_tool.py clear --all -y")
            return

        today = date.today()

        # ── Users ─────────────────────────────────────────────────────────
        user1 = User(id="mock_uid_user1", name="Alex")
        user2 = User(id="mock_uid_user2", name="Jordan")
        db.add_all([user1, user2])
        db.flush()

        # ── Couple ────────────────────────────────────────────────────────
        couple = Couple(partner1_uid=user1.id, partner2_uid=user2.id)
        db.add(couple)
        db.flush()

        # ── Visits ────────────────────────────────────────────────────────
        past_visit = Visit(
            couple_id=couple.id,
            description="Winter trip to Chicago",
            start=today - timedelta(days=60),
            end=today - timedelta(days=55),
        )
        upcoming_visit = Visit(
            couple_id=couple.id,
            description="Summer trip to NYC",
            start=today + timedelta(days=14),
            end=today + timedelta(days=21),
        )
        future_visit = Visit(
            couple_id=couple.id,
            description="Holiday in Europe",
            start=today + timedelta(days=120),
            end=today + timedelta(days=135),
        )
        db.add_all([past_visit, upcoming_visit, future_visit])
        db.flush()

        # ── Activity snapshots on the upcoming visit ──────────────────────
        visit_start = today + timedelta(days=14)
        snapshots = [
            ActivitySnapshot(
                visit_id=upcoming_visit.id,
                date=visit_start,
                name="Flight arrives — check in to hotel",
                category="Travel",
                order_index=0,
            ),
            ActivitySnapshot(
                visit_id=upcoming_visit.id,
                date=visit_start,
                name="Dinner at a nice restaurant",
                category="Food",
                order_index=1,
            ),
            ActivitySnapshot(
                visit_id=upcoming_visit.id,
                date=visit_start + timedelta(days=1),
                name="Central Park morning walk",
                category="Outdoors",
                order_index=0,
            ),
            ActivitySnapshot(
                visit_id=upcoming_visit.id,
                date=visit_start + timedelta(days=1),
                name="Museum of Modern Art",
                category="Culture",
                order_index=1,
            ),
            ActivitySnapshot(
                visit_id=upcoming_visit.id,
                date=visit_start + timedelta(days=2),
                name="Brooklyn Bridge & DUMBO",
                category="Sightseeing",
                order_index=0,
            ),
        ]
        db.add_all(snapshots)

        # ── Activity library ──────────────────────────────────────────────
        activities = [
            Activity(couple_id=couple.id, name="Cooking dinner together", category="Food"),
            Activity(couple_id=couple.id, name="Sunset hike", category="Outdoors"),
            Activity(couple_id=couple.id, name="Board game night", category="Indoor"),
            Activity(couple_id=couple.id, name="Picnic in the park", category="Outdoors"),
            Activity(couple_id=couple.id, name="Movie marathon", category="Indoor"),
            Activity(couple_id=couple.id, name="Local food tour", category="Food"),
        ]
        db.add_all(activities)

        # ── Wishes ────────────────────────────────────────────────────────
        wishes = [
            Wish(uid=user1.id, description="New running shoes", category="Clothing", fulfilled=False),
            Wish(uid=user1.id, description="Polaroid camera", category="Tech", fulfilled=True),
            Wish(uid=user2.id, description="Recipe book", category="Books", fulfilled=False),
            Wish(uid=user2.id, description="Cozy blanket", category="Home", fulfilled=False),
        ]
        db.add_all(wishes)

        db.commit()
        print("✅ Seed complete!")
        print(f"   Users:      {user1.name} (uid: {user1.id})")
        print(f"               {user2.name} (uid: {user2.id})")
        print(f"   Couple id:  {couple.id}")
        print(f"   Visits:     {past_visit.description} (past)")
        print(f"               {upcoming_visit.description} (in 14 days)")
        print(f"               {future_visit.description} (in 120 days)")
        print(f"   Snapshots:  {len(snapshots)} activities on the upcoming visit")
        print(f"   Library:    {len(activities)} activities")
        print(f"   Wishes:     {len(wishes)} items")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
