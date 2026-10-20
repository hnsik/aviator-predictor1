import type { Round } from '../types';

/** Синтетический генератор для демо-режима. Не воспроизводит и не имитирует реальную игру. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const synth = (u: number) => {
  const m = Math.floor((100 * 0.97) / Math.max(1 - u, 0.0005)) / 100;
  return Math.min(Math.max(m, 1), 1000);
};

export function randomDemoMultiplier(): number {
  return synth(Math.random());
}

export function generateDemoRounds(count: number, seed = 20261020): Round[] {
  const rnd = mulberry32(seed);
  const now = Date.now();
  const startId = 48200;
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    multiplier: synth(rnd()),
    ts: now - (count - i) * 35_000,
  }));
}
