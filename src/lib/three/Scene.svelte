<script lang="ts">
  import { browser } from '$app/environment';
  import { onDestroy, onMount } from 'svelte';
  import { MAGATAMA_TUNING } from './magatama-tuning';
  // Pure gate logic only — Tone.js itself stays behind a dynamic import.
  import { shouldStrike } from '$lib/audio/jade-bell';

  let container: HTMLDivElement;
  let canvas: HTMLCanvasElement;

  let destroyScene = () => {};

  onMount(() => {
    if (!browser) return;

    let disposed = false;

    const initialize = async () => {
      const [
        {
          AdditiveBlending,
          AmbientLight,
          Color,
          DirectionalLight,
          HalfFloatType,
          Mesh,
          MeshPhysicalMaterial,
          NormalBlending,
          PMREMGenerator,
          PerspectiveCamera,
          Plane,
          Points,
          Raycaster,
          Scene,
          SRGBColorSpace,
          ShaderMaterial,
          Vector2,
          Vector3,
          WebGLRenderer
        },
        { RoomEnvironment },
        { BloomEffect, EffectComposer, EffectPass, NoiseEffect, RenderPass },
        { default: gsap },
        { ScrollTrigger },
        { createCameraPath, createLineageParticleGeometry, createMagatamaGeometry },
        {
          TONOKI_COLORS,
          createBloomOptions,
          createEnvironmentSettings,
          createGrainOptions,
          createMagatamaDragRotationDelta,
          createMagatamaMaterialOptions,
          createParticleThemeSettings,
          createRendererOptions
        },
        { default: vortexVert },
        { default: vortexFrag }
      ] = await Promise.all([
        import('three'),
        import('three/examples/jsm/environments/RoomEnvironment.js'),
        import('postprocessing'),
        import('gsap'),
        import('gsap/dist/ScrollTrigger'),
        import('./geometry'),
        import('./scene-config'),
        import('./shaders/vortex.vert?raw'),
        import('./shaders/vortex.frag?raw')
      ]);

      if (disposed) return;

      gsap.registerPlugin(ScrollTrigger);

      const scene = new Scene();
      const camera = new PerspectiveCamera(45, 1, 0.1, 1000);
      const renderer = new WebGLRenderer(createRendererOptions(canvas));

      renderer.setClearColor(TONOKI_COLORS.inkVoid, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = SRGBColorSpace;

      // Procedural HDRI: gives transmission/clearcoat something real to refract.
      const environmentSettings = createEnvironmentSettings();
      const pmremGenerator = new PMREMGenerator(renderer);
      const roomEnvironment = new RoomEnvironment();
      const environmentTexture = pmremGenerator.fromScene(roomEnvironment, 0.04).texture;

      scene.environment = environmentTexture;
      scene.environmentIntensity = environmentSettings.intensity;
      scene.environmentRotation.y = environmentSettings.rotationY;
      roomEnvironment.dispose();
      pmremGenerator.dispose();

      // Postprocessing: bloom halo on jade highlights + fine film grain.
      const grainOptions = createGrainOptions();
      const bloomBaseIntensity = createBloomOptions().intensity;
      const bloomEffect = new BloomEffect(createBloomOptions());
      const grainEffect = new NoiseEffect({ premultiply: grainOptions.premultiply });

      grainEffect.blendMode.opacity.value = grainOptions.opacity;

      const composer = new EffectComposer(renderer, { frameBufferType: HalfFloatType });
      const renderPass = new RenderPass(scene, camera);
      const effectPass = new EffectPass(camera, bloomEffect, grainEffect);

      composer.addPass(renderPass);
      composer.addPass(effectPass);

      const magatamaMaterial = new MeshPhysicalMaterial(createMagatamaMaterialOptions());
      const magatama = new Mesh(createMagatamaGeometry(), magatamaMaterial);

      magatama.rotation.set(MAGATAMA_TUNING.animation.baseRotation.x, MAGATAMA_TUNING.animation.baseRotation.y, MAGATAMA_TUNING.animation.baseRotation.z);
      scene.add(magatama);

      const particleUniforms = {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uKofunProgress: { value: 0 },
        uKofunCancelY: { value: 0 },
        uVelocityBoost: { value: 0 },
        uWindCenter: { value: new Vector3(0, 0, 99) },
        uWindRadius: { value: MAGATAMA_TUNING.particles.wind.radius },
        uWindStrength: { value: MAGATAMA_TUNING.particles.wind.strength },
        uSizeScale: { value: 1 },
        uEarthColor: { value: new Color() },
        uJadeColor: { value: new Color() },
        uAlpha: { value: 1 }
      };

      const particleMaterial = new ShaderMaterial({
        uniforms: particleUniforms,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        vertexShader: vortexVert,
        fragmentShader: vortexFrag
      });

      const particles = new Points(
        createLineageParticleGeometry(MAGATAMA_TUNING.particles),
        particleMaterial
      );

      particles.position.y = MAGATAMA_TUNING.particles.positionY;
      particles.rotation.x = MAGATAMA_TUNING.particles.rotationX;
      scene.add(particles);

      const syncParticleTheme = () => {
        const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
        const settings = createParticleThemeSettings(theme);

        particleUniforms.uEarthColor.value.set(settings.earthColor);
        particleUniforms.uJadeColor.value.set(settings.jadeColor);
        particleUniforms.uAlpha.value = settings.alpha * MAGATAMA_TUNING.particles.opacity;
        particleUniforms.uSizeScale.value = settings.sizeScale;
        particleMaterial.blending = theme === 'light' ? NormalBlending : AdditiveBlending;
        particleMaterial.needsUpdate = true;
      };

      const themeObserver = new MutationObserver(syncParticleTheme);
      syncParticleTheme();
      themeObserver.observe(document.documentElement, {
        attributeFilter: ['data-theme'],
        attributes: true
      });

      const ambientLight = new AmbientLight(MAGATAMA_TUNING.lighting.ambientColor, MAGATAMA_TUNING.lighting.ambientIntensity);
      const keyLight = new DirectionalLight(MAGATAMA_TUNING.lighting.keyLightColor, MAGATAMA_TUNING.lighting.keyLightIntensity);
      keyLight.position.set(MAGATAMA_TUNING.lighting.keyLightX, MAGATAMA_TUNING.lighting.keyLightY, MAGATAMA_TUNING.lighting.keyLightZ);
      scene.add(ambientLight, keyLight);

      const pointer = new Vector2(0, 0);
      const dragPointer = new Vector2(0, 0);
      const raycaster = new Raycaster();

      // Camera dolly along the ceremonial path + pointer wind + velocity glow.
      const cameraPath = createCameraPath();
      const cameraPathOrigin = cameraPath.getPoint(0);
      const cameraBase = new Vector3();
      const cameraTarget = new Vector3();
      const pathPoint = new Vector3();
      const windNDC = new Vector2(0, 0);
      const windRaycaster = new Raycaster();
      const windPlane = new Plane(new Vector3(0, 0, 1), 0);
      const windWorld = new Vector3();
      const windLocal = new Vector3();
      let velocityImpulse = 0;
      const baseRotation = { ...MAGATAMA_TUNING.animation.baseRotation };
      const scrollRotation = { ...baseRotation };
      const dragRotation = { x: 0, y: 0, z: 0 };
      let sceneDestroyed = false;
      let frameId = 0;
      let scrollProgress = 0;
      let isDraggingMagatama = false;
      let lastDragX = 0;
      let lastDragY = 0;

      // Sonic Magatama: dragging the stone strikes soft jade-bell tones.
      // Loaded lazily on the first grab; the gesture unlocks the AudioContext.
      let jadeBell: import('$lib/audio/jade-bell').JadeBell | null = null;
      let jadeBellLoading = false;
      let dragDistancePx = 0;
      let lastStrikeAt = 0;

      const ensureJadeBell = async () => {
        if (jadeBell || jadeBellLoading) return;
        jadeBellLoading = true;
        try {
          const { createJadeBell } = await import('$lib/audio/jade-bell');
          const bell = await createJadeBell();
          if (sceneDestroyed) {
            bell.dispose();
            return;
          }
          jadeBell = bell;
        } catch {
          // Audio is an ornament: if the context is blocked, stay silent.
        } finally {
          jadeBellLoading = false;
        }
      };

      const resize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        renderer.setSize(width, height, false);
        composer.setSize(width, height, false);
        camera.aspect = width / height;
        cameraBase.set(0, 0.12, width > 760 ? MAGATAMA_TUNING.layout.cameraZDesktop : MAGATAMA_TUNING.layout.cameraZMobile);
        camera.position.copy(cameraBase);
        magatama.position.x = width > 760 ? MAGATAMA_TUNING.layout.positionXDesktop : width > 620 ? MAGATAMA_TUNING.layout.positionXTablet : MAGATAMA_TUNING.layout.positionXMobile;
        magatama.position.y = width > 620 ? MAGATAMA_TUNING.layout.positionYWide : MAGATAMA_TUNING.layout.positionYNarrow;
        magatama.scale.setScalar(width > 760 ? MAGATAMA_TUNING.layout.scaleDesktop : width > 620 ? MAGATAMA_TUNING.layout.scaleTablet : MAGATAMA_TUNING.layout.scaleMobile);
        camera.updateProjectionMatrix();
      };

      const handlePointerMove = (event: PointerEvent) => {
        pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
        pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
      };

      const syncDragPointer = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        dragPointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        dragPointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      };

      const targetAllowsDrag = (target: EventTarget | null) =>
        target instanceof Element && !target.closest('a, button, input, textarea, select, label');

      const handlePointerDown = (event: PointerEvent) => {
        if (!targetAllowsDrag(event.target)) return;

        syncDragPointer(event);
        raycaster.setFromCamera(dragPointer, camera);

        if (raycaster.intersectObject(magatama, false).length === 0) return;

        isDraggingMagatama = true;
        lastDragX = event.clientX;
        lastDragY = event.clientY;
        dragDistancePx = 0;
        void ensureJadeBell();
        document.documentElement.classList.add('is-rotating-magatama');
        event.preventDefault();
      };

      const handlePointerDrag = (event: PointerEvent) => {
        if (!isDraggingMagatama) return;

        const delta = createMagatamaDragRotationDelta({
          movementX: event.clientX - lastDragX,
          movementY: event.clientY - lastDragY
        });

        dragRotation.x += delta.x;
        dragRotation.y += delta.y;
        dragRotation.z += delta.z;

        if (jadeBell) {
          dragDistancePx +=
            Math.abs(event.clientX - lastDragX) + Math.abs(event.clientY - lastDragY);
          const now = performance.now();
          if (shouldStrike({ accumulatedPx: dragDistancePx, elapsedMs: now - lastStrikeAt })) {
            jadeBell.strike(1 - event.clientY / window.innerHeight);
            dragDistancePx = 0;
            lastStrikeAt = now;
          }
        }

        lastDragX = event.clientX;
        lastDragY = event.clientY;
        event.preventDefault();
      };

      const endDrag = () => {
        isDraggingMagatama = false;
        document.documentElement.classList.remove('is-rotating-magatama');
      };

      const floatTween = gsap.to(magatama.position, {
        y: `+=${MAGATAMA_TUNING.animation.floatAmplitude}`,
        duration: MAGATAMA_TUNING.animation.floatDuration,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      const scrollTween = gsap.to(scrollRotation, {
        x: Math.PI / 2,
        y: Math.PI * 2,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          onUpdate: (self) => {
            scrollProgress = self.progress;
            const impulse = Math.min(
              Math.abs(self.getVelocity()) / MAGATAMA_TUNING.velocity.normalize,
              1
            );
            velocityImpulse = Math.max(velocityImpulse, impulse);
          }
        }
      });

      const vortexTween = gsap.to(particleMaterial.uniforms.uProgress, {
        value: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.heritage-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            scrollProgress = Math.max(scrollProgress, self.progress);
            // Keyhole constellation forms at the heart of The Lineage and
            // dissolves on the way out: sin() peaks mid-section.
            particleUniforms.uKofunProgress.value =
              Math.sin(self.progress * Math.PI) * MAGATAMA_TUNING.particles.kofun.peak;
          }
        }
      });

      const render = () => {
        const time = performance.now() * 0.001;
        particleUniforms.uTime.value = time;

        magatama.rotation.set(
          scrollRotation.x + pointer.y * MAGATAMA_TUNING.animation.pointerParallaxX + dragRotation.x,
          scrollRotation.y + pointer.x * MAGATAMA_TUNING.animation.pointerParallaxY + dragRotation.y,
          scrollRotation.z + dragRotation.z
        );
        particles.rotation.y = time * MAGATAMA_TUNING.animation.particleRotationRate + scrollProgress * MAGATAMA_TUNING.animation.scrollParticleRate;
        // Let the formed Kofun silhouette face the visitor regardless of the
        // cloud's ambient spin: the shader counter-rotates the targets.
        particleUniforms.uKofunCancelY.value = particles.rotation.y;

        // Camera dolly: drift along the ceremonial path with scroll, damped.
        cameraPath.getPoint(Math.min(Math.max(scrollProgress, 0), 1), pathPoint);
        cameraTarget
          .copy(pathPoint)
          .sub(cameraPathOrigin)
          .multiplyScalar(MAGATAMA_TUNING.animation.cameraDolly.strength)
          .add(cameraBase);
        camera.position.lerp(cameraTarget, MAGATAMA_TUNING.animation.cameraDolly.damping);

        // Pointer wind: project the cursor onto the particle plane (local).
        windNDC.set(pointer.x, -pointer.y);
        windRaycaster.setFromCamera(windNDC, camera);
        if (windRaycaster.ray.intersectPlane(windPlane, windWorld)) {
          particles.updateMatrixWorld();
          windLocal.copy(windWorld);
          particles.worldToLocal(windLocal);
          particleUniforms.uWindCenter.value.lerp(
            windLocal,
            MAGATAMA_TUNING.particles.wind.damping
          );
        }

        // Scroll-velocity reactivity: heightened frame while moving fast.
        velocityImpulse *= MAGATAMA_TUNING.velocity.decay;
        bloomEffect.intensity =
          bloomBaseIntensity + velocityImpulse * MAGATAMA_TUNING.velocity.bloomBoost;
        grainEffect.blendMode.opacity.value =
          grainOptions.opacity + velocityImpulse * MAGATAMA_TUNING.velocity.grainBoost;
        particleUniforms.uVelocityBoost.value =
          velocityImpulse * MAGATAMA_TUNING.velocity.particleBoost;

        composer.render();
        frameId = requestAnimationFrame(render);
      };

      resize();
      window.addEventListener('resize', resize);
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handlePointerDrag);
      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', endDrag);
      frameId = requestAnimationFrame(render);

      destroyScene = () => {
        if (sceneDestroyed) return;

        sceneDestroyed = true;
        cancelAnimationFrame(frameId);
        floatTween.kill();
        scrollTween.kill();
        vortexTween.kill();
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        window.removeEventListener('resize', resize);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerdown', handlePointerDown);
        window.removeEventListener('pointermove', handlePointerDrag);
        window.removeEventListener('pointerup', endDrag);
        window.removeEventListener('pointercancel', endDrag);
        document.documentElement.classList.remove('is-rotating-magatama');
        themeObserver.disconnect();
        magatama.geometry.dispose();
        magatamaMaterial.dispose();
        particles.geometry.dispose();
        particleMaterial.dispose();
        composer.dispose();
        environmentTexture.dispose();
        jadeBell?.dispose();
        jadeBell = null;
        renderer.dispose();
      };
    };

    initialize();

    return () => {
      disposed = true;
      destroyScene();
    };
  });

  onDestroy(() => {
    if (browser) destroyScene();
  });
</script>

<div class="webgl-stage" bind:this={container} aria-hidden="true">
  <canvas class="webgl-canvas" bind:this={canvas}></canvas>
</div>
