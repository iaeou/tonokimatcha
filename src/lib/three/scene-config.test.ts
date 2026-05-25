import { describe, expect, test } from 'vitest';
import {
  TONOKI_COLORS,
  createMagatamaMaterialOptions,
  createMagatamaDragRotationDelta,
  createParticleThemeSettings,
  createRendererOptions
} from './scene-config';

describe('TONOKI_COLORS', () => {
  test('keeps the Hisui jade and Haniwa clay palette as numeric Three.js colors', () => {
    expect(TONOKI_COLORS.hisuiJade).toBe(0x00a86b);
    expect(TONOKI_COLORS.haniwaClay).toBe(0x8b4513);
    expect(TONOKI_COLORS.mossGreen).toBe(0x2e4d23);
  });
});

describe('createRendererOptions', () => {
  test('uses a transparent high-performance renderer against the bound canvas', () => {
    const canvas = {} as HTMLCanvasElement;

    expect(createRendererOptions(canvas)).toMatchObject({
      alpha: true,
      antialias: true,
      canvas,
      powerPreference: 'high-performance'
    });
  });
});

describe('createMagatamaMaterialOptions', () => {
  test('uses transmissive jade material settings for the ceremonial bead', () => {
    expect(createMagatamaMaterialOptions()).toMatchObject({
      color: TONOKI_COLORS.hisuiJade,
      transmission: 0.9,
      thickness: 0.65,
      roughness: 0.1,
      metalness: 0,
      clearcoat: 1
    });
  });

  test('uses attenuation properties as a jade-like subsurface scattering approximation', () => {
    expect(createMagatamaMaterialOptions()).toMatchObject({
      attenuationColor: TONOKI_COLORS.hisuiJade,
      attenuationDistance: 0.85
    });
  });
});

describe('createMagatamaDragRotationDelta', () => {
  test('maps a drag gesture into multi-axis rotation only', () => {
    expect(createMagatamaDragRotationDelta({ movementX: 20, movementY: -10 })).toEqual({
      x: -0.06,
      y: 0.12,
      z: 0.045
    });
  });
});

describe('createParticleThemeSettings', () => {
  test('uses a soft but visible particle field in light mode', () => {
    expect(createParticleThemeSettings('light')).toEqual({
      earthColor: 0x86ad6a,
      jadeColor: 0x4fc092,
      alpha: 0.58,
      sizeScale: 1.55
    });
  });

  test('keeps the darker earth-to-jade palette in dark mode', () => {
    expect(createParticleThemeSettings('dark')).toEqual({
      earthColor: 0x8b4513,
      jadeColor: 0x00a86b,
      alpha: 0.78,
      sizeScale: 1
    });
  });
});
