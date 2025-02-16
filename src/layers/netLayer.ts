// Provides a cross-platform networking layer for Node.js, Deno, and Bun

let net: any;

try {
  if (typeof Deno !== 'undefined') {
    // Deno implementation
    net = {
      createSocket: () => new Deno.TcpConn(),
    };
  } else if (typeof Bun !== 'undefined') {
    // Bun implementation
    net = {
      createSocket: () => Bun.connect({ hostname: 'localhost' }),
    };
  } else {
    // Node.js implementation
    net = await import('net');
  }
} catch (error) {
  throw new Error("Failed to load net module. Ensure compatibility with Node.js, Deno, or Bun.");
}

// Creates a TCP socket based on the platform
export function createSocket(): any {
  return net.createSocket();
}

// Add proper TypeScript declarations without overload conflicts
interface NetLayer {
  createSocket(): any;
}

declare const netLayer: NetLayer;
export default netLayer;
