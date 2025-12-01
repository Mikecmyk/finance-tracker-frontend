import React, { useState, useEffect } from 'react';
import './AlertSystem.css';

export default function AlertSystem({ transactions, budgetLimit = 1000 }) {
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(true);

  useEffect(() => {
    const newAlerts = calculateAlerts(transactions, budgetLimit);
    setAlerts(newAlerts);
  }, [transactions, budgetLimit]);

  const calculateAlerts = (transactions, limit) => {
    const alertsList = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Calculate monthly expenses
    const monthlyExpenses = transactions
      .filter(t => t.type === 'expense' && 
        new Date(t.date).getMonth() === currentMonth &&
        new Date(t.date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + t.amount, 0);

    // Budget alert
    if (monthlyExpenses > limit) {
      alertsList.push({
        id: 'budget-exceeded',
        type: 'warning',
        title: 'Budget Exceeded',
        message: `You've spent $${monthlyExpenses.toFixed(2)} this month, exceeding your $${limit} budget.`,
        timestamp: new Date().toISOString()
      });
    } else if (monthlyExpenses > limit * 0.8) {
      alertsList.push({
        id: 'budget-warning',
        type: 'info',
        title: 'Budget Warning',
        message: `You've spent $${monthlyExpenses.toFixed(2)} (${((monthlyExpenses / limit) * 100).toFixed(1)}%) of your $${limit} monthly budget.`,
        timestamp: new Date().toISOString()
      });
    }

    // Large transaction alert
    const largeTransactions = transactions.filter(t => t.amount > 500);
    largeTransactions.forEach((transaction, index) => {
      alertsList.push({
        id: `large-transaction-${index}`,
        type: 'info',
        title: 'Large Transaction',
        message: `Large ${transaction.type}: $${transaction.amount} for ${transaction.category}`,
        timestamp: transaction.date
      });
    });

    // Savings opportunity alert
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    if (savingsRate < 10 && totalIncome > 0) {
      alertsList.push({
        id: 'low-savings',
        type: 'warning',
        title: 'Low Savings Rate',
        message: `Your savings rate is ${savingsRate.toFixed(1)}%. Consider reducing expenses.`,
        timestamp: new Date().toISOString()
      });
    }

    return alertsList.slice(0, 5); // Limit to 5 alerts
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      case 'success':
        return '✓';
      default:
        return '●';
    }
  };

  if (alerts.length === 0 || !showAlerts) {
    return null;
  }

  return (
    <div className="alert-system">
      <div className="alert-header">
        <h4>Financial Alerts</h4>
        <button 
          className="btn-alert-toggle"
          onClick={() => setShowAlerts(false)}
        >
          Dismiss All
        </button>
      </div>
      <div className="alerts-list">
        {alerts.map(alert => (
          <div key={alert.id} className={`alert-item ${alert.type}`}>
            <div className="alert-icon">
              {getAlertIcon(alert.type)}
            </div>
            <div className="alert-content">
              <div className="alert-title">{alert.title}</div>
              <div className="alert-message">{alert.message}</div>
              <div className="alert-time">
                {new Date(alert.timestamp).toLocaleDateString()}
              </div>
            </div>
            <button 
              className="alert-dismiss"
              onClick={() => dismissAlert(alert.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}