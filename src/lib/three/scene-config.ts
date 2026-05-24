import type { MeshPhysicalMaterialParameters, WebGLRendererParameters } from 'three';
import type { Theme } from '$lib/stores/theme';

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

export function createMagatamaMaterialOptions(): MeshPhysicalMaterialParameters {
  return {
    color: TONOKI_COLORS.hisuiJade,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    attenuationColor: TONOKI_COLORS.hisuiJade,
    attenuationDistance: 0.85,
    emissive: 0x0a3a2a,
    emissiveIntensity: 0.18,
    ior: 1.45,
    metalness: 0,
    opacity: 0.9,
    roughness: 0.1,
    thickness: 0.65,
    transmission: 0.9,
    transparent: true
  };
}

export function createParticleThemeSettings(theme: Theme) {
  if (theme === 'light') {
    return {
      earthColor: 0x4d7c3a,
      jadeColor: TONOKI_COLORS.hisuiJade,
      alpha: 0.92,
      sizeScale: 2.25
    };
  }

  return {
    earthColor: TONOKI_COLORS.haniwaClay,
    jadeColor: TONOKI_COLORS.hisuiJade,
    alpha: 0.78,
    sizeScale: 1
  };
}
