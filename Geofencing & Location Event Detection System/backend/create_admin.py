from app.core.security import hash_password
from app.db.database import SessionLocal
from app.models.user import User


def create_admin():
    db = SessionLocal()

    try:
        admin_email = "admin@example.com"
        admin_password = "admin123"

        existing_admin = (
            db.query(User)
            .filter(User.email == admin_email)
            .first()
        )

        if existing_admin:
            print("Admin user already exists.")
            return

        admin = User(
            name="Admin",
            email=admin_email,
            password_hash=hash_password(admin_password),
            role="ADMIN",
            is_active=True,
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("Admin user created successfully.")
        print(f"Email: {admin_email}")
        print(f"Password: {admin_password}")
        print(f"Role: {admin.role}")

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()