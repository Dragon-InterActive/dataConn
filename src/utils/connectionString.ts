export interface ConnectionParams {
    type?: string;
    user?: string;
    password?: string;
    host?: string;
    port?: number;
    database?: string;
    ssl?: boolean;
    schema?: string;
    options?: Record<string, string>;
    source?: string;
  }
  
  // Parses a prefixed DATABASE_URL (e.g., pg_DATABASE_URL, mysql_DATABASE_URL)
  export function parseConnectionString(connectionString: string, source: string = 'default'): ConnectionParams {
    try {
      const url = new URL(connectionString);
      return {
        type: url.protocol.replace(':', ''),
        user: url.username,
        password: url.password,
        host: url.hostname,
        port: url.port ? parseInt(url.port) : undefined,
        database: url.pathname.replace(/^\//, ''),
        ssl: url.searchParams.get('ssl') === 'true',
        schema: url.searchParams.get('schema') ?? undefined,
        options: Object.fromEntries(url.searchParams.entries()),
        source,
      };
    } catch (error) {
      throw new Error(`Invalid connection string from ${source}: ${error.message}`);
    }
  }
  
  // Collects all prefixed DATABASE_URL values and processes them
  export function handlePrefixedConnectionStrings(env: Record<string, string>): Record<string, ConnectionParams> {
    const connections: Record<string, ConnectionParams> = {};
    Object.entries(env).forEach(([key, value]) => {
      const match = key.match(/^(.*)_DATABASE_URL$/);
      if (match) {
        const prefix = match[1];
        connections[prefix] = parseConnectionString(value, `${prefix}_DATABASE_URL`);
      }
    });
    return connections;
  }
  