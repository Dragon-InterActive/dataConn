import { loadEnv } from "./utils/envLoader";
import type { DatabaseAdapter } from "./types";

// Adapter Imports
import { PostgresAdapter } from "./adapters/pgAdapter";
import { MySQLAdapter } from "./adapters/mysqlAdapter";
import { MongoDBAdapter } from "./adapters/mongoAdapter";
import { SQLiteAdapter } from "./adapters/sqliteAdapter";
import { RedisAdapter } from "./adapters/redisAdapter";

// Singleton-pattern for Adapters
const connections: Record<string, DatabaseAdapter> = {};

// Universal database connections
export const dataConn = {
  pg(): DatabaseAdapter {
    if (!connections.pg) {
      const env = loadEnv();
      connections.pg = new PostgresAdapter({
        host: env.PG_HOST,
        port: parseInt(env.PG_PORT ?? "5432"),
        user: env.PG_USER,
        password: env.PG_PASSWORD,
        database: env.PG_DATABASE,
      });
    }
    return connections.pg;
  },

  mysql(): DatabaseAdapter {
    if (!connections.mysql) {
      const env = loadEnv();
      connections.mysql = new MySQLAdapter({
        host: env.MYSQL_HOST,
        port: parseInt(env.MYSQL_PORT ?? "3306"),
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE,
      });
    }
    return connections.mysql;
  },

  mongo(): DatabaseAdapter {
    if (!connections.mongo) {
      const env = loadEnv();
      connections.mongo = new MongoDBAdapter({
        uri: env.MONGO_URI ?? "",
      });
    }
    return connections.mongo;
  },

  sqlite(): DatabaseAdapter {
    if (!connections.sqlite) {
      const env = loadEnv();
      connections.sqlite = new SQLiteAdapter({
        filePath: env.SQLITE_FILE ?? "database.sqlite",
      });
    }
    return connections.sqlite;
  },

  redis(): DatabaseAdapter {
    if (!connections.redis) {
      const env = loadEnv();
      connections.redis = new RedisAdapter({
        host: env.REDIS_HOST ?? "127.0.0.1",
        port: parseInt(env.REDIS_PORT ?? "6379"),
      });
    }
    return connections.redis;
  },
};
