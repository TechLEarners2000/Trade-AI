from sqlalchemy import Column, String, Text, JSON, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class LearningContent(BaseModel):
    __tablename__ = "learning_content"

    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    subcategory = Column(String(100), nullable=True)
    difficulty = Column(String(20), default="beginner")
    tags = Column(JSON, nullable=True)
    image_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)
    author = Column(String(255), nullable=True)


class GlossaryTerm(BaseModel):
    __tablename__ = "glossary_terms"

    term = Column(String(255), nullable=False, unique=True)
    definition = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    related_terms = Column(JSON, nullable=True)
