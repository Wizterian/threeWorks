uniform float uProgress;

// uniform sampler2D uTexture;
// uniform sampler2D uTextureTarget;

varying vec2 vUv;
varying vec4 vColor;
// varying vec3 vColorTarget;

void main()
{
    // Circler dot
    vec2 uv = gl_PointCoord;
    float toCenter = length(uv - vec2(0.5));
    if(toCenter > 0.5) discard;

    // Texture color
    // vec4 colorA = texture2D(uTexture, vUv);
    // vec4 colorB = texture2D(uTextureTarget, vUv);
    // vec4 finalColor = mix(colorA, colorB, uProgress);
    vec4 finalColor = vColor;//vec4(vec3(vColor), 1.);

    gl_FragColor = finalColor;

    // gl_FragColor = vec4(vColor, 1.0);
    // gl_FragColor = vec4(uv, 1., 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}