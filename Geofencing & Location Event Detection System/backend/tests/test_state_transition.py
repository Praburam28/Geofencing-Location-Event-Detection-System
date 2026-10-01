from app.services.state_transition import detect_state_change


def test_outside_to_inside_is_enter():
    result = detect_state_change(
        previous_state="OUTSIDE",
        current_state="INSIDE",
    )

    assert result == "ENTER"


def test_inside_to_outside_is_exit():
    result = detect_state_change(
        previous_state="INSIDE",
        current_state="OUTSIDE",
    )

    assert result == "EXIT"
    
def test_no_state_change_when_still_inside():
    result = detect_state_change(
        previous_state="INSIDE",
        current_state="INSIDE",
    )

    assert result is None


def test_no_state_change_when_still_outside():
    result = detect_state_change(
        previous_state="OUTSIDE",
        current_state="OUTSIDE",
    )

    assert result is None