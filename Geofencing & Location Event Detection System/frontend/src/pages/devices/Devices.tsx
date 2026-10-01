import { useEffect, useState } from "react";
import api from "../../services/api";

interface Device {
  id: number;
  user_id: number;
  device_name: string;
  device_identifier: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DeviceForm {
  device_name: string;
  device_identifier: string;
}

const Devices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [deviceName, setDeviceName] = useState("");
  const [deviceIdentifier, setDeviceIdentifier] =
    useState("");

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  /* =========================
     LOAD DEVICES
     ========================= */

  const loadDevices = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("access_token");

      const response = await api.get("/devices/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDevices(response.data);
    } catch (err: any) {
      console.error(
        "Failed to load devices:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load devices."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  /* =========================
     CREATE DEVICE
     ========================= */

  const handleCreate = async () => {
    if (!deviceName.trim()) {
      setFormError(
        "Device name is required."
      );
      return;
    }

    if (!deviceIdentifier.trim()) {
      setFormError(
        "Device identifier is required."
      );
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const token =
        localStorage.getItem("access_token");

      const data: DeviceForm = {
        device_name: deviceName.trim(),
        device_identifier:
          deviceIdentifier.trim(),
      };

      await api.post("/devices/", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShowCreateModal(false);

      setDeviceName("");
      setDeviceIdentifier("");

      await loadDevices();
    } catch (err: any) {
      console.error(
        "Failed to create device:",
        err
      );

      setFormError(
        err.response?.data?.detail ||
          "Failed to create device."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     TOGGLE DEVICE
     ========================= */

  const handleToggle = async (
    device: Device
  ) => {
    try {
      const token =
        localStorage.getItem("access_token");

      await api.put(
        `/devices/${device.id}`,
        {
          is_active: !device.is_active,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await loadDevices();
    } catch (err: any) {
      console.error(
        "Failed to update device:",
        err
      );

      alert(
        err.response?.data?.detail ||
          "Failed to update device."
      );
    }
  };

  /* =========================
     DELETE DEVICE
     ========================= */

  const handleDelete = async (
    device: Device
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${device.device_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        localStorage.getItem("access_token");

      await api.delete(
        `/devices/${device.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await loadDevices();
    } catch (err: any) {
      console.error(
        "Failed to delete device:",
        err
      );

      alert(
        err.response?.data?.detail ||
          "Failed to delete device."
      );
    }
  };

  /* =========================
     FORMAT DATE
     ========================= */

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleString();
  };

  return (
    <div
      style={{
        padding: "24px",
        color: "white",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            Devices
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#94a3b8",
            }}
          >
            Manage your registered devices
          </p>
        </div>

        <button
          onClick={() =>
            setShowCreateModal(true)
          }
          style={{
            padding:
              "10px 18px",
            border: "none",
            borderRadius: "8px",
            background:
              "#2563eb",
            color: "white",
            cursor:
              "pointer",
            fontSize:
              "14px",
            fontWeight: 600,
          }}
        >
          + Add Device
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            background:
              "#3f1d1d",
            border:
              "1px solid #ef4444",
            borderRadius: "10px",
            color:
              "#fecaca",
          }}
        >
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading ? (
        <div
          style={{
            padding: "30px",
            background:
              "#111827",
            borderRadius:
              "12px",
            textAlign:
              "center",
            color:
              "#94a3b8",
          }}
        >
          Loading devices...
        </div>
      ) : devices.length === 0 ? (
        <div
          style={{
            padding: "40px",
            background:
              "#111827",
            borderRadius:
              "12px",
            textAlign:
              "center",
            color:
              "#94a3b8",
          }}
        >
          <div
            style={{
              fontSize:
                "40px",
              marginBottom:
                "10px",
            }}
          >
            📱
          </div>

          <div
            style={{
              fontSize:
                "18px",
              color:
                "white",
              marginBottom:
                "8px",
            }}
          >
            No devices found
          </div>

          <div>
            Add your first device
            to start tracking
            locations.
          </div>
        </div>
      ) : (
        /* DEVICE TABLE */

        <div
          style={{
            background:
              "#111827",
            borderRadius:
              "12px",
            overflow:
              "hidden",
            border:
              "1px solid #1e293b",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    "#1e293b",
                }}
              >
                <th
                  style={{
                    padding:
                      "15px",
                    textAlign:
                      "left",
                  }}
                >
                  ID
                </th>

                <th
                  style={{
                    padding:
                      "15px",
                    textAlign:
                      "left",
                  }}
                >
                  Device Name
                </th>

                <th
                  style={{
                    padding:
                      "15px",
                    textAlign:
                      "left",
                  }}
                >
                  Identifier
                </th>

                <th
                  style={{
                    padding:
                      "15px",
                    textAlign:
                      "left",
                  }}
                >
                  Status
                </th>

                <th
                  style={{
                    padding:
                      "15px",
                    textAlign:
                      "left",
                  }}
                >
                  Created
                </th>

                <th
                  style={{
                    padding:
                      "15px",
                    textAlign:
                      "center",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {devices.map(
                (device) => (
                  <tr
                    key={
                      device.id
                    }
                    style={{
                      borderTop:
                        "1px solid #1e293b",
                    }}
                  >
                    <td
                      style={{
                        padding:
                          "15px",
                        color:
                          "#94a3b8",
                      }}
                    >
                      {device.id}
                    </td>

                    <td
                      style={{
                        padding:
                          "15px",
                        fontWeight:
                          600,
                      }}
                    >
                      {device.device_name}
                    </td>

                    <td
                      style={{
                        padding:
                          "15px",
                        color:
                          "#cbd5e1",
                      }}
                    >
                      {device.device_identifier}
                    </td>

                    <td
                      style={{
                        padding:
                          "15px",
                      }}
                    >
                      <span
                        style={{
                          display:
                            "inline-block",
                          padding:
                            "5px 10px",
                          borderRadius:
                            "20px",
                          fontSize:
                            "12px",
                          fontWeight:
                            600,
                          background:
                            device.is_active
                              ? "#064e3b"
                              : "#3f1d1d",
                          color:
                            device.is_active
                              ? "#6ee7b7"
                              : "#fca5a5",
                        }}
                      >
                        {device.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td
                      style={{
                        padding:
                          "15px",
                        color:
                          "#94a3b8",
                        fontSize:
                          "13px",
                      }}
                    >
                      {formatDate(
                        device.created_at
                      )}
                    </td>

                    <td
                      style={{
                        padding:
                          "15px",
                        textAlign:
                          "center",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "center",
                          gap: "8px",
                        }}
                      >
                        <button
                          onClick={() =>
                            handleToggle(
                              device
                            )
                          }
                          style={{
                            padding:
                              "7px 12px",
                            border:
                              "1px solid #334155",
                            borderRadius:
                              "6px",
                            background:
                              "#1e293b",
                            color:
                              "white",
                            cursor:
                              "pointer",
                          }}
                        >
                          {device.is_active
                            ? "Disable"
                            : "Enable"}
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              device
                            )
                          }
                          style={{
                            padding:
                              "7px 12px",
                            border:
                              "none",
                            borderRadius:
                              "6px",
                            background:
                              "#dc2626",
                            color:
                              "white",
                            cursor:
                              "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================
          CREATE MODAL
          ========================= */}

      {showCreateModal && (
        <div
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.65)",
            display:
              "flex",
            justifyContent:
              "center",
            alignItems:
              "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              width:
                "450px",
              background:
                "#111827",
              border:
                "1px solid #334155",
              borderRadius:
                "14px",
              padding:
                "24px",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom:
                  "20px",
              }}
            >
              Add Device
            </h2>

            {formError && (
              <div
                style={{
                  padding:
                    "10px",
                  marginBottom:
                    "15px",
                  background:
                    "#3f1d1d",
                  border:
                    "1px solid #ef4444",
                  borderRadius:
                    "7px",
                  color:
                    "#fecaca",
                  fontSize:
                    "14px",
                }}
              >
                {formError}
              </div>
            )}

            {/* DEVICE NAME */}

            <label
              style={{
                display:
                  "block",
                marginBottom:
                  "7px",
                color:
                  "#cbd5e1",
              }}
            >
              Device Name
            </label>

            <input
              value={
                deviceName
              }
              onChange={(e) =>
                setDeviceName(
                  e.target.value
                )
              }
              placeholder="Example: My Android Phone"
              style={{
                width:
                  "100%",
                boxSizing:
                  "border-box",
                padding:
                  "11px",
                marginBottom:
                  "16px",
                background:
                  "#0f172a",
                border:
                  "1px solid #334155",
                borderRadius:
                  "7px",
                color:
                  "white",
                outline:
                  "none",
              }}
            />

            {/* IDENTIFIER */}

            <label
              style={{
                display:
                  "block",
                marginBottom:
                  "7px",
                color:
                  "#cbd5e1",
              }}
            >
              Device Identifier
            </label>

            <input
              value={
                deviceIdentifier
              }
              onChange={(e) =>
                setDeviceIdentifier(
                  e.target.value
                )
              }
              placeholder="Example: android-device-001"
              style={{
                width:
                  "100%",
                boxSizing:
                  "border-box",
                padding:
                  "11px",
                marginBottom:
                  "20px",
                background:
                  "#0f172a",
                border:
                  "1px solid #334155",
                borderRadius:
                  "7px",
                color:
                  "white",
                outline:
                  "none",
              }}
            />

            {/* BUTTONS */}

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => {
                  setShowCreateModal(
                    false
                  );
                  setFormError("");
                  setDeviceName("");
                  setDeviceIdentifier(
                    ""
                  );
                }}
                style={{
                  padding:
                    "10px 16px",
                  border:
                    "1px solid #334155",
                  borderRadius:
                    "7px",
                  background:
                    "#1e293b",
                  color:
                    "white",
                  cursor:
                    "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={
                  handleCreate
                }
                disabled={saving}
                style={{
                  padding:
                    "10px 16px",
                  border:
                    "none",
                  borderRadius:
                    "7px",
                  background:
                    "#2563eb",
                  color:
                    "white",
                  cursor:
                    saving
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    saving
                      ? 0.6
                      : 1,
                }}
              >
                {saving
                  ? "Creating..."
                  : "Create Device"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;