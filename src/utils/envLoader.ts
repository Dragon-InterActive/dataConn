export function loadEnv(): Record<string, string> {
    const env: Record<string, string> = {};
  
    // NODE.JS (v22+)
    if (typeof process !== "undefined" && process.env) {
      return process.env;
    }
  
    // BUN
    if (typeof Bun !== "undefined" && Bun.env) {
      return Bun.env;
    }
  
    // DENO
    if (typeof Deno !== "undefined" && Deno.env) {
      return Object.fromEntries(Deno.env.toObject());
    }
  
    // Fallback: Own Loader for .env-file
    try {
      const envFile = Bun.file?.(".env") || Deno.readTextFileSync?.(".env");
      if (envFile) {
        envFile.split("\n").forEach((line) => {
          const [key, value] = line.split("=").map((s: string) => s.trim());
          if (key) env[key] = value;
        });
      }
    } catch (error) {
      console.warn("[envLoader] No .env-file found and no native support.");
    }
  
    return env;
  }
  