from sqlalchemy.orm import Session

from app.models.geofence_rule import GeofenceRule


def is_event_rule_enabled(
    db: Session,
    geofence_id: int,
    event_type: str,
) -> bool:
    """
    Check whether a specific event rule is enabled
    for a geofence.

    If the rule does not exist, the event is considered
    disabled.
    """

    rule = (
        db.query(GeofenceRule)
        .filter(
            GeofenceRule.geofence_id == geofence_id,
            GeofenceRule.event_type == event_type,
        )
        .first()
    )

    if not rule:
        return False

    return rule.is_enabled