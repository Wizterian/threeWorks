// ver.1 cover fit
uniform sampler2D uTextureFrom;
uniform sampler2D uTextureTo;
uniform float uProgress;
uniform vec2 uUvScale;

varying vec2 vUv;

// // 分割線
// varying vec2 vUvOriginal;
// varying vec2 vUvOffset;


void main() {

    // 画像切替
    vec4 fromColor = texture2D(uTextureFrom, vUv);
    vec4 toColor = texture2D(uTextureTo, vUv);

    float fadeProgress = smoothstep(0.25, 0.75, uProgress); // 画像だけは早めにフェード切替

    // 透明PNGにエッジが出るのを防止
    vec3 fromRGB = fromColor.rgb * fromColor.a;
    vec3 toRGB = toColor.rgb * toColor.a;
    vec4 color = vec4(
        mix(fromRGB, toRGB, fadeProgress), // RGB
        mix(fromColor.a, toColor.a, fadeProgress) // Alpha
    );

    // // 分割線
    // float lineWidth = 0.1;
    // float borderX = step(1.0 - lineWidth, vUvOriginal.x);
    // float borderY = step(1.0 - lineWidth, vUvOriginal.y);
    // float border = max(borderX, borderY);
    // color.rgb *= 1.0 - border;

    gl_FragColor = color;
}
