import { describe, expect, test } from 'vitest';
import {
  TONOKI_COLORS,
  createBloomOptions,
  createEnvironmentSettings,
  createGrainOptions,
  createMagatamaMaterialOptions,
  createMagatamaThemeMaterialOptions,
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
  test('uses a translucent mid-hisui jade so the bead reads as polished stone', () => {
    expect(createMagatamaMaterialOptions()).toMatchObject({
      color: 0x2e6b3e,
      opacity: 0.3,
      roughness: 0.2,
      metalness: 0,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      transmission: 0.5,
      thickness: 0.3,
      ior: 1.61,
      transparent: true
    });
  });

  test('drops attenuation and emissive in favor of the tuned stone-like body', () => {
    const opts = createMagatamaMaterialOptions();
    expect(opts.attenuationColor).toBeUndefined();
    expect(opts.attenuationDistance).toBeUndefined();
    expect(opts.emissive).toBeUndefined();
    expect(opts.emissiveIntensity).toBeUndefined();
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

describe('createEnvironmentSettings', () => {
  test('exposes a defensive copy of the HDRI environment tuning', () => {
    const settings = createEnvironmentSettings();

    expect(settings).toEqual({ intensity: 0.42, rotationY: 2.1 });
    expect(settings).not.toBe(createEnvironmentSettings());
  });
});

describe('createBloomOptions', () => {
  test('blooms only highlights above the cream-stage luminance with a soft wide halo', () => {
    expect(createBloomOptions()).toEqual({
      intensity: 0.75,
      luminanceThreshold: 0.62,
      luminanceSmoothing: 0.25,
      mipmapBlur: true,
      radius: 0.72
    });
  });
});

describe('createGrainOptions', () => {
  test('premultiplies subtle grain so transparent pixels stay clean', () => {
    expect(createGrainOptions()).toEqual({
      premultiply: true,
      opacity: 0.14
    });
  });
});

describe('createMagatamaThemeMaterialOptions', () => {
  test('light mode trades alpha for refraction: dense deeper jade with attenuation', () => {
    const opts = createMagatamaThemeMaterialOptions('light');

    expect(opts).toMatchObject({
      color: 0x256e42,
      opacity: 0.85,
      transmission: 0.7,
      thickness: 0.9,
      attenuationColor: 0x2e8b57,
      attenuationDistance: 1.4,
      transparent: true
    });
    // Shared surface character is inherited from the base stone.
    expect(opts.clearcoat).toBe(0.9);
    expect(opts.ior).toBe(1.61);
  });

  test('dark mode keeps the base translucent stone and resets attenuation', () => {
    const opts = createMagatamaThemeMaterialOptions('dark');

    expect(opts).toMatchObject({
      color: 0x2e6b3e,
      opacity: 0.3,
      transmission: 0.5,
      thickness: 0.3,
      attenuationColor: 0xffffff,
      attenuationDistance: Infinity,
      transparent: true
    });
  });
});

describe('createEnvironmentSettings theme awareness', () => {
  test('the light stage gets stronger reflections than the dark hall', () => {
    expect(createEnvironmentSettings('dark').intensity).toBeCloseTo(0.42);
    expect(createEnvironmentSettings('light').intensity).toBeCloseTo(0.58);
    expect(createEnvironmentSettings('light').rotationY).toBeCloseTo(2.1);
  });
});
