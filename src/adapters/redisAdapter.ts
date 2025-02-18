// Redis Adapter using ioredis with .env prefix support, Redis >= 6 authentication, and socket support.
import { Redis } from 'ioredis';

type RedisAdapterConfig = {
  connectionString?: string;
  socketPath?: string; // Redis socket path support
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  db?: number;
  connectionTimeout?: number;
  idleTimeout?: number;
};

function getConfigFromEnv(): RedisAdapterConfig {
  return {
    connectionString: process.env.REDIS_DATABASE_URL,
    socketPath: process.env.REDIS_SOCKET,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : undefined,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : undefined,
    connectionTimeout: process.env.REDIS_CONNECTION_TIMEOUT ? parseInt(process.env.REDIS_CONNECTION_TIMEOUT) : undefined,
    idleTimeout: process.env.REDIS_IDLE_TIMEOUT ? parseInt(process.env.REDIS_IDLE_TIMEOUT) : undefined,
  };
}

export class RedisAdapter {
  private client: Redis;
  private isConnected = false;
  private config: RedisAdapterConfig;

  constructor(config?: RedisAdapterConfig) {
    this.config = { ...getConfigFromEnv(), ...config };
    
    if (this.config.socketPath) {
      this.client = new Redis(this.config.socketPath);
    } else {
      this.client = new Redis(this.config.connectionString ?? {
        host: this.config.host,
        port: this.config.port,
        username: this.config.username,
        password: this.config.password,
        db: this.config.db,
        connectTimeout: this.config.connectionTimeout ?? 5000,
      });
    }

    this.client.on('error', (err: any) => {
      console.error('Redis error:', err);
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect();
        this.isConnected = true;
        console.log('Connected to Redis via .env, socket, or direct config.');
      } catch (error) {
        console.error('Redis connection failed:', error);
        throw error;
      }
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.isConnected) await this.connect();
    ttl ? await this.client.set(key, value, 'EX', ttl) : await this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) await this.connect();
    return await this.client.get(key);
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      console.log('Redis connection closed.');
    }
  }
}
