import React, { useState, useRef, useCallback, useEffect } from 'react';
import ControlsPanel from './components/ControlsPanel';
import CanvasEditor from './components/CanvasEditor';
import TextPropertiesPanel from './components/TextPropertiesPanel';
import useUndoRedo from './hooks/useUndoRedo';

const App = () => {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('Ready');
  const [isPanelOpen, setIsPanelOpen] = useState(false); // 🌟 untuk toggle panel mobile

  const initialState = {
    image: null,
    blur: 0,
    pixelation: 0,
    texts: [
      {
        id: 1,
        content: 'isi teks',
        x: 200,
        y: 200,
        fontSize: 48,
        color: '#ffffffff',
        strokeWidth: 3,
        uppercase: true,
        scale: 1,
        rotation: 0,
        pixelation: 0
      }
    ],
    selectedTextId: 1
  };

  const { state, setState, undo, redo, canUndo, canRedo } = useUndoRedo(initialState);

  const handleImageUpload = useCallback((image) => {
    setStatus('Image loaded');
    setState(prev => ({ ...prev, image }));
  }, [setState]);

  const handleBlurChange = useCallback((value) => {
    setState(prev => ({ ...prev, blur: value }));
  }, [setState]);

  const handlePixelationChange = useCallback((value) => {
    setState(prev => ({ ...prev, pixelation: value }));
  }, [setState]);

  const handleAddText = useCallback(() => {
    const newText = {
      id: Date.now(),
      content: 'New Text',
      x: 150,
      y: 150,
      fontSize: 32,
      color: '#f0f0f0ff',
      strokeWidth: 2,
      uppercase: false,
      scale: 1,
      rotation: 0,
      pixelation: 0
    };
    setState(prev => ({
      ...prev,
      texts: [...prev.texts, newText],
      selectedTextId: newText.id
    }));
    setStatus('Text layer added');
  }, [setState]);

  const handleTextChange = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      texts: prev.texts.map(text =>
        text.id === id ? { ...text, ...updates } : text
      )
    }));
  }, [setState]);

  const handleSelectText = useCallback((id) => {
    setState(prev => ({ ...prev, selectedTextId: id }));
  }, [setState]);

  const handleDeleteText = useCallback((id) => {
    setState(prev => ({
      ...prev,
      texts: prev.texts.filter(text => text.id !== id),
      selectedTextId: prev.texts.length > 1 ?
        (prev.texts.find(t => t.id !== id)?.id || null) : null
    }));
    setStatus('Text layer deleted');
  }, [setState]);

  const handleExport = useCallback(() => {
    if (canvasRef.current) {
      setState(prev => ({ ...prev, selectedTextId: null }));
      setTimeout(() => {
        const link = document.createElement('a');
        link.download = 'timpadawg-result.png';
        link.href = canvasRef.current.toDataURL('image/png', 1.0);
        link.click();
        setStatus('Image exported');
      }, 50);
    }
  }, [setState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
              setStatus('Redo');
            } else {
              undo();
              setStatus('Undo');
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            setStatus('Redo');
            break;
          case 's':
            e.preventDefault();
            handleExport();
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleExport]);

  const selectedText = state.texts.find(t => t.id === state.selectedTextId);

  return (
    <div className="app">
      <header className="header">
        <h1>
          <i className="fas fa-fire"></i>
          timpaDawg
        </h1>
        {/* 🌟 tombol hamburger saat mobile */}
        <button className="hamburger-btn" onClick={() => setIsPanelOpen(p => !p)}>
          <i className="fas fa-bars"></i>
        </button>
      </header>

      <div className="main-content">
        {/* 📌 Panel kiri */}
        <div className={`panel combined-panel ${isPanelOpen ? 'open' : ''}`}>
          <ControlsPanel
            onImageUpload={handleImageUpload}
            onBlurChange={handleBlurChange}
            onPixelationChange={handlePixelationChange}
            blur={state.blur}
            pixelation={state.pixelation}
            onAddText={handleAddText}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            onExport={handleExport}
          />
          <div className="divider"></div>
          <TextPropertiesPanel
            text={selectedText}
            onChange={(updates) => selectedText && handleTextChange(selectedText.id, updates)}
            onDelete={() => selectedText && handleDeleteText(selectedText.id)}
          />
        </div>

        {/* Canvas */}
        <div className="center-content">
          <div className="canvas-wrapper">
            <CanvasEditor
              ref={canvasRef}
              image={state.image}
              blur={state.blur}
              pixelation={state.pixelation}
              texts={state.texts}
              selectedTextId={state.selectedTextId}
              onTextSelect={handleSelectText}
              onTextChange={handleTextChange}
            />
          </div>
        </div>
      </div>

      <div className="status-bar">
        <div><i className="fas fa-info-circle"></i> {status}</div>
        <div>
          {state.image && (
            <span>
              <i className="fas fa-image"></i> Image Loaded
            </span>
          )}
          {state.texts.length > 0 && (
            <span style={{ marginLeft: '1rem' }}>
              <i className="fas fa-font"></i> {state.texts.length} Text Layers
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
