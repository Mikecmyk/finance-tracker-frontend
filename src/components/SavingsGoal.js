import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './SavingsGoal.css';

export default function SavingsGoal({ transactions }) {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    targetDate: ''
  });

  // Calculate total saved from transactions (for current user only)
  const totalSaved = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0) -
    transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  useEffect(() => {
    if (currentUser) {
      loadUserGoals();
    }
  }, [currentUser]);

  // Load goals for the specific user
  const loadUserGoals = () => {
    if (!currentUser) return;
    
    const savedGoals = localStorage.getItem(`savingsGoals_${currentUser.id}`);
    if (savedGoals) {
      try {
        const parsedGoals = JSON.parse(savedGoals);
        setGoals(parsedGoals);
      } catch (error) {
        console.error('Error loading goals:', error);
        setGoals([]);
      }
    } else {
      setGoals([]);
    }
  };

  // Save goals for the specific user
  const saveGoals = (updatedGoals) => {
    if (!currentUser) return;
    
    setGoals(updatedGoals);
    localStorage.setItem(`savingsGoals_${currentUser.id}`, JSON.stringify(updatedGoals));
  };

  const handleCreateGoal = () => {
    if (!currentUser) {
      alert('You must be logged in to create goals');
      return;
    }

    if (!newGoal.name || !newGoal.targetAmount || !newGoal.targetDate) {
      alert('Please fill all fields');
      return;
    }

    const goal = {
      id: Date.now().toString(),
      userId: currentUser.id, // CRITICAL: Store user ID with goal
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      targetDate: newGoal.targetDate,
      createdAt: new Date().toISOString()
    };

    const updatedGoals = [...goals, goal];
    saveGoals(updatedGoals);
    setNewGoal({ name: '', targetAmount: '', targetDate: '' });
    setShowForm(false);
  };

  const handleAddToGoal = (goalId, amount) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          currentAmount: goal.currentAmount + parseFloat(amount)
        };
      }
      return goal;
    });
    saveGoals(updatedGoals);
  };

  const handleDeleteGoal = (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      const updatedGoals = goals.filter(goal => goal.id !== goalId);
      saveGoals(updatedGoals);
    }
  };

  const calculateProgress = (goal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const calculateDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Filter goals to ensure only current user's goals are displayed
  const userGoals = goals.filter(goal => goal.userId === currentUser?.id);

  return (
    <div className="savings-goal card">
      <div className="goal-header">
        <h3>Savings Goals</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
          disabled={!currentUser}
        >
          {showForm ? 'Cancel' : 'New Goal'}
        </button>
      </div>

      {!currentUser && (
        <p className="auth-warning">Please log in to manage your savings goals.</p>
      )}

      {showForm && currentUser && (
        <div className="goal-form">
          <div className="form-group">
            <label className="form-label">Goal Name</label>
            <input
              type="text"
              value={newGoal.name}
              onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
              className="form-input"
              placeholder="e.g., New Car, Vacation"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Target Amount ($)</label>
            <input
              type="number"
              value={newGoal.targetAmount}
              onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
              className="form-input"
              placeholder="1000"
              min="1"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Target Date</label>
            <input
              type="date"
              value={newGoal.targetDate}
              onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button onClick={handleCreateGoal} className="btn btn-primary">
            Create Goal
          </button>
        </div>
      )}

      <div className="goals-list">
        {userGoals.length === 0 ? (
          <p className="no-goals">
            {currentUser ? 'No savings goals yet. Create your first goal!' : 'No goals to display.'}
          </p>
        ) : (
          userGoals.map(goal => (
            <div key={goal.id} className="goal-item">
              <div className="goal-info">
                <div className="goal-main">
                  <h4 className="goal-name">{goal.name}</h4>
                  <div className="goal-amounts">
                    <span className="current-amount">${goal.currentAmount.toFixed(2)}</span>
                    <span className="target-amount">of ${goal.targetAmount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="goal-details">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${calculateProgress(goal)}%` }}
                    ></div>
                  </div>
                  <div className="goal-meta">
                    <span className="progress-percent">
                      {calculateProgress(goal).toFixed(1)}%
                    </span>
                    <span className="days-remaining">
                      {calculateDaysRemaining(goal.targetDate)} days left
                    </span>
                  </div>
                </div>
              </div>
              <div className="goal-actions">
                <button 
                  onClick={() => {
                    const amount = prompt(`How much to add to ${goal.name}?`);
                    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
                      handleAddToGoal(goal.id, amount);
                    }
                  }}
                  className="btn btn-add"
                  disabled={!currentUser}
                >
                  Add
                </button>
                <button 
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="btn btn-delete"
                  disabled={!currentUser}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {userGoals.length > 0 && currentUser && (
        <div className="total-savings">
          <div className="savings-info">
            <span className="savings-label">Total Available for Goals</span>
            <span className="savings-amount">${totalSaved.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}