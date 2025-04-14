varying vec3 vColor;

void main()
{
    // Circler dot
    vec2 uv = gl_PointCoord;
    float toCenter = length(uv - vec2(0.5));
    if(toCenter > 0.5) discard;

    gl_FragColor = vec4(vColor, 1.0);
    // gl_FragColor = vec4(uv, 1., 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}