import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  description: string | null;
  created_at: string;
}

const AuditLogs = () => {
  const navigate = useNavigate();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      const response = await api.get("/audit-logs/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLogs(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to load audit logs."
      );
    } finally {
      setLoading(false);
    }
  };

  const getActionStyle = (action: string) => {
    const value = action.toUpperCase();

    if (value.includes("CREATE")) {
      return {
        background: "rgba(46, 125, 50, 0.2)",
        color: "#81c784",
      };
    }

    if (value.includes("UPDATE")) {
      return {
        background: "rgba(25, 118, 210, 0.2)",
        color: "#64b5f6",
      };
    }

    if (value.includes("DELETE")) {
      return {
        background: "rgba(211, 47, 47, 0.2)",
        color: "#ef9a9a",
      };
    }

    return {
      background: "rgba(255,255,255,0.1)",
      color: "#c8d0dc",
    };
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Audit Logs</h1>
          <p style={styles.subtitle}>
            Track administrative actions performed in the system
          </p>
        </div>

        <div style={styles.headerButtons}>
          <button style={styles.refreshButton} onClick={fetchLogs}>
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
          Loading audit logs...
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      {!loading && !error && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Activity History</h2>
              <p style={styles.count}>
                {logs.length} log{logs.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {logs.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>📋</div>

              <h3 style={styles.emptyTitle}>
                No audit logs found
              </h3>

              <p style={styles.emptyText}>
                Administrative actions will appear here when they are
                performed.
              </p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Action</th>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Entity</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Date & Time</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={styles.td}>#{log.id}</td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            ...getActionStyle(log.action),
                          }}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {log.user_id !== null
                          ? `User #${log.user_id}`
                          : "System"}
                      </td>

                      <td style={styles.td}>
                        <div style={styles.entity}>
                          <strong>{log.entity_type}</strong>

                          {log.entity_id !== null && (
                            <span>
                              #{log.entity_id}
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={styles.td}>
                        <span style={styles.actionBadge}>
                          {log.action || "—"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {new Date(
                          log.created_at
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
    minWidth: "950px",
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
    padding: "17px 18px",
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

  user: {
    color: "#233653",
    fontWeight: 700,
  },

  entity: {
    color: "#2563eb",
    fontWeight: 700,
  },

  description: {
    color: "#596b82",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  date: {
    color: "#66768c",
    fontSize: "11px",
    whiteSpace: "nowrap",
  },

  actionBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "7px",
    background: "#eaf7ef",
    color: "#16834f",
    border: "1px solid #ccebd9",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.3px",
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

export default AuditLogs;