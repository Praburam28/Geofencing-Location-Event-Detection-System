def detect_state_change(
    previous_state: str,
    current_state: str,
) -> str | None:
    """
    Detect a geofence state transition.

    Returns:
        ENTER  -> OUTSIDE to INSIDE
        EXIT   -> INSIDE to OUTSIDE
        None   -> No state change
    """

    if previous_state == "OUTSIDE" and current_state == "INSIDE":
        return "ENTER"

    if previous_state == "INSIDE" and current_state == "OUTSIDE":
        return "EXIT"

    return None