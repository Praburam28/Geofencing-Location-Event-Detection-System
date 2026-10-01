def is_point_on_segment(
    latitude: float,
    longitude: float,
    latitude1: float,
    longitude1: float,
    latitude2: float,
    longitude2: float,
) -> bool:
    """
    Check whether a point lies exactly on a polygon edge.
    """

    cross_product = (
        (latitude - latitude1) * (longitude2 - longitude1)
        - (longitude - longitude1) * (latitude2 - latitude1)
    )

    tolerance = 1e-10

    if abs(cross_product) > tolerance:
        return False

    return (
        min(latitude1, latitude2) - tolerance
        <= latitude
        <= max(latitude1, latitude2) + tolerance
        and
        min(longitude1, longitude2) - tolerance
        <= longitude
        <= max(longitude1, longitude2) + tolerance
    )


def is_point_inside_polygon(
    latitude: float,
    longitude: float,
    polygon_points: list[tuple[float, float]],
) -> bool:
    """
    Check whether a geographical point is inside a polygon.

    Points exactly on the polygon boundary are considered inside.

    polygon_points:
        List of (latitude, longitude) tuples.

    Returns:
        True if the point is inside or on the boundary.
        False if the point is outside.
    """

    if len(polygon_points) < 3:
        return False

    # First check whether the point lies on any polygon edge.
    for i in range(len(polygon_points)):
        latitude1, longitude1 = polygon_points[i]

        latitude2, longitude2 = polygon_points[
            (i + 1) % len(polygon_points)
        ]

        if is_point_on_segment(
            latitude,
            longitude,
            latitude1,
            longitude1,
            latitude2,
            longitude2,
        ):
            return True

    # Ray-casting algorithm.
    inside = False

    j = len(polygon_points) - 1

    for i in range(len(polygon_points)):
        latitude_i, longitude_i = polygon_points[i]
        latitude_j, longitude_j = polygon_points[j]

        if (longitude_i > longitude) != (longitude_j > longitude):
            intersection_latitude = (
                (latitude_j - latitude_i)
                * (longitude - longitude_i)
                / (longitude_j - longitude_i)
                + latitude_i
            )

            if latitude < intersection_latitude:
                inside = not inside

        j = i

    return inside