import React, { useState, useEffect } from 'react';
import './NotificationCenter.css';

export default function NotificationCenter({ transactions, budgetLimit = 1000 }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const newNotifications = generateNotifications(transactions, budgetLimit);
    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter(n => !n.read).length);
  }, [transactions, budgetLimit]);

  const generateNotifications = (transactions, limit) => {
    const notificationsList = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Calculate monthly expenses for budget alerts
    const monthlyExpenses = transactions
      .filter(t => t.type === 'expense' && 
        new Date(t.date).getMonth() === currentMonth &&
        new Date(t.date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + t.amount, 0);

    // Budget notifications
    if (monthlyExpenses > limit) {
      notificationsList.push({
        id: 'budget-exceeded',
        type: 'warning',
        title: 'Budget Exceeded',
        message: `You've spent $${monthlyExpenses.toFixed(2)} this month, exceeding your $${limit} budget.`,
        timestamp: new Date().toISOString(),
        read: false,
        category: 'budget'
      });
    } else if (monthlyExpenses > limit * 0.8) {
      notificationsList.push({
        id: 'budget-warning',
        type: 'warning',
        title: 'Budget Warning',
        message: `You've spent $${monthlyExpenses.toFixed(2)} (${((monthlyExpenses / limit) * 100).toFixed(1)}%) of your monthly budget.`,
        timestamp: new Date().toISOString(),
        read: false,
        category: 'budget'
      });
    }

    // Large transaction notifications
    const largeTransactions = transactions
      .filter(t => t.amount > 500)
      .slice(-3); // Last 3 large transactions
    
    largeTransactions.forEach((transaction, index) => {
      const transactionDate = new Date(transaction.date);
      const isRecent = (today - transactionDate) < (24 * 60 * 60 * 1000); // Within 24 hours
      
      if (isRecent) {
        notificationsList.push({
          id: `large-transaction-${index}`,
          type: 'info',
          title: 'Large Transaction',
          message: `Large ${transaction.type}: $${transaction.amount} for ${transaction.category}`,
          timestamp: transaction.date,
          read: false,
          category: 'transaction'
        });
      }
    });

    // New transaction notifications (last 5 transactions)
    const recentTransactions = transactions.slice(0, 3);
    recentTransactions.forEach((transaction, index) => {
      const transactionDate = new Date(transaction.date);
      const isRecent = (today - transactionDate) < (2 * 60 * 60 * 1000); // Within 2 hours
      
      if (isRecent) {
        notificationsList.push({
          id: `new-transaction-${index}`,
          type: 'info',
          title: 'New Transaction',
          message: `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}: $${transaction.amount} - ${transaction.category}`,
          timestamp: transaction.date,
          read: false,
          category: 'transaction'
        });
      }
    });

    // Savings rate notification
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    if (savingsRate > 20) {
      notificationsList.push({
        id: 'good-savings',
        type: 'success',
        title: 'Great Savings Rate',
        message: `Your savings rate is ${savingsRate.toFixed(1)}%. Keep it up!`,
        timestamp: new Date().toISOString(),
        read: false,
        category: 'savings'
      });
    } else if (savingsRate < 10 && totalIncome > 0) {
      notificationsList.push({
        id: 'low-savings',
        type: 'warning',
        title: 'Low Savings Rate',
        message: `Your savings rate is ${savingsRate.toFixed(1)}%. Consider reducing expenses.`,
        timestamp: new Date().toISOString(),
        read: false,
        category: 'savings'
      });
    }

    // Goal milestone simulation (in real app, this would come from goals data)
    const savedGoals = localStorage.getItem('savingsGoals');
    if (savedGoals) {
      const goals = JSON.parse(savedGoals);
      goals.forEach((goal, index) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        if (progress >= 50 && progress < 100) {
          notificationsList.push({
            id: `goal-progress-${index}`,
            type: 'success',
            title: 'Goal Progress',
            message: `You're ${progress.toFixed(1)}% towards your "${goal.name}" goal!`,
            timestamp: new Date().toISOString(),
            read: false,
            category: 'goal'
          });
        }
        if (progress >= 100) {
          notificationsList.push({
            id: `goal-complete-${index}`,
            type: 'success',
            title: 'Goal Achieved',
            message: `Congratulations! You've reached your "${goal.name}" goal!`,
            timestamp: new Date().toISOString(),
            read: false,
            category: 'goal'
          });
        }
      });
    }

    // Sort by timestamp (newest first) and limit to 10 notifications
    return notificationsList
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return '!';
      case 'info':
        return 'i';
      case 'success':
        return '✓';
      default:
        return '●';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'budget':
        return 'Budget';
      case 'transaction':
        return 'Transaction';
      case 'savings':
        return 'Savings';
      case 'goal':
        return 'Goal';
      default:
        return 'General';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationTime.toLocaleDateString();
  };

  return (
    <div className="notification-center">
      <button 
        className="notification-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="notification-icon"></span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button 
                  className="btn-mark-all"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>
              )}
              <button 
                className="btn-close"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications</p>
                <span>You're all caught up!</span>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon-container">
                    <span className={`notification-type-icon ${notification.type}`}>
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  <div className="notification-content">
                    <div className="notification-header-line">
                      <span className="notification-title">{notification.title}</span>
                      <span className="notification-category">
                        {getCategoryLabel(notification.category)}
                      </span>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    <div className="notification-footer">
                      <span className="notification-time">
                        {formatTime(notification.timestamp)}
                      </span>
                      <button 
                        className="btn-clear"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(notification.id);
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>

          <div className="notification-footer">
            <span className="notification-count">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}