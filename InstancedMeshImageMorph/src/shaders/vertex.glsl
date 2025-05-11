uniform vec2 uUvScale;
attribute vec2 uvOffset;

varying vec2 vUv;
varying vec2 vUvOriginal;

void main() {
  vUvOriginal = uv; // ← Three.js から自動で来るので再宣言しない！

  vUv = uv * uUvScale + uvOffset;

  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
