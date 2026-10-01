from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_admin
from app.models.user import User


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get("/test")
def admin_test(
    current_admin: User = Depends(get_current_admin),
):
    return {
        "message": "Admin access successful",
        "user_id": current_admin.id,
        "email": current_admin.email,
        "role": current_admin.role,
    }