from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class GeofenceRuleCreate(BaseModel):
    event_type: str
    is_enabled: bool = True

    @field_validator("event_type")
    @classmethod
    def validate_event_type(cls, value: str) -> str:
        allowed_events = {
            "ENTER",
            "EXIT",
            "INSIDE",
            "OUTSIDE",
        }

        value = value.upper()

        if value not in allowed_events:
            raise ValueError(
                "event_type must be ENTER, EXIT, INSIDE, or OUTSIDE"
            )

        return value


class GeofenceRuleUpdate(BaseModel):
    is_enabled: bool


class GeofenceRuleResponse(BaseModel):
    id: int
    geofence_id: int
    event_type: str
    is_enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True