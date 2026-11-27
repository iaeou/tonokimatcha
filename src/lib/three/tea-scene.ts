import * as THREE from 'three';

// Image coordinates start at the top left, in the original art-directed crop.
const coordinates = `
  uniform vec2 cover;
  uniform float portrait, progress, clock, gust, cursor;
  vec4 projectPhoto(vec2 p, float depth) {
    vec2 clip = (p - .5) * vec2(2., -2.) * cover;
    return vec4(clip, 0., 1. - depth);
  }
  float releaseAt(vec2 p) {
    float crest = mix(.592, .68, portrait);
    float ripple = .047*sin(p.x*128. + p.y*42.) + .028*sin(p.y*261. - p.x*157.);
    float front = .10 + (p.y-crest)*mix(2.35,4.65,portrait) + ripple;
    return smoothstep(front-.055, front+.055, progress);
  }
`;
const masks = `
  uniform sampler2D photo;
  float powder(vec2 p, vec3 c) {
    float zone = step(mix(.46,.25,portrait),p.x)*step(mix(.56,.65,portrait),p.y);
    // The bamboo scoop is warmer than the powder, including where they touch.
    return zone*smoothstep(-.005,.045,c.g-c.r+.14*(c.g-c.b))
      *smoothstep(.022,.12,c.g-c.b);
  }
  float branch(vec2 p, vec3 c) {
    float bottom = mix(mix(.39,.215,smoothstep(.813,.832,p.x)),.30,portrait);
    return (1.-smoothstep(bottom-.014,bottom,p.y))
      *smoothstep(.025,.17,1.-min(c.r,min(c.g,c.b)));
  }
`;
const meshVertex = `
  ${coordinates}
  uniform float foliage;
  varying vec2 source;
  void main() {
    source = vec2(uv.x, 1.-uv.y);
    vec2 p = source;
    float flex = smoothstep(.0,mix(.36,.28,portrait),p.y);
    float reach = clamp(1.-p.x,0.,1.);
    float wave = sin(clock*1.28 + p.x*17. - p.y*7.) + .32*sin(clock*2.07+p.x*29.);
    float breeze = wave + gust*exp(-8.*abs(cursor-p.x))*2.4;
    float bend = foliage*(.12*reach + flex)*breeze;
    p += vec2(.009*bend,.003*bend);
    gl_Position = projectPhoto(p, .012*bend);
  }
`;
const meshFragment = `
  ${coordinates}
  ${masks}
  uniform float foliage;
  varying vec2 source;
  void main() {
    vec3 c = texture2D(photo,source).rgb;
    float leaf = branch(source,c);
    vec3 paper = texture2D(photo,vec2(.105 + .10*source.x,source.y)).rgb;
    if (foliage > .5) {
      if (leaf < .004) discard;
      // Recover the edge colour from the photograph's light backdrop.
      gl_FragColor = vec4(clamp((c-paper*(1.-leaf))/leaf,0.,1.),leaf);
    } else {
      float dust = powder(source,c)*releaseAt(source);
      gl_FragColor = vec4(mix(c,paper,max(smoothstep(0.,.12,leaf),dust)),1.);
    }
  }
`;
const dustVertex = `
  ${coordinates}
  uniform sampler2D photo;
  uniform float pixelScale;
  attribute vec3 seed;
  varying vec4 ink;
  void main() {
    vec2 p = position.xy;
    float start = releaseAt(p);
    float flight = start*max(0.,progress - (p.y-mix(.592,.68,portrait))*.95);
    vec2 drift = vec2((seed.x-.44)*.29, -.035-seed.y*.21);
    drift += .014*vec2(sin(clock*.52+seed.z*18.),cos(clock*.64+seed.x*27.));
    gl_Position = projectPhoto(p + flight*drift, flight*(seed.z-.45)*.14);
    gl_PointSize = clamp(pixelScale*(.65+seed.z*1.9)*(1.+flight*.35),1.,9.);
    ink = vec4(texture2D(photo,p).rgb,start*(.91-.48*flight));
  }
`;
const dustFragment = `
  varying vec4 ink;
  void main() {
    float r = length(gl_PointCoord-.5);
    gl_FragColor = vec4(ink.rgb,ink.a*(1.-smoothstep(.22,.5,r)));
  }
`;

export function mountTeaScene(canvas: HTMLCanvasElement, img: HTMLImageElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const texture = new THREE.Texture();
  texture.flipY = false;
  texture.minFilter = THREE.LinearFilter;
  const uniforms = {
    photo: { value: texture }, cover: { value: new THREE.Vector2(1,1) },
    portrait: { value: 0 }, clock: { value: 0 }, progress: { value: 0 },
    gust: { value: 0 }, cursor: { value: 0 }, pixelScale: { value: 1 }
  };
  const grid = new THREE.PlaneGeometry(1,1,100,72);
  const layers = [0,1].map(foliage => {
    const material = new THREE.ShaderMaterial({
      vertexShader: meshVertex, fragmentShader: meshFragment,
      uniforms: { ...uniforms, foliage: { value: foliage } },
      transparent: true, depthTest: false, depthWrite: false
    });
    const mesh = new THREE.Mesh(grid,material);
    mesh.renderOrder = foliage;
    mesh.frustumCulled = false;
    scene.add(mesh);
    return material;
  });
  const geometry = new THREE.BufferGeometry();
  const grains = new THREE.ShaderMaterial({
    uniforms, vertexShader: dustVertex, fragmentShader: dustFragment,
    transparent: true, depthTest: false, depthWrite: false
  });
  const cloud = new THREE.Points(geometry, grains);
  cloud.renderOrder = 2;
  cloud.frustumCulled = false;
  scene.add(cloud);
  let frame = 0;
  let activeSrc = '';
  let last = 0;
  let failed = false;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h || !img.naturalWidth) return;
    const scale = Math.max(w/img.naturalWidth,h/img.naturalHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
    renderer.setSize(w,h,false);
    uniforms.cover.value.set(img.naturalWidth*scale/w,img.naturalHeight*scale/h);
    uniforms.pixelScale.value = renderer.getPixelRatio()*Math.min(1.8,scale*1.65);
  }
  function sample() {
    if (!img.complete || !img.naturalWidth || activeSrc === img.currentSrc) return;
    const mobile = img.naturalWidth < img.naturalHeight;
    const sampler = document.createElement('canvas');
    sampler.width = img.naturalWidth;
    sampler.height = img.naturalHeight;
    const ctx = sampler.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img,0,0);
    const pixels = ctx.getImageData(0,0,sampler.width,sampler.height).data;
    const positions: number[] = [], seeds: number[] = [];
    let state = 73471;
    const rand = () => ((state = (Math.imul(1664525,state)+1013904223)>>>0)/4294967296);
    for (let i=0;i<(mobile ? 52000 : 82000);i++) {
      const x = (mobile ? .25 : .46) + rand()*(mobile ? .74 : .47);
      const y = (mobile ? .66 : .57) + rand()*(mobile ? .20 : .34);
      const index = 4*(Math.floor(y*sampler.height)*sampler.width+Math.floor(x*sampler.width));
      const [r,g,b] = [pixels[index],pixels[index+1],pixels[index+2]];
      if (g-b < 10 || g-r+.14*(g-b) < 3) continue;
      positions.push(x,y,0);
      seeds.push(rand(),rand(),rand());
    }
    geometry.dispose();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('seed',new THREE.Float32BufferAttribute(seeds,3));
    texture.dispose();
    texture.image = sampler;
    texture.needsUpdate = true;
    uniforms.portrait.value = Number(mobile);
    activeSrc = img.currentSrc;
    resize();
  }
  function draw(now: number) {
    frame = 0;
    if (failed || motion.matches || document.hidden || window.scrollY >= window.innerHeight) {
      canvas.style.visibility = 'hidden';
      last = 0;
      return;
    }
    sample();
    if (!activeSrc) return;
    const dt = last ? Math.min((now-last)/1000,.1) : 0;
    last = now;
    uniforms.clock.value += dt;
    uniforms.gust.value *= Math.exp(-2.4*dt);
    uniforms.progress.value = THREE.MathUtils.clamp(window.scrollY/(window.innerHeight*.65),0,1);
    renderer.render(scene,camera);
    canvas.style.visibility = 'visible';
    wake();
  }
  function wake() { if (!frame && !failed) frame = requestAnimationFrame(draw); }
  function pointer(e: PointerEvent) {
    const y = (e.clientY/canvas.clientHeight-.5)/uniforms.cover.value.y+.5;
    const x = (e.clientX/canvas.clientWidth-.5)/uniforms.cover.value.x+.5;
    if (e.pointerType !== 'mouse' || y > (uniforms.portrait.value ? .30 : .37) || x < .32) return;
    uniforms.cursor.value = x;
    uniforms.gust.value = Math.min(1,uniforms.gust.value+.09);
  }
  function lost() { failed = true; canvas.style.visibility = 'hidden'; }
  const observer = new ResizeObserver(() => { resize(); wake(); });
  observer.observe(canvas);
  img.addEventListener('load',wake);
  window.addEventListener('scroll',wake,{ passive:true });
  window.addEventListener('pointermove',pointer,{ passive:true });
  document.addEventListener('visibilitychange',wake);
  motion.addEventListener('change',wake);
  canvas.addEventListener('webglcontextlost',lost);
  wake();
  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    img.removeEventListener('load',wake);
    window.removeEventListener('scroll',wake);
    window.removeEventListener('pointermove',pointer);
    document.removeEventListener('visibilitychange',wake);
    motion.removeEventListener('change',wake);
    canvas.removeEventListener('webglcontextlost',lost);
    grid.dispose(); geometry.dispose(); texture.dispose(); grains.dispose();
    layers.forEach(layer => layer.dispose());
    renderer.dispose();
  };
}
