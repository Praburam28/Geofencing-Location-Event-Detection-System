from datetime import datetime

from pydantic import BaseModel


class GeofenceEventResponse(BaseModel):
    id: int
    device_id: int
    geofence_id: int
    location_event_id: int
    event_type: str
    previous_state: str
    current_state: str
    latitude: float
    longitude: float
    event_timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True