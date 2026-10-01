from app.services import event_detector


def test_enter_rule_returns_enter(monkeypatch):
    monkeypatch.setattr(
        event_detector,
        "is_event_rule_enabled",
        lambda **kwargs: kwargs["event_type"] == "ENTER",
    )

    result = event_detector.detect_geofence_event(
        db=None,
        geofence_id=1,
        previous_state="OUTSIDE",
        current_state="INSIDE",
    )

    assert result == "ENTER"


def test_exit_rule_returns_exit(monkeypatch):
    monkeypatch.setattr(
        event_detector,
        "is_event_rule_enabled",
        lambda **kwargs: kwargs["event_type"] == "EXIT",
    )

    result = event_detector.detect_geofence_event(
        db=None,
        geofence_id=1,
        previous_state="INSIDE",
        current_state="OUTSIDE",
    )

    assert result == "EXIT"


def test_inside_rule_returns_inside(monkeypatch):
    monkeypatch.setattr(
        event_detector,
        "is_event_rule_enabled",
        lambda **kwargs: kwargs["event_type"] == "INSIDE",
    )

    result = event_detector.detect_geofence_event(
        db=None,
        geofence_id=1,
        previous_state="INSIDE",
        current_state="INSIDE",
    )

    assert result == "INSIDE"


def test_outside_rule_returns_outside(monkeypatch):
    monkeypatch.setattr(
        event_detector,
        "is_event_rule_enabled",
        lambda **kwargs: kwargs["event_type"] == "OUTSIDE",
    )

    result = event_detector.detect_geofence_event(
        db=None,
        geofence_id=1,
        previous_state="OUTSIDE",
        current_state="OUTSIDE",
    )

    assert result == "OUTSIDE"


def test_disabled_rule_returns_none(monkeypatch):
    monkeypatch.setattr(
        event_detector,
        "is_event_rule_enabled",
        lambda **kwargs: False,
    )

    result = event_detector.detect_geofence_event(
        db=None,
        geofence_id=1,
        previous_state="OUTSIDE",
        current_state="INSIDE",
    )

    assert result is None
