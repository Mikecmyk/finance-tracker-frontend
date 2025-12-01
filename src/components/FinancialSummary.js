import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './FinancialSummary.css';

export default function FinancialSummary() {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const response = await api.get('/api/transactions/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="financial-summary loading">Loading summary...</div>;
  }

  return (
    <div className="financial-summary card">
      <h3>Financial Summary</h3>
      <div className="summary-grid">
        <div className="summary-item">
          <h4>Total Income</h4>
          <p className="amount income">+${summary.totalIncome.toFixed(2)}</p>
        </div>
        <div className="summary-item">
          <h4>Total Expenses</h4>
          <p className="amount expense">-${summary.totalExpenses.toFixed(2)}</p>
        </div>
        <div className="summary-item">
          <h4>Balance</h4>
          <p className={`amount ${summary.balance >= 0 ? 'income' : 'expense'}`}>
            {summary.balance >= 0 ? '+' : ''}${summary.balance.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}