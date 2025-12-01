import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { currentUser, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionEditForm, setTransactionEditForm] = useState({});
  
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    userId: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30d');

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users')
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page,
        limit: '20',
        ...filters
      }).toString();
      
      const response = await api.get(`/api/admin/transactions?${params}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/api/admin/analytics?period=${analyticsPeriod}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchTransactions();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchTransactions(1);
  }, [filters]);

  useEffect(() => {
    fetchAnalytics();
  }, [analyticsPeriod]);

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      fetchAdminData();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/api/admin/users/${userId}/status`, { 
        isActive: !currentStatus 
      });
      fetchAdminData();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user and all their data?')) {
      try {
        await api.delete(`/api/admin/users/${userId}`);
        fetchAdminData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const updateTransaction = async (transactionId) => {
    try {
      await api.put(`/api/admin/transactions/${transactionId}`, transactionEditForm);
      setEditingTransaction(null);
      setTransactionEditForm({});
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const deleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/api/admin/transactions/${transactionId}`);
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const startEditUser = (user) => {
    setEditingUser(user._id);
    setEditForm({
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
  };

  const startEditTransaction = (transaction) => {
    setEditingTransaction(transaction._id);
    setTransactionEditForm({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date.split('T')[0]
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditingTransaction(null);
    setEditForm({});
    setTransactionEditForm({});
  };

  const saveUserEdit = async (userId) => {
    try {
      await api.put(`/api/admin/users/${userId}`, editForm);
      setEditingUser(null);
      setEditForm({});
      fetchAdminData();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      category: '',
      userId: '',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  if (loading) {
    return <div className="admin-loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <Link to="/" className="logo-link">
                <h1>Finova Admin</h1>
              </Link>
              <nav className="admin-nav">
                <button 
                  className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button 
                  className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  User Management
                </button>
                <button 
                  className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('transactions')}
                >
                  Transaction Management
                </button>
                <button 
                  className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analytics')}
                >
                  System Analytics
                </button>
              </nav>
            </div>
            <div className="user-info">
              <div className="user-details">
                <span className="user-email">{currentUser?.email}</span>
                <span className="user-role admin-badge">Admin</span>
              </div>
              <Link to="/dashboard" className="btn btn-secondary">
                User Dashboard
              </Link>
              <button onClick={logout} className="btn btn-logout">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="container">
          {activeTab === 'overview' && stats && (
            <div className="overview-tab">
              <div className="admin-stats-grid">
                <div className="admin-stat-card primary">
                  <div className="stat-icon">U</div>
                  <div className="stat-info">
                    <h3>{stats.totalUsers}</h3>
                    <p>Total Users</p>
                    <span className="stat-change">+{stats.newUsersThisMonth} this month</span>
                  </div>
                </div>
                <div className="admin-stat-card success">
                  <div className="stat-icon">A</div>
                  <div className="stat-info">
                    <h3>{stats.activeUsers}</h3>
                    <p>Active Users</p>
                    <span className="stat-change">{((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% active rate</span>
                  </div>
                </div>
                <div className="admin-stat-card info">
                  <div className="stat-icon">T</div>
                  <div className="stat-info">
                    <h3>{stats.totalTransactions}</h3>
                    <p>Total Transactions</p>
                    <span className="stat-change">+{stats.transactionsThisMonth} this month</span>
                  </div>
                </div>
                <div className="admin-stat-card warning">
                  <div className="stat-icon">B</div>
                  <div className="stat-info">
                    <h3>${(stats.totalIncome - stats.totalExpenses).toFixed(2)}</h3>
                    <p>Net Balance</p>
                    <span className="stat-change">
                      Income: ${stats.totalIncome.toFixed(2)} | Expenses: ${stats.totalExpenses.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="content-grid">
                <div className="content-column">
                  <div className="recent-users card">
                    <div className="card-header">
                      <h3>Recent Users</h3>
                      <span className="view-all" onClick={() => setActiveTab('users')}>
                        View All
                      </span>
                    </div>
                    <div className="users-list">
                      {stats.recentUsers.map(user => (
                        <div key={user._id} className="user-item">
                          <div className="user-avatar">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="user-details">
                            <span className="user-email">{user.email}</span>
                            <div className="user-meta">
                              <span className={`user-role ${user.role}`}>
                                {user.role}
                              </span>
                              <span className={`user-status ${user.isActive ? 'active' : 'inactive'}`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <span className="user-join-date">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="content-column">
                  <div className="recent-transactions card">
                    <div className="card-header">
                      <h3>Recent Transactions</h3>
                      <span className="view-all" onClick={() => setActiveTab('transactions')}>
                        View All
                      </span>
                    </div>
                    <div className="transactions-list">
                      {stats.recentTransactions.map(transaction => (
                        <div key={transaction._id} className="transaction-item">
                          <div className="transaction-avatar">
                            {transaction.user?.email?.charAt(0).toUpperCase()}
                          </div>
                          <div className="transaction-main">
                            <div className="transaction-header">
                              <span className="transaction-user">
                                {transaction.user?.email}
                              </span>
                              <span className={`transaction-type ${transaction.type}`}>
                                {transaction.type}
                              </span>
                            </div>
                            <span className="transaction-description">
                              {transaction.description}
                            </span>
                          </div>
                          <div className="transaction-details">
                            <span className={`transaction-amount ${transaction.type}`}>
                              {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                            </span>
                            <span className="transaction-category">
                              {transaction.category}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-tab">
              <div className="tab-header">
                <h2>User Management</h2>
                <div className="header-stats">
                  <span className="total-users">{users.length} total users</span>
                  <span className="active-users">
                    {users.filter(u => u.isActive).length} active
                  </span>
                </div>
              </div>
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Status</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id} className={!user.isActive ? 'inactive-user' : ''}>
                        <td className="user-info-cell">
                          {editingUser === user._id ? (
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                              className="edit-input"
                            />
                          ) : (
                            <div className="user-display">
                              <div className="user-avatar-small">
                                {user.email.charAt(0).toUpperCase()}
                              </div>
                              <span className="user-email">{user.email}</span>
                            </div>
                          )}
                        </td>
                        <td>
                          {editingUser === user._id ? (
                            <select 
                              value={editForm.isActive}
                              onChange={(e) => setEditForm({...editForm, isActive: e.target.value === 'true'})}
                              className="status-select"
                            >
                              <option value="true">Active</option>
                              <option value="false">Inactive</option>
                            </select>
                          ) : (
                            <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingUser === user._id ? (
                            <select 
                              value={editForm.role}
                              onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                              className="role-select"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className={`role-badge ${user.role}`}>
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td className="join-date">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="actions">
                          {editingUser === user._id ? (
                            <div className="edit-actions">
                              <button 
                                onClick={() => saveUserEdit(user._id)}
                                className="btn btn-success btn-sm"
                              >
                                Save
                              </button>
                              <button 
                                onClick={cancelEdit}
                                className="btn btn-secondary btn-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              <button 
                                onClick={() => startEditUser(user)}
                                className="btn btn-primary btn-sm"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => toggleUserStatus(user._id, user.isActive)}
                                className={`btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}`}
                                disabled={user._id === currentUser._id}
                              >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button 
                                onClick={() => deleteUser(user._id)}
                                className="btn btn-danger btn-sm"
                                disabled={user._id === currentUser._id}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="transactions-tab">
              <div className="tab-header">
                <h2>Transaction Management</h2>
                <div className="header-stats">
                  <span className="transaction-count">
                    {transactions.total} transactions
                  </span>
                  {transactions.duplicateCheck && transactions.duplicateCheck.length > 0 && (
                    <span className="duplicate-warning">
                      {transactions.duplicateCheck.length} potential duplicates
                    </span>
                  )}
                </div>
              </div>

              <div className="filters-card card">
                <h3>Filters</h3>
                <div className="filters-grid">
                  <div className="filter-group">
                    <label>Search</label>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search description or category..."
                      className="filter-input"
                    />
                  </div>
                  <div className="filter-group">
                    <label>Type</label>
                    <select 
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Types</option>
                      {transactions.types?.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Category</label>
                    <select 
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Categories</option>
                      {transactions.categories?.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>User</label>
                    <select 
                      value={filters.userId}
                      onChange={(e) => handleFilterChange('userId', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Users</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>{user.email}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="filter-input"
                    />
                  </div>
                  <div className="filter-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="filter-input"
                    />
                  </div>
                  <div className="filter-group">
                    <label>Sort By</label>
                    <select 
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="filter-select"
                    >
                      <option value="createdAt">Date Created</option>
                      <option value="date">Transaction Date</option>
                      <option value="amount">Amount</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Order</label>
                    <select 
                      value={filters.sortOrder}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      className="filter-select"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>
                <div className="filter-actions">
                  <button onClick={clearFilters} className="btn btn-secondary">
                    Clear Filters
                  </button>
                </div>
              </div>

              {transactions.duplicateCheck && transactions.duplicateCheck.length > 0 && (
                <div className="duplicates-card card">
                  <h3>Potential Duplicate Transactions</h3>
                  <div className="duplicates-list">
                    {transactions.duplicateCheck.map((group, index) => (
                      <div key={index} className="duplicate-group">
                        <div className="duplicate-header">
                          <span>Same user, amount (${group._id.amount}), description on same day</span>
                          <span className="duplicate-count">{group.count} transactions</span>
                        </div>
                        <div className="duplicate-transactions">
                          {group.transactions.map((transaction, idx) => (
                            <div key={idx} className="duplicate-item">
                              <span>{transaction.user?.email}</span>
                              <span>${transaction.amount}</span>
                              <span>{transaction.description}</span>
                              <span>{new Date(transaction.date).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="transactions-table-container">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.transactions?.map(transaction => (
                      <tr key={transaction._id}>
                        <td className="user-email">
                          {transaction.user?.email}
                        </td>
                        <td>
                          {editingTransaction === transaction._id ? (
                            <select 
                              value={transactionEditForm.type}
                              onChange={(e) => setTransactionEditForm({...transactionEditForm, type: e.target.value})}
                              className="edit-select"
                            >
                              <option value="income">Income</option>
                              <option value="expense">Expense</option>
                            </select>
                          ) : (
                            <span className={`type-badge ${transaction.type}`}>
                              {transaction.type}
                            </span>
                          )}
                        </td>
                        <td className="category">
                          {editingTransaction === transaction._id ? (
                            <input
                              type="text"
                              value={transactionEditForm.category}
                              onChange={(e) => setTransactionEditForm({...transactionEditForm, category: e.target.value})}
                              className="edit-input"
                            />
                          ) : (
                            transaction.category
                          )}
                        </td>
                        <td className={`amount ${transaction.type}`}>
                          {editingTransaction === transaction._id ? (
                            <input
                              type="number"
                              value={transactionEditForm.amount}
                              onChange={(e) => setTransactionEditForm({...transactionEditForm, amount: e.target.value})}
                              className="edit-input"
                              step="0.01"
                            />
                          ) : (
                            `${transaction.type === 'income' ? '+' : '-'}$${transaction.amount}`
                          )}
                        </td>
                        <td className="description">
                          {editingTransaction === transaction._id ? (
                            <input
                              type="text"
                              value={transactionEditForm.description}
                              onChange={(e) => setTransactionEditForm({...transactionEditForm, description: e.target.value})}
                              className="edit-input"
                            />
                          ) : (
                            transaction.description
                          )}
                        </td>
                        <td className="date">
                          {editingTransaction === transaction._id ? (
                            <input
                              type="date"
                              value={transactionEditForm.date}
                              onChange={(e) => setTransactionEditForm({...transactionEditForm, date: e.target.value})}
                              className="edit-input"
                            />
                          ) : (
                            new Date(transaction.date).toLocaleDateString()
                          )}
                        </td>
                        <td className="actions">
                          {editingTransaction === transaction._id ? (
                            <div className="edit-actions">
                              <button 
                                onClick={() => updateTransaction(transaction._id)}
                                className="btn btn-success btn-sm"
                              >
                                Save
                              </button>
                              <button 
                                onClick={cancelEdit}
                                className="btn btn-secondary btn-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              <button 
                                onClick={() => startEditTransaction(transaction)}
                                className="btn btn-primary btn-sm"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => deleteTransaction(transaction._id)}
                                className="btn btn-danger btn-sm"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {transactions.totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      className="btn btn-secondary"
                      disabled={transactions.currentPage === 1}
                      onClick={() => fetchTransactions(transactions.currentPage - 1)}
                    >
                      Previous
                    </button>
                    <span className="page-info">
                      Page {transactions.currentPage} of {transactions.totalPages}
                    </span>
                    <button 
                      className="btn btn-secondary"
                      disabled={transactions.currentPage === transactions.totalPages}
                      onClick={() => fetchTransactions(transactions.currentPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && analytics && (
            <div className="analytics-tab">
              <div className="tab-header">
                <h2>System Analytics</h2>
                <div className="analytics-controls">
                  <select 
                    value={analyticsPeriod}
                    onChange={(e) => setAnalyticsPeriod(e.target.value)}
                    className="period-select"
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                  </select>
                </div>
              </div>

              <div className="analytics-grid">
                <div className="analytics-card full-width">
                  <h3>User Activity Over Time</h3>
                  <div className="chart-placeholder">
                    <div className="chart-data">
                      <h4>Daily Active Users</h4>
                      {analytics.dailyActiveUsers.map((day, index) => (
                        <div key={index} className="data-item">
                          <span>{day._id.month}/{day._id.day}</span>
                          <span>{day.count} users</span>
                        </div>
                      ))}
                    </div>
                    <div className="chart-data">
                      <h4>Weekly Active Users</h4>
                      {analytics.weeklyActiveUsers.map((week, index) => (
                        <div key={index} className="data-item">
                          <span>Week {week._id.week}</span>
                          <span>{week.count} users</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>Most Active Categories</h3>
                  <div className="category-stats">
                    {analytics.categoryStats.map((category, index) => (
                      <div key={index} className="category-item">
                        <div className="category-header">
                          <span className="category-name">{category._id}</span>
                          <span className="category-amount">${category.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="category-details">
                          <span>{category.transactionCount} transactions</span>
                          <span>Avg: ${category.averageAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>Top Active Users</h3>
                  <div className="user-activity-stats">
                    {analytics.userActivity.map((user, index) => (
                      <div key={index} className="user-activity-item">
                        <div className="user-info">
                          <span className="user-email">{user.user.email}</span>
                          <span className={`user-role ${user.user.role}`}>{user.user.role}</span>
                        </div>
                        <div className="activity-stats">
                          <span>{user.transactionCount} transactions</span>
                          <span>${user.totalAmount.toFixed(2)} total</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analytics-card full-width">
                  <h3>Money Tracked Over Time</h3>
                  <div className="money-stats">
                    {analytics.moneyOverTime.map((day, index) => (
                      <div key={index} className="money-item">
                        <span className="date">{day._id.month}/{day._id.day}</span>
                        <div className="money-details">
                          <span className="income">Income: ${day.totalIncome.toFixed(2)}</span>
                          <span className="expense">Expenses: ${day.totalExpenses.toFixed(2)}</span>
                          <span className="net">Net: ${(day.totalIncome - day.totalExpenses).toFixed(2)}</span>
                        </div>
                        <span className="count">{day.transactionCount} transactions</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}