import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "../context/Theme";
import { clearAuth, logout, verifySession } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

export const AppShell = () => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const isLoggingOut = useAppSelector((state) => state.auth.status === "loading");
  const displayName = user?.fullName || user?.username || "User";

  const handleLogout = async () => {
    const result = await dispatch(logout());
    if (logout.fulfilled.match(result)) {
      dispatch(clearAuth());
      navigate("/userLoggedOut", { replace: true });
    }
  };

  useEffect(() => {
    let isCurrentRoute = true;

    dispatch(verifySession()).then((result) => {
      if (
        isCurrentRoute &&
        verifySession.rejected.match(result) &&
        result.payload?.unauthorized
      ) {
        dispatch(clearAuth());
        navigate("/userLoggedOut", { replace: true });
      }
    });

    return () => {
      isCurrentRoute = false;
    };
  }, [dispatch, location.pathname, navigate]);

  return (
    <div className="app-shell">
      <header className="app-navbar">
        <div className="app-navbar__inner">
          <NavLink className="app-brand" to="/dashboard">
            <span className="brand-mark" aria-hidden="true">S</span>
            <span>Sales intelligence</span>
          </NavLink>
          <nav className="app-nav" aria-label="Main navigation">
            <NavLink className={({ isActive }) => `app-nav__link${isActive ? " active" : ""}`} to="/dashboard">
              Dashboard
            </NavLink>
            <div className="orders-nav">
              <span className="app-nav__link orders-nav__label">Orders</span>
              <div className="orders-nav__menu">
                <NavLink to="/orders/add">Add exports order</NavLink>
                <NavLink to="/orders/list">Exports order list</NavLink>
                <NavLink to="/orders/backlogs">Backlogs</NavLink>
              </div>
            </div>
          </nav>
          <button className="theme-switch" type="button" onClick={toggleTheme}>
            {theme === "light" ? "Dark mode" : "Light mode"}
          </button>
          <div className="user-menu">
            <button className="user-menu__trigger" type="button" aria-label="Show user details">
              <span className="user-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5.5 20c.7-3.4 2.8-5.2 6.5-5.2s5.8 1.8 6.5 5.2" />
                </svg>
              </span>
              <span className="user-menu__name">{displayName}</span>
            </button>
            <div className="user-menu__details">
              <strong>{displayName}</strong>
              {user?.username && <span>@{user.username}</span>}
              <button type="button">Change password</button>
              <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
};
