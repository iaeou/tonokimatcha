import { DoubleSide } from 'three';
import type {
  MeshPhysicalMaterialParameters,
  MeshStandardMaterialParameters,
  WebGLRendererParameters
} from 'three';
import type { Theme } from '$lib/stores/theme';
import { MAGATAMA_TUNING } from './magatama-tuning';

/**
 * Material for the faceted low-poly Magatama. Vertex colors carry the artwork,
 * so this is a plain flat-shaded standard surface — a matte stone that catches
 * a little HDRI sheen on each facet. Theme-independent: the greens + gold read
 * on both the cream and ink stages.
 */
export function createLowPolyMaterialOptions(): MeshStandardMaterialParameters {
  return {
    vertexColors: true,
    flatShading: MAGATAMA_TUNING.lowPoly.flatShading,
    roughness: MAGATAMA_TUNING.lowPoly.roughness,
    metalness: MAGATAMA_TUNING.lowPoly.metalness,
    envMapIntensity: MAGATAMA_TUNING.lowPoly.envMapIntensity,
    // The source artwork's facets aren't consistently wound, so a handful of
    // front triangles face away and get culled — reading as hollow gaps. The
    // bead is a small opaque mesh, so render both sides: every facet shows
    // regardless of its winding, and flat shading flips normals per fragment.
    side: DoubleSide
  };
}

/**
 * Material for the illustrated Magatama. Like the low-poly bead it carries its
 * artwork in vertex colors, so this is a plain standard surface — but smooth
 * shaded, not flat: the slab's bevel is a rounded edge and faceting it would
 * turn the one curved surface in the object into a row of chips.
 *
 * `DoubleSide` is load-bearing here, not defensive. The back paint keeps the
 * front's winding so that it lands on the same footprint, which leaves it
 * facing away from the camera that sees it; rendering both sides is what lets
 * three flip the normal per fragment and light it correctly.
 */
export function createIconMaterialOptions(): MeshStandardMaterialParameters {
  return {
    vertexColors: true,
    flatShading: false,
    roughness: MAGATAMA_TUNING.icon.roughness,
    metalness: MAGATAMA_TUNING.icon.metalness,
    envMapIntensity: MAGATAMA_TUNING.icon.envMapIntensity,
    side: DoubleSide
  };
}

/**
 * Scroll window for the bead's farewell, read by the ScrollTrigger in the
 * scene. Both edges sit below the fold, so the stone finishes dissolving
 * before the closing hall is on screen at all.
 */
export function createFarewellSettings() {
  return { ...MAGATAMA_TUNING.farewell };
}

/**
 * Bead opacity across the farewell, `progress` running 0 → 1 over that
 * window. Smoothstep rather than linear: the stone holds its presence for a
 * beat, then leaves quickly, instead of spending the whole approach as a
 * half-there ghost. Clamped, so callers can hand it raw scroll progress.
 */
export function computeFarewellOpacity(progress: number): number {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const eased = clamped * clamped * (3 - 2 * clamped);

  return 1 - eased;
}

interface DragRotationInput {
  movementX: number;
  movementY: number;
}

export const TONOKI_COLORS = {
  hisuiJade: 0x00a86b,
  haniwaClay: 0x8b4513,
  mossGreen: 0x2e4d23,
  inkVoid: 0x080b07,
  ceremonialWhite: 0xf4efe4
} as const;

export function createRendererOptions(canvas: HTMLCanvasElement): WebGLRendererParameters {
  return {
    alpha: true,
    antialias: true,
    canvas,
    powerPreference: 'high-performance'
  };
}

/**
 * Mid-jade Magatama material.
 *
 * Earlier near-black (#072411) read as a solid silhouette against the cream
 * stage and lost the jade character entirely. The color is now a visible
 * mid-hisui green (#2e6b3e), low thickness keeps light from being
 * over-absorbed inside the bead, and `ior` stays high for the wet polished
 * look. The shared tuning module also controls opacity and clearcoat.
 */
export function createMagatamaMaterialOptions(): MeshPhysicalMaterialParameters {
  return {
    ...MAGATAMA_TUNING.material,
    // transparent must be true for opacity < 1 to render correctly
    transparent: MAGATAMA_TUNING.material.opacity < 1
  };
}

export function createMagatamaDragRotationDelta({ movementX, movementY }: DragRotationInput) {
  return {
    x: movementY * MAGATAMA_TUNING.animation.dragSensitivityXY,
    y: movementX * MAGATAMA_TUNING.animation.dragSensitivityXY,
    z: (movementX - movementY) * MAGATAMA_TUNING.animation.dragSensitivityZ
  };
}

export function createParticleThemeSettings(theme: Theme) {
  return theme === 'light' ? MAGATAMA_TUNING.particlesLight : MAGATAMA_TUNING.particlesDark;
}

/**
 * Theme-aware Magatama material: the base stone merged with the per-theme
 * overrides. Dark keeps the alpha-translucent stone (the ink void supplies
 * its depth); light swaps alpha for refraction — near-opaque deeper jade with
 * high transmission and jade attenuation — so the bead reads as dense wet
 * stone on the cream stage instead of diluting into milk.
 */
export function createMagatamaThemeMaterialOptions(theme: Theme): MeshPhysicalMaterialParameters {
  const overrides =
    theme === 'light' ? MAGATAMA_TUNING.materialLight : MAGATAMA_TUNING.materialDark;
  const merged = { ...MAGATAMA_TUNING.material, ...overrides };

  return {
    ...merged,
    transparent: merged.opacity < 1
  };
}

/**
 * Environment settings for the procedural HDRI (RoomEnvironment + PMREM).
 * The env map is what makes `transmission` read as real jade: without it the
 * refraction has nothing to bend, so the bead looks like tinted plastic.
 * Intensity is theme-aware: the light stage needs stronger reflections for
 * the wet-stone highlights to register against cream.
 */
export function createEnvironmentSettings(theme: Theme = 'dark') {
  const { intensity, intensityLight, rotationY } = MAGATAMA_TUNING.environment;

  return {
    intensity: theme === 'light' ? intensityLight : intensity,
    rotationY
  };
}

/**
 * Bloom options for the pmndrs `postprocessing` BloomEffect.
 * Threshold sits above the cream stage luminance so only the jade's
 * clearcoat highlights and refracted hotspots bloom - not the whole page.
 */
export function createBloomOptions() {
  return { ...MAGATAMA_TUNING.postprocessing.bloom };
}

/**
 * Film-grain options for the pmndrs NoiseEffect. `premultiply` scales the
 * noise by scene color, so fully transparent pixels stay untouched and the
 * grain lives only on the bead and particle cloud.
 */
export function createGrainOptions() {
  return { ...MAGATAMA_TUNING.postprocessing.grain };
}
