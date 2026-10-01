from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.db.database import Base


class GeofenceRule(Base):
    __tablename__ = "geofence_rules"

    id = Column(Integer, primary_key=True, index=True)

    geofence_id = Column(
        Integer,
        ForeignKey("geofences.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    event_type = Column(
        String(20),
        nullable=False,
    )

    is_enabled = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )