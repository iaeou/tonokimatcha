<script lang="ts">
  import { browser } from '$app/environment';
  import { onDestroy, onMount } from 'svelte';

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
          Mesh,
          MeshPhysicalMaterial,
          NormalBlending,
          PerspectiveCamera,
          Points,
          Scene,
          SRGBColorSpace,
          ShaderMaterial,
          Vector2,
          WebGLRenderer
        },
        { default: gsap },
        { ScrollTrigger },
        { createLineageParticleGeometry, createMagatamaGeometry },
        {
          TONOKI_COLORS,
          createMagatamaMaterialOptions,
          createParticleThemeSettings,
          createRendererOptions
        },
        { default: vortexVert },
        { default: vortexFrag }
      ] = await Promise.all([
        import('three'),
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

      const magatamaMaterial = new MeshPhysicalMaterial(createMagatamaMaterialOptions());
      const magatama = new Mesh(createMagatamaGeometry(), magatamaMaterial);

      magatama.rotation.set(-0.08, -0.28, -0.44);
      scene.add(magatama);

      const particleUniforms = {
        uTime: { value: 0 },
        uProgress: { value: 0 },
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
        createLineageParticleGeometry({ count: 1100, spread: 4.6, seed: 1500 }),
        particleMaterial
      );

      particles.position.y = -1.52;
      particles.rotation.x = -0.12;
      scene.add(particles);

      const syncParticleTheme = () => {
        const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
        const settings = createParticleThemeSettings(theme);

        particleUniforms.uEarthColor.value.set(settings.earthColor);
        particleUniforms.uJadeColor.value.set(settings.jadeColor);
        particleUniforms.uAlpha.value = settings.alpha;
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

      const ambientLight = new AmbientLight(TONOKI_COLORS.ceremonialWhite, 0.52);
      const keyLight = new DirectionalLight(TONOKI_COLORS.hisuiJade, 2.2);
      keyLight.position.set(5, 5, 5);
      scene.add(ambientLight, keyLight);

      const pointer = new Vector2(0, 0);
      let sceneDestroyed = false;
      let frameId = 0;
      let scrollProgress = 0;

      const resize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.position.set(0, 0.12, width > 760 ? 5.8 : 7.2);
        magatama.position.x = width > 760 ? 1.25 : width > 620 ? 1.65 : 0.95;
        magatama.position.y = width > 620 ? 0.12 : 0.26;
        magatama.scale.setScalar(width > 760 ? 0.92 : width > 620 ? 0.58 : 0.44);
        camera.updateProjectionMatrix();
      };

      const handlePointerMove = (event: PointerEvent) => {
        pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
        pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
      };

      const floatTween = gsap.to(magatama.position, {
        y: '+=0.2',
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      const scrollTween = gsap.to(magatama.rotation, {
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
          }
        }
      });

      const render = () => {
        const time = performance.now() * 0.001;
        particleUniforms.uTime.value = time;

        magatama.rotation.x += pointer.y * 0.0025;
        magatama.rotation.y += pointer.x * 0.004;
        particles.rotation.y = time * 0.035 + scrollProgress * 0.8;

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(render);
      };

      resize();
      window.addEventListener('resize', resize);
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
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
        themeObserver.disconnect();
        magatama.geometry.dispose();
        magatamaMaterial.dispose();
        particles.geometry.dispose();
        particleMaterial.dispose();
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
