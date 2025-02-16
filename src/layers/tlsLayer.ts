// src/layers/tlsLayer.ts
// Provides a cross-platform TLS layer for Node.js, Deno, and Bun with proper TypeScript signatures

let tls: any;

try {
  if (typeof Deno !== 'undefined') {
    // Deno implementation (placeholder)
    tls = {
      createTLSConnection: () => new Deno.TlsConn(),
    };
  } else if (typeof Bun !== 'undefined') {
    // Bun implementation (placeholder)
    tls = {
      createTLSConnection: (options: any) => Bun.connect({ ...options, secure: true }),
    };
  } else {
    // Node.js implementation
    tls = await import('tls');
  }
} catch (error) {
  throw new Error("Failed to load tls module. Ensure compatibility with Node.js, Deno, or Bun.");
}

// Creates a TLS connection for the platform
export function createTLSConnection(options: any): any {
  return tls.createTLSConnection(options);
}

// Add proper TypeScript declarations
interface TLSLayer {
  createTLSConnection(options: any): any;
}

declare const tlsLayer: TLSLayer;
export default tlsLayer;
