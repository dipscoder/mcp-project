import os
import secrets
import string
from datetime import datetime, timezone
from typing import List

from dotenv import load_dotenv
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

# Load environment variables
load_dotenv()

# Get database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
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


# Constants for validation
MAX_TITLE_LENGTH = 100
MAX_CONTENT_LENGTH = 10000


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    stytch_user_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=True)
    name = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationship to memories
    memories = relationship("Memory", back_populates="user", cascade="all, delete-orphan")


class Memory(Base):
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, index=True)
    short_id = Column(String(10), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(MAX_TITLE_LENGTH), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationship to user
    user = relationship("User", back_populates="memories")


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class UserRepository:
    @staticmethod
    def get_or_create_user(stytch_user_id: str, email: str = None, name: str = None) -> User:
        """Get existing user or create a new one."""
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.stytch_user_id == stytch_user_id).first()
            if not user:
                user = User(stytch_user_id=stytch_user_id, email=email, name=name)
                db.add(user)
                db.commit()
                db.refresh(user)
            elif email and user.email != email:
                # Update email if changed
                user.email = email
                if name:
                    user.name = name
                db.commit()
                db.refresh(user)
            return user
        finally:
            db.close()

    @staticmethod
    def get_user_by_stytch_id(stytch_user_id: str) -> User | None:
        """Get user by Stytch user ID."""
        db = SessionLocal()
        try:
            return db.query(User).filter(User.stytch_user_id == stytch_user_id).first()
        finally:
            db.close()


class MemoryRepository:
    @staticmethod
    def get_memories_by_user(stytch_user_id: str) -> List[Memory]:
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.stytch_user_id == stytch_user_id).first()
            if not user:
                return []
            return (
                db.query(Memory)
                .filter(Memory.user_id == user.id)
                .order_by(Memory.created_at.desc())
                .all()
            )
        finally:
            db.close()

    @staticmethod
    def create_memory(stytch_user_id: str, title: str, content: str) -> Memory:
        db = SessionLocal()
        try:
            # Get or create user
            user = db.query(User).filter(User.stytch_user_id == stytch_user_id).first()
            if not user:
                user = User(stytch_user_id=stytch_user_id)
                db.add(user)
                db.commit()
                db.refresh(user)

            # Generate unique short_id
            short_id = generate_short_id()
            while db.query(Memory).filter(Memory.short_id == short_id).first():
                short_id = generate_short_id()

            memory = Memory(
                user_id=user.id, title=title, content=content, short_id=short_id
            )
            db.add(memory)
            db.commit()
            db.refresh(memory)
            return memory
        finally:
            db.close()

    @staticmethod
    def get_memory_by_id(memory_id: int, stytch_user_id: str) -> Memory | None:
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.stytch_user_id == stytch_user_id).first()
            if not user:
                return None
            return (
                db.query(Memory)
                .filter(Memory.id == memory_id, Memory.user_id == user.id)
                .first()
            )
        finally:
            db.close()

    @staticmethod
    def get_memory_by_short_id(short_id: str, stytch_user_id: str) -> Memory | None:
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.stytch_user_id == stytch_user_id).first()
            if not user:
                return None
            return (
                db.query(Memory)
                .filter(Memory.short_id == short_id, Memory.user_id == user.id)
                .first()
            )
        finally:
            db.close()

    @staticmethod
    def update_memory(
        memory_id: int, stytch_user_id: str, title: str, content: str
    ) -> Memory | None:
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.stytch_user_id == stytch_user_id).first()
            if not user:
                return None
            memory = (
                db.query(Memory)
                .filter(Memory.id == memory_id, Memory.user_id == user.id)
                .first()
            )
            if memory:
                memory.title = title
                memory.content = content
                memory.updated_at = utc_now()
                db.commit()
                db.refresh(memory)
            return memory
        finally:
            db.close()

    @staticmethod
    def delete_memory(memory_id: int, stytch_user_id: str) -> bool:
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.stytch_user_id == stytch_user_id).first()
            if not user:
                return False
            memory = (
                db.query(Memory)
                .filter(Memory.id == memory_id, Memory.user_id == user.id)
                .first()
            )
            if memory:
                db.delete(memory)
                db.commit()
                return True
            return False
        finally:
            db.close()
