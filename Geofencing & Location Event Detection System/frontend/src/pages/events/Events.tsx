import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

interface GeofenceEvent {
  id: number;
  device_id: number;
  geofence_id: number;
  location_event_id: number;
  event_type: string;
  previous_state: string;
  current_state: string;
  latitude: number;
  longitude: number;
  event_timestamp: string;
  created_at: string;
}

const Events = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState<GeofenceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      const response = await api.get("/events/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to load geofence events."
      );
    } finally {
      setLoading(false);
    }
  };

  const getEventStyle = (eventType: string) => {
    switch (eventType) {
      case "ENTER":
        return {
          background: "rgba(46, 125, 50, 0.2)",
          color: "#81c784",
        };

      case "EXIT":
        return {
          background: "rgba(211, 47, 47, 0.2)",
          color: "#ef9a9a",
        };

      case "INSIDE":
        return {
          background: "rgba(25, 118, 210, 0.2)",
          color: "#64b5f6",
        };

      case "OUTSIDE":
        return {
          background: "rgba(117, 117, 117, 0.2)",
          color: "#bdbdbd",
        };

      default:
        return {
          background: "rgba(255,255,255,0.1)",
          color: "white",
        };
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Geofence Events</h1>
          <p style={styles.subtitle}>
            View ENTER, EXIT and other geofence detection events
          </p>
        </div>

        <div style={styles.headerButtons}>
          <button style={styles.refreshButton} onClick={fetchEvents}>
            ↻ Refresh
          </button>

          <button
            style={styles.backButton}
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>
        </div>
      </div>

      {loading && (
        <div style={styles.message}>
          Loading geofence events...
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      {!loading && !error && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Event History</h2>
              <p style={styles.count}>
                {events.length} event{events.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {events.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>📍</div>

              <h3 style={styles.emptyTitle}>
                No geofence events yet
              </h3>

              <p style={styles.emptyText}>
                Submit a device location from the Locations page to
                trigger geofence detection.
              </p>

              <button
                style={styles.locationButton}
                onClick={() => navigate("/locations")}
              >
                Go to Locations
              </button>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Event</th>
                    <th style={styles.th}>Device</th>
                    <th style={styles.th}>Geofence</th>
                    <th style={styles.th}>State</th>
                    <th style={styles.th}>Coordinates</th>
                    <th style={styles.th}>Time</th>
                  </tr>
                </thead>

                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td style={styles.td}>#{event.id}</td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            ...getEventStyle(event.event_type),
                          }}
                        >
                          {event.event_type}
                        </span>
                      </td>

                      <td style={styles.td}>
                        Device #{event.device_id}
                      </td>

                      <td style={styles.td}>
                        Geofence #{event.geofence_id}
                      </td>

                      <td style={styles.td}>
                        <div style={styles.state}>
                          <span>{event.previous_state}</span>
                          <span style={styles.arrow}>→</span>
                          <span>{event.current_state}</span>
                        </div>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.coordinates}>
                          <span>
                            {event.latitude.toFixed(6)}
                          </span>
                          <span>
                            {event.longitude.toFixed(6)}
                          </span>
                        </div>
                      </td>

                      <td style={styles.td}>
                        {new Date(
                          event.event_timestamp
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: "30px 0",
    minHeight: "100%",
    color: "#172b4d",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "26px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 800,
    color: "#172b4d",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    marginTop: "7px",
    color: "#718096",
    fontSize: "13px",
  },

  actions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  button: {
    padding: "10px 16px",
    borderRadius: "9px",
    border: "1px solid #dbe5ef",
    background: "#ffffff",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
    boxShadow: "0 5px 15px rgba(48,72,105,0.05)",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e2e9f1",
    borderRadius: "17px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(48,72,105,0.06)",
  },

  cardHeader: {
    padding: "22px 24px",
    borderBottom: "1px solid #edf1f5",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    margin: 0,
    color: "#233653",
    fontSize: "16px",
    fontWeight: 800,
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#8a97a8",
    fontSize: "11px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },

  th: {
    padding: "13px 18px",
    textAlign: "left",
    background: "#f8fafc",
    borderBottom: "1px solid #e5ebf2",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.7px",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "16px 18px",
    borderBottom: "1px solid #edf1f5",
    color: "#344563",
    fontSize: "12px",
    fontWeight: 500,
    verticalAlign: "middle",
  },

  id: {
    color: "#7b8798",
    fontWeight: 700,
  },

  device: {
    color: "#233653",
    fontWeight: 700,
  },

  geofence: {
    color: "#233653",
    fontWeight: 600,
  },

  state: {
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 9px",
    borderRadius: "7px",
    background: "#f4f7fa",
    color: "#596b82",
    fontSize: "11px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  coordinates: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    color: "#596b82",
    fontSize: "11px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },

  time: {
    color: "#66768c",
    fontSize: "11px",
    whiteSpace: "nowrap",
  },

  empty: {
    padding: "55px 20px",
    textAlign: "center",
    color: "#8a97a8",
    fontSize: "13px",
  },

  loading: {
    padding: "55px 20px",
    textAlign: "center",
    color: "#718096",
    fontSize: "13px",
  },

  error: {
    marginBottom: "18px",
    padding: "13px 16px",
    borderRadius: "10px",
    background: "#fff1f4",
    border: "1px solid #f3d1da",
    color: "#c74d70",
    fontSize: "12px",
  },
};

export default Events;