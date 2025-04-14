uniform vec2 uResolution;
uniform sampler2D uTexture;

varying vec3 vColor;

void main()
{
    // Final position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    gl_PointSize = 10. * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Texture color
    vec4 colorIntensity = texture2D(uTexture, uv);
    vColor = colorIntensity.rgb;
}