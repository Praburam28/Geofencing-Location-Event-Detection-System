from sqlalchemy.orm import Session

from app.services.event_rule_service import is_event_rule_enabled
from app.services.state_transition import detect_state_change


def detect_geofence_event(
    db: Session,
    geofence_id: int,
    previous_state: str,
    current_state: str,
) -> str | None:
    """Return the configured event for the current state/transition.

    ENTER and EXIT are emitted only on state transitions.
    INSIDE and OUTSIDE are emitted when the corresponding state remains
    unchanged and the rule is enabled, allowing the system to detect that a
    device continues to remain inside/outside a geofence.
    """
    transition_event = detect_state_change(
        previous_state=previous_state,
        current_state=current_state,
    )

    if transition_event is not None:
        return (
            transition_event
            if is_event_rule_enabled(
                db=db,
                geofence_id=geofence_id,
                event_type=transition_event,
            )
            else None
        )

    if previous_state == current_state and is_event_rule_enabled(
        db=db,
        geofence_id=geofence_id,
        event_type=current_state,
    ):
        return current_state

    return None
