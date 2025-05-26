uniform vec2 uUvScale;

attribute vec2 uvOffset;
// attribute vec3 aFromPosition;

varying vec2 vUv;

// // 分割線
// varying vec2 vUvOriginal;
// varying vec2 vUvOffset;

void main() {
    // // 分割線
    // vUvOriginal = uv;
    // vUvOffset = uvOffset;

    //uv * uUvScale によって、元の (0〜1) UV を画像内の小さい「1粒分」にスケーリングします。
    vUv = uv * uUvScale + uvOffset;

    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);

}

// uniform vec2 uUvScale;
// uniform float uProgress;

// attribute vec2 uvOffset;
// attribute vec3 aFromPosition;
// attribute vec3 aToPosition;

// varying vec2 vUv;

// // // 分割線
// // varying vec2 vUvOriginal;
// // varying vec2 vUvOffset;

// void main() {
//     // // 分割線
//     // vUvOriginal = uv;
//     // vUvOffset = uvOffset;

//     // uv * uUvScale によって、元の (0〜1) UV を画像内の小さい「1粒分」にスケーリング
//     vUv = uv * uUvScale + uvOffset;

//     vec3 interpolated = mix(aFromPosition, aToPosition, uProgress);

//     gl_Position = projectionMatrix * modelViewMatrix * vec4(interpolated, 1.0);

// }