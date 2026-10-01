import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import api from "../../services/api";
import { getToken } from "../../services/authService";

interface Device {
  id: number;
  user_id: number;
  device_name: string;
  device_identifier: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Geofence {
  id: number;
  name: string;
  description?: string;
  geofence_type: string;
  center_latitude?: number;
  center_longitude?: number;
  radius?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface GeofenceEvent {
  id: number;
  device_id: number;
  geofence_id: number;
  location_event_id?: number;
  event_type: string;
  previous_state?: string;
  current_state?: string;
  latitude: number;
  longitude: number;
  event_timestamp: string;
  created_at: string;
}

const PIE_COLORS = [
  "#00d4ff",
  "#7c5cff",
  "#ff6b9d",
  "#ffb547",
];

function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [events, setEvents] = useState<GeofenceEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      const token = getToken();

      if (!token) {
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      try {
        setLoading(true);
        setError("");

        /*
         * Load each API independently.
         *
         * This prevents one failed endpoint from
         * stopping the entire dashboard.
         */

        const devicesRequest = api.get("/devices/", {
          headers,
        });

        const geofencesRequest = api.get("/geofences/", {
          headers,
        });

        const eventsRequest = api.get("/events/", {
          headers,
        });

        const [
          devicesResponse,
          geofencesResponse,
          eventsResponse,
        ] = await Promise.all([
          devicesRequest,
          geofencesRequest,
          eventsRequest,
        ]);

        setDevices(devicesResponse.data || []);
        setGeofences(geofencesResponse.data || []);
        setEvents(eventsResponse.data || []);
      } catch (err: any) {
        console.error("Dashboard API error:", err);

        if (err.response?.data?.detail) {
          setError(err.response.data.detail);
        } else {
          setError("Unable to load dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  /* ACTIVE GEOFENCES */

  const activeGeofenceCount = useMemo(() => {
    return geofences.filter(
      (geofence) => geofence.is_active
    ).length;
  }, [geofences]);

  /* ACTIVE DEVICES */

  const activeDeviceCount = useMemo(() => {
    return devices.filter(
      (device) => device.is_active
    ).length;
  }, [devices]);

  /* TODAY'S EVENTS */

  const todayEventCount = useMemo(() => {
    const today = new Date();

    return events.filter((event) => {
      const eventDate = new Date(
        event.event_timestamp
      );

      return (
        eventDate.getFullYear() === today.getFullYear() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getDate() === today.getDate()
      );
    }).length;
  }, [events]);

  /* EVENT ACTIVITY */

  const eventData = useMemo(() => {
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setDate(date.getDate() - i);

      const count = events.filter((event) => {
        const eventDate = new Date(
          event.event_timestamp
        );

        return (
          eventDate.getFullYear() === date.getFullYear() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getDate() === date.getDate()
        );
      }).length;

      result.push({
        name: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        events: count,
      });
    }

    return result;
  }, [events]);

  /* EVENT DISTRIBUTION */

  const eventDistribution = useMemo(() => {
    const enter = events.filter(
      (event) => event.event_type === "ENTER"
    ).length;

    const exit = events.filter(
      (event) => event.event_type === "EXIT"
    ).length;

    const inside = events.filter(
      (event) => event.event_type === "INSIDE"
    ).length;

    const outside = events.filter(
      (event) => event.event_type === "OUTSIDE"
    ).length;

    const total =
      enter +
      exit +
      inside +
      outside;

    const percentage = (value: number) => {
      if (total === 0) {
        return 0;
      }

      return Math.round(
        (value / total) * 100
      );
    };

    return [
      {
        name: "Enter",
        value: enter,
        percentage: percentage(enter),
      },
      {
        name: "Exit",
        value: exit,
        percentage: percentage(exit),
      },
      {
        name: "Inside",
        value: inside,
        percentage: percentage(inside),
      },
      {
        name: "Outside",
        value: outside,
        percentage: percentage(outside),
      },
    ];
  }, [events]);

  /* RECENT EVENTS */

  const recentEvents = useMemo(() => {
    return [...events]
      .sort(
        (a, b) =>
          new Date(
            b.event_timestamp
          ).getTime() -
          new Date(
            a.event_timestamp
          ).getTime()
      )
      .slice(0, 5);
  }, [events]);

  /* DEVICE NAME */

  const getDeviceName = (deviceId: number) => {
    const device = devices.find(
      (item) => item.id === deviceId
    );

    return (
      device?.device_name ||
      `Device ${deviceId}`
    );
  };

  /* GEOFENCE NAME */

  const getGeofenceName = (geofenceId: number) => {
    const geofence = geofences.find(
      (item) => item.id === geofenceId
    );

    return (
      geofence?.name ||
      `Geofence ${geofenceId}`
    );
  };

  /* TIME AGO */

  const getTimeAgo = (dateString: string) => {
    const eventTime =
      new Date(dateString).getTime();

    const difference =
      Date.now() - eventTime;

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    const days = Math.floor(hours / 24);

    return `${days} day${
      days > 1 ? "s" : ""
    } ago`;
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "18px",
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* ERROR */}

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "10px",
            background:
              "rgba(244,67,54,0.15)",
            border:
              "1px solid rgba(244,67,54,0.35)",
            color: "#ffb4ab",
          }}
        >
          {error}
        </div>
      )}

      {/* STAT CARDS */}

      <div className="stats-grid">

        <div className="stat-card blue-card">
          <div className="stat-icon">
            ◎
          </div>

          <div>
            <span>Active Geofences</span>

            <strong>
              {activeGeofenceCount}
            </strong>

            <small>
              {geofences.length} total
            </small>
          </div>
        </div>

        <div className="stat-card purple-card">
          <div className="stat-icon">
            ▣
          </div>

          <div>
            <span>Registered Devices</span>

            <strong>
              {devices.length}
            </strong>

            <small>
              {activeDeviceCount} active now
            </small>
          </div>
        </div>

        <div className="stat-card pink-card">
          <div className="stat-icon">
            ◈
          </div>

          <div>
            <span>Today's Events</span>

            <strong>
              {todayEventCount}
            </strong>

            <small>
              {events.length} total events
            </small>
          </div>
        </div>

        <div className="stat-card orange-card">
          <div className="stat-icon">
            ⌖
          </div>

          <div>
            <span>Tracked Locations</span>

            <strong>—</strong>

            <small>
              Location history API coming next
            </small>
          </div>
        </div>

      </div>

      {/* CHART ROW */}

      <div className="charts-grid">

        {/* EVENT TREND */}

        <div className="glass-panel chart-panel">

          <div className="panel-header">
            <div>
              <h3>Event Activity</h3>

              <p>
                Location events during the week
              </p>
            </div>

            <span className="panel-badge">
              Last 7 days
            </span>
          </div>

          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart data={eventData}>

                <defs>
                  <linearGradient
                    id="eventGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#00d4ff"
                      stopOpacity={0.55}
                    />

                    <stop
                      offset="100%"
                      stopColor="#00d4ff"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.08)"
                />

                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.5)"
                  tickLine={false}
                />

                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  tickLine={false}
                  allowDecimals={false}
                />

                <Tooltip
                  contentStyle={{
                    background:
                      "rgba(10,25,40,0.95)",
                    border:
                      "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="events"
                  stroke="#00d4ff"
                  strokeWidth={3}
                  fill="url(#eventGradient)"
                />

              </AreaChart>
            </ResponsiveContainer>

          </div>

        </div>

        {/* EVENT DISTRIBUTION */}

        <div className="glass-panel distribution-panel">

          <div className="panel-header">

            <div>
              <h3>Event Distribution</h3>

              <p>
                Events by type
              </p>
            </div>

          </div>

          <div className="pie-wrapper">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>

                <Pie
                  data={eventDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                >

                  {eventDistribution.map(
                    (_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          PIE_COLORS[index]
                        }
                      />
                    )
                  )}

                </Pie>

                <Tooltip
                  contentStyle={{
                    background:
                      "rgba(10,25,40,0.95)",
                    border:
                      "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                />

              </PieChart>
            </ResponsiveContainer>

          </div>

          <div className="legend">

            {eventDistribution.map(
              (event, index) => (
                <div
                  className="legend-item"
                  key={event.name}
                >
                  <span
                    className="legend-dot"
                    style={{
                      background:
                        PIE_COLORS[index],
                    }}
                  />

                  <span>
                    {event.name}
                  </span>

                  <strong>
                    {event.percentage}%
                  </strong>
                </div>
              )
            )}

          </div>

        </div>

      </div>

      {/* RECENT EVENTS */}

      <div className="glass-panel recent-panel">

        <div className="panel-header">

          <div>
            <h3>Recent Events</h3>

            <p>
              Latest detected geofence activity
            </p>
          </div>

          <button
            className="view-button"
            onClick={() =>
              window.location.href =
                "/events"
            }
          >
            View all
          </button>

        </div>

        <div className="event-table">

          <div className="event-row event-header">

            <span>Device</span>
            <span>Geofence</span>
            <span>Event</span>
            <span>Location</span>
            <span>Time</span>

          </div>

          {recentEvents.length === 0 ? (

            <div
              style={{
                padding: "35px",
                textAlign: "center",
                color:
                  "rgba(255,255,255,0.55)",
              }}
            >
              No events found
            </div>

          ) : (

            recentEvents.map((event) => (

              <div
                className="event-row"
                key={event.id}
              >

                <span>
                  {getDeviceName(
                    event.device_id
                  )}
                </span>

                <span>
                  {getGeofenceName(
                    event.geofence_id
                  )}
                </span>

                <span
                  className={`event-tag ${event.event_type.toLowerCase()}`}
                >
                  {event.event_type}
                </span>

                <span>
                  {event.latitude.toFixed(4)},{" "}
                  {event.longitude.toFixed(4)}
                </span>

                <span>
                  {getTimeAgo(
                    event.event_timestamp
                  )}
                </span>

              </div>

            ))

          )}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;