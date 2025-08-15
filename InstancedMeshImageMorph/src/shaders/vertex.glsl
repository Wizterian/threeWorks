// ver.2 scrollTrigger
uniform vec2 uUvScale;
uniform float uProgress;
uniform vec2 uMouse; // Tilt
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
    float duration = 0.4;
    float delay = (1.0 - duration) * ((1.0 - normalizedX) * 0.5 + (1.0 - normalizedY) * 0.5); // delay starts move from top-right to bottom-left
    delay = clamp(delay, 0.0, 1.0 - duration); // rounds a value from 0 to 1, 1.0 - duration is overall animation length
    float end = delay + duration; // animation length

    float localProgress = smoothstep(delay, end, uProgress); // make the range 0 to 1

    // --- Interpolation ---
    // vec3 basePosition = mix(aFromPosition, aToPosition, localProgress); // interpolated base position (instanced center)
    vec3 basePosition = mix(aFromPosition, aToPosition, localProgress); // interpolated base position (instanced center)

    // --- 見た目のばらけ（ランダム揺らぎ） ---
    // aFromPositionベースで一意の乱数を生成（0.0〜1.0）
    float randX = fract(sin(dot(vec2(aFromPosition.x, aFromPosition.y), vec2(12.9898, 78.233))) * 43758.5453);
    float randY = fract(sin(dot(vec2(aFromPosition.y, aFromPosition.x), vec2(39.3467, 11.135))) * 32142.239);
    float randZ = fract(sin(dot(vec2(aFromPosition.x + aFromPosition.y, aFromPosition.y - aFromPosition.x), vec2(91.135, 15.719))) * 15731.239);

    float scatterStrength = 500.0;
    float visibility = pow(sin(localProgress * 3.1415), 2.0); // トランジション中だけ揺らぎを出す定番係数（0→1→0）* イージング強度

    float offsetX = (randX - 0.5) * 2.0 * scatterStrength;
    float offsetY = (randY - 0.5) * 2.0 * scatterStrength;
    float offsetZ = (randZ - 0.5) * 2.0 * scatterStrength;

    // --- ばらけを先に加える（ベース位置に適用） ---
    vec3 scattered = basePosition + vec3(offsetX, offsetY, offsetZ) * visibility;

    // --- Y軸回転（ねじれ） ---
    float angle = localProgress * radians(360.0 * 2.); // 進行度に応じた回転角度（0〜360°）
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)); // 回転マトリクス
    vec2 rotated = rot * vec2(scattered.x, scattered.z); // XZ座標を回転

    // --- 変形後の最終位置（ばらけ＋ねじれ） ---
    vec3 twistedPosition = vec3(
        rotated.x,
        scattered.y,
        rotated.y
    );

    // --- チルト回転（マウスによる視差効果） ---
    float tiltStrength = 0.2; // チルト強度
    float tiltEase = 1.;//sin(uProgress * 3.1415); // easing（in-out）

    float tiltX = uMouse.y * tiltStrength * tiltEase;
    float tiltY = -uMouse.x * tiltStrength * tiltEase;

    mat3 tiltRotX = mat3(
        1.0, 0.0, 0.0,
        0.0, cos(tiltX), -sin(tiltX),
        0.0, sin(tiltX), cos(tiltX)
    );

    mat3 tiltRotY = mat3(
        cos(tiltY), 0.0, sin(tiltY),
        0.0, 1.0, 0.0,
        -sin(tiltY), 0.0, cos(tiltY)
    );

    // --- シーン中心を回転中心としてチルトを適用 ---
    vec3 centered = twistedPosition; // scene centerが(0,0,0)の前提
    vec3 tilted = tiltRotY * (tiltRotX * centered);

    vec3 worldPosition = tilted + position; // 最終ワールド座標

    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPosition, 1.0);
}
