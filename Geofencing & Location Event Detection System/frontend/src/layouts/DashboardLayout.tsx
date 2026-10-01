import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { getToken, logoutUser } from "../services/authService";
import api from "../services/api";
import {
  DashboardRounded,
  MapRounded,
  DevicesOtherRounded,
  LocationOnRounded,
  TimelineRounded,
  FactCheckRounded,
  RadarRounded,
  LogoutRounded,
  ShieldRounded,
} from "@mui/icons-material";

import "../styles/dashboard.css";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    const loadUser = async () => {
      try {
        const response = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
      } catch (error) {
        console.error("Failed to load user:", error);

        logoutUser();
        navigate("/login");
      }
    };

    loadUser();
  }, [navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="dashboard-shell">

      {/* SIDEBAR */}
      <aside className="sidebar">

        {/* BRAND */}
        <div className="sidebar-brand">

          <div className="brand-icon">
            <RadarRounded />
          </div>

          <div>
            <h2>GeoSense</h2>
            <span>LOCATION INTELLIGENCE</span>
          </div>

        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-nav">
          <p className="nav-title">WORKSPACE</p>

          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <DashboardRounded />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/geofences" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <MapRounded />
            <span>Geofences</span>
          </NavLink>

          <NavLink to="/devices" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <DevicesOtherRounded />
            <span>Devices</span>
          </NavLink>

          <NavLink to="/locations" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <LocationOnRounded />
            <span>Locations</span>
          </NavLink>

          <NavLink to="/events" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <TimelineRounded />
            <span>Events</span>
          </NavLink>

          <p className="nav-title system-title">ADMINISTRATION</p>

          <NavLink to="/audit-logs" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <FactCheckRounded />
            <span>Audit Logs</span>
          </NavLink>
        </nav>

        {/* LOGGED-IN USER */}
        <div className="sidebar-user">

          <div className="user-avatar">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div className="user-details">

            <strong>
              {user?.name || "Loading..."}
            </strong>

            <span>
              {user?.role || "User"}
            </span>

          </div>

          <button className="logout-button" onClick={handleLogout} title="Logout" aria-label="Logout"><LogoutRounded /></button>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        {/* TOP BAR */}
        <header className="topbar">

          <div>

            <div className="breadcrumb">GEOFENCE CONTROL CENTER <span>/</span> {location.pathname.replace("/", "").split("/")[0] || "dashboard"}</div>
            <h1>{({
              "/dashboard": "Command Center",
              "/geofences": "Geofence Management",
              "/devices": "Device Management",
              "/locations": "Location Tracking",
              "/events": "Event Monitoring",
              "/audit-logs": "Audit Logs",
            } as Record<string, string>)[location.pathname] || "GeoSense"}</h1>
            <p>Monitor boundaries, devices and location events in real time.</p>

          </div>

          <div className="topbar-user">

            <span className="online-dot"></span>
            <span>{user?.name || "User"}</span>
            <ShieldRounded className="topbar-shield" />

          </div>

        </header>

        {/* PAGE CONTENT */}
        <section className="page-content">
          <Outlet />
        </section>

      </main>

    </div>
  );
}

export default DashboardLayout;