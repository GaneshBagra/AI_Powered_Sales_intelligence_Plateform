import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/Theme.tsx";

interface FormData {
  username: string;
  password: string;
}

interface LoginResponse {
  success?: boolean;
  message?: string;
  data?: {
    username?: string;
    fullName?: string;
  };
}

const url = import.meta.env.VITE_API_URL;
const apiUrl = url ? `${url.replace(/\/+$/, "")}/` : "";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) {
      setError("");
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiUrl}auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const responseText = await res.text();
      let result: LoginResponse = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText) as LoginResponse;
        } catch {
          throw new Error("The server returned an invalid response. Please try again.");
        }
      }

      if (!res.ok || !result.success) {
        throw new Error(
          result.message || "Login failed. Please check your username and password.",
        );
      }
      if (result.data) {
        localStorage.setItem("sales-user", JSON.stringify(result.data));
      }
      setSuccessMessage(result.message || "Login successful.");
      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message === "Failed to fetch"
            ? "Unable to connect to the server. Please try again."
            : err.message
          : "Unable to log in right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page min-vh-100 d-flex align-items-center justify-content-center p-3">
      <section
        className="login-card card border-0 shadow-sm"
        aria-labelledby="login-title"
      >
        <div className="login-card__topbar d-flex align-items-center justify-content-between gap-3">
          <span
            className="brand-mark d-flex align-items-center justify-content-center"
            aria-hidden="true"
          >
            S
          </span>
          <button
            className="theme-toggle btn btn-link text-decoration-none p-0"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
            {theme === "light" ? "Dark mode" : "Light mode"}
          </button>
        </div>

        <div className="login-card__intro">
          <p className="eyebrow">Sales intelligence platform</p>
          <h1 id="login-title">Welcome back.</h1>
          <p className="intro-copy">Sign in to continue to your workspace.</p>
        </div>

        {error && (
          <div
            className="login-error alert alert-danger py-2 px-3"
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            <strong className="d-block mb-1">Login failed</strong>
            {error}
          </div>
        )}

        {successMessage && (
          <div
            className="login-success alert alert-success py-2 px-3"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {successMessage}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              className="form-control"
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => onChangeHandler(e)}
              required
            />
          </div>

          <div className="form-field">
            <div className="field-label-row d-flex align-items-center justify-content-between gap-3">
              <label className="form-label mb-0" htmlFor="password">
                Password
              </label>
              {/* <button className="forgot-link btn btn-link text-decoration-none p-0" type="button">Forgot password?</button> */}
            </div>
            <div className="password-input position-relative">
              <input
                className="form-control"
                id="password"
                name="password"
                type={isPasswordVisible ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => onChangeHandler(e)}
                required
              />
              <button
                className="password-toggle btn btn-link text-decoration-none p-0"
                type="button"
                onClick={() => setIsPasswordVisible((visible) => !visible)}
                aria-label={
                  isPasswordVisible ? "Hide password" : "Show password"
                }
              >
                {isPasswordVisible ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            className="login-button btn w-100"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Log in"}
          </button>
        </form>
      </section>
    </main>
  );
};
