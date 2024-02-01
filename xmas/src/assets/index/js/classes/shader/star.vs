// attribute vec3 position;
attribute vec3 color;
// attribute float opacity;
// attribute float scale;

// scaling depending on the destance b/w camera
// https://chat.openai.com/share/8c708e55-8caf-4ebe-9507-0078d89b2d51

varying vec3 vColor;
// varying float vOpacity;

void main() {
  vColor = color;
  // vOpacity = opacity;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  // gl_PointSize = scale * (300.0 / length(mvPosition.xyz));
  gl_Position = projectionMatrix * mvPosition;
}
