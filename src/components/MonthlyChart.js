import React from 'react';
import './MonthlyChart.css';

export default function MonthlyChart({ transactions, detailed = false }) {
  // Simple chart implementation - in a real app, you'd use a charting library
  const monthlyData = calculateMonthlyData(transactions);
  
  const maxAmount = Math.max(...monthlyData.map(m => Math.max(m.income, m.expenses)));
  
  return (
    <div className="monthly-chart">
      <div className="chart-bars">
        {monthlyData.map((month, index) => (
          <div key={index} className="chart-bar-group">
            <div className="bar-container">
              <div 
                className="bar income-bar" 
                style={{ height: `${(month.income / maxAmount) * 100}%` }}
                title={`Income: $${month.income}`}
              ></div>
              <div 
                className="bar expense-bar" 
                style={{ height: `${(month.expenses / maxAmount) * 100}%` }}
                title={`Expenses: $${month.expenses}`}
              ></div>
            </div>
            <span className="month-label">{month.month}</span>
          </div>
        ))}
      </div>
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color income-color"></div>
          <span>Income</span>
        </div>
        <div className="legend-item">
          <div className="legend-color expense-color"></div>
          <span>Expenses</span>
        </div>
      </div>
    </div>
  );
}

function calculateMonthlyData(transactions) {
  const months = [];
  const currentDate = new Date();
  
  // Get last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === date.getMonth() && 
             transactionDate.getFullYear() === date.getFullYear();
    });
    
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    months.push({
      month: monthName,
      income,
      expenses
    });
  }
  
  return months;
}