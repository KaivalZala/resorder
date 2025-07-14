




'use client';

import React, { useRef, useState, useEffect } from 'react';

const DrawYourDish = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = color;
    }
  }, [color]);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.lineWidth = brushSize;
    }
  }, [brushSize]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    ctxRef.current?.beginPath();
    ctxRef.current?.moveTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    ctxRef.current?.lineTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );
    ctxRef.current?.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
    ctxRef.current?.closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'my-dish.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-pink-100 p-6">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
        🎨 Draw Your Dish
      </h1>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        className="border-4 border-gray-300 rounded-lg bg-white shadow-lg mb-4"
      />

      <div className="flex flex-wrap gap-4 justify-center items-center mt-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          🎨 Color:
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 p-0 border-none"
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-medium">
          🖌️ Brush Size:
          <input
            type="range"
            min={1}
            max={20}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-32"
          />
        </label>

        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🧼 Clear
        </button>

        <button
          onClick={downloadDrawing}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          💾 Download
        </button>
      </div>

      <p className="mt-6 text-sm text-gray-600 text-center">
        Sketch what you think your dish will look like! 🧑‍🍳🍝
      </p>
    </div>
  );
};

export default DrawYourDish;