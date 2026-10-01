from sqlalchemy import Column, Float, ForeignKey, Integer

from app.db.database import Base


class GeofencePoint(Base):
    __tablename__ = "geofence_points"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    geofence_id = Column(
        Integer,
        ForeignKey("geofences.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    latitude = Column(
        Float,
        nullable=False,
    )

    longitude = Column(
        Float,
        nullable=False,
    )

    point_order = Column(
        Integer,
        nullable=False,
    )