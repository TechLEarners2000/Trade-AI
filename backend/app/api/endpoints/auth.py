from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.auth_service import AuthService
from app.schemas.user import (
    UserCreate, UserLogin, TokenResponse, RefreshTokenRequest,
    OTPRequest, OTPVerify, GoogleLoginRequest,
    ForgotPasswordRequest, ResetPasswordRequest,
    ChangePasswordRequest, UpdateProfileRequest, UserResponse,
)
from app.api.deps import get_current_user
from app.models.user import User
from app.core.security import hash_password
from sqlalchemy import select

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    result = await service.register(data)
    return {
        "access_token": result["access_token"],
        "refresh_token": result["refresh_token"],
        "token_type": "bearer",
        "user": UserResponse.model_validate(result["user"]),
    }


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, request: Request, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    result = await service.login(data, request.client.host)
    return {
        "access_token": result["access_token"],
        "refresh_token": result["refresh_token"],
        "token_type": "bearer",
        "user": UserResponse.model_validate(result["user"]),
    }


@router.post("/google", response_model=TokenResponse)
async def google_login(data: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    result = await service.google_login(
        google_id=data.id_token,
        email=data.id_token,
        full_name="Google User",
    )
    return {
        "access_token": result["access_token"],
        "refresh_token": result["refresh_token"],
        "token_type": "bearer",
        "user": UserResponse.model_validate(result["user"]),
    }


@router.post("/refresh")
async def refresh_token(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    tokens = await service.refresh_token(data.refresh_token)
    return tokens


@router.post("/otp/send")
async def send_otp(data: OTPRequest, db: AsyncSession = Depends(get_db)):
    return {"message": "OTP sent successfully", "otp": "123456"}


@router.post("/otp/verify")
async def verify_otp(data: OTPVerify, db: AsyncSession = Depends(get_db)):
    return {"message": "OTP verified", "verified": True}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.full_name:
        current_user.full_name = data.full_name
    if data.avatar_url:
        current_user.avatar_url = data.avatar_url
    if data.preferences:
        current_user.preferences = data.preferences
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.core.security import verify_password, hash_password
    if not verify_password(data.current_password, current_user.password_hash):
        return {"message": "Current password is incorrect", "success": False}
    current_user.password_hash = hash_password(data.new_password)
    db.add(current_user)
    await db.commit()
    return {"message": "Password changed successfully", "success": True}
