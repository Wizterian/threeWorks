uniform vec2 uUvScale;
uniform float uProgress;
// uniform vec2 uMouse; // Tilt
// uniform vec3 uImageCenter; // Tilt
uniform float uHalfHeight;
uniform float uHalfWidth;

attribute vec2 uvOffset;
attribute vec3 aFromPosition;
attribute vec3 aToPosition;

varying vec2 vUv;

// // 分割線
// varying vec2 vUvOriginal;
// varying vec2 vUvOffset;

void main() {
    // // 分割線
    // vUvOriginal = uv;
    // vUvOffset = uvOffset;

    //画像に対しカメラ画角（uv）をズーム（scale）、パン（offset）するイメージ
    vUv = uv * uUvScale + uvOffset;

    // --- Normalize X and Y ---
    float dx = aFromPosition.x; // current position
    float dy = aFromPosition.y;

    float normalizedX = (dx + uHalfWidth) / (2.0 * uHalfWidth); // 0.0 (left) → 1.0 (right)
    float normalizedY = (dy + uHalfHeight) / (2.0 * uHalfHeight);

    // --- Delay & Local Progress ---
    float duration = 0.6;
    float delay = (1.0 - duration) * ((1.0 - normalizedX) * 0.5 + (1.0 - normalizedY) * 0.5); // delay starts move from top-right to bottom-left
    delay = clamp(delay, 0.0, 1.0 - duration); // rounds a value from 0 to 1, 1.0 - duration is overall animation length
    float end = delay + duration; // animation length

    float localProgress = smoothstep(delay, end, uProgress); // make the range 0 to 1

    // --- Interpolation ---
    vec3 interpolated = mix(aFromPosition, aToPosition, localProgress);

    // --- Twist Effect ---
    float angle = localProgress * radians(360.0);
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)); // rotation matrix around Y axis
    vec2 rotated = rot * vec2(interpolated.x, interpolated.z);

    vec3 worldPosition = vec3(rotated.x, interpolated.y, rotated.y) + position; // position（planeの相対座標）+ 回転・遷移中のワールド（絶対）座標

    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPosition, 1.0);
}