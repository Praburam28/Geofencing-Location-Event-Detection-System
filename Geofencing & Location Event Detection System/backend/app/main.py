from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.device import router as device_router
from app.routers.geofence import router as geofence_router
from app.routers.geofence_rule import router as geofence_rule_router
from app.routers.location import router as location_router
from app.routers.geofence_event import router as geofence_event_router
from app.routers.audit_log import router as audit_log_router


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(device_router)
app.include_router(geofence_router)
app.include_router(geofence_rule_router)
app.include_router(location_router)
app.include_router(geofence_event_router)
app.include_router(audit_log_router)


@app.get("/")
def root():
    return {
        "message": "Geofencing & Location Event Detection System API",
        "version": settings.APP_VERSION
    }


@app.get("/db-test")
def db_test():
    return {
        "message": "Database connection successful"
    }