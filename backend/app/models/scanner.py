from sqlalchemy import Column, String, Text, JSON, ForeignKey, Boolean, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class SavedScan(BaseModel):
    __tablename__ = "saved_scans"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    scan_config = Column(JSON, nullable=False)
    is_shared = Column(Boolean, default=False, nullable=False)
    share_url = Column(String(500), nullable=True)
    is_prebuilt = Column(Boolean, default=False, nullable=False)
    category = Column(String(100), nullable=True)

    user = relationship("User", back_populates="saved_scans")
    history = relationship("ScanHistory", back_populates="scan", cascade="all, delete-orphan")


class ScanHistory(BaseModel):
    __tablename__ = "scan_history"

    scan_id = Column(UUID(as_uuid=True), ForeignKey("saved_scans.id", ondelete="CASCADE"), nullable=False)
    result_count = Column(Integer, nullable=False)
    results = Column(JSON, nullable=True)
    execution_time = Column(Float, nullable=True)
    scan_config = Column(JSON, nullable=True)

    scan = relationship("SavedScan", back_populates="history")
