from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Geofencing & Location Event Detection System"
    APP_VERSION: str = "1.0.0"

    DATABASE_URL: str
    MAX_GPS_ACCURACY: float = 50.0
    SECRET_KEY: str = "change-this-secret-key"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
