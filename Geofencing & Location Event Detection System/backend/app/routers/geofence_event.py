from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.device import Device
from app.models.geofence import Geofence
from app.models.geofence_event import GeofenceEvent
from app.models.user import User
from app.schemas.geofence_event import GeofenceEventResponse


router = APIRouter(
    prefix="/events",
    tags=["Geofence Events"],
)


@router.get(
    "/",
    response_model=list[GeofenceEventResponse],
)
def get_all_events(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if limit < 1 or limit > 1000:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="limit must be between 1 and 1000",
        )

    events = (
        db.query(GeofenceEvent)
        .join(Device, GeofenceEvent.device_id == Device.id)
        .filter(Device.user_id == current_user.id)
        .order_by(GeofenceEvent.id.desc())
        .limit(limit)
        .all()
    )

    return events


@router.get(
    "/device/{device_id}",
    response_model=list[GeofenceEventResponse],
)
def get_device_events(
    device_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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

    events = (
        db.query(GeofenceEvent)
        .filter(
            GeofenceEvent.device_id == device_id,
        )
        .order_by(GeofenceEvent.id.desc())
        .all()
    )

    return events


@router.get(
    "/geofence/{geofence_id}",
    response_model=list[GeofenceEventResponse],
)
def get_geofence_events(
    geofence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    geofence = (
        db.query(Geofence)
        .filter(Geofence.id == geofence_id)
        .first()
    )

    if not geofence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Geofence not found",
        )

    events = (
        db.query(GeofenceEvent)
        .join(Device, GeofenceEvent.device_id == Device.id)
        .filter(
            GeofenceEvent.geofence_id == geofence_id,
            Device.user_id == current_user.id,
        )
        .order_by(GeofenceEvent.id.desc())
        .all()
    )

    return events