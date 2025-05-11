uniform sampler2D uTexture;
varying vec2 vUv;
varying vec2 vUvOriginal;

void main() {
  vec4 color = texture2D(uTexture, vUv);

  float lineWidth = 0.1;

  float borderX = step(1.0 - lineWidth, vUvOriginal.x);
  float borderY = step(1.0 - lineWidth, vUvOriginal.y);
  float border = max(borderX, borderY);

  color.rgb *= 1.0 - border;

  gl_FragColor = color;
}
