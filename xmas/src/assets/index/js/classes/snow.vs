// attribute vec3 position;
attribute vec3 color;
attribute float opacity;
attribute float size;

varying vec3 vColor;
varying float fOpacity;

void main() {
  vColor = color;
  fOpacity = opacity;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * (300.0 / length(mvPosition.xyz));
  gl_Position = projectionMatrix * mvPosition;
}
