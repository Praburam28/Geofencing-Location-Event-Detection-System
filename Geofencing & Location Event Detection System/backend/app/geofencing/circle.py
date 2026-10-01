from app.geofencing.geo_utils import calculate_distance


def is_point_inside_circle(
    point_latitude: float,
    point_longitude: float,
    center_latitude: float,
    center_longitude: float,
    radius: float,
) -> bool:
    """
    Check whether a geographical point is inside a circular geofence.

    Args:
        point_latitude: Latitude of the device location.
        point_longitude: Longitude of the device location.
        center_latitude: Latitude of the geofence center.
        center_longitude: Longitude of the geofence center.
        radius: Geofence radius in meters.

    Returns:
        True if the point is inside or exactly on the boundary.
        False if the point is outside.
    """

    distance = calculate_distance(
        point_latitude,
        point_longitude,
        center_latitude,
        center_longitude,
    )

    return distance <= radius