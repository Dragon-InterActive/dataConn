// Platform-specific modules abstraction for Node.js, Deno, and Bun.

// File system abstraction
export let fs;

// Network abstraction
export let net;

// TLS abstraction
export let tls;

// Platform detection and module assignment
if (typeof Deno !== 'undefined') {
  // Deno
  fs = Deno;
  net = await import("https://deno.land/std@0.217.0/net/mod.ts");
  tls = await import("https://deno.land/std@0.217.0/tls/mod.ts");
} else if (typeof Bun !== 'undefined') {
  // Bun
  const bun = await import("bun");
  fs = bun;
  net = bun;
  tls = bun;
} else {
  // Node.js
  const nodeFs = await import("node:fs");
  const nodeNet = await import("node:net");
  const nodeTls = await import("node:tls");
  
  fs = nodeFs.promises;
  net = nodeNet;
  tls = nodeTls;
}
