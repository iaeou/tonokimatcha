uniform float uTime;
uniform float uProgress;
uniform float uKofunProgress;
uniform float uKofunCancelY;
uniform float uSizeScale;
uniform vec3 uEarthColor;
uniform vec3 uJadeColor;

attribute float aSize;
attribute vec3 aRandom;
attribute vec3 aKofun;

varying vec3 vColor;

void main() {
  vec3 pos = position;

  float angle = uProgress * aRandom.x * 6.28;
  float s = sin(angle);
  float c = cos(angle);
  pos.xy *= mat2(c, -s, s, c);

  float wobble = (1.0 - uProgress) * (1.0 - uKofunProgress);
  pos.x += sin(uTime * aRandom.x + pos.y) * wobble * 0.2;
  pos.y += cos(uTime * aRandom.y + pos.x) * wobble * 0.2;

  // Kofun constellation: blend toward the keyhole silhouette targets, each
  // particle arriving on its own slight offset so the mound assembles like
  // stars surfacing rather than a snap into place. The targets are counter-
  // rotated by the Points object's own Y spin (uKofunCancelY) so the formed
  // silhouette always faces the visitor instead of arriving edge-on.
  float cy = cos(-uKofunCancelY);
  float sy = sin(-uKofunCancelY);
  vec3 kofun = vec3(
    aKofun.x * cy + aKofun.z * sy,
    aKofun.y,
    -aKofun.x * sy + aKofun.z * cy
  );
  float formation = clamp(uKofunProgress * (0.75 + aRandom.z * 0.5), 0.0, 1.0);
  pos = mix(pos, kofun, formation);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  gl_PointSize = aSize * uSizeScale * (1.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;

  vColor = mix(uEarthColor, uJadeColor, uProgress);
  vColor = mix(vColor, uJadeColor, formation * 0.6);
}
