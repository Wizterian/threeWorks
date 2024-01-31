// attribute vec3 position;
attribute vec3 color;
// attribute float opacity;
// attribute float scale;

varying vec3 vColor;
// varying float vOpacity;

void main() {
  vColor = color;
  // vOpacity = opacity;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  // gl_PointSize = scale * (300.0 / length(mvPosition.xyz));
  gl_Position = projectionMatrix * mvPosition;
}
