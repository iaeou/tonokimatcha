import type { MeshPhysicalMaterialParameters, WebGLRendererParameters } from 'three';
import type { Theme } from '$lib/stores/theme';

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
 * mid-hisui green (#2e6b3e), thickness is eased from 1.5 → 0.9 so light isn't
 * over-absorbed inside the bead, and `ior` stays high for the wet polished
 * look. Clearcoat and roughness preserve the surface sheen.
 */
export function createMagatamaMaterialOptions(): MeshPhysicalMaterialParameters {
  return {
    color: 0x2e6b3e,
    roughness: 0.12,
    metalness: 0,
    clearcoat: 0.9,
    clearcoatRoughness: 0.08,
    transmission: 0.5,
    thickness: 0.9,
    ior: 1.61
  };
}

export function createMagatamaDragRotationDelta({ movementX, movementY }: DragRotationInput) {
  return {
    x: movementY * 0.006,
    y: movementX * 0.006,
    z: (movementX - movementY) * 0.0015
  };
}

export function createParticleThemeSettings(theme: Theme) {
  if (theme === 'light') {
    return {
      earthColor: 0x86ad6a,
      jadeColor: 0x4fc092,
      alpha: 0.58,
      sizeScale: 1.55
    };
  }

  return {
    earthColor: TONOKI_COLORS.haniwaClay,
    jadeColor: TONOKI_COLORS.hisuiJade,
    alpha: 0.78,
    sizeScale: 1
  };
}
