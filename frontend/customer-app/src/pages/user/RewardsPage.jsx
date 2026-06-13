import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loyaltyAPI } from '../../services/api';
import {
  FaGift, FaCoins, FaAward, FaHistory, FaInfoCircle, FaArrowLeft, FaCheckCircle
} from 'react-icons/fa';
import './RewardsPage.css';

export const RewardsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loyalty, setLoyalty] = useState({ points: 0, total_points_earned: 0, transactions: [] });
  const [settings, setSettings] = useState({ points_per_rupee: 0.1, rupee_per_point: 0.5, min_points_to_redeem: 50 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadLoyaltyDetails = async () => {
      try {
        const [profileRes, settingsRes] = await Promise.all([
          loyaltyAPI.getProfile().catch(err => {
            console.warn('Loyalty profile could not be fetched:', err);
            return { data: { status: 'success', data: { points: 0, total_points_earned: 0, transactions: [] } } };
          }),
          loyaltyAPI.getSettings().catch(err => {
            console.warn('Loyalty settings could not be fetched:', err);
            return { data: { status: 'success', data: { points_per_rupee: 0.1, rupee_per_point: 0.5, min_points_to_redeem: 50 } } };
          })
        ]);

        if (profileRes?.data?.status === 'success') {
          setLoyalty(profileRes.data.data);
        }
        if (settingsRes?.data?.status === 'success') {
          setSettings(settingsRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load loyalty details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLoyaltyDetails();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="rewards-loading">
        <div className="spinner"></div>
        <p>Loading your rewards dashboard...</p>
      </div>
    );
  }

  // Calculate milestone metrics
  const points = loyalty.points;
  const nextMilestone = points < 50 ? 50 : points < 100 ? 100 : points < 200 ? 200 : null;
  const progressPercent = nextMilestone ? Math.min(100, (points / nextMilestone) * 100) : 100;
  const pointsNeeded = nextMilestone ? nextMilestone - points : 0;
  const nextMilestoneValue = nextMilestone ? nextMilestone * settings.rupee_per_point : 0;

  // Determine Tier Level
  const getTier = (pointsEarned) => {
    if (pointsEarned >= 200) return { name: 'Gold VIP', color: '#d97706', bg: '#fef3c7', icon: '👑' };
    if (pointsEarned >= 100) return { name: 'Silver Member', color: '#4b5563', bg: '#f3f4f6', icon: '🥈' };
    return { name: 'Bronze Member', color: '#b45309', bg: '#ffedd5', icon: '🥉' };
  };

  const tier = getTier(points);

  return (
    <div className="rewards-page">
      <div className="rewards-container">

        {/* Navigation Back Link */}
        <button className="back-btn" onClick={() => navigate('/profile')}>
          <FaArrowLeft /> Back to Profile
        </button>

        {/* Hero Banner Area */}
        <div className="rewards-hero" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
          <div className="hero-content">
            <span className="tier-badge" style={{ background: tier.bg, color: tier.color }}>
              {tier.icon} {tier.name}
            </span>
            <h1>Rewards</h1>
            <p>Earn points on every delicious meal and redeem them for exclusive checkout discounts!</p>
          </div>
          <div className="hero-gift-icon-container">
            <FaGift className="floating-gift" />
          </div>
        </div>

        {/* Main Rewards Grid */}
        <div className="rewards-grid">

          {/* Left Column: Dashboard Details */}
          <div className="rewards-main-card">

            {/* Points Summary Block */}
            <div className="rewards-card points-summary">
              <h2>Points Balance</h2>
              <div className="balance-grid">
                <div className="balance-big">
                  <FaCoins className="big-coin-icon" />
                  <div>
                    <span className="pts-count">{points}</span>
                    <span className="pts-label">Available Points</span>
                  </div>
                </div>
                <div className="balance-value-card">
                  <span className="value-label">Discount Value</span>
                  <span className="value-amount">₹{(points * settings.rupee_per_point).toFixed(2)}</span>
                  <span className="value-sub">Ready to apply at checkout</span>
                </div>
              </div>
              <div className="lifetime-summary">
                <span>Lifetime Earned Points: <strong>{loyalty.total_points_earned} pts</strong></span>
              </div>
            </div>

            {/* Progression Milestone Indicator */}
            <div className="rewards-card milestone-card">
              <h2>Milestone Progression</h2>
              {nextMilestone ? (
                <div className="milestone-progress-area">
                  <div className="milestone-text">
                    <span className="next-goal">Next Target: <strong>{nextMilestone} Points</strong></span>
                    <span className="next-reward">Unlocks ₹{nextMilestoneValue.toFixed(0)} Discount</span>
                  </div>
                  <div className="rewards-progress-bar">
                    <div className="rewards-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <div className="milestone-summary-footer">
                    <span>{progressPercent.toFixed(0)}% Completed</span>
                    <span className="needed-count">Need <strong>{pointsNeeded}</strong> more points</span>
                  </div>
                </div>
              ) : (
                <div className="milestone-max">
                  <FaAward className="gold-medal-icon" />
                  <h3>Highest Loyalty Tier Reached!</h3>
                  <p>You have unlocked ultimate VIP benefits. Keep ordering to earn unlimited cashback rewards!</p>
                </div>
              )}
            </div>

            {/* How it works Information Grid */}
            <div className="rewards-card program-info">
              <h2>How the Program Works</h2>
              <div className="info-steps-grid">
                <div className="info-step">
                  <div className="step-num">1</div>
                  <h4>Place an Order</h4>
                  <p>Browse our menu and order your favorite meals.</p>
                </div>
                <div className="info-step">
                  <div className="step-num">2</div>
                  <h4>Earn Points</h4>
                  <p>Receive points automatically when your order is delivered ({1 / settings.points_per_rupee} spent = 1 Point).</p>
                </div>
                <div className="info-step">
                  <div className="step-num">3</div>
                  <h4>Get Discounts</h4>
                  <p>Redeem your points at checkout for direct cashback (1 Point = ₹{settings.rupee_per_point.toFixed(2)} discount).</p>
                </div>
              </div>
              <div className="program-rules-alert">
                <FaInfoCircle />
                <span>Minimum points required to redeem discount is <strong>{settings.min_points_to_redeem} points</strong>.</span>
              </div>
            </div>

          </div>

          {/* Right Column: Transaction Log history */}
          <div className="rewards-sidebar-card">
            <div className="rewards-card transaction-log">
              <h2><FaHistory /> Transaction History</h2>

              {loyalty.transactions && loyalty.transactions.length > 0 ? (
                <div className="transactions-scroll-list">
                  {loyalty.transactions.map((tx) => {
                    const isEarn = tx.points_changed > 0;
                    const dateStr = new Date(tx.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });

                    return (
                      <div key={tx.id} className="tx-log-item">
                        <div className="tx-log-details">
                          <span className="tx-log-title">{tx.description || tx.transaction_type}</span>
                          <span className="tx-log-date">{dateStr}</span>
                        </div>
                        <span className={`tx-log-pts ${isEarn ? 'earn' : 'redeem'}`}>
                          {isEarn ? `+${tx.points_changed}` : tx.points_changed}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-transactions">
                  <span className="empty-tx-icon">📜</span>
                  <p>No transactions recorded yet. Place and receive your first order to start earning points!</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
