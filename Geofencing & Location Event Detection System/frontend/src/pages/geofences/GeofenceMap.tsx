import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useNavigate } from "react-router-dom";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import api from "../../services/api";
import "leaflet/dist/leaflet.css";

interface GeofencePoint {
  id: number;
  latitude: number;
  longitude: number;
  point_order: number;
}

interface Geofence {
  id: number;
  name: string;
  description?: string | null;
  geofence_type: "CIRCLE" | "POLYGON";
  center_latitude?: number | null;
  center_longitude?: number | null;
  radius?: number | null;
  is_active: boolean;
  points?: GeofencePoint[];
}

interface LocationEvent {
  id: number;
  device_id: number;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  recorded_at: string;
  created_at: string;
}

interface GeofenceEvent {
  id: number;
  device_id: number;
  geofence_id: number;
  location_event_id: number;
  event_type: "ENTER" | "EXIT" | "INSIDE" | "OUTSIDE";
  previous_state: string;
  current_state: string;
  latitude: number;
  longitude: number;
  event_timestamp: string;
  created_at: string;
}

const DEFAULT_CENTER: [number, number] = [11.0168, 76.9558];

const eventColor: Record<GeofenceEvent["event_type"], string> = {
  ENTER: "#22c55e",
  EXIT: "#ef4444",
  INSIDE: "#3b82f6",
  OUTSIDE: "#f59e0b",
};

const MapBounds = ({ geofences }: { geofences: Geofence[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || geofences.length === 0) return;

    const bounds: [number, number][] = [];

    geofences.forEach((geofence) => {
      if (
        geofence.geofence_type === "CIRCLE" &&
        geofence.center_latitude != null &&
        geofence.center_longitude != null &&
        geofence.radius != null
      ) {
        const latitudeDelta = geofence.radius / 111320;
        const longitudeDelta =
          geofence.radius /
          (111320 * Math.max(Math.cos((geofence.center_latitude * Math.PI) / 180), 0.01));

        bounds.push(
          [geofence.center_latitude - latitudeDelta, geofence.center_longitude - longitudeDelta],
          [geofence.center_latitude + latitudeDelta, geofence.center_longitude + longitudeDelta],
        );
      }

      if (geofence.geofence_type === "POLYGON" && geofence.points) {
        geofence.points.forEach((point) => {
          bounds.push([point.latitude, point.longitude]);
        });
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [map, geofences]);

  return null;
};

const GeofenceMap = () => {
  const navigate = useNavigate();

  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [latestLocations, setLatestLocations] = useState<LocationEvent[]>([]);
  const [locationHistory, setLocationHistory] = useState<LocationEvent[]>([]);
  const [events, setEvents] = useState<GeofenceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMapData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [geofenceResponse, latestResponse, historyResponse, eventResponse] =
        await Promise.all([
          api.get("/geofences/", { headers }),
          api.get("/locations/latest", { headers }),
          api.get("/locations/?limit=500", { headers }),
          api.get("/events/?limit=100", { headers }),
        ]);

      setGeofences(geofenceResponse.data);
      setLatestLocations(latestResponse.data);
      setLocationHistory(historyResponse.data);
      setEvents(eventResponse.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      setError(err.response?.data?.detail || "Failed to load map data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, [navigate]);

  const activeGeofences = useMemo(
    () => geofences.filter((geofence) => geofence.is_active),
    [geofences],
  );

  const historyByDevice = useMemo(() => {
    const grouped = new Map<number, [number, number][]>();

    [...locationHistory]
      .sort(
        (a, b) =>
          new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
      )
      .forEach((location) => {
        const points = grouped.get(location.device_id) ?? [];
        points.push([location.latitude, location.longitude]);
        grouped.set(location.device_id, points);
      });

    return grouped;
  }, [locationHistory]);

  return (
    <div style={styles.page}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>Geofence Map</Typography>
          <Typography variant="body2" color="text.secondary">
            Geofences, current device locations, location history and events
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<RefreshRoundedIcon />}
            onClick={loadMapData}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </Button>
          <Button variant="outlined" onClick={() => navigate("/geofences")}>
            Geofences
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && (
        <div style={styles.mapCard}>
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={13}
            scrollWheelZoom
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapBounds geofences={activeGeofences} />

            {activeGeofences.map((geofence) => {
              if (
                geofence.geofence_type === "CIRCLE" &&
                geofence.center_latitude != null &&
                geofence.center_longitude != null &&
                geofence.radius != null
              ) {
                return (
                  <Circle
                    key={`geofence-circle-${geofence.id}`}
                    center={[geofence.center_latitude, geofence.center_longitude]}
                    radius={geofence.radius}
                    pathOptions={{ color: "#06b6d4", fillColor: "#06b6d4", fillOpacity: 0.18, weight: 3 }}
                  >
                    <Popup>
                      <strong>{geofence.name}</strong>
                      <p>Circle · {geofence.radius} m</p>
                      <button onClick={() => navigate(`/geofences/${geofence.id}/rules`)}>
                        View Rules
                      </button>
                    </Popup>
                  </Circle>
                );
              }

              if (
                geofence.geofence_type === "POLYGON" &&
                geofence.points &&
                geofence.points.length >= 3
              ) {
                const positions = [...geofence.points]
                  .sort((a, b) => a.point_order - b.point_order)
                  .map((point) => [point.latitude, point.longitude] as [number, number]);

                return (
                  <Polygon
                    key={`geofence-polygon-${geofence.id}`}
                    positions={positions}
                    pathOptions={{ color: "#a855f7", fillColor: "#a855f7", fillOpacity: 0.18, weight: 3 }}
                  >
                    <Popup>
                      <strong>{geofence.name}</strong>
                      <p>Polygon · {positions.length} points</p>
                      <button onClick={() => navigate(`/geofences/${geofence.id}/rules`)}>
                        View Rules
                      </button>
                    </Popup>
                  </Polygon>
                );
              }

              return null;
            })}

            {[...historyByDevice.entries()].map(([deviceId, positions]) =>
              positions.length > 1 ? (
                <Polyline
                  key={`history-${deviceId}`}
                  positions={positions}
                  pathOptions={{ color: "#60a5fa", weight: 3, opacity: 0.55 }}
                />
              ) : null,
            )}

            {latestLocations.map((location) => (
              <CircleMarker
                key={`location-${location.id}`}
                center={[location.latitude, location.longitude]}
                radius={9}
                pathOptions={{ color: "#2563eb", fillColor: "#60a5fa", fillOpacity: 0.9, weight: 2 }}
              >
                <Popup>
                  <strong>Device #{location.device_id}</strong>
                  <p>Latitude: {location.latitude}</p>
                  <p>Longitude: {location.longitude}</p>
                  <p>Accuracy: {location.accuracy ?? "N/A"} m</p>
                  <p>{new Date(location.recorded_at).toLocaleString()}</p>
                </Popup>
              </CircleMarker>
            ))}

            {events.map((event) => (
              <CircleMarker
                key={`event-${event.id}`}
                center={[event.latitude, event.longitude]}
                radius={6}
                pathOptions={{
                  color: eventColor[event.event_type],
                  fillColor: eventColor[event.event_type],
                  fillOpacity: 0.85,
                  weight: 2,
                }}
              >
                <Popup>
                  <strong>{event.event_type}</strong>
                  <p>Device: #{event.device_id}</p>
                  <p>Geofence: #{event.geofence_id}</p>
                  <p>
                    {event.previous_state} → {event.current_state}
                  </p>
                  <p>{new Date(event.event_timestamp).toLocaleString()}</p>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              right: 16,
              bottom: 16,
              zIndex: 1000,
              p: 1.5,
              minWidth: 190,
              backgroundColor: "rgba(15, 23, 42, 0.94)",
              color: "#e2e8f0",
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 0.5, color: "inherit" }}>Map Legend</Typography>
            <Typography variant="caption" display="block">● Blue = current location</Typography>
            <Typography variant="caption" display="block">━ Blue line = location history</Typography>
            <Typography variant="caption" display="block">● Green = ENTER</Typography>
            <Typography variant="caption" display="block">● Red = EXIT</Typography>
            <Typography variant="caption" display="block">● Orange = OUTSIDE</Typography>
            <Typography variant="caption" display="block">● Blue event = INSIDE</Typography>
          </Paper>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { padding: "24px", color: "white", height: "100%", boxSizing: "border-box" },
  mapCard: { position: "relative", width: "100%", height: "calc(100vh - 180px)", minHeight: "500px", borderRadius: "14px", overflow: "hidden", border: "1px solid #334155" },
};

export default GeofenceMap;
