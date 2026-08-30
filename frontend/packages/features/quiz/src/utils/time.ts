export function elapsedMsSince(startMs: number): number {
  return Math.round(performance.now() - startMs);
}

export function nowMs(): number {
  return performance.now();
}
