import { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaCamera, FaTrash, FaPlay, FaPause, FaTimes, FaVolumeUp } from 'react-icons/fa';
import './DeliveryInstructionsModal.css';

export const DeliveryInstructionsModal = ({ isOpen, onClose, addressText, initialInstructions, onSave }) => {
  const [voiceUrl, setVoiceUrl] = useState(initialInstructions?.voiceUrl || '');
  const [imageUrl, setImageUrl] = useState(initialInstructions?.imageUrl || '');
  const [options, setOptions] = useState(initialInstructions?.options || {
    leaveAtDoor: false,
    leaveWithGuard: false,
    avoidCalling: false,
    dontRingBell: false,
    petAtHome: false,
  });

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const recordingTimer = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setVoiceUrl(initialInstructions?.voiceUrl || '');
      setImageUrl(initialInstructions?.imageUrl || '');
      setOptions(initialInstructions?.options || {
        leaveAtDoor: false,
        leaveWithGuard: false,
        avoidCalling: false,
        dontRingBell: false,
        petAtHome: false,
      });
    }
  }, [isOpen, initialInstructions]);

  // Voice note simulator
  const handleRecordStart = (e) => {
    e.preventDefault();
    setIsRecording(true);
    setRecordingSeconds(0);
    recordingTimer.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleRecordEnd = () => {
    if (isRecording) {
      clearInterval(recordingTimer.current);
      setIsRecording(false);
      // Save simulated voice note base64
      setVoiceUrl(`voice_recording_simulated_${recordingSeconds}s.mp3`);
    }
  };

  const handleDeleteVoice = () => {
    setVoiceUrl('');
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  // Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image file size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result); // Base64 representation
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionChange = (key) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    onSave({
      voiceUrl,
      imageUrl,
      options,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="delivery-inst-modal-overlay">
      <div className="delivery-inst-modal-content">
        <button className="delivery-inst-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <h2>Instructions for delivery partner</h2>
        <p className="delivery-inst-address-label">Home</p>
        <p className="delivery-inst-address-text">{addressText}</p>

        {/* Voice Note Section */}
        <div className="delivery-inst-section">
          {!voiceUrl ? (
            <button
              className={`voice-record-btn ${isRecording ? 'recording' : ''}`}
              onMouseDown={handleRecordStart}
              onMouseUp={handleRecordEnd}
              onMouseLeave={handleRecordEnd}
              onTouchStart={handleRecordStart}
              onTouchEnd={handleRecordEnd}
            >
              <FaMicrophone className="mic-icon" />
              <span>
                {isRecording
                  ? `Recording (${recordingSeconds}s)... Release to save`
                  : 'Tap and hold to record instruction'}
              </span>
            </button>
          ) : (
            <div className="voice-player-card">
              <div className="voice-player-info">
                <FaVolumeUp />
                <span>Simulated Voice Note ({voiceUrl.split('_')[3] || 'Recording'})</span>
              </div>
              <div className="voice-player-controls">
                <button className="play-pause-btn" onClick={togglePlayback}>
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <button className="delete-voice-btn" onClick={handleDeleteVoice}>
                  <FaTrash />
                </button>
              </div>
              {isPlaying && <div className="voice-playing-wave" />}
            </div>
          )}
        </div>

        {/* Door Image Section */}
        <div className="delivery-inst-section">
          <label className="section-label">Door/building image (optional)</label>
          {!imageUrl ? (
            <label className="image-upload-card">
              <FaCamera className="camera-icon" />
              <h4>Add an image</h4>
              <p>This helps our delivery partners find your exact location faster</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
          ) : (
            <div className="image-preview-card">
              <img src={imageUrl} alt="Location" className="door-preview" />
              <button className="remove-image-btn" onClick={() => setImageUrl('')}>
                <FaTrash /> Remove Image
              </button>
            </div>
          )}
        </div>

        {/* Options Checklist */}
        <div className="delivery-inst-section options-checklist">
          <label className="option-row">
            <div className="option-title">
              <span className="option-emoji">🚪</span>
              <span>Leave at door</span>
            </div>
            <input
              type="checkbox"
              checked={options.leaveAtDoor}
              onChange={() => handleOptionChange('leaveAtDoor')}
            />
          </label>

          <label className="option-row">
            <div className="option-title">
              <span className="option-emoji">👮</span>
              <span>Leave with guard</span>
            </div>
            <input
              type="checkbox"
              checked={options.leaveWithGuard}
              onChange={() => handleOptionChange('leaveWithGuard')}
            />
          </label>

          <label className="option-row">
            <div className="option-title">
              <span className="option-emoji">🔇</span>
              <span>Avoid calling</span>
            </div>
            <input
              type="checkbox"
              checked={options.avoidCalling}
              onChange={() => handleOptionChange('avoidCalling')}
            />
          </label>

          <label className="option-row">
            <div className="option-title">
              <span className="option-emoji">🔕</span>
              <span>Don't ring the bell</span>
            </div>
            <input
              type="checkbox"
              checked={options.dontRingBell}
              onChange={() => handleOptionChange('dontRingBell')}
            />
          </label>

          <label className="option-row">
            <div className="option-title">
              <span className="option-emoji">🐕</span>
              <span>Pet at home</span>
            </div>
            <input
              type="checkbox"
              checked={options.petAtHome}
              onChange={() => handleOptionChange('petAtHome')}
            />
          </label>
        </div>

        {/* Save Button */}
        <button className="delivery-inst-save-btn" onClick={handleSave}>
          Save Instructions
        </button>
      </div>
    </div>
  );
};
