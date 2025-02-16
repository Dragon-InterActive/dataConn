import { fs } from "./layers.ts";

const DEFAULT_ENV_PATH = new URL("../../../../.env", import.meta.url).pathname;

// Parses .env file content into key-value pairs
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

// Reads .env file from the project root
function loadEnvFile(envPath = DEFAULT_ENV_PATH): Record<string, string> {
  try {
    const data = fs.readFileSync(envPath, { encoding: "utf-8" });
    return parseEnv(data);
  } catch {
    console.warn("No .env file found in project root.");
    return {};
  }
}

// Node.js fallback if --env-file flag is not used
function fallbackForNode() {
  if (process.env.NODE_OPTIONS?.includes('--env-file')) {
    console.log(".env already loaded via --env-file (Node.js)");
    return;
  }
  const parsed = loadEnvFile();
  for (const [key, value] of Object.entries(parsed)) {
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
  console.log("Node.js: .env values loaded as fallback");
}

// Deno fallback if environment variables are not set
function fallbackForDeno() {
  const parsed = loadEnvFile();
  for (const [key, value] of Object.entries(parsed)) {
    if (!Deno.env.has(key)) {
      Deno.env.set(key, value);
    }
  }
  console.log("Deno: .env values loaded as fallback");
}

// Bun does not require a fallback as it automatically loads .env
function fallbackForBun() {
  console.log("Bun automatically loads .env - no fallback required.");
}

// Main function: selects appropriate fallback based on platform
export function loadEnv() {
  if (typeof Bun !== "undefined") {
    fallbackForBun();
  } else if (typeof Deno !== "undefined") {
    fallbackForDeno();
  } else {
    fallbackForNode();
  }
}
