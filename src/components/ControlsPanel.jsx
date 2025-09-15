import React, { useRef } from 'react';
const ControlsPanel = ({
  onImageUpload,
  onBlurChange,
  onPixelationChange,
  blur,
  pixelation,
  onAddText,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExport
}) => {
  const fileInputRef = useRef(null);
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => onImageUpload(img);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => onImageUpload(img);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  const handleDragOver = (event) => {
    event.preventDefault();
  };
  return (
    <div>
      <div className="control-section">
        <h2><i className="fas fa-cloud-upload-alt"></i> Upload Image</h2>
        <div
          className="upload-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <i className="fas fa-file-image"></i>
          <p>Drag & drop image here</p>
          <small>or click to browse (JPG, PNG, GIF)</small>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="input-file"
          />
        </div>
      </div>
      <div className="control-section">
        <h2><i className="fas fa-blur"></i> Image Effects</h2>
        <div className="slider-container">
          <div className="slider-label">
            <span><i className="fas fa-wind"></i> Blur</span>
            <span className="slider-label-value">{blur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={blur}
            onChange={(e) => onBlurChange(Number(e.target.value))}
            className="slider"
          />
        </div>
        <div className="slider-container">
          <div className="slider-label">
            <span><i className="fas fa-th-large"></i> Pixelation</span>
            <span className="slider-label-value">{pixelation}</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            value={pixelation}
            onChange={(e) => onPixelationChange(Number(e.target.value))}
            className="slider"
          />
        </div>
      </div>
      <div className="control-section">
        <h2><i className="fas fa-font"></i> Text Tools</h2>
        <button
          onClick={onAddText}
          className="btn btn-block btn-primary"
        >
          <i className="fas fa-plus"></i> Add Text Layer
        </button>
      </div>
      <div className="control-section">
        <h2><i className="fas fa-tools"></i> Actions</h2>
        <div className="actions-grid">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="btn"
          >
            <i className="fas fa-undo"></i> Undo
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="btn"
          >
            <i className="fas fa-redo"></i> Redo
          </button>
        </div>
        <button
          onClick={onExport}
          className="btn btn-block btn-success"
        >
          <i className="fas fa-download"></i> Export PNG
        </button>
      </div>
    </div>
  );
};
export default ControlsPanel;