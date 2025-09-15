import React from 'react';
const TextPropertiesPanel = ({ text, onChange, onDelete }) => {
  if (!text) {
    return (
      <div className="no-selection">
        <i className="fas fa-mouse-pointer"></i>
        <h3>Select a Text Layer</h3>
        <p>Click on any text in the canvas to edit its properties</p>
      </div>
    );
  }
  const handleInputChange = (field, value) => {
    onChange({ [field]: value });
  };
  return (
    <div>
      <div className="control-section">
        <h2><i className="fas fa-cog"></i> Text Properties</h2>
        <button
          onClick={onDelete}
          className="btn btn-block btn-danger"
        >
          <i className="fas fa-trash-alt"></i> Delete Layer
        </button>
      </div>
      <div className="control-section">
        <label className="form-label">
          <i className="fas fa-i-cursor"></i> Text Content
        </label>
        <textarea
          value={text.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          className="form-textarea"
          placeholder="Enter text or emoji... 🎉🔥✨"
        />
      </div>
      <div className="control-section">
        <label className="form-label">
          <i className="fas fa-text-height"></i> Font Size: {text.fontSize}px
        </label>
        <input
          type="range"
          min="12"
          max="150"
          value={text.fontSize}
          onChange={(e) => handleInputChange('fontSize', Number(e.target.value))}
          className="slider"
        />
      </div>
      <div className="control-section">
        <label className="form-label">
          <i className="fas fa-palette"></i> Text Color
        </label>
        <input
          type="color"
          value={text.color}
          onChange={(e) => handleInputChange('color', e.target.value)}
          className="form-input"
        />
      </div>
      <div className="control-section">
        <label className="form-label">
          <i className="fas fa-border-style"></i> Stroke Width: {text.strokeWidth}px
        </label>
        <input
          type="range"
          min="0"
          max="15"
          value={text.strokeWidth}
          onChange={(e) => handleInputChange('strokeWidth', Number(e.target.value))}
          className="slider"
        />
      </div>
      <div className="control-section">
        <label className="form-label">
          <i className="fas fa-expand"></i> Scale: {text.scale.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={text.scale}
          onChange={(e) => handleInputChange('scale', Number(e.target.value))}
          className="slider"
        />
      </div>
      <div className="control-section">
        <label className="form-label">
          <i className="fas fa-th-large"></i> Text Pixelation: {text.pixelation}
        </label>
        <input
          type="range"
          min="0"
          max="10"
          value={text.pixelation}
          onChange={(e) => handleInputChange('pixelation', Number(e.target.value))}
          className="slider"
        />
      </div>
      <div className="control-section">
        <label className="form-label">
          <i className="fas fa-text-width"></i> Text Transform
        </label>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={text.uppercase}
            onChange={(e) => handleInputChange('uppercase', e.target.checked)}
            className="form-checkbox"
          />
          <span>Uppercase</span>
        </label>
      </div>
    </div>
  );
};
export default TextPropertiesPanel;