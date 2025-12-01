import React, { useState } from 'react';
import api from '../utils/api';
import './TransactionForm.css';

export default function TransactionForm({ onTransactionAdded }) {
  const [type, setType] = useState('income');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = {
    income: ['salary', 'freelance', 'investment', 'gift', 'other'],
    expense: ['food', 'transport', 'rent', 'entertainment', 'utilities', 'shopping', 'healthcare', 'other']
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/transactions', {
        type,
        category,
        amount: parseFloat(amount),
        description
      });

      onTransactionAdded(response.data);
      
      // Reset form
      setCategory('');
      setAmount('');
      setDescription('');
    } catch (error) {
      console.error('Error adding transaction:', error);
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-form card">
      <h3>Add New Transaction</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            className="form-input"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="form-input"
            required
          >
            <option value="">Select Category</option>
            {categories[type].map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="form-input"
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
            placeholder="Transaction description"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
}