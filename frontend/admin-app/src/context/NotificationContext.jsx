import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { notificationsAPI } from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [liveToast, setLiveToast] = useState(null);
  const eventSourceRef = useRef(null);

  // Play two-tone professional notification chime using Web Audio API
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5

      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn('AudioContext playback blocked/failed:', e);
    }
  };

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationsAPI.getNotifications();
      if (res.data?.status === 'success') {
        const list = res.data.data || [];
        setNotifications(list);
        setUnreadCount(list.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Failed to load notifications history:', error);
    }
  };

  // Sync historical notifications and SSE stream on auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();

      const token = sessionStorage.getItem('token');
      if (token) {
        // Build SSE URL (bridge hosted on local Express app)
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.directdine.com/v1';
        const streamUrl = `${baseUrl}/notifications/stream?token=${encodeURIComponent(token)}`;

        // Open Server-Sent Events stream
        const es = new EventSource(streamUrl);
        eventSourceRef.current = es;

        es.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            
            if (payload.status === 'new_notification' && payload.data) {
              const newNotif = payload.data;
              
              setNotifications(prev => {
                if (prev.some(n => n.id === newNotif.id)) return prev;
                
                setUnreadCount(c => c + 1);
                
                // Trigger live slide-in toast and play chime
                setLiveToast(newNotif);
                playChime();
                
                // Dispatch custom event for dashboard auto-reload
                window.dispatchEvent(new CustomEvent('notification-received', { detail: newNotif }));
                
                return [newNotif, ...prev];
              });
              
              // Auto-dismiss toast after 5 seconds
              setTimeout(() => {
                setLiveToast(current => current?.id === newNotif.id ? null : current);
              }, 5000);
            }
          } catch (err) {
            console.error('Failed to parse SSE notification payload:', err);
          }
        };

        es.onerror = () => {
          console.warn('SSE notification stream encountered an error. Reconnecting...');
        };
      }
    } else {
      // Clean up connection on logout
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      setLiveToast(null);
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isAuthenticated]);

  const markRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        liveToast,
        setLiveToast,
        fetchNotifications,
        markRead,
        markAllRead
      }}
    >
      {children}
      
      {/* Global In-App Live Toast Alert */}
      {liveToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #667eea',
          borderRadius: '12px',
          padding: '16px 20px',
          zIndex: 9999,
          maxWidth: '350px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          animation: 'slideInToast 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontWeight: '700', color: '#1f2937', fontSize: '0.95rem' }}>{liveToast.title}</span>
            <button 
              onClick={() => setLiveToast(null)} 
              style={{
                border: 'none',
                background: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '1.1rem',
                padding: '0 0 0 10px',
                lineHeight: 1
              }}
            >
              &times;
            </button>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.4' }}>{liveToast.message}</span>
          <style>{`
            @keyframes slideInToast {
              from { transform: translateX(120%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
