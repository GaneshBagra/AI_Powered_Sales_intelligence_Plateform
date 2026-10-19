import { Link } from "react-router-dom";

export const DashboardPage = () => (
  <section className="page-container dashboard-page">
    <div className="page-heading">
      <div>
        <p className="eyebrow">Overview</p>
        <h1>Dashboard</h1>
        <p className="page-subtitle">Keep track of your export orders and daily activity.</p>
      </div>
      <Link className="primary-action" to="/orders/add">Add exports order</Link>
    </div>
    <div className="stats-grid">
      <article className="stat-card"><span>Pending orders</span><strong>—</strong><small>Ready for processing</small></article>
      <article className="stat-card"><span>Exports this month</span><strong>—</strong><small>All submitted orders</small></article>
      <article className="stat-card"><span>Backlogs</span><strong>—</strong><small>Needs your attention</small></article>
    </div>
    <div className="dashboard-panel">
      <p className="eyebrow">Quick start</p>
      <h2>Start with a new export order</h2>
      <p>Enter purchase order and part details in a guided, step-by-step form.</p>
      <Link className="secondary-action" to="/orders/add">Create an order <span aria-hidden="true">→</span></Link>
    </div>
  </section>
);
