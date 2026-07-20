// All visual and animation tuning knobs for the magatama scene.
// Edit values here; changes propagate to geometry, material, particles, and animation.

export const MAGATAMA_TUNING = {

  // Shape
  // geometry.ts -> createMagatamaGeometry()
  geometry: {
    depth: 0.8,             // extrusion thickness
    bevelEnabled: true,
    bevelThickness: 0.16,
    bevelSize: 0.16,
    bevelOffset: 0,
    bevelSegments: 9,       // bevel quality; higher = rounder edge
    curveSegments: 96,      // silhouette smoothness; lower = faster
    steps: 2,               // extrusion subdivisions
  },

  // Surface
  // scene-config.ts -> createMagatamaMaterialOptions()
  material: {
    color: 0x2e6b3e,          // jade body color
    opacity: 0.3,                 // 0 = invisible, 1 = fully visible
    roughness: 0.2,             // 0 = mirror, 1 = matte
    metalness: 0,
    clearcoat: 0.9,             // surface gloss layer (0-1)
    clearcoatRoughness: 0.08,
    transmission: 0.5,          // 0 = opaque, 1 = full glass
    thickness: 0.3,             // light-absorption depth; lower = brighter
    ior: 1.61,                  // refractive index; glass ~= 1.5, diamond ~= 2.4
  },

  // HDRI-style environment (procedural RoomEnvironment via PMREM)
  // Scene.svelte -> scene.environment
  environment: {
    intensity: 0.42,          // scene.environmentIntensity; how much the env lights/refracts
    rotationY: 2.1,           // radians; rotates reflections around the bead
  },

  // Postprocessing (bloom + film grain)
  // scene-config.ts -> createBloomOptions() / createGrainOptions()
  // Scene.svelte -> EffectComposer
  postprocessing: {
    bloom: {
      intensity: 0.75,            // bloom strength
      luminanceThreshold: 0.62,   // only highlights above this glow
      luminanceSmoothing: 0.25,   // soft knee around the threshold
      mipmapBlur: true,           // wide, soft halo (vs tight glow)
      radius: 0.72,               // halo spread when mipmapBlur is on
    },
    grain: {
      premultiply: true,          // modulate noise by scene color (keeps empty areas clean)
      opacity: 0.14,              // film grain strength
    },
  },

  // Lighting
  // Scene.svelte -> ambientLight / keyLight
  lighting: {
    ambientColor: 0xf4efe4,     // ceremonial white
    ambientIntensity: 0.34,   // lowered when the HDRI env arrived (env now supplies fill light)
    keyLightColor: 0x00a86b,    // hisui jade
    keyLightIntensity: 2.2,
    keyLightX: 5,
    keyLightY: 5,
    keyLightZ: 5,
  },

  // Particle cloud
  // geometry.ts -> createLineageParticleGeometry()
  // Scene.svelte -> particles object
  particles: {
    count: 1100,                // particle count; geometry is rebuilt on change
    spread: 4.6,                // radial spread radius
    seed: 1500,                 // deterministic seed; change for a different layout
    sizeMin: 6,                 // px, smallest particle
    sizeMax: 18,                // px, largest particle
    opacity: 1,                 // 0 = invisible, 1 = fully visible (multiplied on top of theme alpha)
    positionY: -1.52,           // cloud Y offset below magatama
    rotationX: -0.12,           // cloud tilt in radians

    // Kofun constellation: particles migrate into the Daisenryō keyhole
    // silhouette while scrolling through The Lineage, then dissolve again.
    // geometry.ts -> createKofunConstellationPositions()
    kofun: {
      scale: 1.9,               // silhouette size in local particle space
      offsetY: 1.35,            // lifts the silhouette to counter the cloud's positionY
      jitter: 0.07,             // constellation looseness (fraction of scale)
      peak: 1,                  // max formation blend at the section center (0-1)
    },
  },

  // Particle colors - light theme
  // scene-config.ts -> createParticleThemeSettings('light')
  particlesLight: {
    earthColor: 0x86ad6a,
    jadeColor: 0x4fc092,
    alpha: 0.58,                // overall particle opacity
    sizeScale: 1.55,            // particle size multiplier
  },

  // Particle colors - dark theme
  // scene-config.ts -> createParticleThemeSettings('dark')
  particlesDark: {
    earthColor: 0x8b4513,       // haniwa clay
    jadeColor: 0x00a86b,        // hisui jade
    alpha: 0.78,
    sizeScale: 1,
  },

  // Float and rotation animation
  // Scene.svelte -> floatTween / render loop
  animation: {
    baseRotation: { x: -0.08, y: -0.28, z: -0.44 }, // resting orientation

    floatAmplitude: 0.2,          // Y units up/down
    floatDuration: 3.4,           // seconds per half-cycle

    particleRotationRate: 0.035,  // rad/s spin around Y
    scrollParticleRate: 0.8,      // extra rotation added at full scroll

    pointerParallaxX: 0.08,       // pointer tilt strength X axis
    pointerParallaxY: 0.12,       // pointer tilt strength Y axis

    dragSensitivityXY: 0.006,
    dragSensitivityZ: 0.0015,
  },

  // Responsive layout
  // Scene.svelte -> resize()
  layout: {
    scaleDesktop: 0.45,           // >760 px viewport width
    scaleTablet: 0.35,            // 620-760 px
    scaleMobile: 0.27,            // <620 px
    positionXDesktop: 1.65,
    positionXTablet: 1.65,
    positionXMobile: 0.95,
    positionYWide: 0.12,          // >620 px
    positionYNarrow: 0.26,        // <=620 px
    cameraZDesktop: 5.8,
    cameraZMobile: 7.2,
  },

} as const;
