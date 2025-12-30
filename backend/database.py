import secrets
import string
from datetime import datetime, timezone
from typing import List

from sqlalchemy import Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

engine = create_engine("sqlite:///database.db")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Characters for short ID generation (alphanumeric, no ambiguous chars)
SHORT_ID_CHARS = string.ascii_lowercase + string.digits
SHORT_ID_LENGTH = 6


def utc_now():
    return datetime.now(timezone.utc)


def generate_short_id():
    """Generate a short unique ID like 'x7k2m9'."""
    return "".join(secrets.choice(SHORT_ID_CHARS) for _ in range(SHORT_ID_LENGTH))


class Memory(Base):
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, index=True)
    short_id = Column(String(10), unique=True, index=True, nullable=False)
    user_id = Column(String, nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class MemoryRepository:
    @staticmethod
    def get_memories_by_user(user_id: str) -> List[Memory]:
        db = SessionLocal()
        try:
            return (
                db.query(Memory)
                .filter(Memory.user_id == user_id)
                .order_by(Memory.created_at.desc())
                .all()
            )
        finally:
            db.close()

    @staticmethod
    def create_memory(user_id: str, content: str) -> Memory:
        db = SessionLocal()
        try:
            # Generate unique short_id
            short_id = generate_short_id()
            while db.query(Memory).filter(Memory.short_id == short_id).first():
                short_id = generate_short_id()

            memory = Memory(user_id=user_id, content=content, short_id=short_id)
            db.add(memory)
            db.commit()
            db.refresh(memory)
            return memory
        finally:
            db.close()

    @staticmethod
    def get_memory_by_id(memory_id: int, user_id: str) -> Memory | None:
        db = SessionLocal()
        try:
            return (
                db.query(Memory)
                .filter(Memory.id == memory_id, Memory.user_id == user_id)
                .first()
            )
        finally:
            db.close()

    @staticmethod
    def get_memory_by_short_id(short_id: str, user_id: str) -> Memory | None:
        db = SessionLocal()
        try:
            return (
                db.query(Memory)
                .filter(Memory.short_id == short_id, Memory.user_id == user_id)
                .first()
            )
        finally:
            db.close()

    @staticmethod
    def update_memory(memory_id: int, user_id: str, content: str) -> Memory | None:
        db = SessionLocal()
        try:
            memory = (
                db.query(Memory)
                .filter(Memory.id == memory_id, Memory.user_id == user_id)
                .first()
            )
            if memory:
                memory.content = content
                memory.updated_at = utc_now()
                db.commit()
                db.refresh(memory)
            return memory
        finally:
            db.close()

    @staticmethod
    def delete_memory(memory_id: int, user_id: str) -> bool:
        db = SessionLocal()
        try:
            memory = (
                db.query(Memory)
                .filter(Memory.id == memory_id, Memory.user_id == user_id)
                .first()
            )
            if memory:
                db.delete(memory)
                db.commit()
                return True
            return False
        finally:
            db.close()
