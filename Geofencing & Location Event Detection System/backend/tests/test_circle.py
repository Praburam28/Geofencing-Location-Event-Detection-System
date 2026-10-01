from app.geofencing.circle import is_point_inside_circle


def test_point_inside_circle():
    result = is_point_inside_circle(
        point_latitude=11.0168,
        point_longitude=76.9558,
        center_latitude=11.0168,
        center_longitude=76.9558,
        radius=500,
    )

    assert result is True
    
def test_point_outside_circle():
    result = is_point_inside_circle(
        point_latitude=11.0250,
        point_longitude=76.9700,
        center_latitude=11.0168,
        center_longitude=76.9558,
        radius=500,
    )

    assert result is False
    
def test_point_on_circle_boundary():
    result = is_point_inside_circle(
        point_latitude=11.0168,
        point_longitude=76.9603,
        center_latitude=11.0168,
        center_longitude=76.9558,
        radius=500,
    )

    assert result is True

def test_point_on_circle_boundary():
    result = is_point_inside_circle(
        point_latitude=11.0168,
        point_longitude=76.9603,
        center_latitude=11.0168,
        center_longitude=76.9558,
        radius=500,
    )

    assert result is True