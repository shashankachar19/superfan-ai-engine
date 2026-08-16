from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.universe import UniverseResponse, CharacterResponse
from app.models.universe import UniverseModel, CharacterModel

router = APIRouter()

@router.get("/", response_model=List[UniverseResponse])
async def get_universes():
    universes = await UniverseModel.get_all()
    # In dev fallback mode if DB is empty, the frontend will use mock data
    return universes

@router.get("/{universe_id}", response_model=UniverseResponse)
async def get_universe(universe_id: str):
    universe = await UniverseModel.get_by_id(universe_id)
    if not universe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Universe not found"
        )
    return universe

@router.get("/{universe_id}/characters", response_model=List[CharacterResponse])
async def get_characters(universe_id: str):
    characters = await CharacterModel.get_by_universe(universe_id)
    return characters
