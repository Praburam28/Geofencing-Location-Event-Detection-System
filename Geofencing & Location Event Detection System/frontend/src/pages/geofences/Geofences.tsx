import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

interface GeofencePoint {
  latitude: number;
  longitude: number;
  point_order: number;
}

interface Geofence {
  id: number;
  name: string;
  description: string | null;
  geofence_type: string;
  center_latitude: number | null;
  center_longitude: number | null;
  radius: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  points: GeofencePoint[];
}

const Geofences = () => {
  const navigate = useNavigate();

  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create modal
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Edit modal
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingGeofence, setEditingGeofence] =
    useState<Geofence | null>(null);

  // Create form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [geofenceType, setGeofenceType] = useState("CIRCLE");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("");

  const [polygonPoints, setPolygonPoints] = useState<
    GeofencePoint[]
  >([
    {
      latitude: 0,
      longitude: 0,
      point_order: 1,
    },
    {
      latitude: 0,
      longitude: 0,
      point_order: 2,
    },
    {
      latitude: 0,
      longitude: 0,
      point_order: 3,
    },
  ]);

  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);

  // Edit form
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editing, setEditing] = useState(false);

  const token = localStorage.getItem("access_token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    loadGeofences();
  }, []);

  const loadGeofences = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/geofences/", {
        headers,
      });

      setGeofences(response.data);
    } catch (err: any) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Failed to load geofences."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CREATE
  ========================= */

  const resetCreateForm = () => {
    setName("");
    setDescription("");
    setGeofenceType("CIRCLE");

    setLatitude("");
    setLongitude("");
    setRadius("");

    setPolygonPoints([
      {
        latitude: 0,
        longitude: 0,
        point_order: 1,
      },
      {
        latitude: 0,
        longitude: 0,
        point_order: 2,
      },
      {
        latitude: 0,
        longitude: 0,
        point_order: 3,
      },
    ]);

    setIsActive(true);
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    resetCreateForm();
  };

  const addPolygonPoint = () => {
    setPolygonPoints((currentPoints) => [
      ...currentPoints,
      {
        latitude: 0,
        longitude: 0,
        point_order: currentPoints.length + 1,
      },
    ]);
  };

  const removePolygonPoint = (index: number) => {
    if (polygonPoints.length <= 3) {
      setError("A polygon requires at least 3 points.");
      return;
    }

    const updatedPoints = polygonPoints
      .filter((_, pointIndex) => pointIndex !== index)
      .map((point, pointIndex) => ({
        ...point,
        point_order: pointIndex + 1,
      }));

    setPolygonPoints(updatedPoints);
  };

  const updatePolygonPoint = (
    index: number,
    field: "latitude" | "longitude",
    value: string
  ) => {
    const numericValue =
      value === "" ? 0 : Number(value);

    setPolygonPoints((currentPoints) =>
      currentPoints.map((point, pointIndex) =>
        pointIndex === index
          ? {
              ...point,
              [field]: numericValue,
            }
          : point
      )
    );
  };

  const handleCreateGeofence = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!name.trim()) {
        setError("Geofence name is required.");
        return;
      }

      let payload: any = {
        name: name.trim(),
        description: description.trim() || null,
        geofence_type: geofenceType,
      };

      if (geofenceType === "CIRCLE") {
        if (
          latitude === "" ||
          longitude === "" ||
          radius === ""
        ) {
          setError(
            "Latitude, longitude and radius are required."
          );
          return;
        }

        const lat = Number(latitude);
        const lon = Number(longitude);
        const radiusValue = Number(radius);

        if (lat < -90 || lat > 90) {
          setError("Latitude must be between -90 and 90.");
          return;
        }

        if (lon < -180 || lon > 180) {
          setError(
            "Longitude must be between -180 and 180."
          );
          return;
        }

        if (radiusValue <= 0) {
          setError("Radius must be greater than 0.");
          return;
        }

        payload.center_latitude = lat;
        payload.center_longitude = lon;
        payload.radius = radiusValue;
      }

      if (geofenceType === "POLYGON") {
        if (polygonPoints.length < 3) {
          setError(
            "Polygon requires at least 3 points."
          );
          return;
        }

        const invalidPoint = polygonPoints.some(
          (point) =>
            point.latitude < -90 ||
            point.latitude > 90 ||
            point.longitude < -180 ||
            point.longitude > 180
        );

        if (invalidPoint) {
          setError(
            "Polygon coordinates must contain valid latitude and longitude values."
          );
          return;
        }

        payload.points = polygonPoints.map(
          (point, index) => ({
            latitude: Number(point.latitude),
            longitude: Number(point.longitude),
            point_order: index + 1,
          })
        );
      }

      const response = await api.post(
        "/geofences/",
        payload,
        {
          headers,
        }
      );

      setGeofences((current) => [
        ...current,
        response.data,
      ]);

      closeCreateForm();

      setSuccess(
        "Geofence created successfully."
      );

      await loadGeofences();
    } catch (err: any) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Failed to create geofence."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     EDIT
  ========================= */

  const openEditForm = (geofence: Geofence) => {
    setEditingGeofence(geofence);

    setEditName(geofence.name);
    setEditDescription(
      geofence.description || ""
    );
    setEditIsActive(geofence.is_active);

    setError("");
    setSuccess("");

    setShowEditForm(true);
  };

  const closeEditForm = () => {
    setShowEditForm(false);
    setEditingGeofence(null);

    setEditName("");
    setEditDescription("");
    setEditIsActive(true);
  };

  const handleUpdateGeofence = async () => {
    if (!editingGeofence) {
      return;
    }

    if (!editName.trim()) {
      setError("Geofence name is required.");
      return;
    }

    try {
      setEditing(true);
      setError("");
      setSuccess("");

      const payload = {
        name: editName.trim(),
        description:
          editDescription.trim() || null,
        is_active: editIsActive,
      };

      const response = await api.put(
        `/geofences/${editingGeofence.id}`,
        payload,
        {
          headers,
        }
      );

      setGeofences((current) =>
        current.map((geofence) =>
          geofence.id === editingGeofence.id
            ? response.data
            : geofence
        )
      );

      closeEditForm();

      setSuccess(
        "Geofence updated successfully."
      );

      await loadGeofences();
    } catch (err: any) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Failed to update geofence."
      );
    } finally {
      setEditing(false);
    }
  };

  /* =========================
     ENABLE / DISABLE
  ========================= */

  const handleToggleActive = async (
    geofence: Geofence
  ) => {
    try {
      setError("");
      setSuccess("");

      const response = await api.put(
        `/geofences/${geofence.id}`,
        {
          is_active: !geofence.is_active,
        },
        {
          headers,
        }
      );

      setGeofences((current) =>
        current.map((item) =>
          item.id === geofence.id
            ? response.data
            : item
        )
      );

      setSuccess(
        `Geofence "${geofence.name}" ${
          geofence.is_active
            ? "disabled"
            : "enabled"
        } successfully.`
      );

      await loadGeofences();
    } catch (err: any) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Failed to update geofence status."
      );
    }
  };

  /* =========================
     DELETE
  ========================= */

  const handleDeleteGeofence = async (
    geofence: Geofence
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${geofence.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/geofences/${geofence.id}`,
        {
          headers,
        }
      );

      setGeofences((current) =>
        current.filter(
          (item) =>
            item.id !== geofence.id
        )
      );

      setSuccess(
        `Geofence "${geofence.name}" deleted successfully.`
      );
    } catch (err: any) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Failed to delete geofence."
      );
    }
  };

  /* =========================
     DISPLAY HELPERS
  ========================= */

  const getTypeIcon = (type: string) => {
    return type === "CIRCLE"
      ? "◯"
      : "⬡";
  };

  const getTypeLabel = (type: string) => {
    return type === "CIRCLE"
      ? "Circle"
      : "Polygon";
  };

  const getLocation = (
    geofence: Geofence
  ) => {
    if (
      geofence.center_latitude !== null &&
      geofence.center_latitude !== undefined &&
      geofence.center_longitude !== null &&
      geofence.center_longitude !== undefined
    ) {
      return `${geofence.center_latitude.toFixed(
        4
      )}, ${geofence.center_longitude.toFixed(
        4
      )}`;
    }

    return "Polygon boundary";
  };

  const activeCount = geofences.filter(
    (geofence) =>
      geofence.is_active
  ).length;

  const inactiveCount =
    geofences.length - activeCount;

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle}>
          Loading geofences...
        </div>
      </div>
    );
  }

  /* =========================
     PAGE
  ========================= */

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>
            Geofences
          </h1>

          <p style={subtitleStyle}>
            Create and manage geographical
            boundaries.
          </p>
        </div>

        <div style={headerButtonsStyle}>
          <button
            onClick={() =>
              navigate("/geofences/map")
            }
            style={mapButtonStyle}
          >
            🗺 Map
          </button>

          <button
            onClick={() => {
              setError("");
              setSuccess("");
              setShowCreateForm(true);
            }}
            style={primaryButtonStyle}
          >
            + Create Geofence
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div style={successStyle}>
          {success}
        </div>
      )}

      {/* Summary */}
      <div style={summaryGridStyle}>
        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>
            Total Geofences
          </div>

          <div style={summaryValueStyle}>
            {geofences.length}
          </div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>
            Active
          </div>

          <div
            style={{
              ...summaryValueStyle,
              color: "#22c55e",
            }}
          >
            {activeCount}
          </div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>
            Inactive
          </div>

          <div
            style={{
              ...summaryValueStyle,
              color: "#94a3b8",
            }}
          >
            {inactiveCount}
          </div>
        </div>
      </div>

      {/* List */}
      <div style={listCardStyle}>
        <div style={listHeaderStyle}>
          <div>
            <h2 style={sectionTitleStyle}>
              All Geofences
            </h2>

            <p style={listSubtitleStyle}>
              Manage your configured
              geographical boundaries.
            </p>
          </div>
        </div>

        {geofences.length === 0 ? (
          <div style={emptyStyle}>
            <div style={emptyIconStyle}>
              ◯
            </div>

            <h3 style={emptyTitleStyle}>
              No geofences found
            </h3>

            <p style={emptyTextStyle}>
              Create your first geofence
              to get started.
            </p>
          </div>
        ) : (
          <div style={geofenceListStyle}>
            {geofences.map(
              (geofence) => (
                <div
                  key={geofence.id}
                  style={geofenceRowStyle}
                >
                  {/* Information */}
                  <div
                    style={
                      geofenceMainStyle
                    }
                  >
                    <div
                      style={
                        geofenceIconStyle
                      }
                    >
                      {getTypeIcon(
                        geofence.geofence_type
                      )}
                    </div>

                    <div
                      style={
                        geofenceInfoStyle
                      }
                    >
                      <div
                        style={
                          nameRowStyle
                        }
                      >
                        <h3
                          style={
                            geofenceNameStyle
                          }
                        >
                          {
                            geofence.name
                          }
                        </h3>

                        <span
                          style={{
                            ...statusBadgeStyle,
                            backgroundColor:
                              geofence.is_active
                                ? "rgba(34,197,94,0.12)"
                                : "rgba(148,163,184,0.12)",
                            color:
                              geofence.is_active
                                ? "#22c55e"
                                : "#94a3b8",
                          }}
                        >
                          {geofence.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      <div
                        style={
                          detailsRowStyle
                        }
                      >
                        <span>
                          {getTypeLabel(
                            geofence.geofence_type
                          )}
                        </span>

                        <span>
                          •
                        </span>

                        <span>
                          {getLocation(
                            geofence
                          )}
                        </span>

                        {geofence.geofence_type ===
                          "CIRCLE" &&
                          geofence.radius !==
                            null && (
                            <>
                              <span>
                                •
                              </span>

                              <span>
                                Radius:{" "}
                                {
                                  geofence.radius
                                }{" "}
                                m
                              </span>
                            </>
                          )}

                        {geofence.geofence_type ===
                          "POLYGON" && (
                          <>
                            <span>
                              •
                            </span>

                            <span>
                              {
                                geofence
                                  .points
                                  ?.length
                              }{" "}
                              points
                            </span>
                          </>
                        )}
                      </div>

                      {geofence.description && (
                        <p
                          style={
                            descriptionStyle
                          }
                        >
                          {
                            geofence.description
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={actionsStyle}
                  >
                    <button
                      onClick={() =>
                        navigate(
                          `/geofences/${geofence.id}/rules`
                        )
                      }
                      style={
                        rulesButtonStyle
                      }
                    >
                      ⚙ Rules
                    </button>

                    <button
                      onClick={() =>
                        openEditForm(
                          geofence
                        )
                      }
                      style={
                        editButtonStyle
                      }
                    >
                      ✏ Edit
                    </button>

                    <button
                      onClick={() =>
                        handleToggleActive(
                          geofence
                        )
                      }
                      style={{
                        ...toggleButtonStyle,
                        color:
                          geofence.is_active
                            ? "#f59e0b"
                            : "#22c55e",
                        borderColor:
                          geofence.is_active
                            ? "rgba(245,158,11,0.35)"
                            : "rgba(34,197,94,0.35)",
                      }}
                    >
                      {geofence.is_active
                        ? "Disable"
                        : "Enable"}
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteGeofence(
                          geofence
                        )
                      }
                      style={
                        deleteButtonStyle
                      }
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* =========================
          CREATE MODAL
      ========================= */}

      {showCreateForm && (
        <div
          style={
            modalOverlayStyle
          }
        >
          <div style={modalStyle}>
            <div
              style={
                modalHeaderStyle
              }
            >
              <div>
                <h2
                  style={
                    modalTitleStyle
                  }
                >
                  Create Geofence
                </h2>

                <p
                  style={
                    modalSubtitleStyle
                  }
                >
                  Define a new geographical
                  boundary.
                </p>
              </div>

              <button
                onClick={
                  closeCreateForm
                }
                style={
                  closeButtonStyle
                }
              >
                ×
              </button>
            </div>

            <div style={formStyle}>
              {/* Name */}
              <div>
                <label
                  style={labelStyle}
                >
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="Office Area"
                  style={inputStyle}
                />
              </div>

              {/* Description */}
              <div>
                <label
                  style={labelStyle}
                >
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Optional description"
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Type */}
              <div>
                <label
                  style={labelStyle}
                >
                  Geofence Type
                </label>

                <div
                  style={
                    typeSelectorStyle
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      setGeofenceType(
                        "CIRCLE"
                      )
                    }
                    style={{
                      ...typeButtonStyle,
                      background:
                        geofenceType ===
                        "CIRCLE"
                          ? "rgba(0,212,255,0.12)"
                          : "transparent",
                      borderColor:
                        geofenceType ===
                        "CIRCLE"
                          ? "#00d4ff"
                          : "rgba(148,163,184,0.2)",
                      color:
                        geofenceType ===
                        "CIRCLE"
                          ? "#00d4ff"
                          : "#94a3b8",
                    }}
                  >
                    ◯ Circle
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setGeofenceType(
                        "POLYGON"
                      )
                    }
                    style={{
                      ...typeButtonStyle,
                      background:
                        geofenceType ===
                        "POLYGON"
                          ? "rgba(0,212,255,0.12)"
                          : "transparent",
                      borderColor:
                        geofenceType ===
                        "POLYGON"
                          ? "#00d4ff"
                          : "rgba(148,163,184,0.2)",
                      color:
                        geofenceType ===
                        "POLYGON"
                          ? "#00d4ff"
                          : "#94a3b8",
                    }}
                  >
                    ⬡ Polygon
                  </button>
                </div>
              </div>

              {/* Circle */}
              {geofenceType ===
                "CIRCLE" && (
                <>
                  <div
                    style={
                      twoColumnStyle
                    }
                  >
                    <div>
                      <label
                        style={
                          labelStyle
                        }
                      >
                        Latitude
                      </label>

                      <input
                        type="number"
                        value={
                          latitude
                        }
                        onChange={(e) =>
                          setLatitude(
                            e.target
                              .value
                          )
                        }
                        placeholder="11.0168"
                        step="any"
                        style={
                          inputStyle
                        }
                      />
                    </div>

                    <div>
                      <label
                        style={
                          labelStyle
                        }
                      >
                        Longitude
                      </label>

                      <input
                        type="number"
                        value={
                          longitude
                        }
                        onChange={(e) =>
                          setLongitude(
                            e.target
                              .value
                          )
                        }
                        placeholder="76.9558"
                        step="any"
                        style={
                          inputStyle
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={
                        labelStyle
                      }
                    >
                      Radius (meters)
                    </label>

                    <input
                      type="number"
                      value={radius}
                      onChange={(e) =>
                        setRadius(
                          e.target
                            .value
                        )
                      }
                      placeholder="500"
                      min="1"
                      step="any"
                      style={
                        inputStyle
                      }
                    />
                  </div>
                </>
              )}

              {/* Polygon */}
              {geofenceType ===
                "POLYGON" && (
                <div>
                  <div
                    style={
                      polygonHeaderStyle
                    }
                  >
                    <label
                      style={
                        labelStyle
                      }
                    >
                      Polygon Points
                    </label>

                    <button
                      type="button"
                      onClick={
                        addPolygonPoint
                      }
                      style={
                        smallPrimaryButtonStyle
                      }
                    >
                      + Add Point
                    </button>
                  </div>

                  <div
                    style={
                      polygonListStyle
                    }
                  >
                    {polygonPoints.map(
                      (
                        point,
                        index
                      ) => (
                        <div
                          key={index}
                          style={
                            polygonPointStyle
                          }
                        >
                          <div
                            style={
                              pointNumberStyle
                            }
                          >
                            {index + 1}
                          </div>

                          <input
                            type="number"
                            value={
                              point.latitude
                            }
                            onChange={(
                              e
                            ) =>
                              updatePolygonPoint(
                                index,
                                "latitude",
                                e.target
                                  .value
                              )
                            }
                            placeholder="Latitude"
                            step="any"
                            style={
                              inputStyle
                            }
                          />

                          <input
                            type="number"
                            value={
                              point.longitude
                            }
                            onChange={(
                              e
                            ) =>
                              updatePolygonPoint(
                                index,
                                "longitude",
                                e.target
                                  .value
                              )
                            }
                            placeholder="Longitude"
                            step="any"
                            style={
                              inputStyle
                            }
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removePolygonPoint(
                                index
                              )
                            }
                            style={
                              removePointButtonStyle
                            }
                          >
                            ×
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Active */}
              <label
                style={
                  checkboxLabelStyle
                }
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) =>
                    setIsActive(
                      e.target
                        .checked
                    )
                  }
                />

                <span>
                  Geofence active
                </span>
              </label>

              {/* Buttons */}
              <div
                style={
                  modalActionsStyle
                }
              >
                <button
                  onClick={
                    closeCreateForm
                  }
                  style={
                    secondaryButtonStyle
                  }
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleCreateGeofence
                  }
                  disabled={saving}
                  style={{
                    ...primaryButtonStyle,
                    opacity:
                      saving
                        ? 0.6
                        : 1,
                  }}
                >
                  {saving
                    ? "Creating..."
                    : "Create Geofence"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          EDIT MODAL
      ========================= */}

      {showEditForm &&
        editingGeofence && (
          <div
            style={
              modalOverlayStyle
            }
          >
            <div
              style={modalStyle}
            >
              <div
                style={
                  modalHeaderStyle
                }
              >
                <div>
                  <h2
                    style={
                      modalTitleStyle
                    }
                  >
                    Edit Geofence
                  </h2>

                  <p
                    style={
                      modalSubtitleStyle
                    }
                  >
                    Update geofence
                    information and
                    status.
                  </p>
                </div>

                <button
                  onClick={
                    closeEditForm
                  }
                  style={
                    closeButtonStyle
                  }
                >
                  ×
                </button>
              </div>

              <div style={formStyle}>
                {/* Read-only geometry */}
                <div
                  style={
                    readOnlyInfoStyle
                  }
                >
                  <div>
                    <span
                      style={
                        readOnlyLabelStyle
                      }
                    >
                      Type
                    </span>

                    <strong>
                      {getTypeLabel(
                        editingGeofence.geofence_type
                      )}
                    </strong>
                  </div>

                  <div>
                    <span
                      style={
                        readOnlyLabelStyle
                      }
                    >
                      Location
                    </span>

                    <strong>
                      {getLocation(
                        editingGeofence
                      )}
                    </strong>
                  </div>

                  {editingGeofence.geofence_type ===
                    "CIRCLE" &&
                    editingGeofence.radius !==
                      null && (
                      <div>
                        <span
                          style={
                            readOnlyLabelStyle
                          }
                        >
                          Radius
                        </span>

                        <strong>
                          {
                            editingGeofence.radius
                          }{" "}
                          m
                        </strong>
                      </div>
                    )}

                  {editingGeofence.geofence_type ===
                    "POLYGON" && (
                    <div>
                      <span
                        style={
                          readOnlyLabelStyle
                        }
                      >
                        Points
                      </span>

                      <strong>
                        {
                          editingGeofence
                            .points
                            .length
                        }
                      </strong>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Name
                  </label>

                  <input
                    type="text"
                    value={editName}
                    onChange={(e) =>
                      setEditName(
                        e.target
                          .value
                      )
                    }
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Description
                  </label>

                  <textarea
                    value={
                      editDescription
                    }
                    onChange={(e) =>
                      setEditDescription(
                        e.target
                          .value
                      )
                    }
                    rows={3}
                    placeholder="Optional description"
                    style={{
                      ...inputStyle,
                      resize:
                        "vertical",
                    }}
                  />
                </div>

                {/* Active */}
                <label
                  style={
                    checkboxLabelStyle
                  }
                >
                  <input
                    type="checkbox"
                    checked={
                      editIsActive
                    }
                    onChange={(e) =>
                      setEditIsActive(
                        e.target
                          .checked
                      )
                    }
                  />

                  <span>
                    Geofence active
                  </span>
                </label>

                {/* Geometry notice */}
                <div
                  style={
                    geometryNoticeStyle
                  }
                >
                  <strong>
                    Geometry is
                    unchanged.
                  </strong>

                  <span>
                    The current backend
                    update API supports
                    changing the name,
                    description and active
                    status only.
                  </span>
                </div>

                {/* Buttons */}
                <div
                  style={
                    modalActionsStyle
                  }
                >
                  <button
                    onClick={
                      closeEditForm
                    }
                    style={
                      secondaryButtonStyle
                    }
                  >
                    Cancel
                  </button>

                  <button
                    onClick={
                      handleUpdateGeofence
                    }
                    disabled={editing}
                    style={{
                      ...primaryButtonStyle,
                      opacity:
                        editing
                          ? 0.6
                          : 1,
                    }}
                  >
                    {editing
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

/* =========================
   STYLES
========================= */

const pageStyle: React.CSSProperties = {
  padding: "30px",
  minHeight: "100%",
  color: "#f8fafc",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  marginBottom: "30px",
};

const headerButtonsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "30px",
  fontWeight: 700,
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "8px",
  marginBottom: 0,
  color: "#94a3b8",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "10px",
  padding: "12px 18px",
  background: "#00d4ff",
  color: "#06111f",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const mapButtonStyle: React.CSSProperties = {
  border:
    "1px solid rgba(0,212,255,0.3)",
  borderRadius: "10px",
  padding: "12px 18px",
  background:
    "rgba(0,212,255,0.08)",
  color: "#00d4ff",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const summaryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: "18px",
  marginBottom: "24px",
};

const summaryCardStyle: React.CSSProperties = {
  background:
    "rgba(15,23,42,0.75)",
  border:
    "1px solid rgba(148,163,184,0.12)",
  borderRadius: "14px",
  padding: "20px",
};

const summaryLabelStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "13px",
};

const summaryValueStyle: React.CSSProperties = {
  marginTop: "8px",
  fontSize: "28px",
  fontWeight: 700,
};

const listCardStyle: React.CSSProperties = {
  background:
    "rgba(15,23,42,0.75)",
  border:
    "1px solid rgba(148,163,184,0.12)",
  borderRadius: "16px",
  padding: "24px",
};

const listHeaderStyle: React.CSSProperties = {
  marginBottom: "20px",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "20px",
  fontWeight: 600,
};

const listSubtitleStyle: React.CSSProperties = {
  marginTop: "6px",
  marginBottom: 0,
  color: "#64748b",
  fontSize: "13px",
};

const geofenceListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const geofenceRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  padding: "18px",
  borderRadius: "12px",
  background:
    "rgba(30,41,59,0.55)",
  border:
    "1px solid rgba(148,163,184,0.1)",
};

const geofenceMainStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  minWidth: 0,
};

const geofenceIconStyle: React.CSSProperties = {
  width: "46px",
  height: "46px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "12px",
  background:
    "rgba(0,212,255,0.08)",
  color: "#00d4ff",
  fontSize: "22px",
};

const geofenceInfoStyle: React.CSSProperties = {
  minWidth: 0,
};

const nameRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
};

const geofenceNameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "16px",
  fontWeight: 700,
};

const statusBadgeStyle: React.CSSProperties = {
  padding: "5px 9px",
  borderRadius: "20px",
  fontSize: "11px",
  fontWeight: 600,
};

const detailsRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
  marginTop: "7px",
  color: "#94a3b8",
  fontSize: "12px",
};

const descriptionStyle: React.CSSProperties = {
  margin: "7px 0 0",
  color: "#64748b",
  fontSize: "12px",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "8px",
  flexWrap: "wrap",
};

const rulesButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "8px",
  border:
    "1px solid rgba(0,212,255,0.3)",
  background:
    "rgba(0,212,255,0.08)",
  color: "#00d4ff",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 600,
};

const editButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "8px",
  border:
    "1px solid rgba(124,92,255,0.35)",
  background:
    "rgba(124,92,255,0.08)",
  color: "#a78bfa",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 600,
};

const toggleButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "8px",
  background: "transparent",
  border: "1px solid",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 600,
};

const deleteButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "8px",
  border:
    "1px solid rgba(239,68,68,0.35)",
  background:
    "rgba(239,68,68,0.08)",
  color: "#ef4444",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 600,
};

const emptyStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "60px 20px",
};

const emptyIconStyle: React.CSSProperties = {
  fontSize: "42px",
  color: "#475569",
};

const emptyTitleStyle: React.CSSProperties = {
  marginTop: "15px",
  marginBottom: "8px",
};

const emptyTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(2,6,23,0.75)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "720px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#0f172a",
  border:
    "1px solid rgba(148,163,184,0.15)",
  borderRadius: "18px",
  padding: "26px",
  boxShadow:
    "0 25px 70px rgba(0,0,0,0.4)",
};

const modalHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  marginBottom: "24px",
};

const modalTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "22px",
  fontWeight: 700,
};

const modalSubtitleStyle: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#64748b",
  fontSize: "13px",
};

const closeButtonStyle: React.CSSProperties = {
  width: "34px",
  height: "34px",
  borderRadius: "8px",
  border:
    "1px solid rgba(148,163,184,0.15)",
  background:
    "rgba(148,163,184,0.06)",
  color: "#94a3b8",
  fontSize: "24px",
  lineHeight: 1,
  cursor: "pointer",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "#cbd5e1",
  fontSize: "13px",
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: "10px",
  border:
    "1px solid rgba(148,163,184,0.18)",
  background: "#020617",
  color: "#f8fafc",
  outline: "none",
  fontSize: "14px",
};

const typeSelectorStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
};

const typeButtonStyle: React.CSSProperties = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid",
  cursor: "pointer",
  fontWeight: 600,
};

const twoColumnStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "1fr 1fr",
  gap: "15px",
};

const polygonHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const smallPrimaryButtonStyle: React.CSSProperties = {
  padding: "7px 11px",
  borderRadius: "8px",
  border:
    "1px solid rgba(0,212,255,0.3)",
  background:
    "rgba(0,212,255,0.08)",
  color: "#00d4ff",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 600,
};

const polygonListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const polygonPointStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "32px 1fr 1fr 36px",
  gap: "8px",
  alignItems: "center",
};

const pointNumberStyle: React.CSSProperties = {
  width: "32px",
  height: "32px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "rgba(0,212,255,0.08)",
  color: "#00d4ff",
  fontSize: "12px",
  fontWeight: 700,
};

const removePointButtonStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "8px",
  border:
    "1px solid rgba(239,68,68,0.3)",
  background:
    "rgba(239,68,68,0.08)",
  color: "#ef4444",
  cursor: "pointer",
  fontSize: "20px",
};

const checkboxLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  color: "#cbd5e1",
  fontSize: "14px",
  cursor: "pointer",
};

const modalActionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  paddingTop: "5px",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: "10px",
  border:
    "1px solid rgba(148,163,184,0.2)",
  background: "transparent",
  color: "#cbd5e1",
  cursor: "pointer",
  fontWeight: 600,
};

const readOnlyInfoStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "12px",
  padding: "15px",
  borderRadius: "12px",
  background:
    "rgba(30,41,59,0.5)",
  border:
    "1px solid rgba(148,163,184,0.1)",
};

const readOnlyLabelStyle: React.CSSProperties = {
  display: "block",
  color: "#64748b",
  fontSize: "11px",
  marginBottom: "4px",
};

const geometryNoticeStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  padding: "13px",
  borderRadius: "10px",
  background:
    "rgba(245,158,11,0.06)",
  border:
    "1px solid rgba(245,158,11,0.15)",
  color: "#94a3b8",
  fontSize: "12px",
};

const errorStyle: React.CSSProperties = {
  background:
    "rgba(239,68,68,0.1)",
  border:
    "1px solid rgba(239,68,68,0.25)",
  color: "#f87171",
  padding: "12px 16px",
  borderRadius: "10px",
  marginBottom: "20px",
};

const successStyle: React.CSSProperties = {
  background:
    "rgba(34,197,94,0.1)",
  border:
    "1px solid rgba(34,197,94,0.25)",
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

export default Geofences;