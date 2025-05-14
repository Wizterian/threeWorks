uniform vec2 uUvScale;
attribute vec2 uvOffset;

varying vec2 vUv;
varying vec2 vUvOriginal;
varying vec2 vUvOffset;

void main() {
    vUvOriginal = uv;
    vUvOffset = uvOffset;

    //uv * uUvScale によって、元の (0〜1) UV を画像内の小さい「1粒分」にスケーリングします。
    vUv = uv * uUvScale + uvOffset;

    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}