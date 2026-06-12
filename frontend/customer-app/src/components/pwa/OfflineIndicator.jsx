// PWA Features - Offline indicator component
export const OfflineIndicator = ({ isOnline }) => {
  return (
    <div className={`offline-indicator ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? 'Online' : 'Offline'}
    </div>
  );
};
