uniform float uTime;
uniform float uProgress;
uniform float uSizeScale;
uniform vec3 uEarthColor;
uniform vec3 uJadeColor;

attribute float aSize;
attribute vec3 aRandom;

varying vec3 vColor;

void main() {
  vec3 pos = position;

  float angle = uProgress * aRandom.x * 6.28;
  float s = sin(angle);
  float c = cos(angle);
  pos.xy *= mat2(c, -s, s, c);

  pos.x += sin(uTime * aRandom.x + pos.y) * (1.0 - uProgress) * 0.2;
  pos.y += cos(uTime * aRandom.y + pos.x) * (1.0 - uProgress) * 0.2;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  gl_PointSize = aSize * uSizeScale * (1.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;

  vColor = mix(uEarthColor, uJadeColor, uProgress);
}
