// Cross-platform timer layer for Node.js, Deno, and Bun with TypeScript compatibility

// Named export for timerLayer object, intended for direct import usage
export const timerLayer = {
  set(callback: () => void, delay: number): any {
    return (typeof Deno !== 'undefined' || typeof Bun !== 'undefined')
      ? globalThis.setTimeout(callback, delay)
      : global.setTimeout(callback, delay);
  },

  clear(timer: any): void {
    if (typeof Deno !== 'undefined' || typeof Bun !== 'undefined') {
      globalThis.clearTimeout(timer);
    } else {
      global.clearTimeout(timer);
    }
  }
};

// Interface export for TimerLayer type, useful for type-checking and dependency injection
export interface TimerLayer {
  set(callback: () => void, delay: number): any;
  clear(timer: any): void;
}
