from services.visits import get_visits, create_visit, delete_visit, get_visit_schedule, save_visit_schedule
from schemas.user import User, Couple
from schemas.visits import Visit
from schemas.activities import ActivitySnapshot as ActivitySnapshotSchema
from schemas.activities import ActivitySnapshot
from models.visits import CreateVisit
from models.activities import CreateActivitySnapshot
from sqlalchemy import select
from datetime import date

def setup_couple(db, uid1="visit-user-1", uid2="visit-user-2", couple_id=100):
    """Helper to create two users and a couple."""
    db.add(User(id=uid1, name="Alice"))
    db.add(User(id=uid2, name="Bob"))
    db.commit()
    db.add(Couple(id=couple_id, partner1_uid=uid1, partner2_uid=uid2))
    db.commit()
    return couple_id

def test_get_visits_empty(db):
    """Case 1: Couple exists but has no visits."""
    uid1, uid2 = "no-visit-1", "no-visit-2"
    setup_couple(db, uid1, uid2, couple_id=200)

    visits = get_visits(uid=uid1, db=db)
    assert visits == []

def test_get_visits_returns_ordered(db):
    """Case 2: Couple has multiple visits, returned in order by start date."""
    uid1, uid2 = "ordered-visit-1", "ordered-visit-2"
    couple_id = setup_couple(db, uid1, uid2, couple_id=201)

    db.add(Visit(couple_id=couple_id, start=date(2026, 6, 10), end=date(2026, 6, 15), description="Later trip"))
    db.add(Visit(couple_id=couple_id, start=date(2026, 3, 1), end=date(2026, 3, 5), description="Earlier trip"))
    db.commit()

    visits = get_visits(uid=uid1, db=db)
    assert len(visits) == 2
    assert visits[0].description == "Earlier trip"
    assert visits[1].description == "Later trip"

def test_get_visits_as_partner2(db):
    """Case 3: Partner 2 can also fetch the couple's visits."""
    uid1, uid2 = "p2-visit-1", "p2-visit-2"
    couple_id = setup_couple(db, uid1, uid2, couple_id=202)

    db.add(Visit(couple_id=couple_id, start=date(2026, 4, 1), end=date(2026, 4, 3), description="Spring visit"))
    db.commit()

    visits = get_visits(uid=uid2, db=db)
    assert len(visits) == 1
    assert visits[0].description == "Spring visit"

def test_get_visits_no_couple(db):
    """Case 4: User has no couple - should raise."""
    db.add(User(id="solo-visit-user", name="Solo"))
    db.commit()

    try:
        get_visits(uid="solo-visit-user", db=db)
        assert False, "Expected an exception"
    except Exception as e:
        assert "Couple not found" in str(e)

def test_create_visit_no_schedule(db):
    """Case 5: Create a visit with no schedule."""
    uid1, uid2 = "create-v-1", "create-v-2"
    couple_id = setup_couple(db, uid1, uid2, couple_id=203)

    visit_data = CreateVisit(description="Weekend trip", start=date(2026, 5, 1), end=date(2026, 5, 3))
    create_visit(visit=visit_data, schedule=[], uid=uid1, db=db)

    visits = db.execute(select(Visit).where(Visit.couple_id == couple_id)).scalars().all()
    assert len(visits) == 1
    assert visits[0].description == "Weekend trip"
    assert visits[0].start == date(2026, 5, 1)
    assert visits[0].end == date(2026, 5, 3)

def test_create_visit_with_schedule(db):
    """Case 6: Create a visit with activity snapshots."""
    uid1, uid2 = "sched-v-1", "sched-v-2"
    couple_id = setup_couple(db, uid1, uid2, couple_id=204)

    visit_data = CreateVisit(description="Planned trip", start=date(2026, 7, 10), end=date(2026, 7, 12))
    schedule = [
        CreateActivitySnapshot(activity_id=None, date=date(2026, 7, 10), name="Hiking", category="Outdoors", order_index=0),
        CreateActivitySnapshot(activity_id=None, date=date(2026, 7, 11), name="Dinner", category="Food", order_index=0),
    ]
    create_visit(visit=visit_data, schedule=schedule, uid=uid1, db=db)

    visits = db.execute(select(Visit).where(Visit.couple_id == couple_id)).scalars().all()
    assert len(visits) == 1

    snapshots = db.execute(select(ActivitySnapshot).where(ActivitySnapshot.visit_id == visits[0].id)).scalars().all()
    assert len(snapshots) == 2
    assert snapshots[0].name == "Hiking"
    assert snapshots[1].name == "Dinner"

def test_create_visit_no_couple(db):
    """Case 7: Creating a visit without a couple should raise."""
    db.add(User(id="solo-create-user", name="Solo"))
    db.commit()

    visit_data = CreateVisit(description="Impossible trip", start=date(2026, 8, 1), end=date(2026, 8, 3))

    try:
        create_visit(visit=visit_data, schedule=[], uid="solo-create-user", db=db)
        assert False, "Expected an exception"
    except Exception as e:
        assert "Couple not found" in str(e)

def test_delete_visit_no_couple(db):
    """Case 8: Deleting a visit without a couple should return None."""
    uid1, uid2 = "delete-v-1", "delete-v-2"
    couple_id = setup_couple(db, uid1, uid2, couple_id=205)

    visit_data = CreateVisit(description="Delete trip", start=date(2026, 9, 1), end=date(2026, 9, 3))
    create_visit(visit=visit_data, schedule=[], uid=uid1, db=db)

    visit = delete_visit(id=1, uid=uid2, db=db)
    assert visit is None

def test_delete_visit_no_visit(db):
    """Case 9: Deleting a visit that doesn't exist should return None."""
    uid1, uid2 = "delete-v-3", "delete-v-4"
    couple_id = setup_couple(db, uid1, uid2, couple_id=206)

    visit_data = CreateVisit(description="Delete trip", start=date(2026, 9, 1), end=date(2026, 9, 3))
    create_visit(visit=visit_data, schedule=[], uid=uid1, db=db)

    visit = delete_visit(id=1, uid=uid2, db=db)
    assert visit is None

def test_delete_visit_success(db):
    """Case 10: Deleting a visit should delete the visit and all associated activity snapshots."""
    uid1, uid2 = "delete-v-5", "delete-v-6"
    couple_id = setup_couple(db, uid1, uid2, couple_id=207)

    visit_data = CreateVisit(description="Delete trip", start=date(2026, 9, 1), end=date(2026, 9, 3))
    visit = create_visit(visit=visit_data, schedule=[], uid=uid1, db=db)
    id = visit.id
    visit = delete_visit(id=id, uid=uid2, db=db)
    assert visit is not None
    assert visit.id == id
    assert visit.description == "Delete trip"
    assert visit.start == date(2026, 9, 1)

def test_get_visit_schedule_success(db):
    """Case 12: Getting a visit schedule should return the schedule."""
    uid1, uid2 = "schedule-v-3", "schedule-v-4"
    couple_id = setup_couple(db, uid1, uid2, couple_id=209)

    visit_data = CreateVisit(description="Schedule trip", start=date(2026, 9, 1), end=date(2026, 9, 3))
    visit = create_visit(visit=visit_data, schedule=[], uid=uid1, db=db)

    schedule = get_visit_schedule(id=visit.id, uid=uid2, db=db)
    assert schedule is not None
    assert len(schedule) == 0

def test_get_visit_schedule_success_with_schedule(db):
    """Case 13: Getting a visit schedule with a schedule should return the schedule."""
    uid1, uid2 = "schedule-v-5", "schedule-v-6"
    couple_id = setup_couple(db, uid1, uid2, couple_id=210)
    visit_data = CreateVisit(description="Schedule trip", start=date(2026, 9, 1), end=date(2026, 9, 3))
    schedule = [
        CreateActivitySnapshot(activity_id=None, date=date(2026, 9, 1), name="Hiking", category="Outdoors", order_index=0),
        CreateActivitySnapshot(activity_id=None, date=date(2026, 9, 2), name="Dinner", category="Food", order_index=0),
    ]
    visit = create_visit(visit=visit_data, schedule=schedule, uid=uid1, db=db)
    schedule = get_visit_schedule(id=visit.id, uid=uid2, db=db)
    assert schedule is not None
    assert len(schedule) == 2

def test_save_visit_schedule_success(db):
    """Case 14: Saving a visit schedule should save the schedule."""
    uid1, uid2 = "save-v-1", "save-v-2"
    couple_id = setup_couple(db, uid1, uid2, couple_id=211)
    visit_data = CreateVisit(description="Save trip", start=date(2026, 9, 1), end=date(2026, 9, 3))
    visit = create_visit(visit=visit_data, schedule=[
        CreateActivitySnapshot(activity_id=None, date=date(2026, 9, 1), name="Breakfast", category="Food", order_index=0),
    ], uid=uid1, db=db)
    to_add = [
        CreateActivitySnapshot(activity_id=None, date=date(2026, 9, 1), name="Hiking", category="Outdoors", order_index=0),
    ]
    activity_snapshot = db.execute(select(ActivitySnapshot).where(ActivitySnapshot.visit_id == visit.id)).scalar_one()
    to_delete = [activity_snapshot.id]
    visit_id = save_visit_schedule(id=visit.id, to_add=to_add, to_delete=to_delete, uid=uid2, db=db)
    assert visit_id is not None
    assert visit_id == visit.id
    schedule = get_visit_schedule(id=visit_id, uid=uid2, db=db)
    assert schedule is not None
    assert len(schedule) == 1
    assert schedule[0].name == "Hiking"
    assert schedule[0].date == date(2026, 9, 1)
    assert schedule[0].category == "Outdoors"
    assert schedule[0].order_index == 0