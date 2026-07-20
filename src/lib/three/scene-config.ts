import type { MeshPhysicalMaterialParameters, WebGLRendererParameters } from 'three';
import type { Theme } from '$lib/stores/theme';
import { MAGATAMA_TUNING } from './magatama-tuning';

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
 * Environment settings for the procedural HDRI (RoomEnvironment + PMREM).
 * The env map is what makes `transmission` read as real jade: without it the
 * refraction has nothing to bend, so the bead looks like tinted plastic.
 */
export function createEnvironmentSettings() {
  return { ...MAGATAMA_TUNING.environment };
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
