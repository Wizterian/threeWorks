uniform vec2 uResolution;
uniform float uSize;
uniform float uProgress;
uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uTextureTarget;

attribute vec3 aPositionTarget;
attribute float aSize;

varying vec3 vColor;
varying vec2 vUv;

#include ./inc/simplexNoise3d.glsl

void main()
{
    // Delay 時差効果
    float noiseOrigin = simplexNoise3d(position * .2);
    float noiseTarget = simplexNoise3d(aPositionTarget * .2);
    float noise = mix(noiseOrigin, noiseTarget, uProgress);
    noise = smoothstep(-1.0, 1.0, noise);

    float duration = 0.6;
    float delay = (1.0 - duration) * noise; // b/w 0.0 and 0.6
    float end = delay + duration; // b/w 0.0 and 1.0
    float progress = smoothstep(delay, end, uProgress);

    vec3 mixedPosition = mix(position, aPositionTarget, progress);

    // // スパイラルオフセット
    // float angle = progress * 6.2831 * 3.0;
    // float radius = (1.0 - progress) * 100.5;
    // float spinX = cos(angle) * radius;
    // float spinZ = sin(angle) * radius;

    // mixedPosition.x += spinX;
    // mixedPosition.z += spinZ;

    // ゆらぎ
    float timeScale = .1; // 時間の進み具合
    float noiseScale = 2.; // ノイズ空間のスケール
    float offsetStrength = 1.5; // 揺らぎの大きさ

    float offsetX = simplexNoise3d(vec3(mixedPosition * noiseScale + uTime * timeScale));
    float offsetY = simplexNoise3d(vec3(mixedPosition.yzx * noiseScale + uTime * timeScale + 10.0));
    float offsetZ = simplexNoise3d(vec3(mixedPosition.zxy * noiseScale + uTime * timeScale + 20.0));
    vec3 noiseOffset = vec3(offsetX, offsetY, offsetZ) * offsetStrength;

    mixedPosition += noiseOffset;

    // Final position
    vec4 modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    gl_PointSize = aSize * uSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Texture color
    vColor = texture2D(uTexture, uv).rgb;

    // Varying
    vUv = uv;
}