from fastapi import APIRouter, HTTPException, status
from app.schemas.user import UserResponse
from app.models.user import UserModel
from bson import ObjectId

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user():
    # In a real app, this would use a JWT bearer token dependency to get the user ID
    # For now, this is a placeholder returning a dummy user or failing gracefully
    return {
        "_id": str(ObjectId()),
        "username": "DemoUser",
        "email": "demo@example.com",
        "fan_level": "SUPERFAN",
        "xp": 1250,
        "favorite_universes": ["one-piece", "marvel"],
        "favorite_characters": ["luffy", "spiderman"],
        "created_at": "2024-01-01T00:00:00Z"
    }

@router.put("/{user_id}/profile")
async def update_profile(user_id: str, profile_data: dict):
    try:
        await UserModel.update_user(user_id, profile_data)
        updated_user = await UserModel.find_by_id(user_id)
        if updated_user and "_id" in updated_user:
            updated_user["_id"] = str(updated_user["_id"])
        return updated_user or profile_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )
