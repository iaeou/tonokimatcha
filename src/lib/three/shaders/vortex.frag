varying vec3 vColor;
uniform float uAlpha;

void main() {
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
  float strength = clamp(0.16 / max(distanceToCenter, 0.12) - 0.22, 0.0, 0.82) * uAlpha;

  if (strength < 0.0) discard;

  gl_FragColor = vec4(vColor, strength);
}
