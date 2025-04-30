uniform vec2 uResolution;
uniform float uSize;
uniform float uProgress;
uniform float uTime;
uniform sampler2D uTextureFrom;
uniform sampler2D uTextureTo;

attribute vec3 aPositionTarget;
attribute float aSize;

varying vec3 vColor;
varying vec2 vUv;

#include ./inc/simplexNoise3d.glsl

void main()
{
// === Y軸に対する範囲・中心調整用 ===
float halfHeight = 375.0;               // 全体高さの半分（固定値）
float dy = position.y;                  // 現在の頂点のY座標
float normalizedY = (dy + halfHeight) / (2.0 * halfHeight); // Yを0.0〜1.0に正規化

// === X方向のパーティクルばらつき制御 ===
float randomnessStrength = 0.1; // 横並びのパーティクルがばらける強さ（0〜0.5で調整）

// positionベースで一意の乱数を生成（0.0〜1.0）
float random = fract(sin(dot(vec2(position.x, position.y), vec2(12.9898, 78.233))) * 43758.5453);

// -0.5〜+0.5の範囲に変換し、強さを掛けて最終オフセットに
float delayOffset = (random - 0.5) * randomnessStrength;

// === 遅延付きの進行管理 ===
float duration = 0.6; // 各パーティクルの変形にかかる時間（長いほどゆっくり）

// 遅延開始時間（上から順に早く始まる＋ランダムばらけ）
float delay = (1.0 - duration) * (1.0 - normalizedY) + delayOffset;
delay = clamp(delay, 0.0, 1.0 - duration); // 負やオーバー遅延を防ぐ

float end = delay + duration; // この頂点が完了する時刻

// グローバル進捗 uProgress をこの頂点に合わせてローカル進捗へ
float progress = smoothstep(delay, end, uProgress);

// === 元画像→ターゲット画像への補間 ===
vec3 mixedPosition = mix(position, aPositionTarget, progress);

// === Y軸回転（ねじれ） ===
float angle = progress * radians(360.0); // 進行度に応じた回転角度（最大360°）
mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)); // 回転マトリクス（XZ平面）
vec2 rotated = rot * vec2(mixedPosition.x, mixedPosition.z); // XZ座標を回転

// === 反り表現（Z方向のカーブ） ===
float curveAmount = sin(progress * 3.1415) * 40.0; // 進行度に応じて0→最大→0になる反り量
float offsetZ = (dy / halfHeight) * curveAmount;  // Y位置に応じたZ方向の反り具合

// === 見た目のばらけ（ランダム揺らぎ） ===
float randomY = fract(sin(dot(vec2(position.y, position.x), vec2(39.3467, 11.135))) * 32142.239);
float offsetX = (random - 0.5) * 1000.0;
float offsetY = (randomY - 0.5) * 1000.0;

// トランジション中だけ揺らぎを出す係数（0→1→0）
float visibility = sin(progress * 3.1415);

// === 変形後の最終位置（揺らぎ係数を掛ける） ===
vec3 twistedPosition = vec3(
  rotated.x + offsetX * visibility,
  dy + offsetY * visibility,
  rotated.y + offsetZ
);

// === 座標変換・出力 ===
vec4 modelPosition = modelMatrix * vec4(twistedPosition, 1.0);
vec4 viewPosition = viewMatrix * modelPosition;
vec4 projectedPosition = projectionMatrix * viewPosition;
gl_Position = projectedPosition;

// === Pointサイズ調整（デバイス距離に応じて） ===
gl_PointSize = aSize * uSize * uResolution.y;
gl_PointSize *= (1.0 / -viewPosition.z);

// === テクスチャフェード（画像遷移） ===
vec4 colorFrom = texture(uTextureFrom, uv);
vec4 colorTo = texture(uTextureTo, uv);
vec4 blended = mix(colorFrom, colorTo, progress);
vColor = blended.rgb;

// === UVをそのまま渡す ===
vUv = uv;

}