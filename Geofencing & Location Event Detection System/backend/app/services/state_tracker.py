from sqlalchemy.orm import Session

from app.models.geofence_event import GeofenceEvent


def get_previous_state(
    db: Session,
    device_id: int,
    geofence_id: int,
) -> str:
    """
    Get the most recent state of a device for a geofence.

    If no previous state exists, the device is considered OUTSIDE.
    """

    last_event = (
        db.query(GeofenceEvent)
        .filter(
            GeofenceEvent.device_id == device_id,
            GeofenceEvent.geofence_id == geofence_id,
        )
        .order_by(GeofenceEvent.id.desc())
        .first()
    )

    if not last_event:
        return "OUTSIDE"

    return last_event.current_state


def determine_current_state(is_inside: bool) -> str:
    """
    Convert the geofence calculation result into a state.
    """

    if is_inside:
        return "INSIDE"

    return "OUTSIDE"