import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.db import Base

# Force SQLite for all tests
TEST_DB_URL = "sqlite:///./test_all.db"

# Create a test-specific engine and session factory
test_engine = create_engine(
    TEST_DB_URL, 
    connect_args={"check_same_thread": False}
)
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Sets up the SQLite database once per test session."""
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    
    # CLEANUP
    test_engine.dispose()
    if os.path.exists("./test_all.db"):
        os.remove("./test_all.db")
        print("\n🗑️  Test database deleted.")


@pytest.fixture
def db():
    """Provides a fresh SQLite session for each test."""
    session = TestSession()
    try:
        yield session
    finally:
        session.close()