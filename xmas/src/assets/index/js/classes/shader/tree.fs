uniform vec2 resolution;
uniform vec2 imageResolution;
uniform sampler2D uTex;
uniform sampler2D uTexDepth;
uniform vec2 uMouse;

varying vec2 vUv;

void main(){

    // To fit the image to the window, the UV value needs to be adjusted.
    // If the UV value is below 1, the texture becomes larger and can cover the window. (The value of 1 fits the window exactly)
    vec2 ratio = vec2(
    min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
    min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
    );

    // To centerize
    // When the UV value is below 1, it needs to be centered with the number by subtracting the ratio from 1 (100%)
    vec2 uv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    vec4 tex = texture2D(uTex, uv);
    vec4 texDepth = texture2D(uTexDepth, uv);
    vec4 color = texture2D(uTex, uv + (uMouse -vec2(0.5)) *0.02 * texDepth.r);
    gl_FragColor = color;
}