from datetime import datetime

from pydantic import BaseModel, Field, model_validator


class GeofencePointCreate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    point_order: int = Field(..., ge=1)


class GeofenceCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=255)
    geofence_type: str
    center_latitude: float | None = Field(default=None, ge=-90, le=90)
    center_longitude: float | None = Field(default=None, ge=-180, le=180)
    radius: float | None = Field(default=None, gt=0)
    points: list[GeofencePointCreate] | None = None

    @model_validator(mode="after")
    def validate_geofence(self):
        if self.geofence_type not in {"CIRCLE", "POLYGON"}:
            raise ValueError("geofence_type must be CIRCLE or POLYGON")

        if self.geofence_type == "CIRCLE":
            if (
                self.center_latitude is None
                or self.center_longitude is None
                or self.radius is None
            ):
                raise ValueError(
                    "Circle geofence requires center latitude, center longitude, and radius"
                )
            if self.points:
                raise ValueError("Circle geofence cannot contain polygon points")

        if self.geofence_type == "POLYGON":
            if not self.points or len(self.points) < 3:
                raise ValueError("Polygon geofence requires at least 3 points")
            if (
                self.center_latitude is not None
                or self.center_longitude is not None
                or self.radius is not None
            ):
                raise ValueError("Polygon geofence cannot use circle properties")

        return self


class GeofenceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=255)
    geofence_type: str | None = None
    center_latitude: float | None = Field(default=None, ge=-90, le=90)
    center_longitude: float | None = Field(default=None, ge=-180, le=180)
    radius: float | None = Field(default=None, gt=0)
    points: list[GeofencePointCreate] | None = None
    is_active: bool | None = None


class GeofencePointResponse(BaseModel):
    id: int
    geofence_id: int
    latitude: float
    longitude: float
    point_order: int

    class Config:
        from_attributes = True


class GeofenceResponse(BaseModel):
    id: int
    name: str
    description: str | None
    geofence_type: str
    center_latitude: float | None
    center_longitude: float | None
    radius: float | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    points: list[GeofencePointResponse] = []

    class Config:
        from_attributes = True
