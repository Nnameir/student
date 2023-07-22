import { useEffect, useRef } from "react";

// FIXME: release resource when fail
// TODO: error tip
export function ClickedPoints() {
  const domRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (domRef.current) {
      const canvas = domRef.current;
      const gl = canvas.getContext("webgl", {
        antialias: false,
        preserveDrawingBuffer: true,
      });
      if (!gl) return;

      const program = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
      if (!program) return;

      const a_Position = gl.getAttribLocation(program, "a_Position");
      const u_FragColor = gl.getUniformLocation(program, "u_FragColor");
      if (!u_FragColor) return;

      gl.clearColor(0, 0, 0, 1);

      gl.clear(gl.COLOR_BUFFER_BIT);

      const handleMousedown = (ev: MouseEvent) => {
        drawWhenClick(ev, gl, canvas, a_Position, u_FragColor);
      };
      canvas.addEventListener("mousedown", handleMousedown);
      return () => {
        canvas.removeEventListener("mousedown", handleMousedown);
      };
    }
  }, []);

  return <canvas ref={domRef} />;
}

// FIXME: release resource when fail
function initShaders(
  gl: WebGLRenderingContext,
  vShader: string,
  fShader: string
): WebGLProgram | null {
  const vShaderObject = gl.createShader(gl.VERTEX_SHADER);
  if (!vShaderObject) return null;
  gl.shaderSource(vShaderObject, vShader);
  gl.compileShader(vShaderObject);

  const fShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
  if (!fShaderObject) return null;
  gl.shaderSource(fShaderObject, fShader);
  gl.compileShader(fShaderObject);

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vShaderObject);
  gl.attachShader(program, fShaderObject);
  gl.linkProgram(program);
  gl.useProgram(program);

  return program;
}

function drawWhenClick(
  ev: MouseEvent,
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement,
  a_Position: number,
  u_FragColor: WebGLUniformLocation
): void {
  const rect = canvas.getBoundingClientRect();
  const halfWidth = rect.width * 0.5;
  const halfHeight = rect.height * 0.5;
  const x = (ev.clientX - rect.left - halfWidth) / halfWidth;
  const y = (halfHeight - (ev.clientY - rect.top)) / halfHeight;

  gl.vertexAttrib2f(a_Position, x, y);

  if (x > 0) {
    if (y > 0) {
      gl.uniform4f(u_FragColor, 1, 0, 0, 1);
    } else {
      gl.uniform4f(u_FragColor, 0, 1, 0, 1);
    }
  } else {
    if (y > 0) {
      gl.uniform4f(u_FragColor, 0, 0, 1, 1);
    } else {
      gl.uniform4f(u_FragColor, 1, 1, 1, 1);
    }
  }

  gl.drawArrays(gl.POINTS, 0, 1);
}

const VSHADER_SOURCE = `
  attribute vec4 a_Position;

  void main() {
    gl_Position = a_Position;
    gl_PointSize = 5.0;
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;

  void main() {
    gl_FragColor = u_FragColor;
  }
`;
