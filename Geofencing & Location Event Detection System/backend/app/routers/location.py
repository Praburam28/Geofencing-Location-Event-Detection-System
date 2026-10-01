from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.device import Device
from app.models.geofence import Geofence
from app.models.geofence_point import GeofencePoint
from app.models.location_event import LocationEvent
from app.models.user import User
from app.schemas.location import LocationCreate, LocationResponse
from app.services.geofence_state import process_geofence_state
from app.geofencing.circle import is_point_inside_circle
from app.geofencing.polygon import is_point_inside_polygon

router = APIRouter(prefix="/locations", tags=["Locations"])


@router.post(
    "/",
    response_model=LocationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_location(
    location_data: LocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    device = (
        db.query(Device)
        .filter(
            Device.id == location_data.device_id,
            Device.user_id == current_user.id,
        )
        .first()
    )

    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found",
        )

    if not device.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Device is inactive",
        )

    location_event = LocationEvent(
        device_id=device.id,
        latitude=location_data.latitude,
        longitude=location_data.longitude,
        accuracy=location_data.accuracy,
        recorded_at=location_data.recorded_at,
    )

    db.add(location_event)
    db.commit()
    db.refresh(location_event)

    # If GPS accuracy is poor, store the location
    # but do not use it for geofence event detection.
    if (
        location_data.accuracy is not None
        and location_data.accuracy > settings.MAX_GPS_ACCURACY
    ):
        return location_event

    geofences = (
        db.query(Geofence)
        .filter(Geofence.is_active.is_(True))
        .all()
    )

    for geofence in geofences:
        is_inside = False

        if geofence.geofence_type == "CIRCLE":
            is_inside = is_point_inside_circle(
                point_latitude=location_data.latitude,
                point_longitude=location_data.longitude,
                center_latitude=geofence.center_latitude,
                center_longitude=geofence.center_longitude,
                radius=geofence.radius,
            )

        elif geofence.geofence_type == "POLYGON":
            points = (
                db.query(GeofencePoint)
                .filter(
                    GeofencePoint.geofence_id == geofence.id
                )
                .order_by(GeofencePoint.point_order)
                .all()
            )

            polygon_points = [
                (point.latitude, point.longitude)
                for point in points
            ]

            is_inside = is_point_inside_polygon(
                latitude=location_data.latitude,
                longitude=location_data.longitude,
                polygon_points=polygon_points,
            )

        process_geofence_state(
            db=db,
            device_id=device.id,
            geofence_id=geofence.id,
            location_event_id=location_event.id,
            latitude=location_data.latitude,
            longitude=location_data.longitude,
            is_inside=is_inside,
            event_timestamp=location_data.recorded_at,
        )

    return location_event

@router.get(
    "/device/{device_id}",
    response_model=list[LocationResponse],
)
def get_device_location_history(
    device_id: int,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if limit < 1 or limit > 1000:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="limit must be between 1 and 1000",
        )

    device = (
        db.query(Device)
        .filter(
            Device.id == device_id,
            Device.user_id == current_user.id,
        )
        .first()
    )

    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found",
        )

    return (
        db.query(LocationEvent)
        .filter(LocationEvent.device_id == device_id)
        .order_by(LocationEvent.recorded_at.desc(), LocationEvent.id.desc())
        .limit(limit)
        .all()
    )


@router.get(
    "/latest",
    response_model=list[LocationResponse],
)
def get_latest_device_locations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the latest known location for every device owned by the user."""
    device_ids = [
        row.id
        for row in (
            db.query(Device.id)
            .filter(Device.user_id == current_user.id)
            .all()
        )
    ]

    if not device_ids:
        return []

    latest_ids = (
        db.query(
            LocationEvent.device_id,
            func.max(LocationEvent.id).label("max_id"),
        )
        .filter(LocationEvent.device_id.in_(device_ids))
        .group_by(LocationEvent.device_id)
        .subquery()
    )

    return (
        db.query(LocationEvent)
        .join(
            latest_ids,
            LocationEvent.id == latest_ids.c.max_id,
        )
        .order_by(LocationEvent.device_id)
        .all()
    )


@router.get(
    "/",
    response_model=list[LocationResponse],
)
def get_location_history(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if limit < 1 or limit > 1000:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="limit must be between 1 and 1000",
        )

    return (
        db.query(LocationEvent)
        .join(Device, LocationEvent.device_id == Device.id)
        .filter(Device.user_id == current_user.id)
        .order_by(LocationEvent.recorded_at.desc(), LocationEvent.id.desc())
        .limit(limit)
        .all()
    )
