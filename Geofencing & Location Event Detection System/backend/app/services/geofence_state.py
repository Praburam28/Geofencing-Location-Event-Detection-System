from datetime import datetime

from sqlalchemy.orm import Session

from app.models.geofence_event import GeofenceEvent
from app.services.event_detector import detect_geofence_event
from app.services.state_tracker import (
    determine_current_state,
    get_previous_state,
)


def process_geofence_state(
    db: Session,
    device_id: int,
    geofence_id: int,
    location_event_id: int,
    latitude: float,
    longitude: float,
    is_inside: bool,
    event_timestamp: datetime,
) -> dict:
    """
    Process the current state of a device relative to a geofence.

    The function:
    1. Gets the previous state.
    2. Determines the current state.
    3. Detects the appropriate event.
    4. Checks the configured geofence rule.
    5. Saves the event when a rule allows it.
    """

    previous_state = get_previous_state(
        db=db,
        device_id=device_id,
        geofence_id=geofence_id,
    )

    current_state = determine_current_state(
        is_inside=is_inside,
    )

    event_type = detect_geofence_event(
        db=db,
        geofence_id=geofence_id,
        previous_state=previous_state,
        current_state=current_state,
    )

    if event_type is not None:
        geofence_event = GeofenceEvent(
            device_id=device_id,
            geofence_id=geofence_id,
            location_event_id=location_event_id,
            event_type=event_type,
            previous_state=previous_state,
            current_state=current_state,
            latitude=latitude,
            longitude=longitude,
            event_timestamp=event_timestamp,
        )

        db.add(geofence_event)
        db.commit()
        db.refresh(geofence_event)

    return {
        "previous_state": previous_state,
        "current_state": current_state,
        "event_type": event_type,
    }