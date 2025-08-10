varying vec2 vUv;

uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform float uProgress;
uniform vec2 uImageResolution;
uniform vec2 uResolution;

void main() {
  // cover用のUV計算
  vec2 ratio = vec2(
    min((uResolution.x / uResolution.y) / (uImageResolution.x / uImageResolution.y), 1.0),
    min((uResolution.y / uResolution.x) / (uImageResolution.y / uImageResolution.x), 1.0)
  );
  vec2 uv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
  vec4 tex1 = texture2D(uTexture1, uv);
  vec4 tex2 = texture2D(uTexture2, uv);

  // 回転中盤でフェード開始・終了
  float fadeStart = 0.4;
  float fadeEnd = 0.6;
  float fadeProgress = smoothstep(fadeStart, fadeEnd, uProgress);

  vec4 color = mix(tex1, tex2, fadeProgress);

  gl_FragColor = color;
}