import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">GitLab Analytics Dashboard</h1>
        <p className="home-subtitle">
          Comprehensive analytics and insights for your GitLab projects
        </p>
      </header>

      <main className="home-main">
        <section className="features-section">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Dashboard</h3>
              <p>Get an overview of your project metrics and performance indicators</p>
              <Link to="/dashboard" className="feature-link">
                View Dashboard →
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Velocity Tracking</h3>
              <p>Monitor team velocity and sprint performance over time</p>
              <Link to="/velocity" className="feature-link">
                View Velocity →
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Epic Progress</h3>
              <p>Track progress of epics and major initiatives</p>
              <Link to="/epics" className="feature-link">
                View Epics →
              </Link>
            </div>
          </div>
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/dashboard" className="action-button primary">
              Go to Dashboard
            </Link>
            <Link to="/velocity" className="action-button secondary">
              View Velocity Chart
            </Link>
            <Link to="/epics" className="action-button secondary">
              Check Epic Progress
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
