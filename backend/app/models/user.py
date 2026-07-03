import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from app.core.database import Base


class User(BaseModel):
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, nullable=True)
    full_name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_google_user = Column(Boolean, default=False, nullable=False)
    google_id = Column(String(255), nullable=True)
    is_admin = Column(Boolean, default=False, nullable=False)
    is_premium = Column(Boolean, default=False, nullable=False)
    preferences = Column(JSON, default=dict, nullable=True)
    last_login = Column(DateTime(timezone=True), nullable=True)

    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    login_history = relationship("LoginHistory", back_populates="user", cascade="all, delete-orphan")
    watchlists = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")
    portfolios = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")
    saved_scans = relationship("SavedScan", back_populates="user", cascade="all, delete-orphan")
    backtest_strategies = relationship("BacktestStrategy", back_populates="user", cascade="all, delete-orphan")


class UserSession(BaseModel):
    __tablename__ = "user_sessions"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    refresh_token = Column(String(500), nullable=False)
    device_info = Column(String(500), nullable=True)
    ip_address = Column(String(50), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="sessions")


class LoginHistory(BaseModel):
    __tablename__ = "login_history"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    login_type = Column(String(50), nullable=False)
    ip_address = Column(String(50), nullable=True)
    device_info = Column(String(500), nullable=True)
    is_successful = Column(Boolean, default=True, nullable=False)
    failure_reason = Column(String(255), nullable=True)

    user = relationship("User", back_populates="login_history")
