import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaMoneyBillWave, FaHeadset, FaChevronRight } from 'react-icons/fa';
import './SupportPage.css';

const SUPPORT_OPTIONS = [
  {
    path: '/support/complaint',
    icon: FaExclamationTriangle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    title: 'File a Complaint',
    description: 'Report issues with your order — wrong items, missing food, cold delivery, or rude service.',
  },
  {
    path: '/support/refund',
    icon: FaMoneyBillWave,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    title: 'Request a Refund',
    description: 'Paid for an order you didn\'t receive or want to claim money back for a cancelled order.',
  },
  {
    path: '/support/tickets',
    icon: FaHeadset,
    color: '#667eea',
    bg: 'rgba(102,126,234,0.08)',
    title: 'Support Tickets',
    description: 'Get help from our team for account issues, technical problems, or general enquiries.',
  },
];

export const SupportPage = () => {
  return (
    <div className="support-page">
      <div className="support-container">

        <div className="support-header">
          <h1>Support Center</h1>
          <p>How can we help you today? Choose one of the options below.</p>
        </div>

        <div className="support-cards">
          {SUPPORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <Link key={opt.path} to={opt.path} className="support-card">
                <div className="support-card-icon" style={{ background: opt.bg }}>
                  <Icon style={{ color: opt.color }} />
                </div>
                <div className="support-card-content">
                  <h2>{opt.title}</h2>
                  <p>{opt.description}</p>
                </div>
                <FaChevronRight className="support-card-arrow" />
              </Link>
            );
          })}
        </div>

        <div className="support-footer">
          <p>Need something else? <Link to="/support/tickets" className="support-footer-link">Open a support ticket</Link> and we'll get back to you within 24 hours.</p>
        </div>

      </div>
    </div>
  );
};
