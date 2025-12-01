import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import FinancialSummary from './FinancialSummary';
import MonthlyChart from './MonthlyChart';
import CategoryChart from './CategoryChart';
import SavingsGoal from './SavingsGoal';
import AlertSystem from './AlertSystem';
import NotificationCenter from './NotificationCenter';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchTransactions();
    }
  }, [currentUser]);

  const handleTransactionAdded = (newTransaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleTransactionUpdated = (updatedTransaction) => {
    setTransactions(prev => 
      prev.map(t => t._id === updatedTransaction._id ? updatedTransaction : t)
    );
  };

  const handleTransactionDeleted = (deletedId) => {
    setTransactions(prev => prev.filter(t => t._id !== deletedId));
  };

  const recentTransactions = transactions.slice(0, 5);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <Link to="/" className="logo-link">
                <h1>Finova</h1>
              </Link>
              <nav className="dashboard-nav">
                <button 
                  className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button 
                  className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('transactions')}
                >
                  Transactions
                </button>
                <button 
                  className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analytics')}
                >
                  Analytics
                </button>
                <button 
                  className={`nav-item ${activeTab === 'goals' ? 'active' : ''}`}
                  onClick={() => setActiveTab('goals')}
                >
                  Goals
                </button>
              </nav>
            </div>
            <div className="user-info">
              <NotificationCenter transactions={transactions} budgetLimit={1000} />
              <div className="user-details">
                <span className="user-email">{currentUser?.email}</span>
                <span className="user-role">{currentUser?.role}</span>
              </div>
              {currentUser?.role === 'admin' && (
                <Link to="/admin" className="btn btn-secondary">
                  Admin Panel
                </Link>
              )}
              <button onClick={logout} className="btn btn-logout">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="container">
          <AlertSystem transactions={transactions} budgetLimit={1000} />
          
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <FinancialSummary transactions={transactions} />
              
              <div className="charts-grid">
                <div className="chart-card">
                  <h3>Monthly Overview</h3>
                  <MonthlyChart transactions={transactions} />
                </div>
                <div className="chart-card">
                  <h3>Spending by Category</h3>
                  <CategoryChart transactions={transactions} />
                </div>
              </div>

              <div className="content-grid">
                <div className="content-column">
                  <TransactionForm onTransactionAdded={handleTransactionAdded} />
                  <SavingsGoal transactions={transactions} />
                </div>
                <div className="content-column">
                  <div className="recent-transactions card">
                    <div className="card-header">
                      <h3>Recent Transactions</h3>
                      <button 
                        className="btn-text"
                        onClick={() => setActiveTab('transactions')}
                      >
                        View All
                      </button>
                    </div>
                    <TransactionList 
                      transactions={recentTransactions}
                      onTransactionUpdated={handleTransactionUpdated}
                      onTransactionDeleted={handleTransactionDeleted}
                      compact={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="transactions-tab">
              <div className="tab-header">
                <h2>All Transactions</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('overview')}
                >
                  Back to Overview
                </button>
              </div>
              <div className="transactions-content">
                <div className="transactions-sidebar">
                  <TransactionForm onTransactionAdded={handleTransactionAdded} />
                </div>
                <div className="transactions-main">
                  <TransactionList 
                    transactions={transactions}
                    onTransactionUpdated={handleTransactionUpdated}
                    onTransactionDeleted={handleTransactionDeleted}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-tab">
              <div className="tab-header">
                <h2>Financial Analytics</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('overview')}
                >
                  Back to Overview
                </button>
              </div>
              <div className="analytics-grid">
                <div className="analytics-card full-width">
                  <h3>Monthly Income vs Expenses</h3>
                  <MonthlyChart transactions={transactions} detailed={true} />
                </div>
                <div className="analytics-card">
                  <h3>Expense Categories</h3>
                  <CategoryChart transactions={transactions} />
                </div>
                <div className="analytics-card">
                  <h3>Income Sources</h3>
                  <CategoryChart transactions={transactions.filter(t => t.type === 'income')} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="goals-tab">
              <div className="tab-header">
                <h2>Savings Goals</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('overview')}
                >
                  Back to Overview
                </button>
              </div>
              <div className="goals-content">
                <SavingsGoal transactions={transactions} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}