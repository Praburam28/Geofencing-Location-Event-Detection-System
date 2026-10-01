from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.db.database import Base


class GeofenceEvent(Base):
    __tablename__ = "geofence_events"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    device_id = Column(
        Integer,
        ForeignKey("devices.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    geofence_id = Column(
        Integer,
        ForeignKey("geofences.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    location_event_id = Column(
        Integer,
        ForeignKey("location_events.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    event_type = Column(
        String(20),
        nullable=False,
    )

    previous_state = Column(
        String(20),
        nullable=False,
    )

    current_state = Column(
        String(20),
        nullable=False,
    )

    latitude = Column(
        Float,
        nullable=False,
    )

    longitude = Column(
        Float,
        nullable=False,
    )

    event_timestamp = Column(
        DateTime,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )