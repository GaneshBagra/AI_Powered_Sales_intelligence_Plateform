import { useNavigate } from "react-router-dom";

export const UserLoggedOutPage = () => {
  const navigate = useNavigate();

  return (
    <main className="logged-out-page">
      <section className="logged-out-card" aria-labelledby="logged-out-title">
        <p className="eyebrow">Session ended</p>
        <h1 id="logged-out-title">You have been logged out.</h1>
        <p>Your session is no longer valid. Please log in again to continue.</p>
        <button className="primary-action" type="button" onClick={() => navigate("/login")}>
          Login again
        </button>
      </section>
    </main>
  );
};
