// Timeline <-> source-media time mapping, including speed curves.
import { speedCurves } from './presets.js';

function curvePoints(clip) {
  const id = clip.properties?.speedCurve;
  if (!id || id === 'standard') return null;
  const curve = speedCurves.find((c) => c.id === id);
  return curve ? curve.points : null;
}

// Instantaneous playback rate at a local timeline time (seconds from clip start)
export function speedAt(clip, localT) {
  const base = clip.properties?.speed || 1;
  const pts = curvePoints(clip);
  if (!pts) return base;
  const u = Math.max(0, Math.min(1, localT / Math.max(0.001, clip.duration)));
  const pos = u * (pts.length - 1);
  const i = Math.min(pts.length - 2, Math.floor(pos));
  const f = pos - i;
  return base * (pts[i] + (pts[i + 1] - pts[i]) * f);
}

// Seconds of source media consumed after `localT` seconds of timeline playback
export function sourceElapsed(clip, localT) {
  const base = clip.properties?.speed || 1;
  const pts = curvePoints(clip);
  const t = Math.max(0, Math.min(localT, clip.duration));
  if (!pts) return t * base;
  // Exact integral of the piecewise-linear speed curve
  const seg = clip.duration / (pts.length - 1);
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = i * seg;
    if (t <= a) break;
    const b = Math.min(t, a + seg);
    const va = pts[i];
    const slope = (pts[i + 1] - pts[i]) / seg;
    const vb = va + slope * (b - a);
    total += ((va + vb) / 2) * (b - a);
  }
  return total * base;
}

export function sourceTimeAt(clip, timelineT) {
  const local = timelineT - clip.startTime;
  const src = (clip.sourceOffset || 0) + sourceElapsed(clip, local);
  const max = clip.sourceDuration || Infinity;
  return Math.max(0, Math.min(src, max - 0.04));
}
