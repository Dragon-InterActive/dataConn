// Platform-specific imports for file operations
let fs;
if (typeof Deno !== 'undefined') {
  fs = Deno;
} else {
  const nodeFs = await import('node:fs');
  fs = nodeFs.promises;
}

function parseEnv(data: string): Record<string, string> {
  const result: Record<string, string> = {};
  data.split("\n").forEach((line) => {
    const [key, ...values] = line.split("=");
    if (key) {
      result[key.trim()] = values.join("=").trim().replace(/^"(.*)"$/, "$1");
    }
  });
  return result;
}

function loadEnvWithPrefix(envPath: string): void {
  try {
    const data = fs.readFileSync(envPath, { encoding: "utf-8" });
    const parsed = parseEnv(data);
    Object.entries(parsed).forEach(([key, value]) => {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch {
    console.warn("Fallback: No .env file found.");
  }
}

// Node.js fallback if --env-file flag is not used
function fallbackForNode() {
  if (!process.env.NODE_OPTIONS?.includes('--env-file')) {
    loadEnvWithPrefix(new URL("../../../../.env", import.meta.url).pathname);
    console.log("Node.js fallback envLoader executed.");
  }
}

// Deno fallback if environment variables are not set
function fallbackForDeno() {
  if (!Deno.env.get("DENO_ENV_FILE")) {
    loadEnvWithPrefix(".env");
    console.log("Deno fallback envLoader executed.");
  }
}

// Bun does not require a fallback as it automatically loads .env
function fallbackForBun() {
  console.log("Bun automatically loads .env - no fallback required.");
}

export function loadEnv(): void {
  if (typeof Deno !== 'undefined') {
    fallbackForDeno();
  } else if (typeof Bun !== 'undefined') {
    fallbackForBun();
  } else if (typeof process !== 'undefined') {
    fallbackForNode();
  }
}
