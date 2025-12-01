import React, { useState } from 'react';
import api from '../utils/api';
import './TransactionList.css';

export default function TransactionList({ transactions, onTransactionUpdated, onTransactionDeleted, compact = false }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (transaction) => {
    setEditingId(transaction._id);
    setEditForm({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description
    });
  };

  const handleUpdate = async (id) => {
    try {
      const response = await api.put(`/api/transactions/${id}`, editForm);
      onTransactionUpdated(response.data);
      setEditingId(null);
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/api/transactions/${id}`);
        onTransactionDeleted(id);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount, type) => {
    return type === 'income' ? `+$${amount}` : `-$${amount}`;
  };

  const categories = {
    income: ['salary', 'freelance', 'investment', 'gift', 'other'],
    expense: ['food', 'transport', 'rent', 'entertainment', 'utilities', 'shopping', 'healthcare', 'other']
  };

  return (
    <div className={`transaction-list card ${compact ? 'compact' : ''}`}>
      <h3>Recent Transactions</h3>
      {transactions.length === 0 ? (
        <p className="no-transactions">No transactions yet. Add your first transaction above.</p>
      ) : (
        <div className="transactions">
          {transactions.map(transaction => (
            <div key={transaction._id} className={`transaction-item ${transaction.type}`}>
              {editingId === transaction._id ? (
                <div className="edit-form">
                  <select 
                    value={editForm.type}
                    onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                    className="form-input"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                  <select 
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="form-input"
                  >
                    <option value="">Select Category</option>
                    {categories[editForm.type].map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                    className="form-input"
                    placeholder="Amount"
                  />
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="form-input"
                    placeholder="Description"
                  />
                  <div className="edit-actions">
                    <button 
                      onClick={() => handleUpdate(transaction._id)}
                      className="btn btn-primary"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="transaction-info">
                    <div className="transaction-main">
                      <span className="transaction-category">{transaction.category}</span>
                      <span className="transaction-description">{transaction.description}</span>
                    </div>
                    <div className="transaction-details">
                      <span className={`transaction-amount ${transaction.type}`}>
                        {formatAmount(transaction.amount, transaction.type)}
                      </span>
                      <span className="transaction-date">
                        {formatDate(transaction.date)}
                      </span>
                    </div>
                  </div>
                  <div className="transaction-actions">
                    <button 
                      onClick={() => handleEdit(transaction)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(transaction._id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}