import { useEffect, useRef, useState } from 'react';

export default function useWebGLContext() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gl, setGL] = useState<WebGLRenderingContext | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const _gl = canvas.getContext('webgl', {
      antialias: false,
      preserveDrawingBuffer: true,
    });
    if (!_gl) throw new Error('Failed to get the rendering context for WebGL');

    setGL(_gl);

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      _gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return { canvasRef, gl };
}
