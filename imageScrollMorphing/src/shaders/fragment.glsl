uniform float uProgress;

varying vec2 vUv;
varying vec4 vColor;

void main()
{
    // Circler dot
    vec2 uv = gl_PointCoord;
    float toCenter = length(uv - vec2(0.5));
    if(toCenter > 0.5) discard;

    // Texture color
    vec4 finalColor = vColor;//vec4(vec3(vColor), 1.);

    gl_FragColor = finalColor;

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}