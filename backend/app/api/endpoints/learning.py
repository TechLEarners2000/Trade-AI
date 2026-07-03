from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.learning import LearningContent, GlossaryTerm
from sqlalchemy import select

router = APIRouter()


@router.get("/content")
async def get_learning_content(
    category: str = None,
    difficulty: str = Query(None, regex="^(beginner|intermediate|advanced)$"),
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    query = select(LearningContent).where(LearningContent.is_published == True)
    if category:
        query = query.where(LearningContent.category == category)
    if difficulty:
        query = query.where(LearningContent.difficulty == difficulty)
    query = query.limit(limit)
    result = await db.execute(query)
    contents = result.scalars().all()
    return [
        {
            "id": str(c.id), "title": c.title, "category": c.category,
            "subcategory": c.subcategory, "difficulty": c.difficulty,
            "tags": c.tags, "image_url": c.image_url,
        }
        for c in contents
    ]


@router.get("/content/{content_id}")
async def get_learning_content_detail(content_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LearningContent).where(LearningContent.id == content_id))
    content = result.scalar_one_or_none()
    if not content:
        return {"error": "Content not found"}
    return {
        "id": str(content.id), "title": content.title, "content": content.content,
        "category": content.category, "subcategory": content.subcategory,
        "difficulty": content.difficulty, "tags": content.tags,
        "image_url": content.image_url, "video_url": content.video_url,
    }


@router.get("/glossary")
async def get_glossary(term: str = None, limit: int = 100, db: AsyncSession = Depends(get_db)):
    query = select(GlossaryTerm)
    if term:
        query = query.where(GlossaryTerm.term.ilike(f"%{term}%"))
    query = query.limit(limit)
    result = await db.execute(query)
    terms = result.scalars().all()
    return [
        {"id": str(t.id), "term": t.term, "definition": t.definition, "category": t.category}
        for t in terms
    ]
