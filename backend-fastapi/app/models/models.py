from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    chinese_name = Column(String(50))
    role = Column(String(20), default="user")
    created_at = Column(DateTime, default=func.now())


class Shop(Base):
    __tablename__ = "shops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    url = Column(String(500))
    created_at = Column(DateTime, default=func.now())


class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(200), nullable=False)
    details = Column(Text)
    level = Column(String(20), default="info")
    log_type = Column(String(20), default="user")
    user_id = Column(Integer)
    created_at = Column(DateTime, default=func.now())
