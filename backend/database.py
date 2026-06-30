import os
import json
from sqlalchemy import create_engine, String
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.types import TypeDecorator
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/scholarships")

# If using SQLite, patch ARRAY to use JSON
if DATABASE_URL.startswith("sqlite"):
    class JSONList(TypeDecorator):
        impl = String
        cache_ok = True

        def process_bind_param(self, value, dialect):
            if value is None:
                return "[]"
            if isinstance(value, list):
                return json.dumps(value)
            return value

        def process_result_value(self, value, dialect):
            if not value:
                return []
            try:
                return json.loads(value)
            except Exception:
                return []
                
    from sqlalchemy.dialects import postgresql
    postgresql.ARRAY = lambda item_type, **kw: JSONList()
    
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

from typing import Generator
from sqlalchemy.orm import Session

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
