import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

interface Device {
  id: number;
  user_id: number;
  device_name: string;
  device_identifier: string;
  is_active: boolean;
}

interface LocationResponse {
  id: number;
  device_id: number;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  recorded_at: string;
  created_at: string;
}

const Locations = () => {
  const navigate = useNavigate();

  const [devices, setDevices] = useState<Device[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [deviceId, setDeviceId] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [accuracy, setAccuracy] = useState("");
  const [recordedAt, setRecordedAt] = useState("");

  const [result, setResult] = useState<LocationResponse | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoadingDevices(true);

      const token = localStorage.getItem("access_token");

      const response = await api.get("/devices/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDevices(response.data);

      const activeDevice = response.data.find(
        (device: Device) => device.is_active
      );

      if (activeDevice) {
        setDeviceId(String(activeDevice.id));
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to load registered devices."
      );
    } finally {
      setLoadingDevices(false);
    }
  };

  const submitLocation = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setResult(null);

    if (!deviceId || !latitude || !longitude) {
      setError("Please fill all required fields.");
      return;
    }

    const latitudeValue = Number(latitude);
    const longitudeValue = Number(longitude);
    const accuracyValue = accuracy ? Number(accuracy) : null;

    if (latitudeValue < -90 || latitudeValue > 90) {
      setError("Latitude must be between -90 and 90.");
      return;
    }

    if (longitudeValue < -180 || longitudeValue > 180) {
      setError("Longitude must be between -180 and 180.");
      return;
    }

    if (accuracyValue !== null && accuracyValue < 0) {
      setError("GPS accuracy cannot be negative.");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("access_token");

      const payload: {
        device_id: number;
        latitude: number;
        longitude: number;
        accuracy?: number;
        recorded_at?: string;
      } = {
        device_id: Number(deviceId),
        latitude: latitudeValue,
        longitude: longitudeValue,
      };

      if (accuracyValue !== null) {
        payload.accuracy = accuracyValue;
      }

      if (recordedAt) {
        payload.recorded_at = new Date(recordedAt).toISOString();
      }

      const response = await api.post("/locations/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResult(response.data);
      setMessage(
        "Location submitted successfully. Geofence processing was completed by the backend."
      );

      setLatitude("");
      setLongitude("");
      setAccuracy("");
      setRecordedAt("");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to submit location."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Location Tracking</h1>
          <p style={styles.subtitle}>
            Submit device location and trigger geofence detection
          </p>
        </div>

        <button
          style={styles.backButton}
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      <div style={styles.grid}>
        {/* Submit Location */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Submit Location</h2>

          <form onSubmit={submitLocation}>
            <label style={styles.label}>Device *</label>

            {loadingDevices ? (
              <div style={styles.loading}>Loading devices...</div>
            ) : (
              <select
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                style={styles.input}
              >

                <option
                  value=""
                  style={{
                    color: "#233653",
                    background: "#ffffff",
                  }}
                >
                  Select device
                </option>
                <option value="">Select device</option>

                {devices
                  .filter((device) => device.is_active)
                  .map((device) => (
                    <option
                      key={device.id}
                      value={device.id}
                      style={{
                        color: "#233653",
                        background: "#ffffff",
                      }}
                    >
                      {device.device_name} — ID {device.id}
                    </option>
                  ))}
              </select>
            )}

            <label style={styles.label}>Latitude *</label>

            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Example: 11.0168"
              style={styles.input}
            />

            <label style={styles.label}>Longitude *</label>

            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Example: 76.9558"
              style={styles.input}
            />

            <label style={styles.label}>GPS Accuracy (meters)</label>

            <input
              type="number"
              step="any"
              min="0"
              value={accuracy}
              onChange={(e) => setAccuracy(e.target.value)}
              placeholder="Example: 10"
              style={styles.input}
            />

            <label style={styles.label}>Recorded At</label>

            <input
              type="datetime-local"
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
              style={styles.input}
            />

            <button
              type="submit"
              disabled={submitting || loadingDevices}
              style={{
                ...styles.submitButton,
                opacity: submitting || loadingDevices ? 0.6 : 1,
              }}
            >
              {submitting ? "Submitting..." : "Submit Location"}
            </button>
          </form>

          {message && <div style={styles.success}>{message}</div>}

          {error && <div style={styles.error}>{error}</div>}
        </div>

        {/* Information */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>How It Works</h2>

          <div style={styles.infoBox}>
            <div style={styles.infoNumber}>1</div>
            <div>
              <strong>Select Device</strong>
              <p style={styles.infoText}>
                Choose one of your active registered devices.
              </p>
            </div>
          </div>

          <div style={styles.infoBox}>
            <div style={styles.infoNumber}>2</div>
            <div>
              <strong>Send GPS Location</strong>
              <p style={styles.infoText}>
                Provide latitude, longitude and optional GPS accuracy.
              </p>
            </div>
          </div>

          <div style={styles.infoBox}>
            <div style={styles.infoNumber}>3</div>
            <div>
              <strong>Geofence Detection</strong>
              <p style={styles.infoText}>
                The backend checks the location against active geofences.
              </p>
            </div>
          </div>

          <div style={styles.infoBox}>
            <div style={styles.infoNumber}>4</div>
            <div>
              <strong>Event Detection</strong>
              <p style={styles.infoText}>
                ENTER, EXIT, INSIDE and OUTSIDE rules can generate
                geofence events based on the device's current state.
              </p>
            </div>
          </div>

          <div style={styles.warningBox}>
            <strong>GPS Accuracy</strong>
            <p style={styles.infoText}>
              Locations with accuracy greater than the configured 50m
              threshold are stored but geofence processing is skipped.
            </p>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Last Submitted Location</h2>

          <div style={styles.resultGrid}>
            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Location ID</span>
              <strong>{result.id}</strong>
            </div>

            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Device ID</span>
              <strong>{result.device_id}</strong>
            </div>

            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Latitude</span>
              <strong>{result.latitude}</strong>
            </div>

            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Longitude</span>
              <strong>{result.longitude}</strong>
            </div>

            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Accuracy</span>
              <strong>
                {result.accuracy !== null
                  ? `${result.accuracy} m`
                  : "Not provided"}
              </strong>
            </div>

            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Recorded At</span>
              <strong>
                {new Date(result.recorded_at).toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: "30px 0",
    color: "#172b4d",
    minHeight: "100%",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "26px",
    gap: "20px",
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
    marginBottom: 0,
    color: "#718096",
    fontSize: "13px",
  },

  backButton: {
    padding: "10px 16px",
    borderRadius: "9px",
    border: "1px solid #dbe5ef",
    background: "#ffffff",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
    boxShadow: "0 5px 15px rgba(48,72,105,0.05)",
    transition: "all 0.2s ease",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e2e9f1",
    borderRadius: "17px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(48,72,105,0.06)",
  },

  cardTitle: {
    marginTop: 0,
    marginBottom: "20px",
    fontSize: "16px",
    fontWeight: 800,
    color: "#233653",
    letterSpacing: "-0.2px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    marginTop: "16px",
    fontSize: "11px",
    fontWeight: 800,
    color: "#66768c",
    letterSpacing: "0.2px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    borderRadius: "9px",
    border: "1px solid #d9e3ed",
    background: "#f9fbfd",
    color: "#233653",
    outline: "none",
    fontSize: "13px",
    fontFamily: "inherit",
  },

  submitButton: {
    width: "100%",
    marginTop: "23px",
    padding: "13px",
    border: "none",
    borderRadius: "9px",
    background: "linear-gradient(100deg, #198fd0, #2563eb)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(37,99,235,0.18)",
  },

  loading: {
    padding: "12px",
    borderRadius: "9px",
    background: "#f7f9fc",
    border: "1px solid #e1e8f0",
    color: "#718096",
    fontSize: "13px",
  },

  success: {
    marginTop: "18px",
    padding: "12px 14px",
    borderRadius: "9px",
    background: "#ecfaf5",
    border: "1px solid #c9efe2",
    color: "#12805f",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  error: {
    marginTop: "18px",
    padding: "12px 14px",
    borderRadius: "9px",
    background: "#fff1f4",
    border: "1px solid #f3d1da",
    color: "#c74d70",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  infoBox: {
    display: "flex",
    gap: "13px",
    alignItems: "flex-start",
    padding: "14px 0",
    borderBottom: "1px solid #edf1f5",
  },

  infoNumber: {
    minWidth: "30px",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "#eaf5ff",
    color: "#1684c1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "12px",
  },

  infoText: {
    margin: "5px 0 0",
    color: "#718096",
    fontSize: "12px",
    lineHeight: 1.55,
  },

  warningBox: {
    marginTop: "20px",
    padding: "14px",
    borderRadius: "10px",
    background: "#fff8eb",
    border: "1px solid #f3dfb8",
    color: "#b87918",
    fontSize: "12px",
  },

  resultGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "14px",
  },

  resultItem: {
    padding: "14px",
    borderRadius: "10px",
    background: "#f8fafc",
    border: "1px solid #e7edf3",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  resultLabel: {
    color: "#8a97a8",
    fontSize: "9px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.7px",
  },
};

export default Locations;