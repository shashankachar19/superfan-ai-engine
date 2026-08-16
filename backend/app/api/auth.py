from fastapi import APIRouter, HTTPException, status
from datetime import datetime
import uuid

from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.models.user import UserModel
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    existing_user = await UserModel.find_by_email(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_data = {
        "username": user.username,
        "email": user.email,
        "password_hash": get_password_hash(user.password),
        "fan_level": "NEW FAN",
        "xp": 0,
        "favorite_universes": [],
        "favorite_characters": [],
        "created_at": datetime.utcnow()
    }
    
    user_id = await UserModel.create_user(user_data)
    user_data["_id"] = user_id
    
    return user_data

@router.post("/login")
async def login(user: UserLogin):
    db_user = await UserModel.find_by_email(user.email)
    if not db_user or not verify_password(user.password, db_user.get("password_hash")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if "_id" in db_user:
        db_user["_id"] = str(db_user["_id"])
        
    access_token = create_access_token(subject=db_user["_id"])
        
    return {"access_token": access_token, "token_type": "bearer", "user": UserResponse(**db_user).model_dump(by_alias=True)}
