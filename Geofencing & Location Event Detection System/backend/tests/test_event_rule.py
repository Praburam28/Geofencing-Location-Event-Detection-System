from app.services.event_rule_service import is_event_rule_enabled
from app.db.database import SessionLocal
from app.models.geofence_rule import GeofenceRule


def test_event_rule_enabled():
    db = SessionLocal()

    try:
        rule = GeofenceRule(
            geofence_id=1,
            event_type="ENTER",
            is_enabled=True,
        )

        db.add(rule)
        db.commit()
        db.refresh(rule)

        result = is_event_rule_enabled(
            db=db,
            geofence_id=1,
            event_type="ENTER",
        )

        assert result is True

    finally:
        db.delete(rule)
        db.commit()
        db.close()
        

def test_event_rule_disabled():
    db = SessionLocal()

    rule = GeofenceRule(
        geofence_id=3,
        event_type="EXIT",
        is_enabled=False,
    )

    db.add(rule)
    db.commit()
    db.refresh(rule)

    try:
        result = is_event_rule_enabled(
            db=db,
            geofence_id=3,
            event_type="EXIT",
        )

        assert result is False

    finally:
        db.delete(rule)
        db.commit()
        db.close()