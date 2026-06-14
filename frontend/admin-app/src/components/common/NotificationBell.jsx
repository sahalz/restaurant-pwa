import { useState, useEffect, useRef } from 'react';
import { FaRegBell } from 'react-icons/fa';
import { useNotifications } from '../../context/NotificationContext';
import './NotificationBell.css';

export const NotificationBell = () => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = async (notif) => {
    if (!notif.is_read) {
      await markRead(notif.id);
    }
    setIsOpen(false);

    // Dispatch custom event to switch tabs on the dashboards
    if (notif.type === 'order_status') {
      window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'orders' }));
    } else if (notif.type === 'support') {
      window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'support' }));
    }
  };

  const formatTime = (timeStr) => {
    try {
      const date = new Date(timeStr);
      const diffMs = new Date() - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="notification-bell-container" ref={containerRef}>
      <button 
        className="notification-bell-btn" 
        onClick={handleToggle}
        aria-label="View notifications"
      >
        <FaRegBell />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={markAllRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                  onClick={() => handleItemClick(notif)}
                  style={{ background: 'none', border: 'none', width: '100%', font: 'inherit' }}
                >
                  <div className="notification-item-title">{notif.title}</div>
                  <div className="notification-item-msg">{notif.message}</div>
                  <div className="notification-item-time">{formatTime(notif.created_at)}</div>
                </button>
              ))
            ) : (
              <div className="no-notifications">
                <span className="no-notifications-icon">🔔</span>
                <div>You're all caught up!</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
