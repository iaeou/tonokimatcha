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

  // Illustrated Magatama, built from the drawn brand logo the header carries
  // (static/matchaTonoki-logo.svg -> magatama-icon-data.ts). This is the ACTIVE
  // look as of 2026-08-25: the giant bead is now the same character as the
  // icon. Set `enabled: false` to fall back to the faceted low-poly stone.
  // geometry.ts -> createMagatamaIconGeometry()
  // scene-config.ts -> createIconMaterialOptions()
  icon: {
    enabled: true,
    // Thin on purpose now that `dome` below carries the volume. Left at the
    // old 0.42/0.2 the stone kept a straight extruded wall around its rim and
    // read as a domed lid on a can; pared back, the silhouette is a near-edge
    // and the swell alone decides the thickness, so the section is a lens.
    depth: 0.08,                // slab thickness before the bevel
    bevelThickness: 0.04,       // how far the rounded edge bulges in z
    bevelSegments: 8,           // roundness of that edge
    paintGap: 0.004,            // z-step between stacked paint layers
    roughness: 0.62,            // matte enamel, not plastic
    metalness: 0.05,
    // Low on purpose. The ink is only ~2.5% albedo, so at the jade key's 2.2
    // any real environment sheen lifts the outline to mid-grey and the drawing
    // loses its black line. The greens are bright enough not to miss it.
    envMapIntensity: 0.25,
    scaleBoost: 1,              // presence relative to the jade bead

    // Drop volume. Without this the bead is a 0.82-thick slab across 3.4 of
    // width — a sticker on a plate. Each face is domed outward by distance
    // from the silhouette, and the paint is displaced onto the same surface,
    // so the artwork curves with the stone instead of floating on a plane.
    //
    // `reach` being wide is what makes it read as a drop rather than a pill:
    // thickness follows how far a point is from the outline, so the fat body
    // swells to the full bulge while the tail, which is never more than ~0.3
    // across, stays slim on its own.
    // geometry.ts -> domeHeight() / createMagatamaIconGeometry()
    dome: {
      enabled: true,
      bulge: 0.55,              // how far each face lifts at its fullest
      reach: 0.85,              // distance from the outline over which it rises
      maxEdge: 0.18,            // triangles longer than this are split first
      maxPasses: 5,             // ceiling on that refinement
    },

    // The rim's colour. The bake left the slab bare for 0.045 around the
    // silhouette and called that margin the outline — which worked when the
    // stone was a flat card. Domed, that same 0.045 of drawing becomes the
    // whole shoulder of the lens, and the bead wore it as a dark tyre.
    //
    // So the shoulder now takes the colour of whichever paint it runs into,
    // and the ink keeps only `width` at the very edge: a drawn line again
    // rather than a band. `fade` is the blend out of it, wide enough not to
    // stair-step and narrow enough to stay a line.
    // geometry.ts -> paintIconRim()
    rim: {
      inkWidth: 0.01,           // how far the ink line reaches in from the edge
      inkFade: 0.026,           // blend from ink into the neighbouring paint
      // How much of the ink actually lands at that edge. At 1 the rim is the
      // full near-black line, which at this size read as a drawn border round
      // a small object; at 0.3 the edge is the paint's own green with just
      // enough shadow in it to keep the silhouette from dissolving.
      inkStrength: 0.3,
    },
  },

  // Farewell — the bead withdraws before the closing hall.
  //
  // The closing band is where the visitor is asked for something, and the
  // stone shouldn't be hovering over that request. It dissolves during the
  // approach and is fully gone by the time the band starts to appear: the fade
  // both begins and ends while `trigger` is still below the fold. (It was
  // `#guardian` while that ask was a full hall of its own.)
  // scene-config.ts -> createFarewellSettings() / computeFarewellOpacity()
  // Scene.svelte -> farewell ScrollTrigger + render loop
  farewell: {
    enabled: true,
    trigger: '#request',        // the closing band, last on the page
    start: 'top bottom+=70%',   // begins ~0.7 viewport before the hall arrives
    end: 'top bottom+=5%',      // fully transparent just before it enters
    hideBelow: 0.02,            // opacity under this -> mesh.visible = false
  },

  // Faceted low-poly Magatama (baked from texture.svg). Superseded by `icon`
  // above but kept selectable; the jade `material`/`materialLight`/
  // `materialDark` feed the unused smooth path. Vertex colors come from the artwork, so the
  // material is a plain flat-shaded standard surface — matte stone with a
  // touch of sheen from the HDRI. Same for both themes (the greens read on
  // cream and ink alike).
  // scene-config.ts -> createLowPolyMaterialOptions()
  // Scene.svelte -> magatama mesh
  lowPoly: {
    enabled: true,              // false = fall back to the smooth jade bead
    roughness: 0.62,            // matte faceted stone
    metalness: 0.05,
    flatShading: true,          // crisp per-facet normals (the low-poly look)
    envMapIntensity: 0.6,       // how much the HDRI sheens the facets (lower = darks stay dark)
    edgeDarken: 0.62,           // rim/edge color multiplier (baked into data)
    scaleBoost: 1.12,           // slightly larger than the jade bead to match presence
  },

  // Theme-specific material overrides, merged over `material` and applied by
  // the theme observer in Scene.svelte. In the dark hall the cream page is
  // absent, so alpha translucency reads as deep stone; on the light stage the
  // same alpha dilutes into milk, so light mode trades alpha for refraction:
  // near-opaque body, high transmission, and jade attenuation for color depth.
  // scene-config.ts -> createMagatamaThemeMaterialOptions()
  materialLight: {
    color: 0x256e42,            // deeper, chroma-rich jade against the cream stage
    opacity: 0.85,
    transmission: 0.7,
    thickness: 0.9,
    attenuationColor: 0x2e8b57, // light absorbed toward sea-jade inside the stone
    attenuationDistance: 1.4,
  },
  materialDark: {
    // The dark hall keeps the base translucent stone; attenuation is reset to
    // the physical defaults so toggling light -> dark fully round-trips.
    attenuationColor: 0xffffff,
    attenuationDistance: Infinity,
  },

  // HDRI-style environment (procedural RoomEnvironment via PMREM)
  // Scene.svelte -> scene.environment
  environment: {
    intensity: 0.42,          // dark theme: scene.environmentIntensity
    intensityLight: 0.58,     // light theme: wet reflections must read on cream
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
    // Pointer wind: particles part around the cursor and settle back.
    // vortex.vert -> uWindCenter/uWindRadius/uWindStrength
    wind: {
      radius: 1.35,             // influence radius in local particle space
      strength: 0.6,            // max displacement at the cursor
      damping: 0.08,            // per-frame lerp of the wind center
    },

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

    // Scroll sway. This used to be a full turn — y ran to 2π and x to π/2 —
    // which spent the middle of the page showing the stone's back and its
    // edge. The drawing is on the front, so the turn is now a sway: it leans
    // one way through the first half and back through the second, never far
    // enough for the face to look away. Radians either side of rest.
    // Scene.svelte -> scrollTween
    scrollSway: {
      yaw: 0.5,                   // ~29° left and right
      pitch: 0.16,                // ~9° up and down
    },

    floatAmplitude: 0.2,          // Y units up/down
    floatDuration: 3.4,           // seconds per half-cycle

    particleRotationRate: 0.035,  // rad/s spin around Y
    scrollParticleRate: 0.8,      // extra rotation added at full scroll

    pointerParallaxX: 0.08,       // pointer tilt strength X axis
    pointerParallaxY: 0.12,       // pointer tilt strength Y axis

    dragSensitivityXY: 0.006,
    dragSensitivityZ: 0.0015,

    // Camera dolly: the camera drifts along createCameraPath() with scroll,
    // turning the Magatama into an orbited exhibit instead of a static prop.
    // Offsets are relative to the responsive base position from resize().
    cameraDolly: {
      strength: 1,              // 0 = static camera, 1 = full path amplitude
      damping: 0.055,           // per-frame lerp toward the target offset
    },
  },

  // Scroll-velocity reactivity: fast scrolling briefly heightens the frame
  // (more bloom, more grain, larger particles); stillness settles it.
  // Scene.svelte -> render loop
  velocity: {
    normalize: 2600,            // |px/s| that counts as "fast" (maps to 1)
    decay: 0.93,                // per-frame decay of the smoothed impulse
    bloomBoost: 0.55,           // added to bloom intensity at full impulse
    grainBoost: 0.1,            // added to grain opacity at full impulse
    particleBoost: 0.4,         // extra particle size at full impulse
  },

  // Responsive layout
  // Scene.svelte -> resize()
  layout: {
    // Where the stone sits in frame. The camera is 45° at z 5.8, so the plane
    // at z 0 shows ~4.8 units of height and that times the aspect of width —
    // roughly 9.9 x 4.8 on a wide desktop. Positions below are in those units,
    // so x 2.75 lands the bead about four fifths across and y -1.05 about
    // seven tenths down: low and to the right, out of the copy's way.
    scaleDesktop: 0.24,           // >760 px viewport width
    scaleTablet: 0.2,             // 620-760 px
    scaleMobile: 0.16,            // <620 px
    positionXDesktop: 2.75,
    positionXTablet: 1.95,
    // Mobile is the tight one: at z 7.2 and a phone's aspect the frame is only
    // ~2.7 wide, so there is barely a unit of room either side of centre.
    positionXMobile: 0.9,
    positionYWide: -1.05,         // >620 px
    positionYNarrow: -1.45,       // <=620 px
    // Breathing room kept between the stone and the right edge when the frame
    // is too narrow to honour the x above, as a fraction of the half-width.
    // Scene.svelte -> resize()
    edgeInset: 0.04,
    cameraZDesktop: 5.8,
    cameraZMobile: 7.2,
  },

} as const;
