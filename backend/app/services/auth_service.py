from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, UserSession, LoginHistory
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.schemas.user import UserCreate, UserLogin
from fastapi import HTTPException, status
from datetime import datetime, timezone, timedelta
from typing import Optional
import uuid


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, data: UserCreate) -> dict:
        existing = await self.db.execute(select(User).where(User.email == data.email))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        user = User(
            email=data.email,
            full_name=data.full_name,
            password_hash=hash_password(data.password),
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)

        tokens = self._generate_tokens(str(user.id))
        await self._log_login(user, "email", True)
        await self.db.commit()

        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "user": user,
        }

    async def login(self, data: UserLogin, ip: Optional[str] = None) -> dict:
        result = await self.db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()

        if not user or not user.password_hash:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

        if not verify_password(data.password, user.password_hash):
            await self._log_login(user, "email", False, "Invalid password", ip)
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

        user.last_login = datetime.now(timezone.utc)
        tokens = self._generate_tokens(str(user.id))
        await self._log_login(user, "email", True, ip=ip)
        await self.db.commit()

        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "user": user,
        }

    async def google_login(self, google_id: str, email: str, full_name: str, avatar_url: Optional[str] = None) -> dict:
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user:
            user = User(
                email=email,
                full_name=full_name,
                google_id=google_id,
                is_google_user=True,
                is_verified=True,
                avatar_url=avatar_url,
            )
            self.db.add(user)
            await self.db.flush()
            await self.db.refresh(user)
        else:
            user.google_id = google_id
            user.is_google_user = True
            user.is_verified = True
            if avatar_url:
                user.avatar_url = avatar_url

        user.last_login = datetime.now(timezone.utc)
        tokens = self._generate_tokens(str(user.id))
        await self._log_login(user, "google", True)
        await self.db.commit()

        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "user": user,
        }

    async def refresh_token(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        user_id = payload.get("sub")
        tokens = self._generate_tokens(user_id)
        return tokens

    async def get_user_by_id(self, user_id: str) -> User:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    def _generate_tokens(self, user_id: str) -> dict:
        return {
            "access_token": create_access_token({"sub": user_id}),
            "refresh_token": create_refresh_token({"sub": user_id}),
        }

    async def _log_login(self, user: User, login_type: str, success: bool, reason: Optional[str] = None, ip: Optional[str] = None):
        log = LoginHistory(
            user_id=user.id,
            login_type=login_type,
            ip_address=ip,
            is_successful=success,
            failure_reason=reason,
        )
        self.db.add(log)
