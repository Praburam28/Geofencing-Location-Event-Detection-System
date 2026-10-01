# 🌍 Geofencing & Location Event Detection System

A full-stack geospatial event detection platform for tracking locations, managing geofences, and automatically detecting location-based events.

## ✨ Key Features

- 🔐 JWT Authentication & Role-Based Authorization
- 👤 User Management
- 📱 Device Management
- 📍 GPS Location Tracking
- 🔵 Circle Geofences
- 🟣 Polygon Geofences
- ⚙️ Configurable Event Rules
- 🟢 ENTER Detection
- 🔴 EXIT Detection
- 🔵 INSIDE Detection
- ⚪ OUTSIDE Detection
- 🗺️ Interactive Leaflet/OpenStreetMap Map
- 📊 Location & Event History
- 📝 Audit Logs
- 📖 Swagger/OpenAPI Documentation
- 🧪 Postman API Collection
- 🐳 Docker & Docker Compose
- 🗃️ MySQL Database
- 🔄 Alembic Database Migrations

## 🛠️ Technology Stack

### Backend
- Python 3.14
- FastAPI
- SQLAlchemy ORM
- Alembic
- Pydantic
- PyMySQL
- JWT Authentication
- Uvicorn

### Frontend
- React
- TypeScript
- Vite
- Material UI
- Axios
- React Router
- Leaflet
- OpenStreetMap

### Database & Tools
- MySQL 8.0
- Docker
- Docker Compose
- Swagger/OpenAPI
- Postman
- Git & GitHub

## 🏗️ System Architecture

React + TypeScript Frontend
        │
        │ REST API
        ▼
FastAPI Backend
        │
        ├── Authentication
        ├── Geofence Management
        ├── Location Tracking
        ├── Geofencing Engine
        ├── Event Rules
        └── Audit Logging
        │
        ▼
MySQL Database

## 📍 Geofencing Workflow

GPS Location
     ↓
Coordinate Validation
     ↓
Find Active Geofences
     ↓
Circle / Polygon Calculation
     ↓
Determine Current State
     ↓
Compare Previous State
     ↓
ENTER / EXIT / INSIDE / OUTSIDE
     ↓
Apply Event Rules
     ↓
Store Event & Audit Record

## 🚨 Event Detection

| Event | Description |
|---|---|
| ENTER | Device moves from outside to inside |
| EXIT | Device moves from inside to outside |
| INSIDE | Device remains inside |
| OUTSIDE | Device remains outside |

Example:

OUTSIDE → ENTER → INSIDE → EXIT → OUTSIDE

The system avoids unnecessary duplicate transition events when a device remains in the same state.

## 🗺️ Interactive Map

The map provides visualization of:

- Circle geofences
- Polygon geofences
- Current device locations
- Location history
- ENTER events
- EXIT events
- Geofence information

## 🗄️ Database Tables

Main database tables:

- users
- devices
- geofences
- geofence_points
- geofence_rules
- location_events
- geofence_events
- audit_logs

## 📂 Project Structure

geofencing-location-system/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── geofencing/
│   │   └── main.py
│   ├── tests/
│   ├── alembic/
│   ├── alembic.ini
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── routes/
│   ├── public/
│   ├── package.json
│   ├── nginx.conf
│   └── Dockerfile
│
├── docs/
│   └── geofencing.postman_collection.json
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md

## 🚀 Getting Started

### 1. Clone the Repository

git clone https://github.com/YOUR_USERNAME/geofencing-location-system.git
cd geofencing-location-system

### 2. Configure Environment

Create a .env file from .env.example.

Example:

MYSQL_ROOT_PASSWORD=change-root-password
MYSQL_DATABASE=geofencing_db
MYSQL_USER=geofence_user
MYSQL_PASSWORD=geofence_password

Never commit your real .env file to GitHub.

### 3. Start Docker Services

docker compose up -d

Check containers:

docker compose ps

### 4. Run Database Migrations

docker compose exec backend alembic upgrade head

Check migration:

docker compose exec backend alembic current

## 🌐 Application URLs

Frontend:
http://127.0.0.1:5173

Backend:
http://127.0.0.1:8000

Swagger:
http://127.0.0.1:8000/docs

ReDoc:
http://127.0.0.1:8000/redoc

OpenAPI:
http://127.0.0.1:8000/openapi.json

## 🔑 Authentication

Register a user and login to receive a JWT access token.

Example admin credentials for local development:

Email:
admin@example.com

Password:
admin123

Use the returned token in Swagger:

Authorize → Bearer <access_token>

For production, always change default credentials and use a secure JWT secret.

## 🧪 API Testing

A Postman collection is available at:

docs/geofencing.postman_collection.json

Recommended testing flow:

1. Authentication
2. Create/Login User
3. Create Device
4. Create Circle Geofence
5. Create Polygon Geofence
6. Configure Event Rules
7. Send Location
8. Verify ENTER / INSIDE events
9. Send Location outside the geofence
10. Verify EXIT / OUTSIDE events
11. Review Event History
12. Review Audit Logs

## 🧪 Testing

Run backend tests:

pytest

Or through Docker:

docker compose exec backend pytest

Tests cover areas such as:

- Coordinate validation
- Circle calculations
- Polygon calculations
- Inside/outside detection
- State transitions
- ENTER events
- EXIT events
- Duplicate event prevention

## 🔒 Security

The application includes:

- JWT authentication
- Password hashing
- Role-based authorization
- Protected admin endpoints
- Environment-based configuration
- Request validation
- Coordinate validation
- Audit logging

Production recommendations:

- Change default passwords
- Use a strong JWT secret
- Enable HTTPS
- Restrict CORS
- Use secure database credentials
- Store secrets in a secret manager
- Disable development/debug settings

## 🎯 Use Cases

This platform can be adapted for:

- 🚚 Fleet tracking
- 🚕 Taxi and delivery services
- 🏢 Employee location monitoring
- 🏭 Industrial facility monitoring
- 🚛 Logistics management
- 🏫 Campus monitoring
- 🏪 Retail location analytics
- 🚧 Restricted area monitoring
- 📦 Delivery zone detection
- 🚘 Vehicle tracking

## 🔮 Future Enhancements

- Real-time WebSocket location updates
- Redis-based event processing
- Mobile GPS integration
- Push notifications
- Email/SMS alerts
- Geofence analytics dashboard
- Location replay
- Heatmaps
- Real-time fleet monitoring
- Cloud deployment
- Kubernetes support

## 📸 Screenshots

Recommended screenshots to add:

docs/screenshots/
├── dashboard.png
├── geofences.png
├── locations.png
├── events.png
├── audit-logs.png
└── map.png

Then reference them in README.md using standard GitHub Markdown.

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch:

git checkout -b feature/new-feature

3. Commit your changes:

git add .
git commit -m "Add new feature"

4. Push the branch:

git push origin feature/new-feature

5. Create a Pull Request.

## 📄 License

This project is intended for educational, development, and demonstration purposes.

## 👨‍💻 Author

Prabu Ram

Python Developer | Backend Developer | Full-Stack Developer

Technical Interests:
Python, FastAPI, React, TypeScript, REST APIs, MySQL,
SQLAlchemy, Docker, AI/ML, Cloud & Backend Development

---

🌍 Geofencing & Location Event Detection System

Track → Detect → Analyze → Respond

Built with Python, FastAPI, React, MySQL & Leaflet.
