from datetime import datetime

from pydantic import BaseModel, Field


class DeviceCreate(BaseModel):
    device_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )
    device_identifier: str = Field(
        ...,
        min_length=2,
        max_length=255,
    )


class DeviceUpdate(BaseModel):
    device_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    is_active: bool | None = None


class DeviceResponse(BaseModel):
    id: int
    user_id: int
    device_name: str
    device_identifier: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True