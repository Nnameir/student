import { useCallback, useEffect, useRef } from 'react';
import { Select } from 'antd';
import { GLDrawMode } from '../typings';
import { initShaders } from '../utils/webgl';
import useWebGLContext from '../hooks/useWebGLContext';
import classes from './BufferObject.module.scss';

// FIXME: release resource when fail
// TODO: error tip
export function BufferObject() {
  const { canvasRef, gl } = useWebGLContext();
  const vertexTotalRef = useRef(0);

  const handleChange = useCallback(
    (mode: GLDrawMode) => {
      if (!gl) return;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(mode, 0, vertexTotalRef.current);
    },
    [gl],
  );

  useEffect(() => {
    if (!gl) return;

    const program = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!program) return;

    const a_Position = gl.getAttribLocation(program, 'a_Position');
    const u_FragColor = gl.getUniformLocation(program, 'u_FragColor');
    if (!u_FragColor) return;

    vertexTotalRef.current = initVertexBuffers(gl, a_Position);

    gl.uniform4f(u_FragColor, 1, 0, 0, 1);

    gl.clearColor(0, 0, 0, 1);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(GLDrawMode.TRIANGLES, 0, vertexTotalRef.current);
  }, [gl]);

  return (
    <>
      <canvas ref={canvasRef} />
      <Select
        defaultValue={GLDrawMode.TRIANGLES}
        options={MODE_OPTIONS}
        onChange={handleChange}
        className={classes.select}
      />
    </>
  );
}

function initVertexBuffers(gl: WebGLRenderingContext, a_Position: number): number {
  const vertices = new Float32Array([-0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, -0.5]);
  const positionSize = 2;
  const vertexTotal = Math.round(vertices.length / positionSize);

  const vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) throw new Error('Failed to create the buffer object');

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, positionSize, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(a_Position);

  return vertexTotal;
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

const MODE_OPTIONS = [
  {
    value: GLDrawMode.POINTS,
    label: '点',
  },
  {
    value: GLDrawMode.LINES,
    label: '线段',
  },
  {
    value: GLDrawMode.LINE_LOOP,
    label: '闭合折线',
  },
  {
    value: GLDrawMode.LINE_STRIP,
    label: '折线',
  },
  {
    value: GLDrawMode.TRIANGLES,
    label: '三角形',
  },
  {
    value: GLDrawMode.TRIANGLE_STRIP,
    label: '三角带',
  },
  {
    value: GLDrawMode.TRIANGLE_FAN,
    label: '三角扇',
  },
];
