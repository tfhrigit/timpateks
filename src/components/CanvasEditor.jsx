import React, { useEffect, useRef, forwardRef, useCallback } from 'react';

const CanvasEditor = forwardRef(({
  image,
  blur,
  pixelation,
  texts,
  selectedTextId,
  onTextSelect,
  onTextChange
}, ref) => {
  const canvasRef = ref || useRef(null);
  const isDraggingRef = useRef(false);
  const dragTextIdRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const canvasSizeRef = useRef({ width: 0, height: 0 });

  const applyPixelation = useCallback((ctx, width, height, pixelSize) => {
    if (pixelSize <= 0) return;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        const pixelIndex = (y * width + x) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        for (let py = y; py < Math.min(y + pixelSize, height); py++) {
          for (let px = x; px < Math.min(x + pixelSize, width); px++) {
            const index = (py * width + px) * 4;
            data[index] = r;
            data[index + 1] = g;
            data[index + 2] = b;
          }
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, []);

  // NGAMBIL GAMBAR
  const getImageDimensions = useCallback(() => {
    if (!image || !canvasRef.current) {
      return { width: 0, height: 0, x: 0, y: 0, scale: 1 };
    }

    const { width: cw, height: ch } = canvasSizeRef.current;
    const scale = Math.min(cw / image.width, ch / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    const x = (cw - width) / 2;
    const y = (ch - height) / 2;

    return { width, height, x, y, scale };
  }, [image]);


  // RENDER SI CANVAS
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (image) {
      const imgDims = getImageDimensions();
      if (blur > 0) ctx.filter = `blur(${blur}px)`;
      ctx.drawImage(image, imgDims.x, imgDims.y, imgDims.width, imgDims.height);
      ctx.filter = 'none';

      if (pixelation > 0) {
        const imageData = ctx.getImageData(imgDims.x, imgDims.y, imgDims.width, imgDims.height);
        const pixelCtx = document.createElement('canvas').getContext('2d');
        pixelCtx.canvas.width = imgDims.width;
        pixelCtx.canvas.height = imgDims.height;
        pixelCtx.putImageData(imageData, 0, 0);
        const pixelSize = Math.max(1, Math.floor(pixelation * (imgDims.width / 200)));
        applyPixelation(pixelCtx, imgDims.width, imgDims.height, pixelSize);
        ctx.clearRect(imgDims.x, imgDims.y, imgDims.width, imgDims.height);
        ctx.drawImage(pixelCtx.canvas, imgDims.x, imgDims.y);
      }
    }

    texts.forEach(text => {
      const {
        content, fontSize, color, strokeWidth, uppercase, scale: textScale = 1, pixelation: textPixelation = 0
      } = text;
      const imgDims = getImageDimensions();
      const canvasX = imgDims.x + (text.x * imgDims.scale);
      const canvasY = imgDims.y + (text.y * imgDims.scale);

      ctx.save();
      ctx.translate(canvasX, canvasY);
      ctx.scale(textScale, textScale);

      const displayText = uppercase ? content.toUpperCase() : content;
      ctx.font = `bold ${fontSize}px system-ui, "Noto Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = strokeWidth;
      if (textPixelation > 0) ctx.imageSmoothingEnabled = false;

      ctx.strokeText(displayText, 0, 0);
      ctx.fillText(displayText, 0, 0);

      if (text.id === selectedTextId) {
        const textWidth = ctx.measureText(displayText).width;
        const textHeight = fontSize;
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-textWidth/2 - 15, -textHeight/2 - 15, textWidth + 30, textHeight + 30);
        ctx.setLineDash([]);
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(-textWidth/2 - 20, -textHeight/2 - 20, 10, 10);
        ctx.fillRect(textWidth/2 + 10, -textHeight/2 - 20, 10, 10);
        ctx.fillRect(-textWidth/2 - 20, textHeight/2 + 10, 10, 10);
        ctx.fillRect(textWidth/2 + 10, textHeight/2 + 10, 10, 10);
      }

      ctx.restore();
    });
  }, [image, blur, pixelation, texts, selectedTextId, getImageDimensions, applyPixelation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;
    const maxWidth = Math.min(container.clientWidth - 20, 1000);
    const maxHeight = Math.min(window.innerHeight * 0.6, 700);
    canvas.width = maxWidth;
    canvas.height = maxHeight;
    canvasSizeRef.current = { width: maxWidth, height: maxHeight };
    renderCanvas();
    window.addEventListener('resize', renderCanvas);
    return () => window.removeEventListener('resize', renderCanvas);
  }, [renderCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const getRelativePos = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const imgDims = getImageDimensions();
    // hitung balik ke koordinat asli sebelum diskalakan
    const relativeX = (mouseX - imgDims.x) / imgDims.scale;
    const relativeY = (mouseY - imgDims.y) / imgDims.scale;
    return { x: relativeX, y: relativeY };
  };


  const startDrag = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getRelativePos(clientX, clientY);
    const imgDims = getImageDimensions();

    // ubah posisi klik relatif balik ke posisi teks asli
    for (let i = texts.length - 1; i >= 0; i--) {
      const text = texts[i];
      const displayText = text.uppercase ? text.content.toUpperCase() : text.content;
      ctx.font = `bold ${text.fontSize}px system-ui, "Noto Color Emoji", sans-serif`;
      const textWidth = ctx.measureText(displayText).width / imgDims.scale; 
      const textHeight = text.fontSize / imgDims.scale;

      if (
        pos.x >= text.x - textWidth/2 - 25/imgDims.scale &&
        pos.x <= text.x + textWidth/2 + 25/imgDims.scale &&
        pos.y >= text.y - textHeight/2 - 25/imgDims.scale &&
        pos.y <= text.y + textHeight/2 + 25/imgDims.scale
      ) {
        isDraggingRef.current = true;
        dragTextIdRef.current = text.id;
        dragOffsetRef.current = { x: pos.x - text.x, y: pos.y - text.y };
        onTextSelect(text.id);
        return;
      }
    }
  };


  const dragMove = (clientX, clientY) => {
    if (!isDraggingRef.current) return;
    const pos = getRelativePos(clientX, clientY);
    const textId = dragTextIdRef.current;
    onTextChange(textId, {
      x: pos.x - dragOffsetRef.current.x,
      y: pos.y - dragOffsetRef.current.y
    });
  };

  const stopDrag = () => {
    isDraggingRef.current = false;
    dragTextIdRef.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      className="editor-canvas"
      style={{ width: '100%', maxWidth: '1000px', borderRadius: '8px', touchAction: 'none' }}
      onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
      onMouseMove={(e) => dragMove(e.clientX, e.clientY)}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY);
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        dragMove(touch.clientX, touch.clientY);
      }}
      onTouchEnd={stopDrag}
    />
  );
});

export default CanvasEditor;
