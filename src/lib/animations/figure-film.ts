import type { Action } from 'svelte/action';
import { prefersReducedMotion } from './typography-reveal';

/**
 * A hall figure, alive.
 *
 * Some of the drawings exist as gently animated loops — the same character,
 * breathing. The problem is transparency: the drawings must sit on the page as
 * ink with no paper behind them, and video has no cheap alpha. Measured on the
 * source clip, a VP9 with a real alpha channel came to 3.2 MB against 366 kB
 * for the same frames opaque, and the figure did not move with the quality
 * setting — the alpha plane is the whole cost. Safari would then need a second
 * HEVC-with-alpha encode on top, which only Apple's encoder produces.
 *
 * So the alpha is derived here instead, on the GPU, from an ordinary opaque
 * H.264 file that every browser decodes in hardware: the ink's darkness
 * becomes the alpha and the colour is flat black, which is exactly how the
 * still `.webp` figures were built. One shader, one quad, no per-pixel
 * JavaScript — reading 410k pixels back into an array every frame would cost
 * more than the effect is worth.
 *
 * **The source must have pure-white paper.** The encode pushes a curve that
 * lands empty paper on exactly 255; at 250 the alpha would be 0.02 and the
 * whole video rectangle would show as a faint veil, which is the very bug the
 * still figures were rebuilt to remove.
 */

const VERTEX = `
attribute vec2 aPosition;
varying vec2 vTexCoord;
void main() {
  vTexCoord = vec2(aPosition.x * 0.5 + 0.5, 0.5 - aPosition.y * 0.5);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

/**
 * Ink darkness becomes opacity. Black is written premultiplied — with black
 * the premultiplied and straight forms are identical — so the canvas composites
 * correctly without asking for a non-premultiplied context.
 */
const FRAGMENT = `
precision mediump float;
uniform sampler2D uFrame;
varying vec2 vTexCoord;
void main() {
  vec3 c = texture2D(uFrame, vTexCoord).rgb;
  float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0 - luma);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

export interface FigureFilmOptions {
  /** Opaque, pure-white-papered loop. */
  src: string;
  /** How near the viewport the hall must be before the file is fetched. */
  rootMargin?: string;
}

export const figureFilm: Action<HTMLCanvasElement, FigureFilmOptions> = (node, options) => {
  // A watermark is not worth a video decoder to someone who asked for less
  // motion. The still underneath is already the whole drawing.
  if (!options?.src || prefersReducedMotion()) return {};

  const gl = node.getContext('webgl', { alpha: true, antialias: false, depth: false });
  if (!gl) return {};

  const program = gl.createProgram();
  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  if (!program || !vs || !fs) return {};

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return {};

  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPosition = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'none';
  video.crossOrigin = 'anonymous';
  // In the document, but nowhere: a detached video is unreliable as a play
  // target and as a texture source, and `display: none` stops some browsers
  // decoding it at all. A 1px transparent corner keeps it honest.
  video.setAttribute('aria-hidden', 'true');
  video.style.cssText =
    'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;left:0;top:0;';
  node.parentElement?.appendChild(video);

  let frame = 0;
  let sized = false;
  let disposed = false;

  const draw = () => {
    frame = requestAnimationFrame(draw);
    if (video.readyState < 2 || !video.videoWidth) return;

    if (!sized) {
      node.width = video.videoWidth;
      node.height = video.videoHeight;
      gl.viewport(0, 0, node.width, node.height);
      sized = true;
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // The still holds the frame until there is something to show, so the swap
    // never flashes an empty box.
    if (node.dataset.painting !== 'true') node.dataset.painting = 'true';
  };

  // Only fetch and decode while the hall is anywhere near the screen: three of
  // these running at once off-screen is a battery bill for nothing.
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (disposed) return;
      if (entry.isIntersecting) {
        if (!video.src) video.src = options.src;
        void video.play().catch(() => {});
        if (!frame) frame = requestAnimationFrame(draw);
      } else {
        video.pause();
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    { rootMargin: options.rootMargin ?? '25% 0px' }
  );

  observer.observe(node.closest('.section') ?? node);

  return {
    destroy() {
      disposed = true;
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.remove();
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    }
  };
};
