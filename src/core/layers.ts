// Platform-specific modules abstraction for Node.js, Deno, and Bun.

// File system abstraction
export let fs;

// Network abstraction
export let net;

// TLS abstraction
export let tls;

// Redis abstraction
export let RedisClient;

// Platform detection and module assignment
if (typeof Deno !== 'undefined') {
  // Deno
  fs = Deno;
  net = await import("https://deno.land/std@0.217.0/net/mod.ts");
  tls = await import("https://deno.land/std@0.217.0/tls/mod.ts");
  RedisClient = await import("https://deno.land/x/redis@v0.27.0/mod.ts");
} else if (typeof Bun !== 'undefined') {
  // Bun
  const bun = await import("bun");
  fs = bun;
  net = bun;
  tls = bun;
  RedisClient = await import("@redis/client");
} else {
  // Node.js
  const nodeFs = await import("node:fs");
  const nodeNet = await import("node:net");
  const nodeTls = await import("node:tls");
  const nodeRedis = await import("ioredis");
  fs = nodeFs.promises;
  net = nodeNet;
  tls = nodeTls;
  RedisClient = nodeRedis;
}
