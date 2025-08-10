// vertex.glsl

attribute vec2 uvOffset;
attribute vec3 instanceOffset;

uniform float uProgress;
uniform float uHalfWidth;
uniform float uHalfHeight;
uniform vec2 uUvScale;

varying vec2 vUv;

void main() {
  // UVをスケーリングとオフセット
  vUv = uv * uUvScale + uvOffset;

  // Normalized X and Y
  float dx = instanceOffset.x;
  float dy = instanceOffset.y;
  float normalizedX = (dx + uHalfWidth) / (2.0 * uHalfWidth);
  float normalizedY = (dy + uHalfHeight) / (2.0 * uHalfHeight);

  // Delay & Local Progress
  float duration = 0.4;
  float delay = (1.0 - duration) * ((1.0 - normalizedX) * 0.5 + (1.0 - normalizedY) * 0.5);
  delay = clamp(delay, 0.0, 1.0 - duration);
  float end = delay + duration;
  float localProgress = smoothstep(delay, end, uProgress);

  // Global twist rotation around Y-axis (page-turn style)
  float angle = localProgress * radians(360.0);
  mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 rotated = rot * vec2(instanceOffset.x, instanceOffset.z);

  vec3 worldPos = vec3(rotated.x, instanceOffset.y, rotated.y) + position;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
}
