import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="container">
          <div className="nav-content">
            <h1 className="nav-logo">Finova</h1>
            <div className="nav-links">
              <Link to="/auth" className="nav-link">Login</Link>
              <Link to="/auth" className="nav-link nav-link-primary">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Take Control of Your <span className="highlight">Finances</span>
              </h1>
              <p className="hero-description">
                Track your income and expenses, visualize your spending, and achieve your financial goals with our intuitive finance tracking dashboard.
              </p>
              <div className="hero-actions">
                <Link to="/auth" className="btn btn-primary btn-large">
                  Get Started Free
                </Link>
                <Link to="/auth" className="btn btn-secondary btn-large">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <div className="dashboard-preview">
                <div className="preview-header">
                  <div className="preview-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div className="preview-content">
                  <div className="preview-stats">
                    <div className="preview-stat">
                      <span>Income</span>
                      <strong>+$4,200</strong>
                    </div>
                    <div className="preview-stat">
                      <span>Expenses</span>
                      <strong>-$1,850</strong>
                    </div>
                    <div className="preview-stat">
                      <span>Balance</span>
                      <strong>+$2,350</strong>
                    </div>
                  </div>
                  <div className="preview-chart">
                    <div className="chart-bar income-bar"></div>
                    <div className="chart-bar expense-bar"></div>
                    <div className="chart-bar income-bar"></div>
                    <div className="chart-bar expense-bar"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features-header">
            <h2>Everything You Need to Manage Your Money</h2>
            <p>Powerful features to help you understand and control your finances</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Track Income & Expenses</h3>
              <p>Easily record all your financial transactions and categorize them for better insights.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Visual Analytics</h3>
              <p>See your financial data in beautiful charts and graphs to understand your spending patterns.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Set Financial Goals</h3>
              <p>Create and track financial goals to save for important milestones in your life.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Secure & Private</h3>
              <p>Your financial data is encrypted and secure. We prioritize your privacy.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Responsive Design</h3>
              <p>Access your finances from any device - desktop, tablet, or mobile phone.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Real-time Updates</h3>
              <p>See your financial summary update instantly as you add new transactions.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Take Control of Your Finances?</h2>
            <p>Join thousands of users who are already managing their money better with FinanceTracker.</p>
            <Link to="/auth" className="btn btn-primary btn-large">
              Start Tracking Now
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>FinanceTracker</h3>
              <p>Your personal finance companion for a better financial future.</p>
            </div>
            <div className="footer-section">
              <h4>Features</h4>
              <ul>
                <li>Income Tracking</li>
                <li>Expense Management</li>
                <li>Financial Analytics</li>
                <li>Goal Setting</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 FinanceTracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}