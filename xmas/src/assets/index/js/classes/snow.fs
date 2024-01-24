// uniform vec3 uColor;
uniform sampler2D uTexture;

varying vec3 vColor;
varying float fOpacity;

void main() {
  // gl_FragColor = vec4(uColor * vColor, fOpacity);
  // gl_FragColor = vec4(uColor, fOpacity);
  gl_FragColor = vec4(vColor, fOpacity);
  gl_FragColor = gl_FragColor * texture2D(uTexture, gl_PointCoord);
}
