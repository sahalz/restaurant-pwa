import { useState, useEffect } from 'react';
import { FaCamera, FaTrash, FaTimes } from 'react-icons/fa';
import './DeliveryInstructionsModal.css';

export const DeliveryInstructionsModal = ({ isOpen, onClose, addressText, initialInstructions, onSave }) => {
  const [imageUrl, setImageUrl] = useState(initialInstructions?.imageUrl || '');
  const [options, setOptions] = useState(initialInstructions?.options || {
    leaveAtDoor: false,
    leaveWithGuard: false,
    avoidCalling: false,
    dontRingBell: false,
    petAtHome: false,
  });

  useEffect(() => {
    if (isOpen) {
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
      voiceUrl: '', // backward compatibility
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
