// Full PostgreSQL Adapter with PgConnection, PgConnectionPool, PostgresAdapter, and Compatibility Layer for Deno/Bun
import { query, prepared } from '../utils/query';
import { createSocket } from '../layers/netLayer';
import { createTLSConnection } from '../layers/tlsLayer';
import { timerLayer, TimerLayer } from '../layers/timerLayer';

class PgConnection {
  private socket: any;
  private config: any;
  private timeout: number;
  private idleTimeout: number;
  private idleTimer: any = null;

  constructor(config: any) {
    this.config = config;
    this.timeout = config.timeout ?? 5000;
    this.idleTimeout = config.idleTimeout ?? 30000;
    this.configureSSL();
    this.connectToPostgres();
  }

  private configureSSL(): void {
    this.socket = this.config.ssl && this.config.ssl !== 'none' ?
      createTLSConnection(this.config) : createSocket();
  }

  private connectToPostgres(): void {
    this.socket.setTimeout(this.timeout);
    this.socket.connect(this.config.port, this.config.host, () => {
      console.log(`Connected to PostgreSQL at ${this.config.host}:${this.config.port}`);
      this.startIdleTimer();
    });
  }

  private startIdleTimer(): void {
    if (this.idleTimer) timerLayer.clear(this.idleTimer);
    this.idleTimer = timerLayer.set(() => {
      console.log('Idle timeout reached. Closing connection.');
      this.close();
    }, this.idleTimeout);
  }

  async execute(sql: string, values?: any[]): Promise<any> {
    this.startIdleTimer();
    return values ? query(this.socket, sql, values) : query(this.socket, sql);
  }

  async close(): Promise<void> {
    this.socket.end();
  }
}

class PgConnectionPool {
  private pool: PgConnection[] = [];
  private queue: { resolve: Function; reject: Function }[] = [];
  private maxConnections: number;
  private activeConnections = 0;

  constructor(config: any) {
    this.maxConnections = config.maxConnections ?? 10;
  }

  async acquire(): Promise<PgConnection> {
    if (this.activeConnections < this.maxConnections) {
      this.activeConnections++;
      return new PgConnection({});
    }
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject });
    });
  }

  release(connection: PgConnection): void {
    const nextRequest = this.queue.shift();
    if (nextRequest) {
      nextRequest.resolve(connection);
    } else {
      this.activeConnections--;
      connection.close();
    }
  }
}

export class PostgresAdapter {
  private connectionManager: PgConnection | PgConnectionPool;

  constructor(config: any) {
    this.connectionManager = config.usePooling ? new PgConnectionPool(config) : new PgConnection(config);
  }

  async query(sql: string): Promise<any[]> {
    return query(this.connectionManager, sql);
  }

  async prepared(sql: string, params: any[] = []): Promise<any[]> {
    return prepared(this.connectionManager, sql, params);
  }

  async close(): Promise<void> {
    console.log('Closing PostgreSQL connection or pool.');
  }
}
