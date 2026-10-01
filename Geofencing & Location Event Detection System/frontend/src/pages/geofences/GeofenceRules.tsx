import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

interface GeofenceRule {
  id: number;
  geofence_id: number;
  event_type: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface Geofence {
  id: number;
  name: string;
  description?: string | null;
  geofence_type: string;
  is_active: boolean;
}

const eventTypes = ["ENTER", "EXIT", "INSIDE", "OUTSIDE"];

const GeofenceRules = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [geofence, setGeofence] = useState<Geofence | null>(null);
  const [rules, setRules] = useState<GeofenceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedEvent, setSelectedEvent] = useState("ENTER");
  const [enabled, setEnabled] = useState(true);

  const token = localStorage.getItem("access_token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const [geofenceResponse, rulesResponse] = await Promise.all([
        api.get(`/geofences/${id}`, { headers }),
        api.get(`/geofences/${id}/rules`, { headers }),
      ]);

      setGeofence(geofenceResponse.data);
      setRules(rulesResponse.data);
    } catch (err: any) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Failed to load geofence rules."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAddRule = async () => {
    if (!id) return;

    const existingRule = rules.find(
      (rule) => rule.event_type === selectedEvent
    );

    if (existingRule) {
      setError(`${selectedEvent} rule already exists.`);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.post(
        `/geofences/${id}/rules`,
        {
          event_type: selectedEvent,
          is_enabled: enabled,
        },
        { headers }
      );

      setSuccess(`${selectedEvent} rule added successfully.`);

      await loadData();
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to add geofence rule."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRule = async (rule: GeofenceRule) => {
    if (!id) return;

    try {
      setError("");
      setSuccess("");

      await api.put(
        `/geofences/${id}/rules/${rule.id}`,
        {
          is_enabled: !rule.is_enabled,
        },
        { headers }
      );

      setSuccess(
        `${rule.event_type} rule ${
          rule.is_enabled ? "disabled" : "enabled"
        } successfully.`
      );

      await loadData();
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to update geofence rule."
      );
    }
  };

  const getEventDescription = (eventType: string) => {
    switch (eventType) {
      case "ENTER":
        return "Triggered when a device enters the geofence.";

      case "EXIT":
        return "Triggered when a device exits the geofence.";

      case "INSIDE":
        return "Triggered when a device remains inside the geofence.";

      case "OUTSIDE":
        return "Triggered when a device remains outside the geofence.";

      default:
        return "Geofence event rule.";
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "ENTER":
        return "↪";

      case "EXIT":
        return "↩";

      case "INSIDE":
        return "●";

      case "OUTSIDE":
        return "○";

      default:
        return "•";
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle}>Loading geofence rules...</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <button
            onClick={() => navigate("/geofences")}
            style={backButtonStyle}
          >
            ← Back to Geofences
          </button>

          <h1 style={titleStyle}>
            {geofence?.name || "Geofence"} Rules
          </h1>

          <p style={subtitleStyle}>
            Configure which events should be generated for this geofence.
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}

      {success && (
        <div style={successStyle}>
          {success}
        </div>
      )}

      {/* Add Rule */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Add Event Rule</h2>

        <div style={formGridStyle}>
          <div>
            <label style={labelStyle}>Event Type</label>

            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              style={inputStyle}
            >
              {eventTypes.map((event) => (
                <option key={event} value={event}>
                  {event}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Initial Status</label>

            <select
              value={enabled ? "enabled" : "disabled"}
              onChange={(e) =>
                setEnabled(e.target.value === "enabled")
              }
              style={inputStyle}
            >
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          <div style={buttonContainerStyle}>
            <button
              onClick={handleAddRule}
              disabled={saving}
              style={{
                ...primaryButtonStyle,
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Adding..." : "+ Add Rule"}
            </button>
          </div>
        </div>
      </div>

      {/* Rules */}
      <div style={cardStyle}>
        <div style={rulesHeaderStyle}>
          <div>
            <h2 style={sectionTitleStyle}>Configured Rules</h2>
            <p style={countTextStyle}>
              {rules.length} rule{rules.length !== 1 ? "s" : ""}
              configured
            </p>
          </div>
        </div>

        {rules.length === 0 ? (
          <div style={emptyStyle}>
            <div style={emptyIconStyle}>⚙</div>

            <h3 style={emptyTitleStyle}>
              No event rules configured
            </h3>

            <p style={emptyTextStyle}>
              Add an ENTER, EXIT, INSIDE or OUTSIDE rule above.
            </p>
          </div>
        ) : (
          <div style={rulesListStyle}>
            {rules.map((rule) => (
              <div key={rule.id} style={ruleCardStyle}>
                <div style={ruleLeftStyle}>
                  <div style={eventIconStyle}>
                    {getEventIcon(rule.event_type)}
                  </div>

                  <div>
                    <div style={eventNameStyle}>
                      {rule.event_type}
                    </div>

                    <div style={eventDescriptionStyle}>
                      {getEventDescription(rule.event_type)}
                    </div>
                  </div>
                </div>

                <div style={ruleRightStyle}>
                  <span
                    style={{
                      ...statusBadgeStyle,
                      backgroundColor: rule.is_enabled
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(148,163,184,0.15)",
                      color: rule.is_enabled
                        ? "#22c55e"
                        : "#94a3b8",
                    }}
                  >
                    {rule.is_enabled ? "Enabled" : "Disabled"}
                  </span>

                  <button
                    onClick={() => handleToggleRule(rule)}
                    style={{
                      ...toggleButtonStyle,
                      borderColor: rule.is_enabled
                        ? "rgba(239,68,68,0.4)"
                        : "rgba(34,197,94,0.4)",
                      color: rule.is_enabled
                        ? "#ef4444"
                        : "#22c55e",
                    }}
                  >
                    {rule.is_enabled ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Information */}
      <div style={infoCardStyle}>
        <div style={infoIconStyle}>ℹ</div>

        <div>
          <h3 style={infoTitleStyle}>How rules work</h3>

          <p style={infoTextStyle}>
            Rules determine which geofence events are recorded when
            a device location is processed.
          </p>

          <ul style={infoListStyle}>
            <li>
              <strong>ENTER</strong> — device moves from outside to
              inside.
            </li>

            <li>
              <strong>EXIT</strong> — device moves from inside to
              outside.
            </li>

            <li>
              <strong>INSIDE</strong> — device remains inside.
            </li>

            <li>
              <strong>OUTSIDE</strong> — device remains outside.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const pageStyle: React.CSSProperties = {
  padding: "30px",
  minHeight: "100%",
  color: "#f8fafc",
};

const headerStyle: React.CSSProperties = {
  marginBottom: "30px",
};

const backButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#00d4ff",
  cursor: "pointer",
  padding: 0,
  fontSize: "14px",
  marginBottom: "15px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "30px",
  margin: 0,
  fontWeight: 700,
};

const subtitleStyle: React.CSSProperties = {
  color: "#94a3b8",
  marginTop: "8px",
};

const cardStyle: React.CSSProperties = {
  background: "rgba(15, 23, 42, 0.75)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  borderRadius: "16px",
  padding: "24px",
  marginBottom: "24px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "20px",
  fontWeight: 600,
};

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr auto",
  gap: "20px",
  alignItems: "end",
  marginTop: "20px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "#cbd5e1",
  fontSize: "14px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(148,163,184,0.2)",
  background: "#0f172a",
  color: "#f8fafc",
  outline: "none",
  fontSize: "14px",
  boxSizing: "border-box",
};

const buttonContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "12px 20px",
  border: "none",
  borderRadius: "10px",
  background: "#00d4ff",
  color: "#06111f",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const rulesHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const countTextStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "13px",
  marginTop: "6px",
};

const rulesListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "20px",
};

const ruleCardStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  padding: "18px",
  borderRadius: "12px",
  background: "rgba(30,41,59,0.6)",
  border: "1px solid rgba(148,163,184,0.1)",
};

const ruleLeftStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
};

const eventIconStyle: React.CSSProperties = {
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,212,255,0.1)",
  color: "#00d4ff",
  fontSize: "20px",
  fontWeight: 700,
};

const eventNameStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
};

const eventDescriptionStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "13px",
  marginTop: "4px",
};

const ruleRightStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const statusBadgeStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: 600,
};

const toggleButtonStyle: React.CSSProperties = {
  padding: "8px 13px",
  borderRadius: "8px",
  background: "transparent",
  border: "1px solid",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 600,
};

const emptyStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "50px 20px",
};

const emptyIconStyle: React.CSSProperties = {
  fontSize: "40px",
  color: "#64748b",
};

const emptyTitleStyle: React.CSSProperties = {
  marginTop: "15px",
  marginBottom: "8px",
};

const emptyTextStyle: React.CSSProperties = {
  color: "#64748b",
  margin: 0,
};

const infoCardStyle: React.CSSProperties = {
  display: "flex",
  gap: "15px",
  padding: "20px",
  borderRadius: "14px",
  background: "rgba(0,212,255,0.05)",
  border: "1px solid rgba(0,212,255,0.12)",
};

const infoIconStyle: React.CSSProperties = {
  color: "#00d4ff",
  fontSize: "20px",
};

const infoTitleStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "16px",
};

const infoTextStyle: React.CSSProperties = {
  color: "#94a3b8",
  margin: "0 0 10px",
  fontSize: "14px",
};

const infoListStyle: React.CSSProperties = {
  color: "#94a3b8",
  margin: 0,
  paddingLeft: "20px",
  lineHeight: 1.8,
  fontSize: "13px",
};

const errorStyle: React.CSSProperties = {
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.25)",
  color: "#f87171",
  padding: "12px 16px",
  borderRadius: "10px",
  marginBottom: "20px",
};

const successStyle: React.CSSProperties = {
  background: "rgba(34,197,94,0.1)",
  border: "1px solid rgba(34,197,94,0.25)",
  color: "#4ade80",
  padding: "12px 16px",
  borderRadius: "10px",
  marginBottom: "20px",
};

const loadingStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "60px",
  color: "#94a3b8",
};

export default GeofenceRules;