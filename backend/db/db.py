from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from sqlalchemy.orm import declarative_base

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")

if DB_URL:
    engine = create_engine(DB_URL)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    engine = None
    Session = None

Base = declarative_base()

def get_db():
    with Session() as db:
        yield db