from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)

# Test user credentials
TEST_EMAIL = "test_api_user_001@example.com"
TEST_PASSWORD = "testpassword123"


def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "message": "Geofencing & Location Event Detection System API",
        "version": "1.0.0",
    }


def test_register_user():
    response = client.post(
        "/auth/register",
        json={
            "name": "Test API User 2",
            "email": "test_api_user_002@example.com",
            "password": "testpassword123",
        },
    )

    # User may already exist if the test was run previously.
    assert response.status_code in [201, 400]

    if response.status_code == 201:
        data = response.json()

        assert data["name"] == "Test API User 2"
        assert data["email"] == "test_api_user_002@example.com"
        assert data["role"] == "USER"
        assert data["is_active"] is True


def test_login_user():
    response = client.post(
        "/auth/login",
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_get_my_profile():
    login_response = client.post(
        "/auth/login",
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    response = client.get(
        "/auth/me",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["email"] == TEST_EMAIL
    assert data["role"] == "USER"
    assert data["is_active"] is True


def test_auth_me_without_token():
    response = client.get("/auth/me")

    assert response.status_code in [401, 403]


def test_auth_me_with_invalid_token():
    response = client.get(
        "/auth/me",
        headers={
            "Authorization": "Bearer invalid-token"
        },
    )

    assert response.status_code == 401


def test_invalid_login():
    response = client.post(
        "/auth/login",
        json={
            "email": TEST_EMAIL,
            "password": "wrong-password",
        },
    )

    assert response.status_code == 401


def test_register_invalid_email():
    response = client.post(
        "/auth/register",
        json={
            "name": "Invalid Email User",
            "email": "not-an-email",
            "password": "testpassword123",
        },
    )

    assert response.status_code == 422


def test_register_short_password():
    response = client.post(
        "/auth/register",
        json={
            "name": "Short Password User",
            "email": "short_password_test@example.com",
            "password": "123",
        },
    )

    assert response.status_code == 422


def test_db_test_endpoint():
    response = client.get("/db-test")

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Database connection successful"