from datetime import datetime

from pydantic import BaseModel, Field


class LocationCreate(BaseModel):
    device_id: int = Field(..., gt=0)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    accuracy: float | None = Field(default=None, ge=0)
    recorded_at: datetime


class LocationResponse(BaseModel):
    id: int
    device_id: int
    latitude: float
    longitude: float
    accuracy: float | None
    recorded_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
