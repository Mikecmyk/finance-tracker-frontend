import React from 'react';
import './CategoryChart.css';

export default function CategoryChart({ transactions }) {
  const categoryData = calculateCategoryData(transactions);
  const total = categoryData.reduce((sum, item) => sum + item.amount, 0);
  
  return (
    <div className="category-chart">
      <div className="chart-content">
        {categoryData.map((item, index) => (
          <div key={item.category} className="category-item">
            <div className="category-info">
              <div 
                className="category-color"
                style={{ backgroundColor: getCategoryColor(index) }}
              ></div>
              <div className="category-details">
                <span className="category-name">{item.category}</span>
                <span className="category-amount">${item.amount}</span>
              </div>
            </div>
            <div className="category-bar">
              <div 
                className="bar-fill"
                style={{ 
                  width: `${(item.amount / total) * 100}%`,
                  backgroundColor: getCategoryColor(index)
                }}
              ></div>
            </div>
            <span className="category-percent">
              {((item.amount / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function calculateCategoryData(transactions) {
  const categories = {};
  
  transactions.forEach(transaction => {
    if (!categories[transaction.category]) {
      categories[transaction.category] = 0;
    }
    categories[transaction.category] += transaction.amount;
  });
  
  return Object.entries(categories)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6); // Top 6 categories
}

function getCategoryColor(index) {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];
  return colors[index % colors.length];
}