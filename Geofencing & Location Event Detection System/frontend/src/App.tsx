import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AuthPage from "./pages/auth/AuthPage";
import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/dashboard/Dashboard";
import Geofences from "./pages/geofences/Geofences";
import GeofenceRules from "./pages/geofences/GeofenceRules";
import GeofenceMap from "./pages/geofences/GeofenceMap";

import Devices from "./pages/devices/Devices";
import Locations from "./pages/locations/Locations";
import Events from "./pages/events/Events";
import AuditLogs from "./pages/audit-logs/AuditLogs";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* Protected Application Layout */}
        <Route path="/" element={<DashboardLayout />}>

          <Route
            index
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Dashboard */}
          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          {/* Geofences */}
          <Route
            path="geofences"
            element={<Geofences />}
          />

          <Route
            path="geofences/:id/rules"
            element={<GeofenceRules />}
          />

          <Route
            path="geofences/map"
            element={<GeofenceMap />}
          />

          {/* Devices */}
          <Route
            path="devices"
            element={<Devices />}
          />

          {/* Locations */}
          <Route
            path="locations"
            element={<Locations />}
          />

          {/* Events */}
          <Route
            path="events"
            element={<Events />}
          />

          {/* Audit Logs */}
          <Route
            path="audit-logs"
            element={<AuditLogs />}
          />

        </Route>

        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;