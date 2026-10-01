import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../../services/authService";
import "../../styles/auth.css";

const AuthPage = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        await loginUser({
          email,
          password,
        });

        setSuccess("Login successful!");

        // Go to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        // REGISTER
        await registerUser({
          name,
          email,
          password,
        });

        setSuccess("Registration successful! Please login.");

        // Switch to login
        setIsLogin(true);
        setName("");
        setPassword("");
      }
    } catch (err: any) {
      console.error(err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background-circle circle-one"></div>
      <div className="auth-background-circle circle-two"></div>

      <div className="auth-container">
        {/* LEFT SIDE */}
        <div className="auth-card">
          <div className="auth-header">
            <h1>GeoSense</h1>
            <p>
              {isLogin
                ? "Welcome back! Login to continue."
                : "Create your GeoSense account."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="input-group">
                <label>Name</label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            {success && <div className="auth-success">{success}</div>}

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Login"
                : "Create Account"}
            </button>
          </form>

          <div className="auth-switch">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                    setSuccess("");
                  }}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                    setSuccess("");
                  }}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-info">
          <h2>Geofencing & Location</h2>

          <h3>Event Detection System</h3>

          <p>
            Monitor devices, manage geofences and detect real-time location
            events from a single dashboard.
          </p>

          <div className="feature-list">
            <div>📍 Real-time Location Tracking</div>
            <div>⭕ Circular & Polygon Geofences</div>
            <div>🚪 Enter & Exit Detection</div>
            <div>📊 Event Analytics</div>
            <div>🔐 Role Based Access</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;