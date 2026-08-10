import type { H3Event } from "h3";

export interface TimingState {
  start: number;
  sections: Map<string, number>;
}

declare module "h3" {
  interface H3EventContext {
    timings?: TimingState;
  }
}

export interface Timings {
  time: <T>(name: string, fn: () => Promise<T> | T) => Promise<T>;
  mark: (name: string, duration: number) => void;
}

const disabled: Timings = {
  time: async (_name, fn) => await fn(),
  mark: () => {},
};

export const useTimings = (event: H3Event): Timings => {
  if (!useRuntimeConfig(event).debug.timings) {
    return disabled;
  }

  let state = event.context.timings;
  if (!state) {
    state = { start: performance.now(), sections: new Map() };
    event.context.timings = state;
  }

  const { sections } = state;
  const mark = (name: string, duration: number) => {
    // Accumulate, so a section measured more than once sums instead of resetting.
    sections.set(name, (sections.get(name) ?? 0) + duration);
  };

  return {
    mark,
    time: async (name, fn) => {
      const start = performance.now();

      try {
        return await fn();
      } finally {
        mark(name, performance.now() - start);
      }
    },
  };
};
