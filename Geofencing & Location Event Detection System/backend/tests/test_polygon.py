from app.geofencing.polygon import is_point_inside_polygon


def test_point_inside_polygon():
    polygon_points = [
        (11.0180, 76.9550),
        (11.0180, 76.9580),
        (11.0150, 76.9580),
        (11.0150, 76.9550),
    ]

    result = is_point_inside_polygon(
        latitude=11.0165,
        longitude=76.9565,
        polygon_points=polygon_points,
    )

    assert result is True
    
def test_point_outside_polygon():
    polygon_points = [
        (11.0180, 76.9550),
        (11.0180, 76.9580),
        (11.0150, 76.9580),
        (11.0150, 76.9550),
    ]

    result = is_point_inside_polygon(
        latitude=11.0200,
        longitude=76.9600,
        polygon_points=polygon_points,
    )

    assert result is False

def test_point_on_polygon_boundary():
    polygon_points = [
        (11.0180, 76.9550),
        (11.0180, 76.9580),
        (11.0150, 76.9580),
        (11.0150, 76.9550),
    ]

    result = is_point_inside_polygon(
        latitude=11.0180,
        longitude=76.9565,
        polygon_points=polygon_points,
    )

    assert result is True