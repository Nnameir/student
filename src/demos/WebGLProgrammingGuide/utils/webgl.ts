// FIXME: release resource when fail
export function initShaders(
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
