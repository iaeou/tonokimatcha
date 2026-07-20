/**
 * Jade bell — the sonic Magatama.
 *
 * Dragging the Magatama strikes soft bell tones from a D-minor pentatonic
 * ladder: the vertical pointer position picks the degree (higher on screen =
 * higher note), and strikes are throttled by both drag distance and time so a
 * slow ceremonial turn produces sparse single notes, never a glissando.
 *
 * Tone.js is imported dynamically inside `createJadeBell()` — nothing audio
 * touches the bundle until the visitor actually takes hold of the stone. The
 * first pointer gesture satisfies the browser autoplay policy for
 * `Tone.start()`.
 *
 * Tuning philosophy: quiet (-16 dB), long reverb tail (temple room), fast
 * attack with no sustain — struck jade, not a synth pad. Jaume: timbre knobs
 * are all in JADE_BELL_TUNING.synth / .reverb, replace at will.
 */

export const JADE_BELL_TUNING = {
  /** D-minor pentatonic, low-mid register: koto-adjacent, never shrill. */
  notes: ['D3', 'F3', 'G3', 'A3', 'C4', 'D4', 'F4'],
  volumeDb: -16,
  reverb: {
    decay: 5.5,             // seconds; temple-hall tail
    wet: 0.55,
  },
  synth: {
    harmonicity: 2.4,       // partial spacing; higher = glassier
    modulationIndex: 8,     // strike brightness
    attack: 0.004,
    decay: 0.6,
    release: 2.4,
  },
  /** Minimum accumulated drag distance (px) between strikes. */
  minDragPx: 46,
  /** Minimum time (ms) between strikes. */
  minIntervalMs: 130,
} as const;

/**
 * Map a normalized vertical position (0 = bottom of viewport, 1 = top) to a
 * note index. Clamped so wild pointer values stay on the ladder.
 */
export function pickNoteIndex(normalizedY: number, noteCount: number): number {
  const clamped = Math.min(1, Math.max(0, normalizedY));
  return Math.min(noteCount - 1, Math.floor(clamped * noteCount));
}

export interface StrikeGate {
  accumulatedPx: number;
  elapsedMs: number;
}

/** Both gates must open: enough drag travelled AND enough time passed. */
export function shouldStrike(
  { accumulatedPx, elapsedMs }: StrikeGate,
  tuning: { minDragPx: number; minIntervalMs: number } = JADE_BELL_TUNING
): boolean {
  return accumulatedPx >= tuning.minDragPx && elapsedMs >= tuning.minIntervalMs;
}

export interface JadeBell {
  /** Strike a note for a normalized vertical pointer position (0-1, 1 = top). */
  strike(normalizedY: number): void;
  dispose(): void;
}

export async function createJadeBell(): Promise<JadeBell> {
  const Tone = await import('tone');

  await Tone.start();

  const reverb = new Tone.Reverb({
    decay: JADE_BELL_TUNING.reverb.decay,
    wet: JADE_BELL_TUNING.reverb.wet
  }).toDestination();

  const volume = new Tone.Volume(JADE_BELL_TUNING.volumeDb).connect(reverb);

  const synth = new Tone.FMSynth({
    harmonicity: JADE_BELL_TUNING.synth.harmonicity,
    modulationIndex: JADE_BELL_TUNING.synth.modulationIndex,
    oscillator: { type: 'sine' },
    envelope: {
      attack: JADE_BELL_TUNING.synth.attack,
      decay: JADE_BELL_TUNING.synth.decay,
      sustain: 0,
      release: JADE_BELL_TUNING.synth.release
    },
    modulation: { type: 'sine' },
    modulationEnvelope: {
      attack: JADE_BELL_TUNING.synth.attack,
      decay: JADE_BELL_TUNING.synth.decay * 0.5,
      sustain: 0,
      release: JADE_BELL_TUNING.synth.release * 0.5
    }
  }).connect(volume);

  return {
    strike(normalizedY: number) {
      const note = JADE_BELL_TUNING.notes[pickNoteIndex(normalizedY, JADE_BELL_TUNING.notes.length)];
      synth.triggerAttackRelease(note, '8n');
    },
    dispose() {
      synth.dispose();
      volume.dispose();
      reverb.dispose();
    }
  };
}
