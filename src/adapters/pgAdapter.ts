// PostgreSQL Adapter with custom-built client (no external dependencies)

// Discussion Notes: Pooling and Deno/Bun Compatibility Plan

/*
1. **Pooling Plan:**
   - Implement connection pooling using a custom Pool class.
   - Pool should manage multiple PgConnection instances.
   - Configuration: max connections, idle timeout, queue behavior.
   
2. **Deno/Bun Compatibility Plan:**
   - Create platform-specific adapters.
   - Replace 'net', 'tls', and 'NodeJS.Timeout' with Deno/Bun equivalents.
   - Introduce an abstraction layer to select the appropriate module based on the runtime.
*/

import { sanitize } from '../utils/sanitize';
// Note: The 'net' module is native to Node.js. Deno and Bun require their own TCP modules.
// Import 'net' and 'tls' only for Node.js; for Deno/Bun, custom adapters will be implemented.
let net: any;
let tls: any;
try {
    net = await import('net');
    tls = await import('tls');
} catch (error) {
    throw new Error("The 'net' module is only available in Node.js. Use platform-specific adapters for Deno or Bun.");
}

class PgConnection {
    private socket: any;
    private config: any;
    private timeout: number;
    private idleTimeout: number;
    private idleTimer: NodeJS.Timeout | null = null;

    constructor(config: any) {
        this.config = config;
        this.timeout = config.timeout ?? 5000;
        this.idleTimeout = config.idleTimeout ?? 30000;
        this.configureSSL();
        this.connectToPostgres();
    }

    private configureSSL(): void {
        switch (this.config.ssl) {
            case 'none':
                this.socket = new net.Socket();
                console.log('SSL disabled. Connecting without encryption.');
            break;
            case 'true':
            case 'required':
                this.socket = tls.connect({
                    host: this.config.host,
                    port: this.config.port,
                    rejectUnauthorized: this.config.rejectUnauthorized ?? true,
                }, () => {
                    console.log('SSL handshake completed with PostgreSQL server.');
                });
            break;
            default:
              throw new Error("Invalid SSL mode. Use 'none', 'true', or 'required'.");
        }
    }

    private connectToPostgres(): void {
        this.socket.setTimeout(this.timeout);
        this.socket.connect(this.config.port, this.config.host, ()=>{
            console.log(`Connecting to PostgreSQL at ${this.config.host}:${this.config.port}`);
            this.sendStartupMessage();
            this.startIdleTimer();
        });
        this.socket.on('error', (err: { message: any; }) => {
            console.error(`Postgres connection error: ${err.message}`);
        });
    }

    private sendStartupMessage(): void {
        const startupMessage = `version=3 user=${this.config.user} database=${this.config.database}`;
        this.socket.write(startupMessage);
    }

    private startIdleTimer(): void {
        if(this.idleTimer) clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(()=>{
            console.log(`Idle timeout reached. Closing connection.`);
            this.close();
        }, this.idleTimeout);
    }

    async execute(sql: string, values?: any[]): Promise<any> {
        const query = values ? `${sql} with ${JSON.stringify(values)}` : sql;
        this.socket.write(query);
        return new Promise((resolve, reject) => {
            this.socket.once('data', (data: { toString: () => string; }) => {
                try {
                    resolve({ rows: JSON.parse(data.toString()) });
                } catch (parseError) {
                    reject(new Error(`Invalid data format: ${parseError.message}`));
                }
            });
            this.socket.once('timeout', ()=> {
                reject(new Error(`Query execution timed out`));
            });
            this.socket.once('error', (error: { message: any; }) => {
                reject(new Error(`Query execution error: ${error.message}`));
            });
        });
    }

    async close(): Promise<void> {
        this.socket.end(() => {
            console.log('Closing PostgreSQL connection.');
        });
    }
}

// Placeholder class for future implementation.
class PgConnectionPool {
    // TODO: Manage multiple connections, reuse idle connections, and queue requests.
    constructor(config: any){
        console.log('Connection pooling will be implemented here.');
    }
}

export class PostgresAdapter {
    private connection: PgConnection;

    constructor(config: any) {
        console.log('Deno/Bun compatibility adapters will be added in the future.');
        this.connection = new PgConnection(config);
    }

    async query(sql: string): Promise<any[]> {
        try {
            const result = await this.connection.execute(sql);
            return result.rows;
        } catch (error) {
            throw new Error(`Postgres query failed: ${error.message}`);
        }
    }

    async prepared(sql: string, params: any[] = []): Promise<any[]> {
        try {
            const { query, values } = sanitize(sql, params);
            const result = await this.connection.execute(query, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Postgres prepared query failed: ${error.message}`);
        }
    }

    async close(): Promise<void> {
        await this.connection.close();
    }
}
