from services.auth import me, update_name
from schemas.user import User, Couple
from sqlalchemy import select
from datetime import datetime
from services.auth import create_code, join_couple

def test_init_new_user(db):
    """Case 1: User doesn't exist - should be initialized with empty name."""
    uid = "new-firebase-uid"
    result = me(uid=uid, db=db)
    
    assert result.uid == uid
    assert result.name == ""
    assert result.couple is None
    
    # Verify it was actually saved to DB
    user_in_db = db.query(User).filter(User.id == uid).first()
    assert user_in_db is not None

def test_get_existing_user_no_couple(db):
    """Case 2: User exists but has no couple relationship."""
    uid = "lonely-user"
    db.add(User(id=uid, name="Solitary Sam"))
    db.commit()
    
    result = me(uid=uid, db=db)
    assert result.uid == uid
    assert result.name == "Solitary Sam"
    assert result.couple is None

def test_get_user_with_partner(db):
    """Case 3: User exists and has a couple with a partner."""
    uid1 = "partner-1"
    uid2 = "partner-2"
    
    # Setup: Create two users and a couple connecting them
    db.add(User(id=uid1, name="Romeo"))
    db.add(User(id=uid2, name="Juliet"))
    db.commit() # Commit users first to satisfy foreign key constraints
    
    db.add(Couple(id=1, partner1_uid=uid1, partner2_uid=uid2))
    db.commit()
    
    # Test for Partner 1
    result1 = me(uid=uid1, db=db)
    assert result1.couple.id == 1
    assert result1.couple.partner.uid == uid2
    assert result1.couple.partner.name == "Juliet"
    
    # Test for Partner 2
    result2 = me(uid=uid2, db=db)
    assert result2.couple.id == 1
    assert result2.couple.partner.uid == uid1
    assert result2.couple.partner.name == "Romeo"

def test_get_user_with_incomplete_couple(db):
    """Case 4: User has a couple entry but no second partner yet."""
    uid = "waiting-user"
    db.add(User(id=uid, name="Waiting Wendy"))
    db.commit()
    
    db.add(Couple(id=2, partner1_uid=uid, partner2_uid=None))
    db.commit()
    
    result = me(uid=uid, db=db)
    assert result.couple.id == 2
    assert result.couple.partner is None

def test_update_name(db):
    """Case 5: Update user name."""
    uid = "update-user"
    db.add(User(id=uid, name=""))
    db.commit()
    
    update_name(name="New Name", uid=uid, db=db)
    user = db.execute(select(User).where(User.id == uid)).scalar_one()

    assert user.name == "New Name"

def test_create_code(db):
    """Case 6: Create a new code."""
    uid = "create-user"
    db.add(User(id=uid, name=""))
    db.commit()
    
    code = create_code(uid=uid, db=db)
    assert code.code is not None
    assert code.expires_at is not None
    assert code.expires_at > datetime.now()

def test_join_couple(db):
    """Case 7: Join a couple using a code."""
    uid = "join-user"
    db.add(User(id=uid, name=""))
    db.commit()
    
    code = create_code(uid=uid, db=db)
    
    couple = join_couple(code.code, uid, db)
    assert couple.id is not None
    assert couple.partner.uid is not None