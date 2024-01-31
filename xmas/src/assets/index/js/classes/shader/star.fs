uniform sampler2D uTexture;

varying vec3 vColor;
// varying float vOpacity;

void main() {
  // gl_FragColor = vec4(uColor * vColor, vOpacity);
  // gl_FragColor = vec4(uColor, vOpacity);
  gl_FragColor = vec4(vColor, 1.);
  gl_FragColor = gl_FragColor * texture2D(uTexture, gl_PointCoord);
}
