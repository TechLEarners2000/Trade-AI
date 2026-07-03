from sqlalchemy import Column, String, Float, JSON, ForeignKey, Boolean, Text, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Alert(BaseModel):
    __tablename__ = "alerts"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=True)
    alert_type = Column(String(100), nullable=False)
    condition = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    notification_type = Column(String(50), default="push")
    cooldown_minutes = Column(Integer, default=60)
    last_triggered = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="alerts")
    stock = relationship("Stock")
    history = relationship("AlertHistory", back_populates="alert", cascade="all, delete-orphan")


class AlertHistory(BaseModel):
    __tablename__ = "alert_history"

    alert_id = Column(UUID(as_uuid=True), ForeignKey("alerts.id", ondelete="CASCADE"), nullable=False)
    triggered_value = Column(Float, nullable=True)
    message = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)

    alert = relationship("Alert", back_populates="history")
